/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'admin.auth.login': {
    methods: ["POST"]
    pattern: '/api/v1/admin/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_auth').adminLoginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_auth').adminLoginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.auth.me': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/auth/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['show']>>>
    }
  }
  'admin.auth.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/admin/auth/me'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_auth').updateAdminProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_auth').updateAdminProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.auth.logout': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
    }
  }
  'admin.admin_users.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_users_controller').default['index']>>>
    }
  }
  'admin.admin_users.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/admin/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_rbac').updateAdminUserValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_rbac').updateAdminUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_users_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_users_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.admin_users.sync_roles': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/users/:id/roles'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_rbac').adminUserRolesValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_rbac').adminUserRolesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_users_controller').default['syncRoles']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_users_controller').default['syncRoles']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.admin_roles.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/roles'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_roles_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_roles_controller').default['index']>>>
    }
  }
  'admin.admin_roles.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/roles'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_rbac').createAdminRoleValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_rbac').createAdminRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_roles_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_roles_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.admin_roles.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/admin/roles/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_rbac').updateAdminRoleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_rbac').updateAdminRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_roles_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_roles_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.admin_roles.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/roles/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_roles_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_roles_controller').default['destroy']>>>
    }
  }
  'admin.admin_roles.sync_permissions': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/roles/:id/permissions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_rbac').adminRolePermissionsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_rbac').adminRolePermissionsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_roles_controller').default['syncPermissions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_roles_controller').default['syncPermissions']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.admin_permissions.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/permissions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_permissions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_permissions_controller').default['index']>>>
    }
  }
  'admin.admin_permissions.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/permissions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_rbac').createAdminPermissionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_rbac').createAdminPermissionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_permissions_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_permissions_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.admin_permissions.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/admin/permissions/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_rbac').updateAdminPermissionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_rbac').updateAdminPermissionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_permissions_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_permissions_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.admin_permissions.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/permissions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_permissions_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_permissions_controller').default['destroy']>>>
    }
  }
  'admin.upload_config.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/upload-config'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/upload_config_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/upload_config_controller').default['show']>>>
    }
  }
  'admin.uploads.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/uploads'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_upload').listUploadSessionsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.uploads.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/uploads'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_upload').normalUploadValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_upload').normalUploadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.uploads.initialize': {
    methods: ["POST"]
    pattern: '/api/v1/admin/uploads/init'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_upload').initializeUploadValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_upload').initializeUploadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['initialize']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['initialize']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.uploads.store_chunk': {
    methods: ["POST"]
    pattern: '/api/v1/admin/uploads/:uploadId/chunks'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_upload').uploadChunkValidator)>>
      paramsTuple: [ParamValue]
      params: { uploadId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_upload').uploadChunkValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['storeChunk']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['storeChunk']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.uploads.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/uploads/:uploadId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { uploadId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['show']>>>
    }
  }
  'admin.uploads.complete': {
    methods: ["POST"]
    pattern: '/api/v1/admin/uploads/:uploadId/complete'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { uploadId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['complete']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['complete']>>>
    }
  }
  'admin.uploads.abort': {
    methods: ["POST"]
    pattern: '/api/v1/admin/uploads/:uploadId/abort'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { uploadId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['abort']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['abort']>>>
    }
  }
  'admin.attachments.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/attachments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin_upload').listAttachmentsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.attachments.bind': {
    methods: ["POST"]
    pattern: '/api/v1/admin/attachments/bind'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_upload').bindAttachmentsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_upload').bindAttachmentsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['bind']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['bind']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.attachments.sort': {
    methods: ["POST"]
    pattern: '/api/v1/admin/attachments/sort'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_upload').sortAttachmentsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_upload').sortAttachmentsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['sort']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['sort']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.attachments.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/attachments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['show']>>>
    }
  }
  'admin.attachments.content': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/attachments/:id/content'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['content']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['content']>>>
    }
  }
  'admin.attachments.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/attachments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['destroy']>>>
    }
  }
  'admin.upload_cleanup.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/uploads/cleanup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/upload_cleanup_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/upload_cleanup_controller').default['store']>>>
    }
  }
}
