import AdminRole from '#models/admin_role'
import AdminUser from '#models/admin_user'
import AdminAuthService from '#services/admin_auth_service'
import { adminUserRolesValidator, updateAdminUserValidator } from '#validators/admin_rbac'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminUsersController {
  async index() {
    const users = await AdminUser.query().orderBy('id', 'asc')
    return Promise.all(users.map((user) => AdminAuthService.serializeUser(user)))
  }

  async update({ params, request }: HttpContext) {
    const user = await AdminUser.findOrFail(params.id)
    user.merge(await request.validateUsing(updateAdminUserValidator))
    await user.save()
    return AdminAuthService.serializeUser(user)
  }

  async syncRoles({ params, request, response }: HttpContext) {
    const user = await AdminUser.findOrFail(params.id)
    const { roleIds } = await request.validateUsing(adminUserRolesValidator)
    const ids = [...new Set(roleIds)]
    const roleCount = ids.length
      ? await AdminRole.query().whereIn('id', ids).count('* as total')
      : [{ $extras: { total: 0 } }]

    if (Number(roleCount[0].$extras.total) !== ids.length) {
      return response.unprocessableEntity({
        code: 'E_ADMIN_ROLE_NOT_FOUND',
        message: 'One or more roles do not exist',
      })
    }

    await user.related('roles').sync(ids)
    return AdminAuthService.serializeUser(user)
  }
}
