export type WechatProvider = 'mini' | 'official'
export interface WechatIdentity {
  provider: WechatProvider
  appId: string
  openId: string
  unionId: string | null
  unionScope: string
  nickname?: string | null
  avatar?: string | null
}
