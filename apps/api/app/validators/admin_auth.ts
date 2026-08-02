import vine from '@vinejs/vine'

export const adminLoginValidator = vine.create({
  username: vine.string().trim().minLength(2).maxLength(64),
  password: vine.string().minLength(1).maxLength(128),
  remember: vine.boolean().optional(),
})

export const updateAdminProfileValidator = vine.create({
  fullName: vine.string().trim().minLength(1).maxLength(64),
  email: vine.string().trim().email().maxLength(254),
  profile: vine.string().trim().maxLength(500).nullable().optional(),
  avatarAttachmentId: vine.number().positive().nullable().optional(),
})
