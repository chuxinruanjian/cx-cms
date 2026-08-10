import vine from '@vinejs/vine'

export const adminLoginValidator = vine.create({
  username: vine.string().trim().minLength(2).maxLength(64),
  password: vine.string().minLength(1).maxLength(128),
  remember: vine.boolean().optional(),
})

const adminMobile = () =>
  vine
    .string()
    .trim()
    .regex(/^1[3-9]\d{9}$/)

export const adminSmsSendValidator = vine.create({
  mobile: adminMobile(),
})

export const adminSmsLoginValidator = vine.create({
  mobile: adminMobile(),
  code: vine
    .string()
    .trim()
    .regex(/^\d{6}$/),
  remember: vine.boolean().optional(),
})

export const changeAdminPasswordValidator = vine.create({
  currentPassword: vine.string().minLength(1).maxLength(128),
  newPassword: vine
    .string()
    .minLength(8)
    .maxLength(128)
    .regex(/[A-Za-z]/)
    .regex(/\d/),
})

export const sendAdminMobileCodeValidator = vine.create({
  mobile: adminMobile(),
})

export const updateAdminMobileValidator = vine.create({
  currentPassword: vine.string().minLength(1).maxLength(128),
  mobile: adminMobile(),
  code: vine
    .string()
    .trim()
    .regex(/^\d{6}$/),
})

export const resetAdminPasswordCodeValidator = vine.create({
  mobile: adminMobile(),
})

export const resetAdminPasswordValidator = vine.create({
  mobile: adminMobile(),
  code: vine
    .string()
    .trim()
    .regex(/^\d{6}$/),
  newPassword: vine
    .string()
    .minLength(8)
    .maxLength(128)
    .regex(/[A-Za-z]/)
    .regex(/\d/),
})

export const updateAdminProfileValidator = vine.create({
  fullName: vine.string().trim().minLength(1).maxLength(64),
  email: vine.string().trim().email().maxLength(254),
  profile: vine.string().trim().maxLength(500).nullable().optional(),
  avatarAttachmentId: vine.number().positive().nullable().optional(),
})
