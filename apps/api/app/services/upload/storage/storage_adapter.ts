import type { Readable } from 'node:stream'
import type { StorageDisk } from '#types/upload'

export interface StoredObject {
  disk: StorageDisk
  objectKey: string
  storagePath: string
  url: string | null
}

export interface DirectUploadAuthorization {
  uploadUrl: string
  token: string
  objectKey: string
  expiresIn: number
}

export interface StoredObjectMetadata extends StoredObject {
  size: number
  mimeType: string
  hash: string
}

export interface StorageAdapter {
  readonly disk: StorageDisk
  put(sourcePath: string, objectKey: string): Promise<StoredObject>
  delete(objectKey: string): Promise<void>
  exists(objectKey: string): Promise<boolean>
  read(objectKey: string): Promise<Readable>
  abortMultipart(storageUploadId: string): Promise<void>
  createDirectUpload?(objectKey: string, size: number, mimeType: string): DirectUploadAuthorization
  inspect?(objectKey: string): Promise<StoredObjectMetadata>
}
