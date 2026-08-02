import uploadConfig from '#config/upload'
import CloudStorageAdapter from '#services/upload/storage/cloud_storage_adapter'
import LocalStorageAdapter from '#services/upload/storage/local_storage_adapter'
import type { StorageAdapter } from '#services/upload/storage/storage_adapter'
import type { StorageDisk } from '#types/upload'

export default class StorageManager {
  private static adapters = new Map<StorageDisk, StorageAdapter>()

  static disk(name: StorageDisk = uploadConfig.defaultDisk): StorageAdapter {
    const existing = this.adapters.get(name)
    if (existing) {
      return existing
    }

    const adapter =
      name === 'local' ? new LocalStorageAdapter(uploadConfig.root) : new CloudStorageAdapter(name)
    this.adapters.set(name, adapter)
    return adapter
  }

  /** Intended for provider registration and isolated tests. */
  static register(name: StorageDisk, adapter: StorageAdapter) {
    this.adapters.set(name, adapter)
  }

  static reset() {
    this.adapters.clear()
  }
}
