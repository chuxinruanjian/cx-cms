import AdminUser from '#models/admin_user'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'
import uploadConfig from '#config/upload'
import StorageManager from '#services/upload/storage/storage_manager'
import { rm } from 'node:fs/promises'
import { test } from '@japa/runner'

const MINI = '/api/v1/auth/wechat/mini-program'

interface UserLoginResult {
  user: { id: number; username: string }
  token: { value: string }
}

test.group('User authentication', (group) => {
  let originalFetch: typeof globalThis.fetch
  let responses: Record<string, unknown>[]
  let requests: URL[]

  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(async () => {
    originalFetch = globalThis.fetch
    const { default: config } = await import('#config/user_auth')
    const configSnapshot = structuredClone(config)
    StorageManager.reset()
    await rm(uploadConfig.root, { recursive: true, force: true })
    responses = []
    requests = []
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = new URL(
        typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      )
      requests.push(url)
      const payload = responses.shift()
      if (!payload) throw new Error('No fake WeChat response queued')
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as typeof fetch
    return async () => {
      globalThis.fetch = originalFetch
      Object.assign(config, configSnapshot)
      StorageManager.reset()
      await rm(uploadConfig.root, { recursive: true, force: true })
    }
  })

  // Modules are imported inside tests so the initial red run fails on missing routes.
  const configure = async () => {
    const { default: config } = await import('#config/user_auth')
    config.wechat.mini = {
      appId: 'wx1111111111111111',
      appSecret: 'fixture-mini-secret',
      openPlatformId: 'fixture-platform',
    }
    config.wechat.official = {
      appId: 'wx2222222222222222',
      appSecret: 'fixture-official-secret',
      openPlatformId: 'fixture-platform',
      redirectUri: 'https://example.test/wechat/callback',
      scope: 'snsapi_userinfo',
    }
    config.rateLimits.password.limit = 100
    config.rateLimits.wechat.limit = 100
    return config
  }

  test('creates a user from trusted mini-program identity without accepting client profile or identifiers', async ({
    client,
    assert,
  }) => {
    // Check route existence first, before loading the new feature's configuration.
    // @ts-expect-error Intentionally omit the required code to test server validation.
    const missingCode = await client.post(MINI).json({})
    missingCode.assertStatus(422)
    await configure()
    responses.push({
      openid: 'trusted-openid',
      unionid: 'trusted-unionid',
      session_key: 'fixture-session-key',
    })
    const forgedProfile = {
      code: 'fixture-code',
      openid: 'forged',
      unionid: 'forged',
      nickname: 'forged',
      avatar: 'data:forged',
    }
    const response = await client.post(MINI).json(forgedProfile)
    response.assertStatus(200)
    response.assertBodyContains({
      isNewUser: true,
      user: {
        mobile: null,
        nickname: null,
        avatar: null,
        passwordLoginEnabled: false,
        canChangeUsername: true,
      },
    })
    const body = response.body() as UserLoginResult
    assert.match(body.user.username, /^u_[0-9a-f]{32}$/)
    assert.notInclude(JSON.stringify(body), 'fixture-session-key')
    assert.notProperty(body.user, 'password')
    const row = await db.from('users').where('id', body.user.id).first()
    assert.isTrue(await hash.verify(row.password, '123456'))
    assert.equal(row.union_id, 'trusted-unionid')
    assert.equal(requests[0].hostname, 'api.weixin.qq.com')
    assert.equal(requests[0].pathname, '/sns/jscode2session')
    const blocked = await client
      .post('/api/v1/auth/login')
      .json({ username: body.user.username, password: '123456' })
    blocked.assertStatus(401)
    const me = await client
      .get('/api/v1/auth/me')
      .header('Authorization', `Bearer ${body.token.value}`)
    me.assertStatus(200)
    assert.notProperty(me.body(), 'password')
  })

  test('requires profile authorization separately, allows one username change, and enables password login after setting a password', async ({
    client,
    assert,
  }) => {
    await configure()
    responses.push({ openid: 'mini-profile' })
    const login = await client.post(MINI).json({ code: 'profile-code' })
    login.assertStatus(200)
    const body = login.body() as UserLoginResult
    const authorization = `Bearer ${body.token.value}`
    const uploadSettings = await client
      .get('/api/v1/upload-config')
      .header('Authorization', authorization)
    uploadSettings.assertStatus(200)
    const anonymousConfig = await client.get('/api/v1/upload-config')
    anonymousConfig.assertStatus(401)
    const profile = await client
      .patch('/api/v1/auth/me')
      .header('Authorization', authorization)
      .json({
        nickname: '小程序昵称',
        avatar: '/api/v1/uploads/files/11111111-1111-4111-8111-111111111111',
        mobile: '13800138000',
        unionId: 'forged',
      })
    profile.assertStatus(200)
    profile.assertBodyContains({
      nickname: '小程序昵称',
      avatar: '/api/v1/uploads/files/11111111-1111-4111-8111-111111111111',
      mobile: null,
    })
    const invalidAvatar = await client
      .patch('/api/v1/auth/me')
      .header('Authorization', authorization)
      .json({ avatar: 'data:image/png;base64,aaaa' })
    invalidAvatar.assertStatus(422)
    const unchanged = await client
      .patch('/api/v1/auth/username')
      .header('Authorization', authorization)
      .json({ username: body.user.username })
    unchanged.assertBodyContains({ canChangeUsername: true })
    const renamed = await client
      .patch('/api/v1/auth/username')
      .header('Authorization', authorization)
      .json({ username: 'New_Username' })
    renamed.assertStatus(200)
    renamed.assertBodyContains({ username: 'new_username', canChangeUsername: false })
    const second = await client
      .patch('/api/v1/auth/username')
      .header('Authorization', authorization)
      .json({ username: 'another_name' })
    second.assertStatus(409)
    const setPassword = await client
      .put('/api/v1/auth/password')
      .header('Authorization', authorization)
      .json({ password: 'NewPassword123!' })
    setPassword.assertStatus(200)
    const passwordLogin = await client
      .post('/api/v1/auth/login')
      .json({ username: 'NEW_USERNAME', password: 'NewPassword123!' })
    passwordLogin.assertStatus(200)
    const id = (passwordLogin.body() as UserLoginResult).user.id
    assert.equal(id, body.user.id)
    const wrongCurrent = await client
      .put('/api/v1/auth/password')
      .header('Authorization', authorization)
      .json({ password: 'Replacement123!', currentPassword: 'wrong' })
    wrongCurrent.assertStatus(401)
    const changed = await client
      .put('/api/v1/auth/password')
      .header('Authorization', authorization)
      .json({ password: 'Replacement123!', currentPassword: 'NewPassword123!' })
    changed.assertStatus(200)
    const otherSession = await client
      .get('/api/v1/auth/me')
      .header('Authorization', `Bearer ${(passwordLogin.body() as UserLoginResult).token.value}`)
    otherSession.assertStatus(401)
    const current = await client.get('/api/v1/auth/me').header('Authorization', authorization)
    current.assertStatus(200)
    const logout = await client.delete('/api/v1/auth/logout').header('Authorization', authorization)
    logout.assertStatus(200)
    const revoked = await client.get('/api/v1/auth/me').header('Authorization', authorization)
    revoked.assertStatus(401)
  })

  test('reuses mini-program identities, scopes OpenIDs by application, and records a newly supplied UnionID', async ({
    client,
    assert,
  }) => {
    const config = await configure()
    responses.push(
      { openid: 'same-openid' },
      { openid: 'same-openid', unionid: 'later-union' },
      { openid: 'same-openid' }
    )
    const first = await client.post(MINI).json({ code: 'first' })
    const second = await client.post(MINI).json({ code: 'second' })
    first.assertStatus(200)
    second.assertStatus(200)
    assert.equal(
      (first.body() as UserLoginResult).user.id,
      (second.body() as UserLoginResult).user.id
    )
    const row = await db
      .from('users')
      .where('id', (first.body() as UserLoginResult).user.id)
      .first()
    assert.equal(row.union_id, 'later-union')
    config.wechat.mini.appId = 'wx3333333333333333'
    const anotherApp = await client.post(MINI).json({ code: 'other-app' })
    anotherApp.assertStatus(200)
    assert.notEqual(
      (anotherApp.body() as UserLoginResult).user.id,
      (first.body() as UserLoginResult).user.id
    )
  })

  test('logs in through official-account OAuth with a browser-bound one-time state and trusted profile', async ({
    client,
    assert,
  }) => {
    await configure()
    responses.push(
      { access_token: 'fixture-oauth-access', openid: 'official-openid', scope: 'snsapi_userinfo' },
      {
        openid: 'official-openid',
        unionid: 'shared-union',
        nickname: '公众号昵称',
        headimgurl: 'https://thirdwx.qlogo.cn/fixture/avatar',
      }
    )
    const authorize = await client
      .get('/api/v1/auth/wechat/official-account/authorize')
      .withSession({})
    authorize.assertStatus(200)
    const browser = authorize.session('wechatLoginBrowser') as string
    assert.match(browser, /^[0-9a-f]{64}$/)
    const url = new URL((authorize.body() as { url: string }).url)
    assert.equal(url.origin, 'https://open.weixin.qq.com')
    assert.equal(url.searchParams.get('redirect_uri'), 'https://example.test/wechat/callback')
    const state = url.searchParams.get('state')!
    const wrongBrowser = await client
      .post('/api/v1/auth/wechat/official-account')
      .withSession({ wechatLoginBrowser: 'other-browser' })
      .json({ code: 'code', state })
    wrongBrowser.assertStatus(401)
    const response = await client
      .post('/api/v1/auth/wechat/official-account')
      .withSession({ wechatLoginBrowser: browser })
      .json({ code: 'official-code', state })
    response.assertStatus(200)
    response.assertBodyContains({
      user: { nickname: '公众号昵称', avatar: 'https://thirdwx.qlogo.cn/fixture/avatar' },
    })
    assert.notInclude(JSON.stringify(response.body()), 'fixture-oauth-access')
    const repeated = await client
      .post('/api/v1/auth/wechat/official-account')
      .withSession({ wechatLoginBrowser: browser })
      .json({ code: 'again', state })
    repeated.assertStatus(401)
    responses.push({ openid: 'mini-openid', unionid: 'shared-union' })
    const mini = await client.post(MINI).json({ code: 'linked-mini' })
    mini.assertStatus(200)
    assert.equal(
      (mini.body() as UserLoginResult).user.id,
      (response.body() as UserLoginResult).user.id
    )
    assert.equal(requests[0].pathname, '/sns/oauth2/access_token')
    assert.equal(requests[1].pathname, '/sns/userinfo')
  })

  test('does not merge matching UnionIDs from different open-platform scopes or case-different OpenIDs', async ({
    client,
    assert,
  }) => {
    const config = await configure()
    responses.push(
      { openid: 'CaseSensitive', unionid: 'same-union' },
      { openid: 'casesensitive' },
      { openid: 'other', unionid: 'same-union' }
    )
    const first = await client.post(MINI).json({ code: 'case1' })
    const second = await client.post(MINI).json({ code: 'case2' })
    first.assertStatus(200)
    second.assertStatus(200)
    assert.notEqual(
      (first.body() as UserLoginResult).user.id,
      (second.body() as UserLoginResult).user.id
    )
    config.wechat.mini.openPlatformId = 'different-platform'
    const third = await client.post(MINI).json({ code: 'different-platform' })
    third.assertStatus(200)
    assert.notEqual(
      (first.body() as UserLoginResult).user.id,
      (third.body() as UserLoginResult).user.id
    )
  })

  test('rejects unsafe identity merges, disabled users, invalid provider responses and administrator tokens', async ({
    client,
    assert,
  }) => {
    await configure()
    responses.push(
      { openid: 'mini-a', unionid: 'union-a' },
      { openid: 'mini-b' },
      { openid: 'mini-b', unionid: 'union-a' }
    )
    const first = await client.post(MINI).json({ code: 'a' })
    const second = await client.post(MINI).json({ code: 'b' })
    first.assertStatus(200)
    second.assertStatus(200)
    const conflict = await client.post(MINI).json({ code: 'conflict' })
    conflict.assertStatus(409)
    await db
      .from('users')
      .where('id', (first.body() as UserLoginResult).user.id)
      .update({ status: false })
    responses.push({ openid: 'mini-a', unionid: 'union-a' })
    const disabled = await client.post(MINI).json({ code: 'disabled' })
    disabled.assertStatus(403)
    const disabledMe = await client
      .get('/api/v1/auth/me')
      .header('Authorization', `Bearer ${(first.body() as UserLoginResult).token.value}`)
    disabledMe.assertStatus(403)
    responses.push({ errcode: 40029, errmsg: 'raw-provider-secret-must-not-leak' })
    const invalid = await client.post(MINI).json({ code: 'bad-code' })
    invalid.assertStatus(401)
    assert.notInclude(JSON.stringify(invalid.body()), 'raw-provider-secret-must-not-leak')
    const admin = await AdminUser.create({
      username: 'separate-admin',
      email: 'separate@example.test',
      password: 'AdminPassword123!',
      status: true,
      isSuperAdmin: true,
    })
    const adminToken = await AdminUser.accessTokens.create(admin)
    const crossGuard = await client
      .get('/api/v1/auth/me')
      .header('Authorization', `Bearer ${adminToken.value!.release()}`)
    crossGuard.assertStatus(401)
    const userCrossGuard = await client
      .get('/api/v1/admin/auth/me')
      .header('Authorization', `Bearer ${(second.body() as UserLoginResult).token.value}`)
    userCrossGuard.assertStatus(401)
  })

  test('enforces one username change atomically without consuming it on a duplicate name', async ({
    client,
    assert,
  }) => {
    await configure()
    const { default: User } = await import('#models/user')
    await User.create({
      username: 'reserved_name',
      password: 'ManualPassword123!',
      passwordLoginEnabled: true,
      status: true,
      mobile: '13800138000',
    })
    const manual = await client
      .post('/api/v1/auth/login')
      .json({ username: 'reserved_name', password: 'ManualPassword123!' })
    manual.assertStatus(200)
    manual.assertBodyContains({ user: { mobile: '13800138000' } })
    responses.push({ openid: 'rename-user' })
    const login = await client.post(MINI).json({ code: 'rename-code' })
    login.assertStatus(200)
    const authorization = `Bearer ${(login.body() as UserLoginResult).token.value}`
    const duplicate = await client
      .patch('/api/v1/auth/username')
      .header('Authorization', authorization)
      .json({ username: 'reserved_name' })
    duplicate.assertStatus(422)
    const attempts = await Promise.all(
      ['username_one', 'username_two'].map((username) =>
        client
          .patch('/api/v1/auth/username')
          .header('Authorization', authorization)
          .json({ username })
      )
    )
    assert.deepEqual(attempts.map((result) => result.status()).sort(), [200, 409])
    const user = await User.findOrFail((login.body() as UserLoginResult).user.id)
    assert.isNotNull(user.usernameChangedAt)
    assert.notProperty(user.serialize(), 'password')
  })

  test('handles simultaneous logins without duplicate users or identity records', async ({
    client,
    assert,
  }) => {
    await configure()
    responses.push(
      { openid: 'concurrent-openid', unionid: 'concurrent-union' },
      { openid: 'concurrent-openid', unionid: 'concurrent-union' }
    )
    const logins = await Promise.all(
      ['code-one', 'code-two'].map((code) => client.post(MINI).json({ code }))
    )
    logins.forEach((result) => result.assertStatus(200))
    assert.equal(
      (logins[0].body() as UserLoginResult).user.id,
      (logins[1].body() as UserLoginResult).user.id
    )
    const users = await db.from('users').count('* as total')
    const accounts = await db.from('user_wechat_accounts').count('* as total')
    assert.equal(Number(users[0].total), 1)
    assert.equal(Number(accounts[0].total), 1)
  })

  test('uses the shared upload flow for user avatars and keeps admin ownership isolated', async ({
    client,
  }) => {
    await configure()
    responses.push({ openid: 'avatar-user' })
    const login = await client.post(MINI).json({ code: 'avatar-code' })
    login.assertStatus(200)
    const body = login.body() as UserLoginResult
    const authorization = `Bearer ${body.token.value}`
    const image = Buffer.alloc(128)
    Buffer.from('89504e470d0a1a0a', 'hex').copy(image)
    const uploaded = await client
      .post('/api/v1/uploads')
      .header('Authorization', authorization)
      .fields({ uploadToken: 'avatar_fixture_123' })
      .file('file', image, { filename: 'avatar.png', contentType: 'image/png' })
    uploaded.assertStatus(201)
    uploaded.assertBodyContains({
      uploaderType: 'user',
      uploaderId: body.user.id,
      status: 'active',
    })
    const file = uploaded.body() as { id: number; url: string }
    const readable = await client.get(file.url)
    readable.assertStatus(200)
    const updated = await client
      .patch('/api/v1/auth/me')
      .header('Authorization', authorization)
      .json({ avatar: file.url, nickname: 'New avatar' })
    updated.assertStatus(200)
    updated.assertBodyContains({ avatar: file.url, nickname: 'New avatar' })
    const admin = await AdminUser.create({
      username: 'avatar-admin',
      email: 'avatar-admin@example.test',
      password: 'AdminPassword123!',
      status: true,
      isSuperAdmin: false,
    })
    const token = await AdminUser.accessTokens.create(admin)
    const forbidden = await client
      .delete(`/api/v1/admin/uploads/files/${file.id}`)
      .header('Authorization', `Bearer ${token.value!.release()}`)
    forbidden.assertStatus(403)
    const crossGuard = await client
      .post('/api/v1/uploads')
      .header('Authorization', `Bearer ${token.value!.release()}`)
      .fields({ uploadToken: 'cross_guard_123' })
      .file('file', image, { filename: 'avatar.png', contentType: 'image/png' })
    crossGuard.assertStatus(401)
  })

  test('does not leak request credentials on provider failures or trust mismatched official-account identities', async ({
    client,
    assert,
  }) => {
    const config = await configure()
    globalThis.fetch = (async () => {
      throw new Error('https://api.weixin.qq.com/?secret=fixture-mini-secret&code=fixture-code')
    }) as typeof fetch
    const unavailable = await client.post(MINI).json({ code: 'fixture-code' })
    unavailable.assertStatus(502)
    assert.notInclude(JSON.stringify(unavailable.body()), 'fixture-mini-secret')
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(responses.shift()), {
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch
    responses.push(
      { access_token: 'fixture-access', openid: 'official-real', scope: 'snsapi_userinfo' },
      { openid: 'official-forged', unionid: 'forged' }
    )
    const authorize = await client
      .get('/api/v1/auth/wechat/official-account/authorize')
      .withSession({ wechatLoginBrowser: 'browser' })
    authorize.assertStatus(200)
    const state = new URL((authorize.body() as { url: string }).url).searchParams.get('state')!
    const invalid = await client
      .post('/api/v1/auth/wechat/official-account')
      .withSession({ wechatLoginBrowser: 'browser' })
      .json({ code: 'official-code', state })
    invalid.assertStatus(502)
    const users = await db.from('users').count('* as total')
    assert.equal(Number(users[0].total), 0)
    config.wechat.mini.appSecret = undefined
    const disabled = await client.post(MINI).json({ code: 'disabled' })
    disabled.assertStatus(503)
  })

  test('limits password login attempts and expires OAuth state', async ({ client, assert }) => {
    const config = await configure()
    config.rateLimits.password.limit = 2
    for (let index = 0; index < 2; index++) {
      const response = await client
        .post('/api/v1/auth/login')
        .json({ username: 'unknown_user', password: 'invalid' })
      response.assertStatus(401)
    }
    const limited = await client
      .post('/api/v1/auth/login')
      .json({ username: 'unknown_user', password: 'invalid' })
    limited.assertStatus(429)
    assert.isTrue(Number(limited.header('retry-after')) > 0)
    const authorize = await client
      .get('/api/v1/auth/wechat/official-account/authorize')
      .withSession({ wechatLoginBrowser: 'browser' })
    authorize.assertStatus(200)
    await db.from('user_oauth_states').update({ expires_at: '2000-01-01 00:00:00' })
    const state = new URL((authorize.body() as { url: string }).url).searchParams.get('state')!
    const expired = await client
      .post('/api/v1/auth/wechat/official-account')
      .withSession({ wechatLoginBrowser: 'browser' })
      .json({ code: 'expired', state })
    expired.assertStatus(401)
  })
})
