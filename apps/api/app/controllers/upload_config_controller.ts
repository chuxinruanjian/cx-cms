import uploadConfig from '#config/upload'

export default class UploadConfigController {
  async show() {
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
      directUploadProvider: uploadConfig.directUploadEnabled ? 'qiniu' : null,
      deduplicate: uploadConfig.deduplicate,
      virusScanEnabled: uploadConfig.virusScanEnabled,
      contentReviewEnabled: uploadConfig.contentReviewEnabled,
    }
  }
}
