/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'system_configs.public_index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/system-configs/public'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_configs_controller').default['publicIndex']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_configs_controller').default['publicIndex']>>>
    }
  }
  'uploaded_files.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/uploads/files/:uuid'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { uuid: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/uploaded_files_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/uploaded_files_controller').default['show']>>>
    }
  }
  'user.user_auth.login': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user_auth').userPasswordLoginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user_auth').userPasswordLoginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['login']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.user_auth.mini': {
    methods: ["POST"]
    pattern: '/api/v1/auth/wechat/mini-program'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user_auth').userWechatLoginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user_auth').userWechatLoginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['mini']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['mini']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.user_auth.authorize': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/wechat/official-account/authorize'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['authorize']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['authorize']>>>
    }
  }
  'user.user_auth.official': {
    methods: ["POST"]
    pattern: '/api/v1/auth/wechat/official-account'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user_auth').userOfficialLoginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user_auth').userOfficialLoginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['official']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['official']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.upload_config.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/upload-config'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/upload_config_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/upload_config_controller').default['show']>>>
    }
  }
  'user.user_uploads.store': {
    methods: ["POST"]
    pattern: '/api/v1/uploads'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['store']>>>
    }
  }
  'user.user_uploads.initialize': {
    methods: ["POST"]
    pattern: '/api/v1/uploads/init'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['initialize']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['initialize']>>>
    }
  }
  'user.user_uploads.initialize_direct': {
    methods: ["POST"]
    pattern: '/api/v1/uploads/direct/init'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['initializeDirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['initializeDirect']>>>
    }
  }
  'user.user_uploads.complete_direct': {
    methods: ["POST"]
    pattern: '/api/v1/uploads/direct/:attachmentId/complete'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { attachmentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['completeDirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['completeDirect']>>>
    }
  }
  'user.user_uploads.store_chunk': {
    methods: ["POST"]
    pattern: '/api/v1/uploads/:uploadId/chunks'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { uploadId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['storeChunk']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['storeChunk']>>>
    }
  }
  'user.user_uploads.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/uploads/:uploadId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { uploadId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['show']>>>
    }
  }
  'user.user_uploads.complete': {
    methods: ["POST"]
    pattern: '/api/v1/uploads/:uploadId/complete'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { uploadId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['complete']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['complete']>>>
    }
  }
  'user.user_uploads.abort': {
    methods: ["POST"]
    pattern: '/api/v1/uploads/:uploadId/abort'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { uploadId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['abort']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['abort']>>>
    }
  }
  'user.user_uploads.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/uploads/files/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_uploads_controller').default['destroy']>>>
    }
  }
  'user.user_auth.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['show']>>>
    }
  }
  'user.user_auth.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/auth/me'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user_auth').updateUserProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user_auth').updateUserProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.user_auth.rename': {
    methods: ["PATCH"]
    pattern: '/api/v1/auth/username'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user_auth').renameUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user_auth').renameUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['rename']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['rename']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.user_auth.password': {
    methods: ["PUT"]
    pattern: '/api/v1/auth/password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user_auth').setUserPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user_auth').setUserPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['password']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['password']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.user_auth.logout': {
    methods: ["DELETE"]
    pattern: '/api/v1/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_auth_controller').default['logout']>>>
    }
  }
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
  'admin.auth.sms.send': {
    methods: ["POST"]
    pattern: '/api/v1/admin/auth/sms/send'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_auth').adminSmsSendValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_auth').adminSmsSendValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['sendSms']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['sendSms']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.auth.sms.login': {
    methods: ["POST"]
    pattern: '/api/v1/admin/auth/sms/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_auth').adminSmsLoginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_auth').adminSmsLoginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['smsLogin']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['smsLogin']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.auth.passwordReset.code': {
    methods: ["POST"]
    pattern: '/api/v1/admin/auth/password-reset/code'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_auth').resetAdminPasswordCodeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_auth').resetAdminPasswordCodeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_security_controller').default['sendPasswordResetCode']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_security_controller').default['sendPasswordResetCode']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.auth.passwordReset': {
    methods: ["POST"]
    pattern: '/api/v1/admin/auth/password-reset'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_auth').resetAdminPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_auth').resetAdminPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_security_controller').default['resetPassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_security_controller').default['resetPassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.members.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/members'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/member_management').listMembersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/members_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/members_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.members.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/members/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/members_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/members_controller').default['show']>>>
    }
  }
  'admin.members.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/admin/members/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/member_management').updateMemberValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/member_management').updateMemberValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/members_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/members_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
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
  'admin.auth.security.password': {
    methods: ["PATCH"]
    pattern: '/api/v1/admin/auth/security/password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_auth').changeAdminPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_auth').changeAdminPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_security_controller').default['updatePassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_security_controller').default['updatePassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.auth.security.mobile.code': {
    methods: ["POST"]
    pattern: '/api/v1/admin/auth/security/mobile/code'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_auth').sendAdminMobileCodeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_auth').sendAdminMobileCodeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_security_controller').default['sendMobileCode']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_security_controller').default['sendMobileCode']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.auth.security.mobile': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/auth/security/mobile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_auth').updateAdminMobileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_auth').updateAdminMobileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_security_controller').default['updateMobile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_security_controller').default['updateMobile']>>> | { status: 422; response: { errors: SimpleError[] } }
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
  'admin.system_configs.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/system-configs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/system_config').listSystemConfigsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_configs_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_configs_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.system_configs.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/system-configs'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/system_config').createSystemConfigValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/system_config').createSystemConfigValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_configs_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_configs_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.system_configs.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/admin/system-configs/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/system_config').updateSystemConfigValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/system_config').updateSystemConfigValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_configs_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_configs_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.system_configs.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/system-configs/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system_configs_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system_configs_controller').default['destroy']>>>
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
  'admin.uploads.initialize_direct': {
    methods: ["POST"]
    pattern: '/api/v1/admin/uploads/direct/init'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_upload').initializeUploadValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_upload').initializeUploadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['initializeDirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['initializeDirect']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.uploads.complete_direct': {
    methods: ["POST"]
    pattern: '/api/v1/admin/uploads/direct/:attachmentId/complete'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_upload').completeDirectUploadValidator)>>
      paramsTuple: [ParamValue]
      params: { attachmentId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_upload').completeDirectUploadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['completeDirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['completeDirect']>>> | { status: 422; response: { errors: SimpleError[] } }
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
  'admin.uploads.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/uploads/files/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['destroy']>>>
    }
  }
}
