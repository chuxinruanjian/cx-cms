import vine from '@vinejs/vine'

const code = () =>
  vine
    .string()
    .trim()
    .minLength(2)
    .maxLength(128)
    .regex(/^[a-z][a-z0-9._-]*$/)

export const createAdminRoleValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(64),
  code: code(),
  description: vine.string().trim().maxLength(255).nullable().optional(),
  status: vine.boolean().optional(),
})

export const updateAdminRoleValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(64).optional(),
  code: code().optional(),
  description: vine.string().trim().maxLength(255).nullable().optional(),
  status: vine.boolean().optional(),
})

export const createAdminPermissionValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(64),
  code: code(),
  description: vine.string().trim().maxLength(255).nullable().optional(),
  status: vine.boolean().optional(),
})

export const updateAdminPermissionValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(64).optional(),
  code: code().optional(),
  description: vine.string().trim().maxLength(255).nullable().optional(),
  status: vine.boolean().optional(),
})

export const adminRolePermissionsValidator = vine.create({
  permissionIds: vine.array(vine.number().positive()),
})

export const adminUserRolesValidator = vine.create({
  roleIds: vine.array(vine.number().positive()),
})

export const updateAdminUserValidator = vine.create({
  fullName: vine.string().trim().maxLength(64).nullable().optional(),
  email: vine.string().trim().email().maxLength(254).optional(),
  avatar: vine.string().trim().maxLength(255).nullable().optional(),
  status: vine.boolean().optional(),
})
