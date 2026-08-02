import UploadException from '#exceptions/upload_exception'
import type { StorageAdapter } from '#services/upload/storage/storage_adapter'
import type { StorageDisk } from '#types/upload'

/**
 * Contract placeholder for OSS and S3-compatible providers.
 *
 * Add the provider SDK inside this adapter only. Controllers, attachment
 * services, and business modules must keep using StorageManager.
 */
export default class CloudStorageAdapter implements StorageAdapter {
  constructor(readonly disk: Extract<StorageDisk, 'oss' | 's3'>) {}

  async put(): Promise<never> {
    throw this.notConfigured()
  }

  async delete(): Promise<never> {
    throw this.notConfigured()
  }

  async exists(): Promise<never> {
    throw this.notConfigured()
  }

  async read(): Promise<never> {
    throw this.notConfigured()
  }

  async abortMultipart(): Promise<never> {
    throw this.notConfigured()
  }

  private notConfigured() {
    return new UploadException(
      `${this.disk.toUpperCase()} storage adapter is not configured`,
      'E_UPLOAD_DISK_NOT_CONFIGURED',
      503
    )
  }
}
