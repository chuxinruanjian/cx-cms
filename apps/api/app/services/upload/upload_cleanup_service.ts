import AdminAttachment from '#models/admin_attachment'
import AdminUploadSession from '#models/admin_upload_session'
import AttachmentService from '#services/upload/attachment_service'
import UploadSessionService from '#services/upload/upload_session_service'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'

export default class UploadCleanupService {
  static async run() {
    const now = DateTime.now()
    const sessions = await AdminUploadSession.query()
      .whereIn('status', ['initialized', 'uploading', 'failed'])
      .where('expires_at', '<', now.toSQL()!)
    let sessionsCleaned = 0
    let attachmentsCleaned = 0
    const errors: Array<{ type: string; id: string | number; message: string }> = []

    for (const session of sessions) {
      try {
        await UploadSessionService.abort(null, session.uploadId, true)
        sessionsCleaned++
      } catch (error) {
        errors.push({
          type: 'session',
          id: session.uploadId,
          message: error instanceof Error ? error.message : 'Unknown cleanup error',
        })
      }
    }

    const attachments = await AdminAttachment.query()
      .where('status', 'temporary')
      .where('expires_at', '<', now.toSQL()!)
      .whereDoesntHave('relations', () => {})
    for (const attachment of attachments) {
      try {
        await AttachmentService.delete(null, attachment, true)
        attachmentsCleaned++
      } catch (error) {
        errors.push({
          type: 'attachment',
          id: attachment.id,
          message: error instanceof Error ? error.message : 'Unknown cleanup error',
        })
      }
    }

    logger.info(
      {
        operation: 'temporary_upload_cleanup',
        sessionsCleaned,
        attachmentsCleaned,
        errors,
      },
      'Temporary upload cleanup completed'
    )
    return { sessionsCleaned, attachmentsCleaned, errors }
  }
}
