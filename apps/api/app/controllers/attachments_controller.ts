import UploadException from '#exceptions/upload_exception'
import Attachment from '#models/attachment'
import AttachmentRelation from '#models/attachment_relation'
import AdminRbacService from '#services/admin_rbac_service'
import AttachmentService from '#services/upload/attachment_service'
import StorageManager from '#services/upload/storage/storage_manager'
import {
  bindAttachmentsValidator,
  listAttachmentsValidator,
  sortAttachmentsValidator,
} from '#validators/admin_upload'
import type { HttpContext } from '@adonisjs/core/http'
import type { StorageDisk } from '#types/upload'
import { DateTime } from 'luxon'

export default class AttachmentsController {
  async index({ auth, request }: HttpContext) {
    auth.getUserOrFail()
    const filters = await request.validateUsing(listAttachmentsValidator)
    const query = Attachment.query().orderBy('id', 'desc')
    if (filters.search) query.whereLike('original_name', `%${filters.search}%`)
    if (filters.fileType) query.where('file_type', filters.fileType)
    if (filters.status) query.where('status', filters.status)
    if (filters.storageDisk) query.where('storage_disk', filters.storageDisk)
    if (filters.uploaderId) query.where('uploader_id', filters.uploaderId)
    if (filters.uploadToken) query.where('upload_token', filters.uploadToken)
    if (filters.createdFrom) {
      const from = DateTime.fromISO(filters.createdFrom)
      if (!from.isValid) throw new UploadException('Invalid createdFrom date', 'E_DATE_INVALID')
      query.where('created_at', '>=', from.toSQL()!)
    }
    if (filters.createdTo) {
      const to = DateTime.fromISO(filters.createdTo)
      if (!to.isValid) throw new UploadException('Invalid createdTo date', 'E_DATE_INVALID')
      query.where('created_at', '<=', to.toSQL()!)
    }

    const result = await query.paginate(filters.page || 1, filters.perPage || 20)
    const data = await Promise.all(
      result.all().map(async (attachment) => {
        const count = await AttachmentRelation.query()
          .where('attachment_id', attachment.id)
          .count('* as total')
          .first()
        return AttachmentService.serialize(attachment, Number(count?.$extras.total ?? 0))
      })
    )
    return { data, meta: result.getMeta() }
  }

  async show({ auth, params }: HttpContext) {
    const attachment = await this.authorizedAttachment(auth.getUserOrFail(), params.id)
    return AttachmentService.findAndSerialize(attachment.id)
  }

  async content({ auth, params, request, response }: HttpContext) {
    const attachment = await this.authorizedAttachment(auth.getUserOrFail(), params.id)
    if (!attachment.objectKey || attachment.status === 'deleted') {
      throw new UploadException(
        'Attachment content is unavailable',
        'E_ATTACHMENT_FILE_MISSING',
        404
      )
    }
    const stream = await StorageManager.disk(attachment.storageDisk as StorageDisk).read(
      attachment.objectKey
    )
    const disposition = request.input('download') === '1' ? 'attachment' : 'inline'
    const encodedName = encodeURIComponent(attachment.originalName)
    response.header('Content-Type', attachment.mimeType)
    response.header('Content-Length', String(attachment.size))
    response.header('Content-Disposition', `${disposition}; filename*=UTF-8''${encodedName}`)
    return response.stream(stream)
  }

  async bind({ auth, request }: HttpContext) {
    return AttachmentService.bind(
      auth.getUserOrFail(),
      await request.validateUsing(bindAttachmentsValidator)
    )
  }

  async sort({ auth, request }: HttpContext) {
    return AttachmentService.sort(
      auth.getUserOrFail(),
      await request.validateUsing(sortAttachmentsValidator)
    )
  }

  async destroy({ auth, params }: HttpContext) {
    const attachment = await Attachment.findOrFail(params.id)
    return AttachmentService.delete(auth.getUserOrFail(), attachment)
  }

  private async authorizedAttachment(
    user: Awaited<ReturnType<HttpContext['auth']['getUserOrFail']>>,
    id: number
  ) {
    const attachment = await Attachment.findOrFail(id)
    if (
      attachment.uploaderId !== user.id &&
      !(await AdminRbacService.allows(user, { permissions: ['admin.attachments.view'] }))
    ) {
      throw new UploadException('Cannot access this attachment', 'E_ATTACHMENT_FORBIDDEN', 403)
    }
    return attachment
  }
}
