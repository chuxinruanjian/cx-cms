import { AdminRoleSchema } from '#database/schema'
import AdminPermission from '#models/admin_permission'
import AdminUser from '#models/admin_user'
import { manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class AdminRole extends AdminRoleSchema {
  @manyToMany(() => AdminUser, {
    pivotTable: 'admin_user_roles',
    pivotForeignKey: 'role_id',
    pivotRelatedForeignKey: 'user_id',
    pivotTimestamps: true,
  })
  declare users: ManyToMany<typeof AdminUser>

  @manyToMany(() => AdminPermission, {
    pivotTable: 'admin_role_permissions',
    pivotForeignKey: 'role_id',
    pivotRelatedForeignKey: 'permission_id',
    pivotTimestamps: true,
  })
  declare permissions: ManyToMany<typeof AdminPermission>
}
