import UploadException from '#exceptions/upload_exception'
import UploadChunk from '#models/upload_chunk'
import UploadSession from '#models/upload_session'
import AttachmentService from '#services/upload/attachment_service'
import UploadSessionService from '#services/upload/upload_session_service'
import {
  completeDirectUploadValidator,
  initializeUploadValidator,
  listUploadSessionsValidator,
  normalUploadValidator,
  uploadChunkValidator,
} from '#validators/admin_upload'
import type { HttpContext } from '@adonisjs/core/http'

export default class UploadsController {
  async index({ auth, request }: HttpContext) {
    auth.getUserOrFail()
    const {
      page = 1,
      perPage = 20,
      status,
    } = await request.validateUsing(listUploadSessionsValidator)
    const query = UploadSession.query().orderBy('id', 'desc')
    if (status) query.where('status', status)
    const result = await query.paginate(page, perPage)

    const data = await Promise.all(
      result.all().map(async (session) => {
        const chunks = await UploadChunk.query()
          .where('upload_session_id', session.id)
          .orderBy('chunk_index', 'asc')
        return UploadSessionService.serialize(
          session,
          chunks.map((chunk) => chunk.chunkIndex)
        )
      })
    )
    return { data, meta: result.getMeta() }
  }

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
}
