import AdminRbacService, { type AuthorizationRequirement } from '#services/admin_rbac_service'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminRbacMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn, options: AuthorizationRequirement) {
    const user = auth.getUserOrFail()
    if (!(await AdminRbacService.allows(user, options))) {
      return response.forbidden({
        code: 'E_ADMIN_FORBIDDEN',
        message: 'You do not have permission to perform this action',
      })
    }

    return next()
  }
}
