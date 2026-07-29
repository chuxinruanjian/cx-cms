import vine from '@vinejs/vine'

export const adminLoginValidator = vine.create({
  username: vine.string().trim().minLength(2).maxLength(64),
  password: vine.string().minLength(1).maxLength(128),
  remember: vine.boolean().optional(),
})
