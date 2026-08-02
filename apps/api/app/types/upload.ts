export const attachmentStatuses = [
  'uploading',
  'temporary',
  'active',
  'pending_delete',
  'deleted',
  'failed',
] as const

export type AttachmentStatus = (typeof attachmentStatuses)[number]

export const uploadSessionStatuses = [
  'initialized',
  'uploading',
  'completed',
  'aborted',
  'expired',
  'failed',
] as const

export type UploadSessionStatus = (typeof uploadSessionStatuses)[number]
export type AttachmentFileType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
export type UploadMode = 'normal' | 'multipart' | 'direct'
export type StorageDisk = 'local' | 'oss' | 's3'
