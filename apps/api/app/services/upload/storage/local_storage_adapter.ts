import UploadException from '#exceptions/upload_exception'
import type { StorageAdapter, StoredObject } from '#services/upload/storage/storage_adapter'
import type { StorageDisk } from '#types/upload'
import { createReadStream, createWriteStream } from 'node:fs'
import { access, mkdir, rm } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'
import { pipeline } from 'node:stream/promises'

export default class LocalStorageAdapter implements StorageAdapter {
  readonly disk: StorageDisk = 'local'

  constructor(private readonly root: string) {}

  async put(sourcePath: string, objectKey: string): Promise<StoredObject> {
    const destination = this.absolutePath(objectKey)
    await mkdir(dirname(destination), { recursive: true })
    await pipeline(createReadStream(sourcePath), createWriteStream(destination, { flags: 'wx' }))

    return {
      disk: this.disk,
      objectKey,
      storagePath: objectKey,
      url: null,
    }
  }

  async delete(objectKey: string) {
    await rm(this.absolutePath(objectKey), { force: true })
  }

  async exists(objectKey: string) {
    try {
      await access(this.absolutePath(objectKey))
      return true
    } catch {
      return false
    }
  }

  async read(objectKey: string) {
    if (!(await this.exists(objectKey))) {
      throw new UploadException('Stored file does not exist', 'E_ATTACHMENT_FILE_MISSING', 404)
    }
    return createReadStream(this.absolutePath(objectKey))
  }

  async abortMultipart() {
    // Multipart chunks are staged locally and removed by UploadSessionService.
  }

  private absolutePath(objectKey: string) {
    const root = resolve(this.root)
    const path = resolve(root, objectKey)
    if (path !== root && !path.startsWith(`${root}${sep}`)) {
      throw new UploadException('Invalid storage path', 'E_UPLOAD_PATH_INVALID')
    }
    return path
  }
}
