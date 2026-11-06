/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  uploadedFiles: {
    show: typeof routes['uploaded_files.show']
  }
  admin: {
    auth: {
      login: typeof routes['admin.auth.login']
      sms: {
        send: typeof routes['admin.auth.sms.send']
        login: typeof routes['admin.auth.sms.login']
      }
      passwordReset: typeof routes['admin.auth.passwordReset'] & {
        code: typeof routes['admin.auth.passwordReset.code']
      }
      me: typeof routes['admin.auth.me']
      update: typeof routes['admin.auth.update']
      logout: typeof routes['admin.auth.logout']
      security: {
        password: typeof routes['admin.auth.security.password']
        mobile: typeof routes['admin.auth.security.mobile'] & {
          code: typeof routes['admin.auth.security.mobile.code']
        }
      }
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
    uploadConfig: {
      show: typeof routes['admin.upload_config.show']
    }
    uploads: {
      store: typeof routes['admin.uploads.store']
      initialize: typeof routes['admin.uploads.initialize']
      initializeDirect: typeof routes['admin.uploads.initialize_direct']
      completeDirect: typeof routes['admin.uploads.complete_direct']
      storeChunk: typeof routes['admin.uploads.store_chunk']
      show: typeof routes['admin.uploads.show']
      complete: typeof routes['admin.uploads.complete']
      abort: typeof routes['admin.uploads.abort']
      destroy: typeof routes['admin.uploads.destroy']
    }
  }
}
