import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.auth.me': { paramsTuple?: []; params?: {} }
    'admin.auth.logout': { paramsTuple?: []; params?: {} }
    'admin.admin_users.index': { paramsTuple?: []; params?: {} }
    'admin.admin_users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_users.sync_roles': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_roles.index': { paramsTuple?: []; params?: {} }
    'admin.admin_roles.store': { paramsTuple?: []; params?: {} }
    'admin.admin_roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_roles.sync_permissions': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_permissions.index': { paramsTuple?: []; params?: {} }
    'admin.admin_permissions.store': { paramsTuple?: []; params?: {} }
    'admin.admin_permissions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_permissions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'admin.auth.me': { paramsTuple?: []; params?: {} }
    'admin.admin_users.index': { paramsTuple?: []; params?: {} }
    'admin.admin_roles.index': { paramsTuple?: []; params?: {} }
    'admin.admin_permissions.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'admin.auth.me': { paramsTuple?: []; params?: {} }
    'admin.admin_users.index': { paramsTuple?: []; params?: {} }
    'admin.admin_roles.index': { paramsTuple?: []; params?: {} }
    'admin.admin_permissions.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.admin_roles.store': { paramsTuple?: []; params?: {} }
    'admin.admin_permissions.store': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'admin.auth.logout': { paramsTuple?: []; params?: {} }
    'admin.admin_roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_permissions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'admin.admin_users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_permissions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'admin.admin_users.sync_roles': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_roles.sync_permissions': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}