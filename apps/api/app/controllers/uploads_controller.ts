import UploadException from '#exceptions/upload_exception'
import Attachment from '#models/attachment'
import AttachmentService from '#services/upload/attachment_service'
import UploadSessionService from '#services/upload/upload_session_service'
import {
  completeDirectUploadValidator,
  initializeUploadValidator,
  normalUploadValidator,
  uploadChunkValidator,
} from '#validators/admin_upload'
import type { HttpContext } from '@adonisjs/core/http'

export default class UploadsController {
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { uploadToken } = await request.validateUsing(normalUploadValidator)
    const file = request.file('file')
    if (!file) {
      throw new UploadException('The file field is required', 'E_UPLOAD_FILE_REQUIRED')
    }
    if (!file.isValid || !file.tmpPath) {
      return response.unprocessableEntity({
        code: 'E_UPLOAD_FILE_INVALID',
        message: file.errors.map((error) => error.message).join('; ') || 'Uploaded file is invalid',
      })
    }

    const mimeType = file.type?.includes('/')
      ? file.type
      : file.type && file.subtype
        ? `${file.type}/${file.subtype}`
        : 'application/octet-stream'
    const attachment = await AttachmentService.createNormal(user, {
      sourcePath: file.tmpPath,
      originalName: file.clientName,
      mimeType,
      expectedSize: file.size,
      uploadToken,
    })
    return response.created(AttachmentService.serialize(attachment))
  }

  async initialize({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(initializeUploadValidator)
    return response.created(await UploadSessionService.initialize(user, payload))
  }

  async initializeDirect({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(initializeUploadValidator)
    return response.created(await AttachmentService.initializeDirect(user, payload))
  }

  async completeDirect({ auth, params, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const { uploadToken } = await request.validateUsing(completeDirectUploadValidator)
    const attachment = await AttachmentService.completeDirect(
      user,
      params.attachmentId,
      uploadToken
    )
    return AttachmentService.serialize(attachment)
  }

  async storeChunk({ auth, params, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(uploadChunkValidator)
    const chunk = request.file('chunk')
    if (!chunk?.isValid || !chunk.tmpPath) {
      throw new UploadException('A valid chunk file is required', 'E_UPLOAD_CHUNK_REQUIRED')
    }
    return UploadSessionService.uploadChunk(user, params.uploadId, {
      ...payload,
      sourcePath: chunk.tmpPath,
      size: chunk.size,
    })
  }

  async show({ auth, params }: HttpContext) {
    return UploadSessionService.status(auth.getUserOrFail(), params.uploadId)
  }

  async complete({ auth, params }: HttpContext) {
    return UploadSessionService.complete(auth.getUserOrFail(), params.uploadId)
  }

  async abort({ auth, params }: HttpContext) {
    return UploadSessionService.abort(auth.getUserOrFail(), params.uploadId)
  }

  async destroy({ auth, params }: HttpContext) {
    return AttachmentService.delete(auth.getUserOrFail(), await Attachment.findOrFail(params.id))
  }
}
