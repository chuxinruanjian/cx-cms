/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  admin: {
    auth: {
      login: typeof routes['admin.auth.login']
      me: typeof routes['admin.auth.me']
      logout: typeof routes['admin.auth.logout']
    }
    adminUsers: {
      index: typeof routes['admin.admin_users.index']
      update: typeof routes['admin.admin_users.update']
      syncRoles: typeof routes['admin.admin_users.sync_roles']
    }
    adminRoles: {
      index: typeof routes['admin.admin_roles.index']
      store: typeof routes['admin.admin_roles.store']
      update: typeof routes['admin.admin_roles.update']
      destroy: typeof routes['admin.admin_roles.destroy']
      syncPermissions: typeof routes['admin.admin_roles.sync_permissions']
    }
    adminPermissions: {
      index: typeof routes['admin.admin_permissions.index']
      store: typeof routes['admin.admin_permissions.store']
      update: typeof routes['admin.admin_permissions.update']
      destroy: typeof routes['admin.admin_permissions.destroy']
    }
  }
}
