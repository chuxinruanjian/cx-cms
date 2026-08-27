import vine from '@vinejs/vine'

const uploadToken = () =>
  vine
    .string()
    .trim()
    .minLength(8)
    .maxLength(64)
    .regex(/^[A-Za-z0-9_-]+$/)

const hash = () =>
  vine
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{64}$/)

export const normalUploadValidator = vine.create({
  uploadToken: uploadToken(),
})

export const initializeUploadValidator = vine.create({
  originalName: vine.string().trim().minLength(1).maxLength(255),
  mimeType: vine.string().trim().minLength(1).maxLength(128),
  fileSize: vine.number().positive(),
  fileHash: hash().nullable().optional(),
  uploadToken: uploadToken(),
  chunkSize: vine.number().positive().optional(),
})

export const completeDirectUploadValidator = vine.create({
  uploadToken: uploadToken(),
})

export const uploadChunkValidator = vine.create({
  chunkIndex: vine.number().min(0),
  chunkHash: hash(),
})
