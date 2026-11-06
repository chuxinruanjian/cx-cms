import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class UserAuthMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    const user = await auth.use('user').authenticate()
    if (!user.status)
      return response.forbidden({
        code: 'E_USER_DISABLED',
        message: 'This user account has been disabled',
      })
    return next()
  }
}
