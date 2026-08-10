import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.auth.sms.send': { paramsTuple?: []; params?: {} }
    'admin.auth.sms.login': { paramsTuple?: []; params?: {} }
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
    'admin.uploads.index': { paramsTuple?: []; params?: {} }
    'admin.uploads.store': { paramsTuple?: []; params?: {} }
    'admin.uploads.initialize': { paramsTuple?: []; params?: {} }
    'admin.uploads.store_chunk': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.uploads.show': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.uploads.complete': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.uploads.abort': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.attachments.index': { paramsTuple?: []; params?: {} }
    'admin.attachments.bind': { paramsTuple?: []; params?: {} }
    'admin.attachments.sort': { paramsTuple?: []; params?: {} }
    'admin.attachments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.attachments.content': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.attachments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.upload_cleanup.store': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'admin.auth.me': { paramsTuple?: []; params?: {} }
    'admin.admin_users.index': { paramsTuple?: []; params?: {} }
    'admin.admin_roles.index': { paramsTuple?: []; params?: {} }
    'admin.admin_permissions.index': { paramsTuple?: []; params?: {} }
    'admin.upload_config.show': { paramsTuple?: []; params?: {} }
    'admin.uploads.index': { paramsTuple?: []; params?: {} }
    'admin.uploads.show': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.attachments.index': { paramsTuple?: []; params?: {} }
    'admin.attachments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.attachments.content': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'admin.auth.me': { paramsTuple?: []; params?: {} }
    'admin.admin_users.index': { paramsTuple?: []; params?: {} }
    'admin.admin_roles.index': { paramsTuple?: []; params?: {} }
    'admin.admin_permissions.index': { paramsTuple?: []; params?: {} }
    'admin.upload_config.show': { paramsTuple?: []; params?: {} }
    'admin.uploads.index': { paramsTuple?: []; params?: {} }
    'admin.uploads.show': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.attachments.index': { paramsTuple?: []; params?: {} }
    'admin.attachments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.attachments.content': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.auth.sms.send': { paramsTuple?: []; params?: {} }
    'admin.auth.sms.login': { paramsTuple?: []; params?: {} }
    'admin.auth.security.mobile.code': { paramsTuple?: []; params?: {} }
    'admin.admin_roles.store': { paramsTuple?: []; params?: {} }
    'admin.admin_permissions.store': { paramsTuple?: []; params?: {} }
    'admin.uploads.store': { paramsTuple?: []; params?: {} }
    'admin.uploads.initialize': { paramsTuple?: []; params?: {} }
    'admin.uploads.store_chunk': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.uploads.complete': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.uploads.abort': { paramsTuple: [ParamValue]; params: {'uploadId': ParamValue} }
    'admin.attachments.bind': { paramsTuple?: []; params?: {} }
    'admin.attachments.sort': { paramsTuple?: []; params?: {} }
    'admin.upload_cleanup.store': { paramsTuple?: []; params?: {} }
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
    'admin.attachments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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