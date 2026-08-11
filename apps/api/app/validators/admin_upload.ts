import { attachmentStatuses, uploadSessionStatuses } from '#types/upload'
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

export const bindAttachmentsValidator = vine.create({
  attachmentIds: vine.array(vine.number().positive()).maxLength(100),
  businessType: vine
    .string()
    .trim()
    .minLength(2)
    .maxLength(64)
    .regex(/^[a-z][a-z0-9._-]*$/),
  businessId: vine.string().trim().minLength(1).maxLength(64),
  fieldName: vine
    .string()
    .trim()
    .minLength(1)
    .maxLength(64)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
})

export const sortAttachmentsValidator = bindAttachmentsValidator

export const listAttachmentsValidator = vine.create({
  page: vine.number().positive().optional(),
  perPage: vine.number().min(1).max(100).optional(),
  search: vine.string().trim().maxLength(255).optional(),
  fileType: vine
    .enum(['image', 'video', 'audio', 'document', 'archive', 'other'] as const)
    .optional(),
  status: vine.enum(attachmentStatuses).optional(),
  storageDisk: vine.enum(['local', 'qiniu', 'oss', 's3'] as const).optional(),
  uploaderId: vine.number().positive().optional(),
  uploadToken: uploadToken().optional(),
  createdFrom: vine.string().trim().maxLength(40).optional(),
  createdTo: vine.string().trim().maxLength(40).optional(),
})

export const listUploadSessionsValidator = vine.create({
  page: vine.number().positive().optional(),
  perPage: vine.number().min(1).max(100).optional(),
  status: vine.enum(uploadSessionStatuses).optional(),
})
