import uploadConfig from '#config/upload'
import UploadException from '#exceptions/upload_exception'
import type {
  DirectUploadAuthorization,
  StorageAdapter,
  StoredObject,
  StoredObjectMetadata,
} from '#services/upload/storage/storage_adapter'
import { Readable } from 'node:stream'
import qiniu from 'qiniu'

interface QiniuOptions {
  accessKey?: string
  secretKey?: string
  bucket?: string
  domain?: string
  uploadUrl: string
  uploadTokenTtlSeconds: number
}

export default class QiniuStorageAdapter implements StorageAdapter {
  readonly disk = 'qiniu' as const
  private readonly mac: qiniu.auth.digest.Mac
  private readonly manager: qiniu.rs.BucketManager
  private readonly bucket: string
  private readonly domain: string

  constructor(private readonly options: QiniuOptions = uploadConfig.qiniu) {
    if (!options.accessKey || !options.secretKey || !options.bucket || !options.domain) {
      throw new UploadException(
        'Qiniu storage is not fully configured',
        'E_UPLOAD_DISK_NOT_CONFIGURED',
        503
      )
    }
    this.bucket = options.bucket
    this.domain = options.domain
    this.mac = new qiniu.auth.digest.Mac(options.accessKey, options.secretKey)
    this.manager = new qiniu.rs.BucketManager(this.mac, new qiniu.conf.Config())
  }

  async put(sourcePath: string, objectKey: string): Promise<StoredObject> {
    const authorization = this.createDirectUpload(objectKey, 0, '')
    const uploader = new qiniu.form_up.FormUploader(new qiniu.conf.Config())
    const result = await uploader.putFile(
      authorization.token,
      objectKey,
      sourcePath,
      new qiniu.form_up.PutExtra()
    )
    const statusCode = result.resp.statusCode ?? 0
    if (statusCode < 200 || statusCode >= 300) {
      throw new UploadException('Qiniu upload failed', 'E_QINIU_UPLOAD_FAILED', 502)
    }
    return this.storedObject(objectKey)
  }

  async delete(objectKey: string) {
    try {
      const result = await this.manager.delete(this.bucket, objectKey)
      const statusCode = result.resp.statusCode ?? 0
      if (statusCode < 200 || statusCode >= 300) {
        throw new UploadException('Qiniu delete failed', 'E_QINIU_DELETE_FAILED', 502)
      }
    } catch (error) {
      if (this.statusCode(error) === 612) return
      throw error
    }
  }

  async exists(objectKey: string) {
    try {
      await this.inspect(objectKey)
      return true
    } catch (error) {
      if (this.statusCode(error) === 612) return false
      throw error
    }
  }

  async read(objectKey: string) {
    const response = await fetch(this.publicUrl(objectKey))
    if (response.status === 404) {
      throw new UploadException('Stored file does not exist', 'E_ATTACHMENT_FILE_MISSING', 404)
    }
    if (!response.ok || !response.body) {
      throw new UploadException('Unable to read Qiniu object', 'E_QINIU_READ_FAILED', 502)
    }
    return Readable.from(response.body)
  }

  async abortMultipart() {
    // Project multipart chunks are staged locally before StorageManager.put.
  }

  createDirectUpload(objectKey: string, size: number, mimeType: string): DirectUploadAuthorization {
    const policy = new qiniu.rs.PutPolicy({
      scope: `${this.bucket}:${objectKey}`,
      expires: this.options.uploadTokenTtlSeconds,
      insertOnly: 1,
      ...(size > 0 ? { fsizeMin: size, fsizeLimit: size } : {}),
      ...(mimeType && mimeType !== 'application/octet-stream' ? { mimeLimit: mimeType } : {}),
    })
    return {
      uploadUrl: this.options.uploadUrl,
      token: policy.uploadToken(this.mac),
      objectKey,
      expiresIn: this.options.uploadTokenTtlSeconds,
    }
  }

  async inspect(objectKey: string): Promise<StoredObjectMetadata> {
    const result = await this.manager.stat(this.bucket, objectKey)
    const statusCode = result.resp.statusCode ?? 0
    if (statusCode < 200 || statusCode >= 300) {
      throw new UploadException('Qiniu object lookup failed', 'E_QINIU_STAT_FAILED', 502)
    }
    return {
      ...this.storedObject(objectKey),
      size: Number(result.data.fsize ?? 0),
      mimeType: result.data.mimeType || 'application/octet-stream',
      hash: result.data.hash,
    }
  }

  private storedObject(objectKey: string): StoredObject {
    return {
      disk: this.disk,
      objectKey,
      storagePath: objectKey,
      url: this.publicUrl(objectKey),
    }
  }

  private publicUrl(objectKey: string) {
    return this.manager.publicDownloadUrl(this.domain, objectKey)
  }

  private statusCode(error: unknown) {
    if (typeof error !== 'object' || error === null) return undefined
    const candidate = error as {
      code?: number
      statusCode?: number
      resp?: { statusCode?: number }
    }
    return candidate.statusCode ?? candidate.resp?.statusCode ?? candidate.code
  }
}
