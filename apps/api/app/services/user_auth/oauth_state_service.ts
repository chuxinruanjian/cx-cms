import config from '#config/user_auth'
import WechatClient from '#services/user_auth/wechat_client'
import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'
import { createHash, randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'

const digest = (value: string) => createHash('sha256').update(value).digest('hex')

export default class OauthStateService {
  static async authorize(browser: string) {
    const credentials = WechatClient.credentials('official')
    const redirectUri = config.wechat.official.redirectUri
    if (!redirectUri)
      throw new Exception('WeChat callback is not configured', {
        code: 'E_WECHAT_NOT_CONFIGURED',
        status: 503,
      })
    const state = randomBytes(32).toString('hex')
    const now = DateTime.now()
    await db
      .from('user_oauth_states')
      .where('expires_at', '<', now.toSQL({ includeOffset: false })!)
      .delete()
    await db.table('user_oauth_states').insert({
      state_hash: digest(state),
      browser_hash: digest(browser),
      app_id: credentials.appId,
      expires_at: now.plus({ seconds: config.oauthStateSeconds }).toSQL({ includeOffset: false }),
      created_at: now.toSQL({ includeOffset: false }),
    })
    const url = new URL('https://open.weixin.qq.com/connect/oauth2/authorize')
    url.searchParams.set('appid', credentials.appId)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', config.wechat.official.scope)
    url.searchParams.set('state', state)
    url.hash = 'wechat_redirect'
    return { url: url.toString(), expiresIn: config.oauthStateSeconds }
  }

  static async consume(state: string, browser: unknown) {
    if (typeof browser !== 'string' || !browser) return this.invalid()
    const credentials = WechatClient.credentials('official')
    const now = DateTime.now().toSQL({ includeOffset: false })!
    const consumed = await db
      .from('user_oauth_states')
      .where('state_hash', digest(state))
      .where('browser_hash', digest(browser))
      .where('app_id', credentials.appId)
      .whereNull('used_at')
      .where('expires_at', '>', now)
      .update({ used_at: now })
    if (Number(consumed) !== 1) this.invalid()
  }

  private static invalid(): never {
    throw new Exception('WeChat authorization state is invalid or expired', {
      code: 'E_WECHAT_OAUTH_STATE_INVALID',
      status: 401,
    })
  }
}
