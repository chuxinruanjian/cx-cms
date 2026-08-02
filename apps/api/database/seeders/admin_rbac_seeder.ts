import AdminPermission from '#models/admin_permission'
import AdminRole from '#models/admin_role'
import AdminUser from '#models/admin_user'
import env from '#start/env'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

const permissions = [
  ['查看管理员', 'admin.users.view'],
  ['更新管理员', 'admin.users.update'],
  ['分配管理员角色', 'admin.users.roles'],
  ['查看角色', 'admin.roles.view'],
  ['创建角色', 'admin.roles.create'],
  ['更新角色', 'admin.roles.update'],
  ['删除角色', 'admin.roles.delete'],
  ['分配角色权限', 'admin.roles.permissions'],
  ['查看权限', 'admin.permissions.view'],
  ['创建权限', 'admin.permissions.create'],
  ['更新权限', 'admin.permissions.update'],
  ['删除权限', 'admin.permissions.delete'],
  ['上传文件', 'admin.attachments.upload'],
  ['查看文件', 'admin.attachments.view'],
  ['绑定和排序文件', 'admin.attachments.bind'],
  ['删除文件', 'admin.attachments.delete'],
  ['清理临时文件', 'admin.attachments.cleanup'],
] as const

export default class AdminRbacSeeder extends BaseSeeder {
  async run() {
    const username = env.get('ADMIN_USERNAME')
    const password = env.get('ADMIN_PASSWORD')
    const email = env.get('ADMIN_EMAIL')

    if (!username || !password || !email) {
      throw new Error('Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_EMAIL before running db:seed')
    }

    const permissionModels = await Promise.all(
      permissions.map(([name, code]) =>
        AdminPermission.updateOrCreate(
          { code },
          {
            name,
            description: null,
            status: true,
          }
        )
      )
    )

    const role = await AdminRole.updateOrCreate(
      { code: 'super_admin' },
      {
        name: '超级管理员',
        description: '系统内置角色，拥有所有后台权限',
        status: true,
      }
    )
    await role.related('permissions').sync(permissionModels.map((permission) => permission.id))

    const user = await AdminUser.updateOrCreate(
      { username },
      {
        fullName: env.get('ADMIN_NAME', '超级管理员'),
        email,
        password,
        status: true,
        isSuperAdmin: true,
      }
    )
    await user.related('roles').sync([role.id])
  }
}
