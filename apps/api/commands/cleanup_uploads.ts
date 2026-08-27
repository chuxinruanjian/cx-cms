import UploadCleanupService from '#services/upload/upload_cleanup_service'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class CleanupUploads extends BaseCommand {
  static commandName = 'uploads:cleanup'
  static description = 'Remove expired multipart sessions and incomplete uploads'
  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const result = await UploadCleanupService.run()
    this.logger.success(
      `Cleaned ${result.sessionsCleaned} sessions and ${result.attachmentsCleaned} attachments`
    )
    if (result.errors.length) {
      this.logger.warning(`${result.errors.length} cleanup item(s) failed and can be retried`)
    }
  }
}
