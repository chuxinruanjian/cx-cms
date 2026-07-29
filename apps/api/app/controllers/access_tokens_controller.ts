import AdminUser from '#models/admin_user'
import AdminAuthService from '#services/admin_auth_service'
import { adminLoginValidator } from '#validators/admin_auth'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class AccessTokensController {
  async store({ request, response }: HttpContext) {
    const {
      username,
      password,
      remember = false,
    } = await request.validateUsing(adminLoginValidator)

    const user = await AdminUser.verifyCredentials(username, password)
    if (!user.status) {
      return response.forbidden({
        code: 'E_ADMIN_DISABLED',
        message: 'This administrator account has been disabled',
      })
    }

    user.lastLoginAt = DateTime.now()
    user.lastLoginIp = request.ip()
    await user.save()

    const token = await AdminUser.accessTokens.create(user, ['*'], {
      name: 'admin-web',
      expiresIn: remember ? '30 days' : '12 hours',
    })

    return {
      user: await AdminAuthService.serializeUser(user),
      token: {
        type: 'Bearer',
        value: token.value!.release(),
        expiresAt: token.expiresAt,
      },
    }
  }

  async show({ auth }: HttpContext) {
    return AdminAuthService.serializeUser(auth.getUserOrFail())
  }

  async destroy({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken) {
      await AdminUser.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return { message: 'Logged out successfully' }
  }
}
