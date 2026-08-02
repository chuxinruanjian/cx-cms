import uploadConfig from '#config/upload'
import type { HttpContext } from '@adonisjs/core/http'

export default class UploadConfigController {
  async show({ auth }: HttpContext) {
    auth.getUserOrFail()
    return {
      allowedExtensions: uploadConfig.allowedExtensions,
      maxBytes: uploadConfig.maxBytes,
      normalThreshold: uploadConfig.normalMaxBytes,
      chunkSize: uploadConfig.chunkSize,
      concurrency: uploadConfig.chunkConcurrency,
      maxRetries: uploadConfig.maxRetries,
      maxCount: uploadConfig.maxCount,
      temporaryTtlHours: uploadConfig.temporaryTtlHours,
      defaultDisk: uploadConfig.defaultDisk,
      imageQuality: uploadConfig.imageQuality,
      directUploadEnabled: uploadConfig.directUploadEnabled,
      deduplicate: uploadConfig.deduplicate,
      virusScanEnabled: uploadConfig.virusScanEnabled,
      contentReviewEnabled: uploadConfig.contentReviewEnabled,
    }
  }
}
