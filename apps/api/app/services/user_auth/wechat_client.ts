import config from '#config/user_auth'
import type { WechatIdentity, WechatProvider } from '#types/user_auth'
import { Exception } from '@adonisjs/core/exceptions'

const identifier = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 && value.length <= 128 ? value : null
const profileText = (value: unknown, max: number) =>
  typeof value === 'string' && value.length <= max ? value : null

export default class WechatClient {
  static credentials(provider: WechatProvider) {
    const credentials = config.wechat[provider]
    if (!credentials.appId || !credentials.appSecret) {
      throw new Exception('WeChat login is not configured', {
        code: 'E_WECHAT_NOT_CONFIGURED',
        status: 503,
      })
    }
    return { ...credentials, appId: credentials.appId, appSecret: credentials.appSecret }
  }

  private static async request(path: string, params: Record<string, string>) {
    const url = new URL(path, 'https://api.weixin.qq.com')
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
    let data: Record<string, unknown>
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(10000), redirect: 'error' })
      if (!response.ok) throw new Error('Provider request failed')
      data = (await response.json()) as Record<string, unknown>
      if (!data || typeof data !== 'object' || Array.isArray(data))
        throw new Error('Invalid response')
    } catch {
      // Fetch errors may contain the request URL and app secret. Do not propagate them.
      throw new Exception('WeChat service is unavailable', {
        code: 'E_WECHAT_UNAVAILABLE',
        status: 502,
      })
    }
    if (data.errcode && data.errcode !== 0) {
      const invalidCode = [40029, 40163, 40003].includes(Number(data.errcode))
      throw new Exception('WeChat authorization failed', {
        code: invalidCode ? 'E_WECHAT_CODE_INVALID' : 'E_WECHAT_UNAVAILABLE',
        status: invalidCode ? 401 : 502,
      })
    }
    return data
  }

  static async mini(code: string): Promise<WechatIdentity> {
    const credentials = this.credentials('mini')
    const data = await this.request('/sns/jscode2session', {
      appid: credentials.appId,
      secret: credentials.appSecret,
      js_code: code,
      grant_type: 'authorization_code',
    })
    return this.identity('mini', credentials, data)
  }

  static async official(code: string): Promise<WechatIdentity> {
    const credentials = this.credentials('official')
    const token = await this.request('/sns/oauth2/access_token', {
      appid: credentials.appId,
      secret: credentials.appSecret,
      code,
      grant_type: 'authorization_code',
    })
    const identity = this.identity('official', credentials, token)
    if (typeof token.access_token !== 'string' || !token.access_token) this.invalidIdentity()
    if (typeof token.scope === 'string' && token.scope.split(',').includes('snsapi_userinfo')) {
      const profile = await this.request('/sns/userinfo', {
        access_token: token.access_token as string,
        openid: identity.openId,
        lang: 'zh_CN',
      })
      if (profile.openid !== identity.openId) this.invalidIdentity()
      const unionId = identifier(profile.unionid)
      if (identity.unionId && unionId && identity.unionId !== unionId) this.invalidIdentity()
      identity.unionId = unionId || identity.unionId
      identity.nickname = profileText(profile.nickname, 100)
      const avatar = profileText(profile.headimgurl, 512)
      identity.avatar = avatar && /^https?:\/\//i.test(avatar) ? avatar : null
    }
    return identity
  }

  private static identity(
    provider: WechatProvider,
    credentials: { appId: string; openPlatformId?: string },
    data: Record<string, unknown>
  ): WechatIdentity {
    const openId = identifier(data.openid)
    if (
      !openId ||
      (data.unionid !== undefined && data.unionid !== null && !identifier(data.unionid))
    )
      this.invalidIdentity()
    return {
      provider,
      appId: credentials.appId,
      openId: openId as string,
      unionId: identifier(data.unionid),
      unionScope: credentials.openPlatformId
        ? `open:${credentials.openPlatformId}`
        : `app:${credentials.appId}`,
    }
  }

  private static invalidIdentity(): never {
    throw new Exception('WeChat returned an invalid identity', {
      code: 'E_WECHAT_IDENTITY_INVALID',
      status: 502,
    })
  }
}
