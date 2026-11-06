import env from '#start/env'

const userAuthConfig = {
  tokenExpiresIn: '30 days',
  oauthStateSeconds: 600,
  rateLimits: {
    password: { limit: 20, seconds: 60 },
    wechat: { limit: 60, seconds: 60 },
    oauthAuthorize: { limit: 30, seconds: 60 },
  },
  wechat: {
    mini: {
      appId: env.get('WECHAT_MINI_APP_ID'),
      appSecret: env.get('WECHAT_MINI_APP_SECRET')?.release(),
      openPlatformId: env.get('WECHAT_MINI_OPEN_PLATFORM_ID'),
    },
    official: {
      appId: env.get('WECHAT_OFFICIAL_APP_ID'),
      appSecret: env.get('WECHAT_OFFICIAL_APP_SECRET')?.release(),
      openPlatformId: env.get('WECHAT_OFFICIAL_OPEN_PLATFORM_ID'),
      redirectUri: env.get('WECHAT_OFFICIAL_REDIRECT_URI'),
      scope: env.get('WECHAT_OFFICIAL_SCOPE', 'snsapi_userinfo'),
    },
  },
}
export default userAuthConfig
