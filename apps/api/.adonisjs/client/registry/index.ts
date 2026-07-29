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
  'admin.auth.me': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/auth/me',
    tokens: [{"old":"/api/v1/admin/auth/me","type":0,"val":"api","end":""},{"old":"/api/v1/admin/auth/me","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/auth/me","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/auth/me","type":0,"val":"auth","end":""},{"old":"/api/v1/admin/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['admin.auth.me']['types'],
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
