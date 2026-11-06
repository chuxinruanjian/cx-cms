/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  systemConfigs: {
    publicIndex: typeof routes['system_configs.public_index']
  }
  uploadedFiles: {
    show: typeof routes['uploaded_files.show']
  }
  user: {
    userAuth: {
      login: typeof routes['user.user_auth.login']
      mini: typeof routes['user.user_auth.mini']
      authorize: typeof routes['user.user_auth.authorize']
      official: typeof routes['user.user_auth.official']
      show: typeof routes['user.user_auth.show']
      update: typeof routes['user.user_auth.update']
      rename: typeof routes['user.user_auth.rename']
      password: typeof routes['user.user_auth.password']
      logout: typeof routes['user.user_auth.logout']
    }
    uploadConfig: {
      show: typeof routes['user.upload_config.show']
    }
    userUploads: {
      store: typeof routes['user.user_uploads.store']
      initialize: typeof routes['user.user_uploads.initialize']
      initializeDirect: typeof routes['user.user_uploads.initialize_direct']
      completeDirect: typeof routes['user.user_uploads.complete_direct']
      storeChunk: typeof routes['user.user_uploads.store_chunk']
      show: typeof routes['user.user_uploads.show']
      complete: typeof routes['user.user_uploads.complete']
      abort: typeof routes['user.user_uploads.abort']
      destroy: typeof routes['user.user_uploads.destroy']
    }
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
    members: {
      index: typeof routes['admin.members.index']
      show: typeof routes['admin.members.show']
      update: typeof routes['admin.members.update']
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
    systemConfigs: {
      index: typeof routes['admin.system_configs.index']
      store: typeof routes['admin.system_configs.store']
      update: typeof routes['admin.system_configs.update']
      destroy: typeof routes['admin.system_configs.destroy']
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
