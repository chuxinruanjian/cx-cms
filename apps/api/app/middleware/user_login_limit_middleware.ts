import LoginLimitService, { type LoginLimitScope } from '#services/user_auth/login_limit_service'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class UserLoginLimitMiddleware {
  async handle(
    { request, response }: HttpContext,
    next: NextFn,
    options: { scope: LoginLimitScope }
  ) {
    const retryAfter = await LoginLimitService.consume(options.scope, request.ip())
    if (retryAfter) {
      response.header('Retry-After', String(retryAfter))
      return response.tooManyRequests({
        code: 'E_USER_AUTH_RATE_LIMITED',
        message: 'Too many login attempts. Please try again later.',
        retryAfterSeconds: retryAfter,
      })
    }
    return next()
  }
}
