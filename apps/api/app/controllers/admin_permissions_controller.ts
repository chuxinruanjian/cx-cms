import AdminPermission from '#models/admin_permission'
import {
  createAdminPermissionValidator,
  updateAdminPermissionValidator,
} from '#validators/admin_rbac'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminPermissionsController {
  async index() {
    return AdminPermission.query().orderBy('id', 'asc')
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createAdminPermissionValidator)
    return response.created(await AdminPermission.create(payload))
  }

  async update({ params, request }: HttpContext) {
    const permission = await AdminPermission.findOrFail(params.id)
    permission.merge(await request.validateUsing(updateAdminPermissionValidator))
    await permission.save()
    return permission
  }

  async destroy({ params, response }: HttpContext) {
    const permission = await AdminPermission.findOrFail(params.id)
    await permission.delete()
    return response.noContent()
  }
}
