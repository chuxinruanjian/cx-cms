/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
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
  'admin.upload_config.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/upload-config',
    tokens: [{"old":"/api/v1/admin/upload-config","type":0,"val":"api","end":""},{"old":"/api/v1/admin/upload-config","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/upload-config","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/upload-config","type":0,"val":"upload-config","end":""}],
    types: placeholder as Registry['admin.upload_config.show']['types'],
  },
  'admin.uploads.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/uploads',
    tokens: [{"old":"/api/v1/admin/uploads","type":0,"val":"api","end":""},{"old":"/api/v1/admin/uploads","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/uploads","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/uploads","type":0,"val":"uploads","end":""}],
    types: placeholder as Registry['admin.uploads.index']['types'],
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
  'admin.attachments.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/attachments',
    tokens: [{"old":"/api/v1/admin/attachments","type":0,"val":"api","end":""},{"old":"/api/v1/admin/attachments","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/attachments","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/attachments","type":0,"val":"attachments","end":""}],
    types: placeholder as Registry['admin.attachments.index']['types'],
  },
  'admin.attachments.bind': {
    methods: ["POST"],
    pattern: '/api/v1/admin/attachments/bind',
    tokens: [{"old":"/api/v1/admin/attachments/bind","type":0,"val":"api","end":""},{"old":"/api/v1/admin/attachments/bind","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/attachments/bind","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/attachments/bind","type":0,"val":"attachments","end":""},{"old":"/api/v1/admin/attachments/bind","type":0,"val":"bind","end":""}],
    types: placeholder as Registry['admin.attachments.bind']['types'],
  },
  'admin.attachments.sort': {
    methods: ["POST"],
    pattern: '/api/v1/admin/attachments/sort',
    tokens: [{"old":"/api/v1/admin/attachments/sort","type":0,"val":"api","end":""},{"old":"/api/v1/admin/attachments/sort","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/attachments/sort","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/attachments/sort","type":0,"val":"attachments","end":""},{"old":"/api/v1/admin/attachments/sort","type":0,"val":"sort","end":""}],
    types: placeholder as Registry['admin.attachments.sort']['types'],
  },
  'admin.attachments.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/attachments/:id',
    tokens: [{"old":"/api/v1/admin/attachments/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/attachments/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/attachments/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/attachments/:id","type":0,"val":"attachments","end":""},{"old":"/api/v1/admin/attachments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.attachments.show']['types'],
  },
  'admin.attachments.content': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/attachments/:id/content',
    tokens: [{"old":"/api/v1/admin/attachments/:id/content","type":0,"val":"api","end":""},{"old":"/api/v1/admin/attachments/:id/content","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/attachments/:id/content","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/attachments/:id/content","type":0,"val":"attachments","end":""},{"old":"/api/v1/admin/attachments/:id/content","type":1,"val":"id","end":""},{"old":"/api/v1/admin/attachments/:id/content","type":0,"val":"content","end":""}],
    types: placeholder as Registry['admin.attachments.content']['types'],
  },
  'admin.attachments.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/attachments/:id',
    tokens: [{"old":"/api/v1/admin/attachments/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/attachments/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/attachments/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/attachments/:id","type":0,"val":"attachments","end":""},{"old":"/api/v1/admin/attachments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.attachments.destroy']['types'],
  },
  'admin.upload_cleanup.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/uploads/cleanup',
    tokens: [{"old":"/api/v1/admin/uploads/cleanup","type":0,"val":"api","end":""},{"old":"/api/v1/admin/uploads/cleanup","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/uploads/cleanup","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/uploads/cleanup","type":0,"val":"uploads","end":""},{"old":"/api/v1/admin/uploads/cleanup","type":0,"val":"cleanup","end":""}],
    types: placeholder as Registry['admin.upload_cleanup.store']['types'],
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
