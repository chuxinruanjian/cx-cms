import type { Readable } from 'node:stream'
import type { StorageDisk } from '#types/upload'

export interface StoredObject {
  disk: StorageDisk
  objectKey: string
  storagePath: string
  url: string | null
}

export interface StorageAdapter {
  readonly disk: StorageDisk
  put(sourcePath: string, objectKey: string): Promise<StoredObject>
  delete(objectKey: string): Promise<void>
  exists(objectKey: string): Promise<boolean>
  read(objectKey: string): Promise<Readable>
  abortMultipart(storageUploadId: string): Promise<void>
}
