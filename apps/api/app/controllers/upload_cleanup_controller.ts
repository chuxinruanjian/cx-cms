import UploadCleanupService from '#services/upload/upload_cleanup_service'

export default class UploadCleanupController {
  async store() {
    return UploadCleanupService.run()
  }
}
