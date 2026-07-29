import AdminPermission from '#models/admin_permission'
import AdminRole from '#models/admin_role'
import {
  adminRolePermissionsValidator,
  createAdminRoleValidator,
  updateAdminRoleValidator,
} from '#validators/admin_rbac'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminRolesController {
  async index() {
    return AdminRole.query().orderBy('id', 'asc').preload('permissions')
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createAdminRoleValidator)
    const role = await AdminRole.create(payload)
    await role.load('permissions')
    return response.created(role)
  }

  async update({ params, request }: HttpContext) {
    const role = await AdminRole.findOrFail(params.id)
    role.merge(await request.validateUsing(updateAdminRoleValidator))
    await role.save()
    await role.load('permissions')
    return role
  }

  async destroy({ params, response }: HttpContext) {
    const role = await AdminRole.findOrFail(params.id)
    await role.delete()
    return response.noContent()
  }

  async syncPermissions({ params, request, response }: HttpContext) {
    const role = await AdminRole.findOrFail(params.id)
    const { permissionIds } = await request.validateUsing(adminRolePermissionsValidator)
    const ids = [...new Set(permissionIds)]
    const permissionCount = ids.length
      ? await AdminPermission.query().whereIn('id', ids).count('* as total')
      : [{ $extras: { total: 0 } }]

    if (Number(permissionCount[0].$extras.total) !== ids.length) {
      return response.unprocessableEntity({
        code: 'E_ADMIN_PERMISSION_NOT_FOUND',
        message: 'One or more permissions do not exist',
      })
    }

    await role.related('permissions').sync(ids)
    await role.load('permissions')
    return role
  }
}
