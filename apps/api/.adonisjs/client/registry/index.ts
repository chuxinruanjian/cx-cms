/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'system_configs.public_index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/system-configs/public',
    tokens: [{"old":"/api/v1/system-configs/public","type":0,"val":"api","end":""},{"old":"/api/v1/system-configs/public","type":0,"val":"v1","end":""},{"old":"/api/v1/system-configs/public","type":0,"val":"system-configs","end":""},{"old":"/api/v1/system-configs/public","type":0,"val":"public","end":""}],
    types: placeholder as Registry['system_configs.public_index']['types'],
  },
  'uploaded_files.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/uploads/files/:uuid',
    tokens: [{"old":"/api/v1/uploads/files/:uuid","type":0,"val":"api","end":""},{"old":"/api/v1/uploads/files/:uuid","type":0,"val":"v1","end":""},{"old":"/api/v1/uploads/files/:uuid","type":0,"val":"uploads","end":""},{"old":"/api/v1/uploads/files/:uuid","type":0,"val":"files","end":""},{"old":"/api/v1/uploads/files/:uuid","type":1,"val":"uuid","end":""}],
    types: placeholder as Registry['uploaded_files.show']['types'],
  },
  'user.user_auth.login': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['user.user_auth.login']['types'],
  },
  'user.user_auth.mini': {
    methods: ["POST"],
    pattern: '/api/v1/auth/wechat/mini-program',
    tokens: [{"old":"/api/v1/auth/wechat/mini-program","type":0,"val":"api","end":""},{"old":"/api/v1/auth/wechat/mini-program","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/wechat/mini-program","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/wechat/mini-program","type":0,"val":"wechat","end":""},{"old":"/api/v1/auth/wechat/mini-program","type":0,"val":"mini-program","end":""}],
    types: placeholder as Registry['user.user_auth.mini']['types'],
  },
  'user.user_auth.authorize': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/wechat/official-account/authorize',
    tokens: [{"old":"/api/v1/auth/wechat/official-account/authorize","type":0,"val":"api","end":""},{"old":"/api/v1/auth/wechat/official-account/authorize","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/wechat/official-account/authorize","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/wechat/official-account/authorize","type":0,"val":"wechat","end":""},{"old":"/api/v1/auth/wechat/official-account/authorize","type":0,"val":"official-account","end":""},{"old":"/api/v1/auth/wechat/official-account/authorize","type":0,"val":"authorize","end":""}],
    types: placeholder as Registry['user.user_auth.authorize']['types'],
  },
  'user.user_auth.official': {
    methods: ["POST"],
    pattern: '/api/v1/auth/wechat/official-account',
    tokens: [{"old":"/api/v1/auth/wechat/official-account","type":0,"val":"api","end":""},{"old":"/api/v1/auth/wechat/official-account","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/wechat/official-account","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/wechat/official-account","type":0,"val":"wechat","end":""},{"old":"/api/v1/auth/wechat/official-account","type":0,"val":"official-account","end":""}],
    types: placeholder as Registry['user.user_auth.official']['types'],
  },
  'user.upload_config.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/upload-config',
    tokens: [{"old":"/api/v1/upload-config","type":0,"val":"api","end":""},{"old":"/api/v1/upload-config","type":0,"val":"v1","end":""},{"old":"/api/v1/upload-config","type":0,"val":"upload-config","end":""}],
    types: placeholder as Registry['user.upload_config.show']['types'],
  },
  'user.user_uploads.store': {
    methods: ["POST"],
    pattern: '/api/v1/uploads',
    tokens: [{"old":"/api/v1/uploads","type":0,"val":"api","end":""},{"old":"/api/v1/uploads","type":0,"val":"v1","end":""},{"old":"/api/v1/uploads","type":0,"val":"uploads","end":""}],
    types: placeholder as Registry['user.user_uploads.store']['types'],
  },
  'user.user_uploads.initialize': {
    methods: ["POST"],
    pattern: '/api/v1/uploads/init',
    tokens: [{"old":"/api/v1/uploads/init","type":0,"val":"api","end":""},{"old":"/api/v1/uploads/init","type":0,"val":"v1","end":""},{"old":"/api/v1/uploads/init","type":0,"val":"uploads","end":""},{"old":"/api/v1/uploads/init","type":0,"val":"init","end":""}],
    types: placeholder as Registry['user.user_uploads.initialize']['types'],
  },
  'user.user_uploads.initialize_direct': {
    methods: ["POST"],
    pattern: '/api/v1/uploads/direct/init',
    tokens: [{"old":"/api/v1/uploads/direct/init","type":0,"val":"api","end":""},{"old":"/api/v1/uploads/direct/init","type":0,"val":"v1","end":""},{"old":"/api/v1/uploads/direct/init","type":0,"val":"uploads","end":""},{"old":"/api/v1/uploads/direct/init","type":0,"val":"direct","end":""},{"old":"/api/v1/uploads/direct/init","type":0,"val":"init","end":""}],
    types: placeholder as Registry['user.user_uploads.initialize_direct']['types'],
  },
  'user.user_uploads.complete_direct': {
    methods: ["POST"],
    pattern: '/api/v1/uploads/direct/:attachmentId/complete',
    tokens: [{"old":"/api/v1/uploads/direct/:attachmentId/complete","type":0,"val":"api","end":""},{"old":"/api/v1/uploads/direct/:attachmentId/complete","type":0,"val":"v1","end":""},{"old":"/api/v1/uploads/direct/:attachmentId/complete","type":0,"val":"uploads","end":""},{"old":"/api/v1/uploads/direct/:attachmentId/complete","type":0,"val":"direct","end":""},{"old":"/api/v1/uploads/direct/:attachmentId/complete","type":1,"val":"attachmentId","end":""},{"old":"/api/v1/uploads/direct/:attachmentId/complete","type":0,"val":"complete","end":""}],
    types: placeholder as Registry['user.user_uploads.complete_direct']['types'],
  },
  'user.user_uploads.store_chunk': {
    methods: ["POST"],
    pattern: '/api/v1/uploads/:uploadId/chunks',
    tokens: [{"old":"/api/v1/uploads/:uploadId/chunks","type":0,"val":"api","end":""},{"old":"/api/v1/uploads/:uploadId/chunks","type":0,"val":"v1","end":""},{"old":"/api/v1/uploads/:uploadId/chunks","type":0,"val":"uploads","end":""},{"old":"/api/v1/uploads/:uploadId/chunks","type":1,"val":"uploadId","end":""},{"old":"/api/v1/uploads/:uploadId/chunks","type":0,"val":"chunks","end":""}],
    types: placeholder as Registry['user.user_uploads.store_chunk']['types'],
  },
  'user.user_uploads.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/uploads/:uploadId',
    tokens: [{"old":"/api/v1/uploads/:uploadId","type":0,"val":"api","end":""},{"old":"/api/v1/uploads/:uploadId","type":0,"val":"v1","end":""},{"old":"/api/v1/uploads/:uploadId","type":0,"val":"uploads","end":""},{"old":"/api/v1/uploads/:uploadId","type":1,"val":"uploadId","end":""}],
    types: placeholder as Registry['user.user_uploads.show']['types'],
  },
  'user.user_uploads.complete': {
    methods: ["POST"],
    pattern: '/api/v1/uploads/:uploadId/complete',
    tokens: [{"old":"/api/v1/uploads/:uploadId/complete","type":0,"val":"api","end":""},{"old":"/api/v1/uploads/:uploadId/complete","type":0,"val":"v1","end":""},{"old":"/api/v1/uploads/:uploadId/complete","type":0,"val":"uploads","end":""},{"old":"/api/v1/uploads/:uploadId/complete","type":1,"val":"uploadId","end":""},{"old":"/api/v1/uploads/:uploadId/complete","type":0,"val":"complete","end":""}],
    types: placeholder as Registry['user.user_uploads.complete']['types'],
  },
  'user.user_uploads.abort': {
    methods: ["POST"],
    pattern: '/api/v1/uploads/:uploadId/abort',
    tokens: [{"old":"/api/v1/uploads/:uploadId/abort","type":0,"val":"api","end":""},{"old":"/api/v1/uploads/:uploadId/abort","type":0,"val":"v1","end":""},{"old":"/api/v1/uploads/:uploadId/abort","type":0,"val":"uploads","end":""},{"old":"/api/v1/uploads/:uploadId/abort","type":1,"val":"uploadId","end":""},{"old":"/api/v1/uploads/:uploadId/abort","type":0,"val":"abort","end":""}],
    types: placeholder as Registry['user.user_uploads.abort']['types'],
  },
  'user.user_uploads.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/uploads/files/:id',
    tokens: [{"old":"/api/v1/uploads/files/:id","type":0,"val":"api","end":""},{"old":"/api/v1/uploads/files/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/uploads/files/:id","type":0,"val":"uploads","end":""},{"old":"/api/v1/uploads/files/:id","type":0,"val":"files","end":""},{"old":"/api/v1/uploads/files/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['user.user_uploads.destroy']['types'],
  },
  'user.user_auth.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/me',
    tokens: [{"old":"/api/v1/auth/me","type":0,"val":"api","end":""},{"old":"/api/v1/auth/me","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/me","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['user.user_auth.show']['types'],
  },
  'user.user_auth.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/auth/me',
    tokens: [{"old":"/api/v1/auth/me","type":0,"val":"api","end":""},{"old":"/api/v1/auth/me","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/me","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['user.user_auth.update']['types'],
  },
  'user.user_auth.rename': {
    methods: ["PATCH"],
    pattern: '/api/v1/auth/username',
    tokens: [{"old":"/api/v1/auth/username","type":0,"val":"api","end":""},{"old":"/api/v1/auth/username","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/username","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/username","type":0,"val":"username","end":""}],
    types: placeholder as Registry['user.user_auth.rename']['types'],
  },
  'user.user_auth.password': {
    methods: ["PUT"],
    pattern: '/api/v1/auth/password',
    tokens: [{"old":"/api/v1/auth/password","type":0,"val":"api","end":""},{"old":"/api/v1/auth/password","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/password","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/password","type":0,"val":"password","end":""}],
    types: placeholder as Registry['user.user_auth.password']['types'],
  },
  'user.user_auth.logout': {
    methods: ["DELETE"],
    pattern: '/api/v1/auth/logout',
    tokens: [{"old":"/api/v1/auth/logout","type":0,"val":"api","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['user.user_auth.logout']['types'],
  },
  'admin.auth.login': {
    methods: ["POST"],
    pattern: '/api/v1/admin/auth/login',
    tokens: [{"old":"/api/v1/admin/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/admin/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/auth/login","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/admin/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['admin.auth.login']['types'],
  },
  'admin.auth.sms.send': {
    methods: ["POST"],
    pattern: '/api/v1/admin/auth/sms/send',
    tokens: [{"old":"/api/v1/admin/auth/sms/send","type":0,"val":"api","end":""},{"old":"/api/v1/admin/auth/sms/send","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/auth/sms/send","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/auth/sms/send","type":0,"val":"auth","end":""},{"old":"/api/v1/admin/auth/sms/send","type":0,"val":"sms","end":""},{"old":"/api/v1/admin/auth/sms/send","type":0,"val":"send","end":""}],
    types: placeholder as Registry['admin.auth.sms.send']['types'],
  },
  'admin.auth.sms.login': {
    methods: ["POST"],
    pattern: '/api/v1/admin/auth/sms/login',
    tokens: [{"old":"/api/v1/admin/auth/sms/login","type":0,"val":"api","end":""},{"old":"/api/v1/admin/auth/sms/login","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/auth/sms/login","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/auth/sms/login","type":0,"val":"auth","end":""},{"old":"/api/v1/admin/auth/sms/login","type":0,"val":"sms","end":""},{"old":"/api/v1/admin/auth/sms/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['admin.auth.sms.login']['types'],
  },
  'admin.auth.passwordReset.code': {
    methods: ["POST"],
    pattern: '/api/v1/admin/auth/password-reset/code',
    tokens: [{"old":"/api/v1/admin/auth/password-reset/code","type":0,"val":"api","end":""},{"old":"/api/v1/admin/auth/password-reset/code","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/auth/password-reset/code","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/auth/password-reset/code","type":0,"val":"auth","end":""},{"old":"/api/v1/admin/auth/password-reset/code","type":0,"val":"password-reset","end":""},{"old":"/api/v1/admin/auth/password-reset/code","type":0,"val":"code","end":""}],
    types: placeholder as Registry['admin.auth.passwordReset.code']['types'],
  },
  'admin.auth.passwordReset': {
    methods: ["POST"],
    pattern: '/api/v1/admin/auth/password-reset',
    tokens: [{"old":"/api/v1/admin/auth/password-reset","type":0,"val":"api","end":""},{"old":"/api/v1/admin/auth/password-reset","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/auth/password-reset","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/auth/password-reset","type":0,"val":"auth","end":""},{"old":"/api/v1/admin/auth/password-reset","type":0,"val":"password-reset","end":""}],
    types: placeholder as Registry['admin.auth.passwordReset']['types'],
  },
  'admin.auth.me': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/auth/me',
    tokens: [{"old":"/api/v1/admin/auth/me","type":0,"val":"api","end":""},{"old":"/api/v1/admin/auth/me","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/auth/me","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/auth/me","type":0,"val":"auth","end":""},{"old":"/api/v1/admin/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['admin.auth.me']['types'],
  },
  'admin.auth.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/admin/auth/me',
    tokens: [{"old":"/api/v1/admin/auth/me","type":0,"val":"api","end":""},{"old":"/api/v1/admin/auth/me","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/auth/me","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/auth/me","type":0,"val":"auth","end":""},{"old":"/api/v1/admin/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['admin.auth.update']['types'],
  },
  'admin.auth.logout': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/auth/logout',
    tokens: [{"old":"/api/v1/admin/auth/logout","type":0,"val":"api","end":""},{"old":"/api/v1/admin/auth/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/auth/logout","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/v1/admin/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['admin.auth.logout']['types'],
  },
  'admin.auth.security.password': {
    methods: ["PATCH"],
    pattern: '/api/v1/admin/auth/security/password',
    tokens: [{"old":"/api/v1/admin/auth/security/password","type":0,"val":"api","end":""},{"old":"/api/v1/admin/auth/security/password","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/auth/security/password","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/auth/security/password","type":0,"val":"auth","end":""},{"old":"/api/v1/admin/auth/security/password","type":0,"val":"security","end":""},{"old":"/api/v1/admin/auth/security/password","type":0,"val":"password","end":""}],
    types: placeholder as Registry['admin.auth.security.password']['types'],
  },
  'admin.auth.security.mobile.code': {
    methods: ["POST"],
    pattern: '/api/v1/admin/auth/security/mobile/code',
    tokens: [{"old":"/api/v1/admin/auth/security/mobile/code","type":0,"val":"api","end":""},{"old":"/api/v1/admin/auth/security/mobile/code","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/auth/security/mobile/code","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/auth/security/mobile/code","type":0,"val":"auth","end":""},{"old":"/api/v1/admin/auth/security/mobile/code","type":0,"val":"security","end":""},{"old":"/api/v1/admin/auth/security/mobile/code","type":0,"val":"mobile","end":""},{"old":"/api/v1/admin/auth/security/mobile/code","type":0,"val":"code","end":""}],
    types: placeholder as Registry['admin.auth.security.mobile.code']['types'],
  },
  'admin.auth.security.mobile': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/auth/security/mobile',
    tokens: [{"old":"/api/v1/admin/auth/security/mobile","type":0,"val":"api","end":""},{"old":"/api/v1/admin/auth/security/mobile","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/auth/security/mobile","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/auth/security/mobile","type":0,"val":"auth","end":""},{"old":"/api/v1/admin/auth/security/mobile","type":0,"val":"security","end":""},{"old":"/api/v1/admin/auth/security/mobile","type":0,"val":"mobile","end":""}],
    types: placeholder as Registry['admin.auth.security.mobile']['types'],
  },
  'admin.admin_users.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/users',
    tokens: [{"old":"/api/v1/admin/users","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['admin.admin_users.index']['types'],
  },
  'admin.admin_users.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/admin/users/:id',
    tokens: [{"old":"/api/v1/admin/users/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_users.update']['types'],
  },
  'admin.admin_users.sync_roles': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/users/:id/roles',
    tokens: [{"old":"/api/v1/admin/users/:id/roles","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/:id/roles","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/:id/roles","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/:id/roles","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/:id/roles","type":1,"val":"id","end":""},{"old":"/api/v1/admin/users/:id/roles","type":0,"val":"roles","end":""}],
    types: placeholder as Registry['admin.admin_users.sync_roles']['types'],
  },
  'admin.admin_roles.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/roles',
    tokens: [{"old":"/api/v1/admin/roles","type":0,"val":"api","end":""},{"old":"/api/v1/admin/roles","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/roles","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/roles","type":0,"val":"roles","end":""}],
    types: placeholder as Registry['admin.admin_roles.index']['types'],
  },
  'admin.admin_roles.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/roles',
    tokens: [{"old":"/api/v1/admin/roles","type":0,"val":"api","end":""},{"old":"/api/v1/admin/roles","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/roles","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/roles","type":0,"val":"roles","end":""}],
    types: placeholder as Registry['admin.admin_roles.store']['types'],
  },
  'admin.admin_roles.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/admin/roles/:id',
    tokens: [{"old":"/api/v1/admin/roles/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"roles","end":""},{"old":"/api/v1/admin/roles/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_roles.update']['types'],
  },
  'admin.admin_roles.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/roles/:id',
    tokens: [{"old":"/api/v1/admin/roles/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/roles/:id","type":0,"val":"roles","end":""},{"old":"/api/v1/admin/roles/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_roles.destroy']['types'],
  },
  'admin.admin_roles.sync_permissions': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/roles/:id/permissions',
    tokens: [{"old":"/api/v1/admin/roles/:id/permissions","type":0,"val":"api","end":""},{"old":"/api/v1/admin/roles/:id/permissions","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/roles/:id/permissions","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/roles/:id/permissions","type":0,"val":"roles","end":""},{"old":"/api/v1/admin/roles/:id/permissions","type":1,"val":"id","end":""},{"old":"/api/v1/admin/roles/:id/permissions","type":0,"val":"permissions","end":""}],
    types: placeholder as Registry['admin.admin_roles.sync_permissions']['types'],
  },
  'admin.admin_permissions.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/permissions',
    tokens: [{"old":"/api/v1/admin/permissions","type":0,"val":"api","end":""},{"old":"/api/v1/admin/permissions","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/permissions","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/permissions","type":0,"val":"permissions","end":""}],
    types: placeholder as Registry['admin.admin_permissions.index']['types'],
  },
  'admin.admin_permissions.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/permissions',
    tokens: [{"old":"/api/v1/admin/permissions","type":0,"val":"api","end":""},{"old":"/api/v1/admin/permissions","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/permissions","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/permissions","type":0,"val":"permissions","end":""}],
    types: placeholder as Registry['admin.admin_permissions.store']['types'],
  },
  'admin.admin_permissions.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/admin/permissions/:id',
    tokens: [{"old":"/api/v1/admin/permissions/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/permissions/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/permissions/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/permissions/:id","type":0,"val":"permissions","end":""},{"old":"/api/v1/admin/permissions/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_permissions.update']['types'],
  },
  'admin.admin_permissions.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/permissions/:id',
    tokens: [{"old":"/api/v1/admin/permissions/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/permissions/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/permissions/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/permissions/:id","type":0,"val":"permissions","end":""},{"old":"/api/v1/admin/permissions/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_permissions.destroy']['types'],
  },
  'admin.system_configs.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/system-configs',
    tokens: [{"old":"/api/v1/admin/system-configs","type":0,"val":"api","end":""},{"old":"/api/v1/admin/system-configs","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/system-configs","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/system-configs","type":0,"val":"system-configs","end":""}],
    types: placeholder as Registry['admin.system_configs.index']['types'],
  },
  'admin.system_configs.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/system-configs',
    tokens: [{"old":"/api/v1/admin/system-configs","type":0,"val":"api","end":""},{"old":"/api/v1/admin/system-configs","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/system-configs","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/system-configs","type":0,"val":"system-configs","end":""}],
    types: placeholder as Registry['admin.system_configs.store']['types'],
  },
  'admin.system_configs.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/admin/system-configs/:id',
    tokens: [{"old":"/api/v1/admin/system-configs/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/system-configs/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/system-configs/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/system-configs/:id","type":0,"val":"system-configs","end":""},{"old":"/api/v1/admin/system-configs/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.system_configs.update']['types'],
  },
  'admin.system_configs.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/system-configs/:id',
    tokens: [{"old":"/api/v1/admin/system-configs/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/system-configs/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/system-configs/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/system-configs/:id","type":0,"val":"system-configs","end":""},{"old":"/api/v1/admin/system-configs/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.system_configs.destroy']['types'],
  },
  'admin.upload_config.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/upload-config',
    tokens: [{"old":"/api/v1/admin/upload-config","type":0,"val":"api","end":""},{"old":"/api/v1/admin/upload-config","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/upload-config","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/upload-config","type":0,"val":"upload-config","end":""}],
    types: placeholder as Registry['admin.upload_config.show']['types'],
  },
  'admin.uploads.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/uploads',
    tokens: [{"old":"/api/v1/admin/uploads","type":0,"val":"api","end":""},{"old":"/api/v1/admin/uploads","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/uploads","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/uploads","type":0,"val":"uploads","end":""}],
    types: placeholder as Registry['admin.uploads.store']['types'],
  },
  'admin.uploads.initialize': {
    methods: ["POST"],
    pattern: '/api/v1/admin/uploads/init',
    tokens: [{"old":"/api/v1/admin/uploads/init","type":0,"val":"api","end":""},{"old":"/api/v1/admin/uploads/init","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/uploads/init","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/uploads/init","type":0,"val":"uploads","end":""},{"old":"/api/v1/admin/uploads/init","type":0,"val":"init","end":""}],
    types: placeholder as Registry['admin.uploads.initialize']['types'],
  },
  'admin.uploads.initialize_direct': {
    methods: ["POST"],
    pattern: '/api/v1/admin/uploads/direct/init',
    tokens: [{"old":"/api/v1/admin/uploads/direct/init","type":0,"val":"api","end":""},{"old":"/api/v1/admin/uploads/direct/init","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/uploads/direct/init","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/uploads/direct/init","type":0,"val":"uploads","end":""},{"old":"/api/v1/admin/uploads/direct/init","type":0,"val":"direct","end":""},{"old":"/api/v1/admin/uploads/direct/init","type":0,"val":"init","end":""}],
    types: placeholder as Registry['admin.uploads.initialize_direct']['types'],
  },
  'admin.uploads.complete_direct': {
    methods: ["POST"],
    pattern: '/api/v1/admin/uploads/direct/:attachmentId/complete',
    tokens: [{"old":"/api/v1/admin/uploads/direct/:attachmentId/complete","type":0,"val":"api","end":""},{"old":"/api/v1/admin/uploads/direct/:attachmentId/complete","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/uploads/direct/:attachmentId/complete","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/uploads/direct/:attachmentId/complete","type":0,"val":"uploads","end":""},{"old":"/api/v1/admin/uploads/direct/:attachmentId/complete","type":0,"val":"direct","end":""},{"old":"/api/v1/admin/uploads/direct/:attachmentId/complete","type":1,"val":"attachmentId","end":""},{"old":"/api/v1/admin/uploads/direct/:attachmentId/complete","type":0,"val":"complete","end":""}],
    types: placeholder as Registry['admin.uploads.complete_direct']['types'],
  },
  'admin.uploads.store_chunk': {
    methods: ["POST"],
    pattern: '/api/v1/admin/uploads/:uploadId/chunks',
    tokens: [{"old":"/api/v1/admin/uploads/:uploadId/chunks","type":0,"val":"api","end":""},{"old":"/api/v1/admin/uploads/:uploadId/chunks","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/uploads/:uploadId/chunks","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/uploads/:uploadId/chunks","type":0,"val":"uploads","end":""},{"old":"/api/v1/admin/uploads/:uploadId/chunks","type":1,"val":"uploadId","end":""},{"old":"/api/v1/admin/uploads/:uploadId/chunks","type":0,"val":"chunks","end":""}],
    types: placeholder as Registry['admin.uploads.store_chunk']['types'],
  },
  'admin.uploads.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/uploads/:uploadId',
    tokens: [{"old":"/api/v1/admin/uploads/:uploadId","type":0,"val":"api","end":""},{"old":"/api/v1/admin/uploads/:uploadId","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/uploads/:uploadId","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/uploads/:uploadId","type":0,"val":"uploads","end":""},{"old":"/api/v1/admin/uploads/:uploadId","type":1,"val":"uploadId","end":""}],
    types: placeholder as Registry['admin.uploads.show']['types'],
  },
  'admin.uploads.complete': {
    methods: ["POST"],
    pattern: '/api/v1/admin/uploads/:uploadId/complete',
    tokens: [{"old":"/api/v1/admin/uploads/:uploadId/complete","type":0,"val":"api","end":""},{"old":"/api/v1/admin/uploads/:uploadId/complete","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/uploads/:uploadId/complete","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/uploads/:uploadId/complete","type":0,"val":"uploads","end":""},{"old":"/api/v1/admin/uploads/:uploadId/complete","type":1,"val":"uploadId","end":""},{"old":"/api/v1/admin/uploads/:uploadId/complete","type":0,"val":"complete","end":""}],
    types: placeholder as Registry['admin.uploads.complete']['types'],
  },
  'admin.uploads.abort': {
    methods: ["POST"],
    pattern: '/api/v1/admin/uploads/:uploadId/abort',
    tokens: [{"old":"/api/v1/admin/uploads/:uploadId/abort","type":0,"val":"api","end":""},{"old":"/api/v1/admin/uploads/:uploadId/abort","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/uploads/:uploadId/abort","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/uploads/:uploadId/abort","type":0,"val":"uploads","end":""},{"old":"/api/v1/admin/uploads/:uploadId/abort","type":1,"val":"uploadId","end":""},{"old":"/api/v1/admin/uploads/:uploadId/abort","type":0,"val":"abort","end":""}],
    types: placeholder as Registry['admin.uploads.abort']['types'],
  },
  'admin.uploads.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/uploads/files/:id',
    tokens: [{"old":"/api/v1/admin/uploads/files/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/uploads/files/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/uploads/files/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/uploads/files/:id","type":0,"val":"uploads","end":""},{"old":"/api/v1/admin/uploads/files/:id","type":0,"val":"files","end":""},{"old":"/api/v1/admin/uploads/files/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.uploads.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
