import config from '#config/user_auth'
import User from '#models/user'
import UserWechatAccount from '#models/user_wechat_account'
import type { WechatIdentity } from '#types/user_auth'
import { Exception } from '@adonisjs/core/exceptions'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import { createHash, randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'

const digest = (...parts: string[]) => createHash('sha256').update(parts.join('\0')).digest('hex')
const uniqueError = (error: unknown) =>
  ['SQLITE_CONSTRAINT_UNIQUE', 'ER_DUP_ENTRY'].includes((error as { code?: string })?.code || '')

export default class UserAuthService {
  static serialize(user: User) {
    return {
      id: user.id,
      username: user.username,
      mobile: user.mobile,
      nickname: user.nickname,
      avatar: user.avatar,
      status: Boolean(user.status),
      passwordLoginEnabled: Boolean(user.passwordLoginEnabled),
      canChangeUsername: !user.usernameChangedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  static async passwordLogin(username: string, password: string) {
    let user: User
    try {
      user = await User.verifyCredentials(username, password)
    } catch (error) {
      if ((error as { code?: string }).code === 'E_INVALID_CREDENTIALS') {
        throw new Exception('Invalid user credentials', {
          code: 'E_INVALID_CREDENTIALS',
          status: 401,
        })
      }
      throw error
    }
    if (!user.passwordLoginEnabled)
      throw new Exception('Invalid user credentials', {
        code: 'E_INVALID_CREDENTIALS',
        status: 401,
      })
    return this.issueToken(user, false)
  }

  static async wechatLogin(identity: WechatIdentity) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const linked = await db.transaction(async (trx) => {
          const identityKey = digest(identity.provider, identity.appId, identity.openId)
          let account = await UserWechatAccount.query({ client: trx })
            .where('identity_key', identityKey)
            .first()
          const unionKey = identity.unionId ? digest(identity.unionScope, identity.unionId) : null
          const unionOwner = unionKey
            ? await User.query({ client: trx }).where('union_key', unionKey).first()
            : null
          let user = account
            ? await User.query({ client: trx })
                .where('id', account.userId)
                .forUpdate()
                .firstOrFail()
            : unionOwner
          if (user && unionOwner && user.id !== unionOwner.id) this.conflict()
          const isNewUser = !user
          if (!user)
            user = await User.create(
              {
                username: `u_${randomBytes(16).toString('hex')}`,
                password: '123456',
                passwordLoginEnabled: false,
                usernameChangedAt: null,
                mobile: null,
                nickname: null,
                avatar: null,
                status: true,
                unionId: null,
                unionScope: null,
                unionKey: null,
                lastLoginAt: null,
              },
              { client: trx }
            )
          this.assertActive(user)
          if (identity.unionId) {
            if (
              user.unionKey &&
              user.unionKey !== unionKey &&
              user.unionScope !== `app:${identity.appId}`
            )
              this.conflict()
            user.merge({ unionId: identity.unionId, unionScope: identity.unionScope, unionKey })
          }
          if (!user.nickname && identity.nickname) user.nickname = identity.nickname
          if (!user.avatar && identity.avatar) user.avatar = identity.avatar
          await user.save()
          if (!account)
            account = await UserWechatAccount.create(
              {
                userId: user.id,
                provider: identity.provider,
                appId: identity.appId,
                openId: identity.openId,
                identityKey,
                unionId: identity.unionId,
              },
              { client: trx }
            )
          else if (identity.unionId && account.unionId !== identity.unionId) {
            account.unionId = identity.unionId
            await account.save()
          }
          return { userId: user.id, isNewUser }
        })
        return this.issueToken(await User.findOrFail(linked.userId), linked.isNewUser)
      } catch (error) {
        const retryable =
          uniqueError(error) ||
          [
            'SQLITE_BUSY',
            'SQLITE_BUSY_SNAPSHOT',
            'ER_LOCK_DEADLOCK',
            'ER_LOCK_WAIT_TIMEOUT',
          ].includes((error as { code?: string })?.code || '')
        if (!retryable) throw error
        if (attempt === 2)
          throw new Exception('Please retry WeChat login', {
            code: 'E_WECHAT_LOGIN_RETRY',
            status: 503,
          })
      }
    }
    throw new Exception('Please retry WeChat login', { code: 'E_WECHAT_LOGIN_RETRY', status: 503 })
  }

  static async rename(user: User, username: string) {
    if (user.username === username) return this.serialize(user)
    try {
      const changed = await db
        .from('users')
        .where('id', user.id)
        .whereNull('username_changed_at')
        .update({
          username,
          username_changed_at: DateTime.now().toSQL({ includeOffset: false }),
          updated_at: DateTime.now().toSQL({ includeOffset: false }),
        })
      if (Number(changed) !== 1)
        throw new Exception('Username can only be changed once', {
          code: 'E_USERNAME_ALREADY_CHANGED',
          status: 409,
        })
    } catch (error) {
      if (uniqueError(error))
        throw new Exception('Username is already in use', { code: 'E_USERNAME_TAKEN', status: 422 })
      throw error
    }
    return this.serialize(await User.findOrFail(user.id))
  }

  static async setPassword(user: User, password: string, currentPassword?: string) {
    await db.transaction(async (trx) => {
      const current = await User.query({ client: trx })
        .where('id', user.id)
        .forUpdate()
        .firstOrFail()
      if (
        current.passwordLoginEnabled &&
        (!currentPassword || !(await hash.verify(current.password, currentPassword)))
      ) {
        throw new Exception('Current password is incorrect', {
          code: 'E_CURRENT_PASSWORD_INVALID',
          status: 401,
        })
      }
      current.password = password
      current.passwordLoginEnabled = true
      await current.save()
      const tokens = trx.from('user_access_tokens').where('tokenable_id', user.id)
      if (user.currentAccessToken) tokens.whereNot('id', String(user.currentAccessToken.identifier))
      await tokens.delete()
    })
    return this.serialize(await User.findOrFail(user.id))
  }

  private static async issueToken(user: User, isNewUser: boolean) {
    this.assertActive(user)
    user.lastLoginAt = DateTime.now()
    await user.save()
    const token = await User.accessTokens.create(user, ['*'], {
      name: 'user-login',
      expiresIn: config.tokenExpiresIn,
    })
    return {
      isNewUser,
      user: this.serialize(user),
      token: { type: 'Bearer', value: token.value!.release(), expiresAt: token.expiresAt },
    }
  }

  private static assertActive(user: User) {
    if (!user.status)
      throw new Exception('This user account has been disabled', {
        code: 'E_USER_DISABLED',
        status: 403,
      })
  }
  private static conflict(): never {
    throw new Exception('WeChat identities belong to different existing accounts', {
      code: 'E_WECHAT_ACCOUNT_CONFLICT',
      status: 409,
    })
  }
}
