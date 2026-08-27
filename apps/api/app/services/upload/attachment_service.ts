import uploadConfig from '#config/upload'
import UploadException from '#exceptions/upload_exception'
import Attachment from '#models/attachment'
import type AdminUser from '#models/admin_user'
import FileInspectorService from '#services/upload/file_inspector_service'
import StorageManager from '#services/upload/storage/storage_manager'
import type { StorageDisk, UploadMode } from '#types/upload'
import logger from '@adonisjs/core/services/logger'
import { randomUUID } from 'node:crypto'
import { stat } from 'node:fs/promises'
import { DateTime } from 'luxon'

interface FinalizeInput {
  sourcePath: string
  mimeType: string
  expectedSize: number
  expectedHash?: string | null
}

interface DirectUploadInput {
  originalName: string
  mimeType: string
  fileSize: number
  uploadToken: string
}

export default class AttachmentService {
  static async initializeDirect(user: AdminUser, input: DirectUploadInput) {
    if (!uploadConfig.directUploadEnabled) {
      throw new UploadException(
        'Qiniu direct upload is not enabled',
        'E_UPLOAD_DIRECT_DISABLED',
        503
      )
    }

    const originalName = FileInspectorService.sanitizeOriginalName(input.originalName)
    const mimeType = input.mimeType || 'application/octet-stream'
    const fileType = FileInspectorService.classify(originalName, mimeType)
    FileInspectorService.assertSize(fileType, input.fileSize)
    const extension = FileInspectorService.extension(originalName)
    const now = DateTime.now()
    const uuid = randomUUID()
    const objectKey = this.objectKey(fileType, uuid, extension, now)
    const authorization = StorageManager.direct('qiniu').createDirectUpload(
      objectKey,
      input.fileSize,
      mimeType
    )
    const attachment = await Attachment.create({
      uuid,
      parentAttachmentId: null,
      originalName,
      storageDisk: 'qiniu',
      storagePath: objectKey,
      objectKey,
      url: null,
      extension,
      mimeType,
      fileType,
      size: input.fileSize,
      hash: null,
      width: null,
      height: null,
      duration: null,
      status: 'uploading',
      uploadMode: 'direct',
      uploadToken: input.uploadToken,
      uploaderId: user.id,
      isComplete: false,
      errorMessage: null,
      lastUsedAt: now,
      boundAt: null,
      expiresAt: now.plus({ hours: uploadConfig.temporaryTtlHours }),
      deletedAt: null,
    })

    return {
      attachmentId: attachment.id,
      provider: 'qiniu' as const,
      objectKey: authorization.objectKey,
      uploadUrl: authorization.uploadUrl,
      providerToken: authorization.token,
      expiresIn: authorization.expiresIn,
    }
  }

  static async completeDirect(user: AdminUser, attachmentId: number, uploadToken: string) {
    const attachment = await Attachment.findOrFail(attachmentId)
    if (!user.isSuperAdmin && attachment.uploaderId !== user.id) {
      throw new UploadException('Cannot complete this upload', 'E_ATTACHMENT_FORBIDDEN', 403)
    }
    if (attachment.uploadMode !== 'direct' || attachment.storageDisk !== 'qiniu') {
      throw new UploadException(
        'Attachment is not a Qiniu direct upload',
        'E_UPLOAD_DIRECT_INVALID'
      )
    }
    if (attachment.uploadToken !== uploadToken) {
      throw new UploadException('Upload token does not match', 'E_UPLOAD_TOKEN_MISMATCH', 403)
    }
    if (attachment.isComplete) return attachment
    if (!attachment.objectKey) {
      throw new UploadException('Upload object key is missing', 'E_UPLOAD_OBJECT_KEY_MISSING')
    }

    try {
      const stored = await StorageManager.direct('qiniu').inspect(attachment.objectKey)
      if (stored.size !== Number(attachment.size)) {
        await StorageManager.disk('qiniu').delete(attachment.objectKey)
        throw new UploadException('Uploaded file size does not match', 'E_UPLOAD_SIZE_MISMATCH')
      }
      FileInspectorService.classify(attachment.originalName, stored.mimeType)
      const now = DateTime.now()
      attachment.merge({
        storagePath: stored.storagePath,
        objectKey: stored.objectKey,
        url: stored.url,
        mimeType: stored.mimeType,
        hash: stored.hash,
        status: 'active',
        isComplete: true,
        errorMessage: null,
        lastUsedAt: now,
        expiresAt: null,
      })
      await attachment.save()
      logger.info(
        {
          operation: 'qiniu_direct_upload_completed',
          userId: user.id,
          attachmentId: attachment.id,
          storagePath: stored.storagePath,
        },
        'Qiniu direct upload completed'
      )
      return attachment
    } catch (error) {
      attachment.status = 'failed'
      attachment.errorMessage = error instanceof Error ? error.message : 'Direct upload failed'
      await attachment.save()
      throw error
    }
  }

  static async createNormal(
    user: AdminUser,
    input: FinalizeInput & {
      originalName: string
      uploadToken: string
    }
  ) {
    const originalName = FileInspectorService.sanitizeOriginalName(input.originalName)
    const attachment = await Attachment.create({
      uuid: randomUUID(),
      parentAttachmentId: null,
      originalName,
      storageDisk: uploadConfig.defaultDisk,
      storagePath: null,
      objectKey: null,
      url: null,
      extension: FileInspectorService.extension(originalName),
      mimeType: input.mimeType || 'application/octet-stream',
      fileType: FileInspectorService.classify(
        originalName,
        input.mimeType || 'application/octet-stream'
      ),
      size: input.expectedSize,
      hash: null,
      width: null,
      height: null,
      duration: null,
      status: 'uploading',
      uploadMode: 'normal',
      uploadToken: input.uploadToken,
      uploaderId: user.id,
      isComplete: false,
      errorMessage: null,
      lastUsedAt: DateTime.now(),
      boundAt: null,
      expiresAt: DateTime.now().plus({ hours: uploadConfig.temporaryTtlHours }),
      deletedAt: null,
    })

    try {
      await this.finalize(attachment, input)
      return attachment
    } catch (error) {
      attachment.status = 'failed'
      attachment.errorMessage = error instanceof Error ? error.message : 'Upload failed'
      await attachment.save()
      throw error
    }
  }

  static async finalize(attachment: Attachment, input: FinalizeInput) {
    const fileStat = await stat(input.sourcePath)
    if (fileStat.size !== input.expectedSize) {
      throw new UploadException('Uploaded file size does not match', 'E_UPLOAD_SIZE_MISMATCH')
    }

    const inspected = await FileInspectorService.inspect(
      input.sourcePath,
      attachment.originalName,
      input.mimeType,
      fileStat.size
    )
    if (input.expectedHash && inspected.hash !== input.expectedHash.toLowerCase()) {
      throw new UploadException('Uploaded file hash does not match', 'E_UPLOAD_HASH_MISMATCH')
    }

    const now = DateTime.now()
    const objectKey = this.objectKey(inspected.fileType, attachment.uuid, inspected.extension, now)
    const stored = await StorageManager.disk(attachment.storageDisk as StorageDisk).put(
      input.sourcePath,
      objectKey
    )

    attachment.merge({
      storageDisk: stored.disk,
      storagePath: stored.storagePath,
      objectKey: stored.objectKey,
      url: stored.url,
      extension: inspected.extension,
      mimeType: input.mimeType,
      fileType: inspected.fileType,
      size: fileStat.size,
      hash: inspected.hash,
      status: 'active',
      isComplete: true,
      errorMessage: null,
      lastUsedAt: now,
      expiresAt: null,
    })
    await attachment.save()

    logger.info(
      {
        operation: 'upload_completed',
        userId: attachment.uploaderId,
        attachmentId: attachment.id,
        storagePath: stored.storagePath,
      },
      'Attachment upload completed'
    )
    return attachment
  }

  static async delete(user: AdminUser | null, attachment: Attachment, system = false) {
    if (attachment.status === 'deleted') {
      return this.serialize(attachment)
    }
    if (!system && (!user || (!user.isSuperAdmin && attachment.uploaderId !== user.id))) {
      throw new UploadException('Cannot delete this attachment', 'E_ATTACHMENT_FORBIDDEN', 403)
    }

    attachment.status = 'pending_delete'
    await attachment.save()

    const derivatives = await Attachment.query().where('parent_attachment_id', attachment.id)
    for (const derivative of derivatives) {
      await this.delete(user, derivative, true)
    }

    if (attachment.objectKey) {
      await StorageManager.disk(attachment.storageDisk as StorageDisk).delete(attachment.objectKey)
    }

    attachment.status = 'deleted'
    attachment.deletedAt = DateTime.now()
    attachment.expiresAt = null
    await attachment.save()

    logger.info(
      {
        operation: 'attachment_deleted',
        userId: system ? null : user?.id,
        attachmentId: attachment.id,
        storagePath: attachment.storagePath,
      },
      'Attachment deleted'
    )
    return this.serialize(attachment)
  }

  static async findAndSerialize(id: number) {
    const attachment = await Attachment.findOrFail(id)
    return this.serialize(attachment)
  }

  static serialize(attachment: Attachment) {
    const localContentUrl =
      attachment.status === 'deleted' ? null : `/api/v1/uploads/files/${attachment.uuid}`
    const contentUrl = attachment.status === 'deleted' ? null : attachment.url || localContentUrl
    return {
      id: attachment.id,
      uuid: attachment.uuid,
      originalName: attachment.originalName,
      fileName: attachment.originalName,
      storageDisk: attachment.storageDisk,
      extension: attachment.extension,
      mimeType: attachment.mimeType,
      fileType: attachment.fileType,
      size: Number(attachment.size),
      hash: attachment.hash,
      width: attachment.width,
      height: attachment.height,
      duration: attachment.duration,
      status: attachment.status,
      uploadMode: attachment.uploadMode as UploadMode,
      uploadToken: attachment.uploadToken,
      uploaderId: attachment.uploaderId,
      isComplete: Boolean(attachment.isComplete),
      url: contentUrl,
      previewUrl: contentUrl,
      downloadUrl: contentUrl,
      progress: attachment.isComplete ? 100 : 0,
      errorMessage: attachment.errorMessage,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
      boundAt: attachment.boundAt,
      expiresAt: attachment.expiresAt,
      deletedAt: attachment.deletedAt,
    }
  }

  private static objectKey(fileType: string, uuid: string, extension: string, date: DateTime) {
    const folder = fileType === 'image' ? 'images' : fileType === 'video' ? 'videos' : 'files'
    return `${folder}/${date.toFormat('yyyy/LL')}/${uuid}.${extension}`
  }
}
