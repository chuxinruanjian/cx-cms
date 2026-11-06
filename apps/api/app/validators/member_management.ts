import vine from '@vinejs/vine'

export const listMembersValidator = vine.create({
  keyword: vine.string().trim().maxLength(100).optional(),
  status: vine.boolean().optional(),
  page: vine.number().withoutDecimals().positive().optional(),
  perPage: vine.number().withoutDecimals().range([1, 100]).optional(),
})
export const updateMemberValidator = vine.create({
  nickname: vine.string().trim().maxLength(100).nullable().optional(),
  avatar: vine
    .string()
    .maxLength(512)
    .regex(/^(https?:\/\/[^\s]+|\/api\/v1\/uploads\/files\/[0-9a-f-]{36})$/i)
    .nullable()
    .optional(),
  status: vine.boolean().optional(),
})
