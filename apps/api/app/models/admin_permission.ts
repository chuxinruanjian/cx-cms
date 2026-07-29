import { AdminPermissionSchema } from '#database/schema'
import AdminRole from '#models/admin_role'
import { manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class AdminPermission extends AdminPermissionSchema {
  @manyToMany(() => AdminRole, {
    pivotTable: 'admin_role_permissions',
    pivotForeignKey: 'permission_id',
    pivotRelatedForeignKey: 'role_id',
    pivotTimestamps: true,
  })
  declare roles: ManyToMany<typeof AdminRole>
}
