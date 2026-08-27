import UploadException from '#exceptions/upload_exception'
import Attachment from '#models/attachment'
import StorageManager from '#services/upload/storage/storage_manager'
import type { StorageDisk } from '#types/upload'
import type { HttpContext } from '@adonisjs/core/http'

export default class UploadedFilesController {
  async show({ params, request, response }: HttpContext) {
    const file = await Attachment.findBy('uuid', params.uuid)
    if (!file?.objectKey || !file.isComplete || file.status === 'deleted') {
      throw new UploadException('Uploaded file is unavailable', 'E_UPLOAD_FILE_MISSING', 404)
    }

    if (file.url) return response.redirect(file.url)

    const stream = await StorageManager.disk(file.storageDisk as StorageDisk).read(file.objectKey)
    const disposition = request.input('download') === '1' ? 'attachment' : 'inline'
    const encodedName = encodeURIComponent(file.originalName)
    response.header('Content-Type', file.mimeType)
    response.header('Content-Length', String(file.size))
    response.header('Content-Disposition', `${disposition}; filename*=UTF-8''${encodedName}`)
    return response.stream(stream)
  }
}
