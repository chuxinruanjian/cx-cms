import uploadConfig from '#config/upload'
import UploadException from '#exceptions/upload_exception'
import AdminAttachment from '#models/admin_attachment'
import AdminAttachmentRelation from '#models/admin_attachment_relation'
import type AdminUser from '#models/admin_user'
import AdminRbacService from '#services/admin_rbac_service'
import FileInspectorService from '#services/upload/file_inspector_service'
import StorageManager from '#services/upload/storage/storage_manager'
import type { UploadMode } from '#types/upload'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import { randomUUID } from 'node:crypto'
import { stat } from 'node:fs/promises'
import { DateTime } from 'luxon'

interface FinalizeInput {
  sourcePath: string
  mimeType: string
  expectedSize: number
  expectedHash?: string | null
}

interface BindInput {
  attachmentIds: number[]
  businessType: string
  businessId: string
  fieldName: string
}

export default class AttachmentService {
  static async createNormal(
    user: AdminUser,
    input: FinalizeInput & {
      originalName: string
      uploadToken: string
    }
  ) {
    const originalName = FileInspectorService.sanitizeOriginalName(input.originalName)
    const attachment = await AdminAttachment.create({
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

  static async finalize(attachment: AdminAttachment, input: FinalizeInput) {
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
    const stored = await StorageManager.disk(attachment.storageDisk as 'local' | 'oss' | 's3').put(
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
      status: 'temporary',
      isComplete: true,
      errorMessage: null,
      lastUsedAt: now,
      expiresAt: now.plus({ hours: uploadConfig.temporaryTtlHours }),
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

  static async bind(user: AdminUser, input: BindInput) {
    const ids = [...new Set(input.attachmentIds)]
    const attachments = ids.length
      ? await AdminAttachment.query().whereIn('id', ids).whereNot('status', 'deleted')
      : []
    const attachmentsById = new Map(attachments.map((attachment) => [attachment.id, attachment]))

    if (attachments.length !== ids.length) {
      throw new UploadException(
        'One or more attachments do not exist',
        'E_ATTACHMENT_NOT_FOUND',
        404
      )
    }
    if (!user.isSuperAdmin && attachments.some((attachment) => attachment.uploaderId !== user.id)) {
      throw new UploadException(
        'Cannot bind another user’s attachment',
        'E_ATTACHMENT_FORBIDDEN',
        403
      )
    }
    if (
      attachments.some((attachment) => !attachment.isComplete || attachment.status === 'failed')
    ) {
      throw new UploadException('Attachment is not ready to bind', 'E_ATTACHMENT_NOT_READY')
    }

    await db.transaction(async (trx) => {
      const previousRelations = await AdminAttachmentRelation.query({ client: trx })
        .where('business_type', input.businessType)
        .where('business_id', input.businessId)
        .where('field_name', input.fieldName)
        .preload('attachment')
      if (
        !user.isSuperAdmin &&
        previousRelations.some((relation) => relation.attachment.uploaderId !== user.id)
      ) {
        throw new UploadException(
          'Cannot replace another user’s attachment binding',
          'E_ATTACHMENT_FORBIDDEN',
          403
        )
      }
      const detachedIds = previousRelations
        .filter((relation) => !ids.includes(relation.attachmentId))
        .map((relation) => relation.attachmentId)

      if (detachedIds.length) {
        await AdminAttachmentRelation.query({ client: trx })
          .where('business_type', input.businessType)
          .where('business_id', input.businessId)
          .where('field_name', input.fieldName)
          .whereIn('attachment_id', detachedIds)
          .delete()

        for (const detachedId of detachedIds) {
          const remaining = await AdminAttachmentRelation.query({ client: trx })
            .where('attachment_id', detachedId)
            .count('* as total')
            .first()
          if (Number(remaining?.$extras.total ?? 0) === 0) {
            const detached = await AdminAttachment.find(detachedId, { client: trx })
            if (detached && detached.status !== 'deleted') {
              detached.useTransaction(trx)
              detached.status = 'temporary'
              detached.boundAt = null
              detached.lastUsedAt = DateTime.now()
              detached.expiresAt = DateTime.now().plus({
                hours: uploadConfig.temporaryTtlHours,
              })
              await detached.save()
            }
          }
        }
      }

      for (const [sort, attachmentId] of ids.entries()) {
        const attachment = attachmentsById.get(attachmentId)!
        attachment.useTransaction(trx)
        let relation = await AdminAttachmentRelation.query({ client: trx })
          .where('attachment_id', attachment.id)
          .where('business_type', input.businessType)
          .where('business_id', input.businessId)
          .where('field_name', input.fieldName)
          .first()
        if (!relation) {
          relation = new AdminAttachmentRelation()
          relation.useTransaction(trx)
          relation.merge({
            attachmentId: attachment.id,
            businessType: input.businessType,
            businessId: input.businessId,
            fieldName: input.fieldName,
          })
        }
        relation.sort = sort
        await relation.save()

        attachment.status = 'active'
        attachment.boundAt = DateTime.now()
        attachment.lastUsedAt = DateTime.now()
        attachment.expiresAt = null
        await attachment.save()
      }
    })

    logger.info(
      {
        operation: 'attachments_bound',
        userId: user.id,
        attachmentIds: ids,
        businessType: input.businessType,
        businessId: input.businessId,
        fieldName: input.fieldName,
      },
      'Attachments bound to business record'
    )
    return Promise.all(ids.map((id) => this.findAndSerialize(id)))
  }

  static async sort(
    user: AdminUser,
    input: Omit<BindInput, 'attachmentIds'> & { attachmentIds: number[] }
  ) {
    const relations = await AdminAttachmentRelation.query()
      .where('business_type', input.businessType)
      .where('business_id', input.businessId)
      .where('field_name', input.fieldName)
      .preload('attachment')

    const requestedIds = new Set(input.attachmentIds)
    if (
      relations.length !== requestedIds.size ||
      relations.some((relation) => !requestedIds.has(relation.attachmentId))
    ) {
      throw new UploadException(
        'Sort list does not match bound attachments',
        'E_ATTACHMENT_SORT_INVALID'
      )
    }
    if (
      !user.isSuperAdmin &&
      relations.some((relation) => relation.attachment.uploaderId !== user.id)
    ) {
      throw new UploadException(
        'Cannot sort another user’s attachments',
        'E_ATTACHMENT_FORBIDDEN',
        403
      )
    }

    await db.transaction(async (trx) => {
      for (const [sort, attachmentId] of input.attachmentIds.entries()) {
        await AdminAttachmentRelation.query({ client: trx })
          .where('attachment_id', attachmentId)
          .where('business_type', input.businessType)
          .where('business_id', input.businessId)
          .where('field_name', input.fieldName)
          .update({ sort })
      }
    })
    return { attachmentIds: input.attachmentIds }
  }

  static async delete(user: AdminUser | null, attachment: AdminAttachment, system = false) {
    if (attachment.status === 'deleted') {
      return this.serialize(attachment, 0)
    }
    if (!system && (!user || !(await this.canDelete(user, attachment)))) {
      throw new UploadException('Cannot delete this attachment', 'E_ATTACHMENT_FORBIDDEN', 403)
    }

    const relationCount = await AdminAttachmentRelation.query()
      .where('attachment_id', attachment.id)
      .count('* as total')
      .first()
    if (Number(relationCount?.$extras.total ?? 0) > 0) {
      throw new UploadException(
        'Attachment is still referenced by business data',
        'E_ATTACHMENT_IN_USE',
        409
      )
    }

    attachment.status = 'pending_delete'
    await attachment.save()

    const derivatives = await AdminAttachment.query().where('parent_attachment_id', attachment.id)
    for (const derivative of derivatives) {
      await this.delete(user, derivative, true)
    }

    if (attachment.objectKey) {
      await StorageManager.disk(attachment.storageDisk as 'local' | 'oss' | 's3').delete(
        attachment.objectKey
      )
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
    return this.serialize(attachment, 0)
  }

  static async findAndSerialize(id: number) {
    const attachment = await AdminAttachment.findOrFail(id)
    const relations = await AdminAttachmentRelation.query()
      .where('attachment_id', id)
      .orderBy('sort', 'asc')
    return {
      ...this.serialize(attachment, relations.length),
      references: relations.map((relation) => ({
        businessType: relation.businessType,
        businessId: relation.businessId,
        fieldName: relation.fieldName,
        sort: relation.sort,
        createdAt: relation.createdAt,
      })),
    }
  }

  static serialize(attachment: AdminAttachment, referenceCount = 0) {
    const contentUrl =
      attachment.status === 'deleted' ? null : `/api/v1/admin/attachments/${attachment.id}/content`
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
      referenceCount,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
      boundAt: attachment.boundAt,
      expiresAt: attachment.expiresAt,
      deletedAt: attachment.deletedAt,
    }
  }

  private static async canDelete(user: AdminUser, attachment: AdminAttachment) {
    return (
      user.isSuperAdmin ||
      attachment.uploaderId === user.id ||
      (await AdminRbacService.allows(user, { permissions: ['admin.attachments.delete'] }))
    )
  }

  private static objectKey(fileType: string, uuid: string, extension: string, date: DateTime) {
    const folder = fileType === 'image' ? 'images' : fileType === 'video' ? 'videos' : 'files'
    return `${folder}/${date.toFormat('yyyy/LL')}/${uuid}.${extension}`
  }
}
