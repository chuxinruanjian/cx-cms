import uploadConfig from '#config/upload'
import UploadException from '#exceptions/upload_exception'
import CloudStorageAdapter from '#services/upload/storage/cloud_storage_adapter'
import LocalStorageAdapter from '#services/upload/storage/local_storage_adapter'
import QiniuStorageAdapter from '#services/upload/storage/qiniu_storage_adapter'
import type {
  DirectUploadAuthorization,
  StorageAdapter,
  StoredObjectMetadata,
} from '#services/upload/storage/storage_adapter'
import type { StorageDisk } from '#types/upload'

export default class StorageManager {
  private static adapters = new Map<StorageDisk, StorageAdapter>()

  static disk(name: StorageDisk = uploadConfig.defaultDisk): StorageAdapter {
    const existing = this.adapters.get(name)
    if (existing) {
      return existing
    }

    const adapter =
      name === 'local'
        ? new LocalStorageAdapter(uploadConfig.root)
        : name === 'qiniu'
          ? new QiniuStorageAdapter()
          : new CloudStorageAdapter(name)
    this.adapters.set(name, adapter)
    return adapter
  }

  /** Intended for provider registration and isolated tests. */
  static register(name: StorageDisk, adapter: StorageAdapter) {
    this.adapters.set(name, adapter)
  }

  static direct(name: StorageDisk = uploadConfig.defaultDisk) {
    const adapter = this.disk(name)
    if (!adapter.createDirectUpload || !adapter.inspect) {
      throw new UploadException(
        `Storage disk "${name}" does not support direct uploads`,
        'E_UPLOAD_DIRECT_NOT_SUPPORTED',
        503
      )
    }
    return adapter as StorageAdapter & {
      createDirectUpload(
        objectKey: string,
        size: number,
        mimeType: string
      ): DirectUploadAuthorization
      inspect(objectKey: string): Promise<StoredObjectMetadata>
    }
  }

  static reset() {
    this.adapters.clear()
  }
}
