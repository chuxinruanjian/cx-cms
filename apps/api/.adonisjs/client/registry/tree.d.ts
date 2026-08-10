/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  admin: {
    auth: {
      login: typeof routes['admin.auth.login']
      sms: {
        send: typeof routes['admin.auth.sms.send']
        login: typeof routes['admin.auth.sms.login']
      }
      me: typeof routes['admin.auth.me']
      update: typeof routes['admin.auth.update']
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
    uploadConfig: {
      show: typeof routes['admin.upload_config.show']
    }
    uploads: {
      index: typeof routes['admin.uploads.index']
      store: typeof routes['admin.uploads.store']
      initialize: typeof routes['admin.uploads.initialize']
      storeChunk: typeof routes['admin.uploads.store_chunk']
      show: typeof routes['admin.uploads.show']
      complete: typeof routes['admin.uploads.complete']
      abort: typeof routes['admin.uploads.abort']
    }
    attachments: {
      index: typeof routes['admin.attachments.index']
      bind: typeof routes['admin.attachments.bind']
      sort: typeof routes['admin.attachments.sort']
      show: typeof routes['admin.attachments.show']
      content: typeof routes['admin.attachments.content']
      destroy: typeof routes['admin.attachments.destroy']
    }
    uploadCleanup: {
      store: typeof routes['admin.upload_cleanup.store']
    }
  }
}
