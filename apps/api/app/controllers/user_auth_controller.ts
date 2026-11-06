import User from '#models/user'
import UserAuthService from '#services/user_auth/user_auth_service'
import WechatClient from '#services/user_auth/wechat_client'
import OauthStateService from '#services/user_auth/oauth_state_service'
import {
  renameUserValidator,
  setUserPasswordValidator,
  updateUserProfileValidator,
  userOfficialLoginValidator,
  userPasswordLoginValidator,
  userWechatLoginValidator,
} from '#validators/user_auth'
import type { HttpContext } from '@adonisjs/core/http'
import { randomBytes } from 'node:crypto'

export default class UserAuthController {
  async login({ request, response }: HttpContext) {
    response.header('Cache-Control', 'no-store')
    const { username, password } = await request.validateUsing(userPasswordLoginValidator)
    return UserAuthService.passwordLogin(username, password)
  }
  async mini({ request, response }: HttpContext) {
    response.header('Cache-Control', 'no-store')
    const { code } = await request.validateUsing(userWechatLoginValidator)
    return UserAuthService.wechatLogin(await WechatClient.mini(code))
  }
  async authorize({ session, response }: HttpContext) {
    response.header('Cache-Control', 'no-store')
    let browser = session.get('wechatLoginBrowser')
    if (typeof browser !== 'string' || !browser) {
      browser = randomBytes(32).toString('hex')
      session.put('wechatLoginBrowser', browser)
    }
    return OauthStateService.authorize(browser)
  }
  async official({ request, session, response }: HttpContext) {
    response.header('Cache-Control', 'no-store')
    const { code, state } = await request.validateUsing(userOfficialLoginValidator)
    await OauthStateService.consume(state, session.get('wechatLoginBrowser'))
    return UserAuthService.wechatLogin(await WechatClient.official(code))
  }
  async show({ auth, response }: HttpContext) {
    response.header('Cache-Control', 'no-store')
    return UserAuthService.serialize(auth.use('user').getUserOrFail())
  }
  async update({ auth, request, response }: HttpContext) {
    response.header('Cache-Control', 'no-store')
    const user = auth.use('user').getUserOrFail()
    user.merge(await request.validateUsing(updateUserProfileValidator))
    await user.save()
    return UserAuthService.serialize(user)
  }
  async rename({ auth, request, response }: HttpContext) {
    response.header('Cache-Control', 'no-store')
    const { username } = await request.validateUsing(renameUserValidator)
    return UserAuthService.rename(auth.use('user').getUserOrFail(), username)
  }
  async password({ auth, request, response }: HttpContext) {
    response.header('Cache-Control', 'no-store')
    const { password, currentPassword } = await request.validateUsing(setUserPasswordValidator)
    return UserAuthService.setPassword(auth.use('user').getUserOrFail(), password, currentPassword)
  }
  async logout({ auth }: HttpContext) {
    const user = auth.use('user').getUserOrFail()
    if (user.currentAccessToken)
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    return { message: 'Logged out successfully' }
  }
}
