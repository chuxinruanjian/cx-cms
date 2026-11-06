import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'uploaded_files.show': { paramsTuple: [ParamValue]; params: {'uuid': ParamValue} }
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.auth.sms.send': { paramsTuple?: []; params?: {} }
    'admin.auth.sms.login': { paramsTuple?: []; params?: {} }
    'admin.auth.passwordReset.code': { paramsTuple?: []; params?: {} }
    'admin.auth.passwordReset': { paramsTuple?: []; params?: {} }
    'admin.auth.me': { paramsTuple?: []; params?: {} }
    'admin.auth.update': { paramsTuple?: []; params?: {} }
    'admin.auth.logout': { paramsTuple?: []; params?: {} }
    'admin.auth.security.password': { paramsTuple?: []; params?: {} }
    'admin.auth.security.mobile.code': { paramsTuple?: []; params?: {} }
    'admin.auth.security.mobile': { paramsTuple?: []; params?: {} }
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
    'admin.upload_config.show': { paramsTuple?: []; params?: {} }
    'admin.uploads.store': { paramsTuple?: []; params?: {} }
    'admin.uploads.initialize': { paramsTuple?: []; params?: {} }
    'admin.uploads.initialize_direct': { paramsTuple?: []; params?: {} }
    'admin.uploads.complete_direct': { paramsTuple: [ParamValue]; params: {'attachmentId': ParamValue} }
    'admin.uploads.store_chunk': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.uploads.show': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.uploads.complete': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.uploads.abort': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.uploads.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'uploaded_files.show': { paramsTuple: [ParamValue]; params: {'uuid': ParamValue} }
    'admin.auth.me': { paramsTuple?: []; params?: {} }
    'admin.admin_users.index': { paramsTuple?: []; params?: {} }
    'admin.admin_roles.index': { paramsTuple?: []; params?: {} }
    'admin.admin_permissions.index': { paramsTuple?: []; params?: {} }
    'admin.upload_config.show': { paramsTuple?: []; params?: {} }
    'admin.uploads.show': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
  }
  HEAD: {
    'uploaded_files.show': { paramsTuple: [ParamValue]; params: {'uuid': ParamValue} }
    'admin.auth.me': { paramsTuple?: []; params?: {} }
    'admin.admin_users.index': { paramsTuple?: []; params?: {} }
    'admin.admin_roles.index': { paramsTuple?: []; params?: {} }
    'admin.admin_permissions.index': { paramsTuple?: []; params?: {} }
    'admin.upload_config.show': { paramsTuple?: []; params?: {} }
    'admin.uploads.show': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
  }
  POST: {
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.auth.sms.send': { paramsTuple?: []; params?: {} }
    'admin.auth.sms.login': { paramsTuple?: []; params?: {} }
    'admin.auth.passwordReset.code': { paramsTuple?: []; params?: {} }
    'admin.auth.passwordReset': { paramsTuple?: []; params?: {} }
    'admin.auth.security.mobile.code': { paramsTuple?: []; params?: {} }
    'admin.admin_roles.store': { paramsTuple?: []; params?: {} }
    'admin.admin_permissions.store': { paramsTuple?: []; params?: {} }
    'admin.uploads.store': { paramsTuple?: []; params?: {} }
    'admin.uploads.initialize': { paramsTuple?: []; params?: {} }
    'admin.uploads.initialize_direct': { paramsTuple?: []; params?: {} }
    'admin.uploads.complete_direct': { paramsTuple: [ParamValue]; params: {'attachmentId': ParamValue} }
    'admin.uploads.store_chunk': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.uploads.complete': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.uploads.abort': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
  }
  PATCH: {
    'admin.auth.update': { paramsTuple?: []; params?: {} }
    'admin.auth.security.password': { paramsTuple?: []; params?: {} }
    'admin.admin_users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_permissions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'admin.auth.logout': { paramsTuple?: []; params?: {} }
    'admin.admin_roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_permissions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.uploads.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'admin.auth.security.mobile': { paramsTuple?: []; params?: {} }
    'admin.admin_users.sync_roles': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_roles.sync_permissions': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}