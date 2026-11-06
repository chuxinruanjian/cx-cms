import vine from '@vinejs/vine'

const username = () =>
  vine
    .string()
    .trim()
    .toLowerCase()
    .minLength(3)
    .maxLength(64)
    .regex(/^[a-z][a-z0-9_]*$/)
export const userPasswordLoginValidator = vine.create({
  username: username(),
  password: vine.string().maxLength(128),
})
export const userWechatLoginValidator = vine.create({
  code: vine.string().trim().minLength(1).maxLength(512),
})
export const userOfficialLoginValidator = vine.create({
  code: vine.string().trim().minLength(1).maxLength(512),
  state: vine.string().regex(/^[0-9a-f]{64}$/),
})
export const updateUserProfileValidator = vine.create({
  nickname: vine.string().trim().maxLength(100).nullable().optional(),
  avatar: vine
    .string()
    .maxLength(512)
    .regex(/^(https?:\/\/[^\s]+|\/api\/v1\/uploads\/files\/[0-9a-f-]{36})$/i)
    .nullable()
    .optional(),
})
export const renameUserValidator = vine.create({ username: username() })
export const setUserPasswordValidator = vine.create({
  password: vine.string().minLength(8).maxLength(128),
  currentPassword: vine.string().maxLength(128).optional(),
})
