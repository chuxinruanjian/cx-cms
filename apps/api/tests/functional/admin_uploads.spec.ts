import uploadConfig from '#config/upload'
import Attachment from '#models/attachment'
import UploadSession from '#models/upload_session'
import AdminUser from '#models/admin_user'
import AttachmentService from '#services/upload/attachment_service'
import type {
  DirectUploadAuthorization,
  StorageAdapter,
  StoredObject,
  StoredObjectMetadata,
} from '#services/upload/storage/storage_adapter'
import StorageManager from '#services/upload/storage/storage_manager'
import UploadCleanupService from '#services/upload/upload_cleanup_service'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import type { ApiClient } from '@japa/api-client'
import { test } from '@japa/runner'
import { createHash, randomUUID } from 'node:crypto'
import { rm } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { DateTime } from 'luxon'

const sha256 = (value: Buffer) => createHash('sha256').update(value).digest('hex')

const png = (size = 128) => {
  const value = Buffer.alloc(size)
  Buffer.from('89504e470d0a1a0a', 'hex').copy(value)
  return value
}

const pdf = (size: number) => {
  const value = Buffer.alloc(size, 32)
  Buffer.from('%PDF-1.7\n').copy(value)
  return value
}

const createUser = async (username: string, isSuperAdmin = true) =>
  AdminUser.create({
    username,
    fullName: username,
    email: `${username}@example.com`,
    password: 'StrongPassword123!',
    status: true,
    isSuperAdmin,
  })

const bearer = async (user: AdminUser) => {
  const token = await AdminUser.accessTokens.create(user)
  return `Bearer ${token.value!.release()}`
}

const uploadNormal = async (
  client: ApiClient,
  authorization: string,
  value = png(),
  filename = 'image.png',
  contentType = 'image/png',
  uploadToken = 'draft_token_123'
) =>
  client
    .post('/api/v1/admin/uploads')
    .header('Authorization', authorization)
    .fields({ uploadToken })
    .file('file', value, { filename, contentType })

class FakeOssAdapter implements StorageAdapter {
  readonly disk = 'oss' as const
  readonly objects = new Map<string, Buffer>()
  deleted: string[] = []
  aborted: string[] = []

  async put(_sourcePath: string, objectKey: string): Promise<StoredObject> {
    this.objects.set(objectKey, Buffer.from('stored'))
    return { disk: 'oss', objectKey, storagePath: objectKey, url: null }
  }

  async delete(objectKey: string) {
    this.deleted.push(objectKey)
    this.objects.delete(objectKey)
  }

  async exists(objectKey: string) {
    return this.objects.has(objectKey)
  }

  async read(objectKey: string) {
    return Readable.from(this.objects.get(objectKey) ?? Buffer.alloc(0))
  }

  async abortMultipart(storageUploadId: string) {
    this.aborted.push(storageUploadId)
  }
}

class FakeQiniuAdapter implements StorageAdapter {
  readonly disk = 'qiniu' as const
  readonly objects = new Map<string, StoredObjectMetadata>()

  async put(_sourcePath: string, objectKey: string): Promise<StoredObject> {
    return { disk: this.disk, objectKey, storagePath: objectKey, url: this.url(objectKey) }
  }

  async delete(objectKey: string) {
    this.objects.delete(objectKey)
  }

  async exists(objectKey: string) {
    return this.objects.has(objectKey)
  }

  async read() {
    return Readable.from(Buffer.from('qiniu'))
  }

  async abortMultipart() {}

  createDirectUpload(objectKey: string): DirectUploadAuthorization {
    return {
      uploadUrl: 'https://upload.example.test',
      token: 'scoped-provider-token',
      objectKey,
      expiresIn: 600,
    }
  }

  async inspect(objectKey: string) {
    const object = this.objects.get(objectKey)
    if (!object) throw new Error('Object is missing')
    return object
  }

  object(objectKey: string, size: number, mimeType: string): StoredObjectMetadata {
    return {
      disk: this.disk,
      objectKey,
      storagePath: objectKey,
      url: this.url(objectKey),
      size,
      mimeType,
      hash: 'qiniu-etag',
    }
  }

  private url(objectKey: string) {
    return `https://cdn.example.test/${objectKey}`
  }
}

test.group('Unified admin uploads', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(async () => {
    StorageManager.reset()
    await rm(uploadConfig.root, { recursive: true, force: true })
    return async () => {
      StorageManager.reset()
      await rm(uploadConfig.root, { recursive: true, force: true })
    }
  })

  test('uses shared attachment table names and MySQL-safe index names', async ({ assert }) => {
    const tableNames = ['attachments', 'upload_sessions', 'upload_chunks']

    for (const tableName of tableNames) {
      assert.isTrue(await db.connection().schema.hasTable(tableName))
      assert.isFalse(await db.connection().schema.hasTable(`admin_${tableName}`))
    }
    assert.isFalse(await db.connection().schema.hasTable('attachment_relations'))

    const indexes = await db
      .from('sqlite_master')
      .select('name')
      .where('type', 'index')
      .whereIn('tbl_name', tableNames)

    assert.isTrue(indexes.length > 0)
    for (const index of indexes) {
      assert.isAtMost(String(index.name).length, 64)
    }
  })

  test('uploads a small file with a persistent public URL and deletes it physically', async ({
    client,
  }) => {
    const user = await createUser('uploader')
    const authorization = await bearer(user)
    const response = await uploadNormal(client, authorization)

    response.assertStatus(201)
    response.assertBodyContains({
      originalName: 'image.png',
      fileType: 'image',
      status: 'active',
      uploadMode: 'normal',
      progress: 100,
    })

    const attachment = await Attachment.findOrFail((response.body() as { id: number }).id)
    response.assertBodyContains({ url: `/api/v1/uploads/files/${attachment.uuid}` })
    const publicFile = await client.get(`/api/v1/uploads/files/${attachment.uuid}`)
    publicFile.assertStatus(200)
    const adapter = StorageManager.disk('local')
    await adapter.exists(attachment.objectKey!).then((exists) => {
      if (!exists) throw new Error('Expected stored file to exist')
    })

    const deleted = await client
      .delete(`/api/v1/admin/uploads/files/${attachment.id}`)
      .header('Authorization', authorization)
    deleted.assertStatus(200)
    deleted.assertBodyContains({ status: 'deleted' })
    await adapter.exists(attachment.objectKey!).then((exists) => {
      if (exists) throw new Error('Expected stored file to be deleted')
    })
  })

  test('issues a scoped Qiniu direct token and verifies the object before completion', async ({
    client,
  }) => {
    const mutableConfig = uploadConfig as unknown as { directUploadEnabled: boolean }
    const previousDirect = mutableConfig.directUploadEnabled
    mutableConfig.directUploadEnabled = true
    const adapter = new FakeQiniuAdapter()
    StorageManager.register('qiniu', adapter)

    try {
      const user = await createUser('qiniu-direct')
      const authorization = await bearer(user)
      const value = png()
      const initialized = await client
        .post('/api/v1/admin/uploads/direct/init')
        .header('Authorization', authorization)
        .json({
          originalName: 'direct.png',
          mimeType: 'image/png',
          fileSize: value.length,
          uploadToken: 'qiniu_draft_123',
        })

      initialized.assertStatus(201)
      initialized.assertBodyContains({
        provider: 'qiniu',
        uploadUrl: 'https://upload.example.test',
        providerToken: 'scoped-provider-token',
      })
      const body = initialized.body() as { attachmentId: number; objectKey: string }
      adapter.objects.set(body.objectKey, adapter.object(body.objectKey, value.length, 'image/png'))

      const completed = await client
        .post(`/api/v1/admin/uploads/direct/${body.attachmentId}/complete`)
        .header('Authorization', authorization)
        .json({ uploadToken: 'qiniu_draft_123' })
      completed.assertStatus(200)
      completed.assertBodyContains({
        id: body.attachmentId,
        storageDisk: 'qiniu',
        uploadMode: 'direct',
        status: 'active',
        url: `https://cdn.example.test/${body.objectKey}`,
      })
    } finally {
      mutableConfig.directUploadEnabled = previousDirect
    }
  })

  test('supports multipart retry, duplicate chunks, resume status, and integrity checking', async ({
    client,
  }) => {
    const user = await createUser('multipart')
    const authorization = await bearer(user)
    const value = pdf(1024 * 1024 + 257)
    const first = value.subarray(0, 1024 * 1024)
    const second = value.subarray(1024 * 1024)

    const initialized = await client
      .post('/api/v1/admin/uploads/init')
      .header('Authorization', authorization)
      .json({
        originalName: 'contract.pdf',
        mimeType: 'application/pdf',
        fileSize: value.length,
        fileHash: sha256(value),
        uploadToken: 'multipart_draft_123',
        chunkSize: 1024 * 1024,
      })
    initialized.assertStatus(201)
    const uploadId = initialized.body().uploadId

    const failedChunk = await client
      .post(`/api/v1/admin/uploads/${uploadId}/chunks`)
      .header('Authorization', authorization)
      .fields({ chunkIndex: 0, chunkHash: '0'.repeat(64) })
      .file('chunk', first, {
        filename: '0.part',
        contentType: 'application/octet-stream',
      })
    failedChunk.assertStatus(422)

    const firstChunk = await client
      .post(`/api/v1/admin/uploads/${uploadId}/chunks`)
      .header('Authorization', authorization)
      .fields({ chunkIndex: 0, chunkHash: sha256(first) })
      .file('chunk', first, {
        filename: '0.part',
        contentType: 'application/octet-stream',
      })
    firstChunk.assertStatus(200)
    firstChunk.assertBodyContains({ uploadedChunks: [0], missingChunks: [1], progress: 50 })

    const duplicate = await client
      .post(`/api/v1/admin/uploads/${uploadId}/chunks`)
      .header('Authorization', authorization)
      .fields({ chunkIndex: 0, chunkHash: sha256(first) })
      .file('chunk', first, {
        filename: '0.part',
        contentType: 'application/octet-stream',
      })
    duplicate.assertStatus(200)
    duplicate.assertBodyContains({ uploadedChunks: [0] })

    const resumed = await client
      .get(`/api/v1/admin/uploads/${uploadId}`)
      .header('Authorization', authorization)
    resumed.assertStatus(200)
    resumed.assertBodyContains({ uploadedChunks: [0], missingChunks: [1] })

    await client
      .post(`/api/v1/admin/uploads/${uploadId}/chunks`)
      .header('Authorization', authorization)
      .fields({ chunkIndex: 1, chunkHash: sha256(second) })
      .file('chunk', second, {
        filename: '1.part',
        contentType: 'application/octet-stream',
      })
      .then((result) => result.assertStatus(200))

    const completed = await client
      .post(`/api/v1/admin/uploads/${uploadId}/complete`)
      .header('Authorization', authorization)
    completed.assertStatus(200)
    completed.assertBodyContains({
      originalName: 'contract.pdf',
      size: value.length,
      hash: sha256(value),
      status: 'active',
      progress: 100,
    })
  })

  test('does not expire a completed URL-backed upload', async ({ client }) => {
    const user = await createUser('cleanup')
    const authorization = await bearer(user)
    const response = await uploadNormal(client, authorization)
    const attachment = await Attachment.findOrFail((response.body() as { id: number }).id)
    attachment.expiresAt = DateTime.now().minus({ minutes: 1 })
    await attachment.save()

    const result = await UploadCleanupService.run()
    if (result.attachmentsCleaned !== 0) throw new Error('Completed files must remain available')

    await attachment.refresh()
    if (attachment.status !== 'active') throw new Error('Expected the uploaded file to stay active')
  })

  test('cleans expired multipart sessions and supports explicit cancellation', async ({
    client,
  }) => {
    const user = await createUser('cancel')
    const authorization = await bearer(user)
    const init = await client
      .post('/api/v1/admin/uploads/init')
      .header('Authorization', authorization)
      .json({
        originalName: 'large.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024 * 1024,
        uploadToken: 'cancel_draft_123',
      })
    const uploadId = init.body().uploadId

    const canceled = await client
      .post(`/api/v1/admin/uploads/${uploadId}/abort`)
      .header('Authorization', authorization)
    canceled.assertStatus(200)
    canceled.assertBodyContains({ status: 'aborted' })

    const second = await client
      .post('/api/v1/admin/uploads/init')
      .header('Authorization', authorization)
      .json({
        originalName: 'expired.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024 * 1024,
        uploadToken: 'expired_draft_123',
      })
    const session = await UploadSession.findByOrFail('uploadId', second.body().uploadId)
    session.expiresAt = DateTime.now().minus({ minutes: 1 })
    await session.save()

    const result = await UploadCleanupService.run()
    if (result.sessionsCleaned !== 1) throw new Error('Expected one session cleanup')
    await session.refresh()
    if (session.status !== 'expired') throw new Error('Expected session to expire')
  })

  test('rejects invalid MIME, forged signatures, and oversized initialization', async ({
    client,
  }) => {
    const user = await createUser('security')
    const authorization = await bearer(user)

    const invalidMime = await client
      .post('/api/v1/admin/uploads/init')
      .header('Authorization', authorization)
      .json({
        originalName: 'image.png',
        mimeType: 'text/plain',
        fileSize: 128,
        uploadToken: 'invalid_mime_123',
      })
    invalidMime.assertStatus(422)
    invalidMime.assertBodyContains({ code: 'E_UPLOAD_MIME_MISMATCH' })

    const forged = await uploadNormal(
      client,
      authorization,
      Buffer.from('not a real png'),
      'image.png',
      'image/png'
    )
    forged.assertStatus(422)
    forged.assertBodyContains({ code: 'E_UPLOAD_SIGNATURE_MISMATCH' })

    const oversized = await client
      .post('/api/v1/admin/uploads/init')
      .header('Authorization', authorization)
      .json({
        originalName: 'too-large.pdf',
        mimeType: 'application/pdf',
        fileSize: uploadConfig.maxBytes.document + 1,
        uploadToken: 'oversized_draft_123',
      })
    oversized.assertStatus(422)
    oversized.assertBodyContains({ code: 'E_UPLOAD_SIZE_EXCEEDED' })
  })

  test('prevents another administrator from deleting an upload', async ({ client }) => {
    const owner = await createUser('owner')
    const other = await createUser('other', false)
    const uploaded = await uploadNormal(client, await bearer(owner))

    const response = await client
      .delete(`/api/v1/admin/uploads/files/${(uploaded.body() as { id: number }).id}`)
      .header('Authorization', await bearer(other))
    response.assertStatus(403)
    response.assertBodyContains({ code: 'E_ATTACHMENT_FORBIDDEN' })
  })

  test('treats missing source files and repeated deletion as successful', async ({ client }) => {
    const user = await createUser('idempotent')
    const authorization = await bearer(user)
    const uploaded = await uploadNormal(client, authorization)
    const attachment = await Attachment.findOrFail((uploaded.body() as { id: number }).id)
    await StorageManager.disk('local').delete(attachment.objectKey!)

    const first = await client
      .delete(`/api/v1/admin/uploads/files/${attachment.id}`)
      .header('Authorization', authorization)
    first.assertStatus(200)
    first.assertBodyContains({ status: 'deleted' })

    const second = await client
      .delete(`/api/v1/admin/uploads/files/${attachment.id}`)
      .header('Authorization', authorization)
    second.assertStatus(200)
    second.assertBodyContains({ status: 'deleted' })
  })

  test('routes OSS deletion and multipart abort through the storage adapter', async () => {
    const user = await createUser('oss')
    const adapter = new FakeOssAdapter()
    StorageManager.register('oss', adapter)
    adapter.objects.set('files/example.pdf', Buffer.from('example'))

    const attachment = await Attachment.create({
      uuid: randomUUID(),
      parentAttachmentId: null,
      originalName: 'example.pdf',
      storageDisk: 'oss',
      storagePath: 'files/example.pdf',
      objectKey: 'files/example.pdf',
      url: null,
      extension: 'pdf',
      mimeType: 'application/pdf',
      fileType: 'document',
      size: 7,
      hash: sha256(Buffer.from('example')),
      width: null,
      height: null,
      duration: null,
      status: 'temporary',
      uploadMode: 'direct',
      uploadToken: 'oss_draft_123',
      uploaderId: user.id,
      isComplete: true,
      errorMessage: null,
      lastUsedAt: DateTime.now(),
      boundAt: null,
      expiresAt: DateTime.now().plus({ hours: 1 }),
      deletedAt: null,
    })
    adapter.objects.set('images/example-thumb.webp', Buffer.from('thumb'))
    const derivative = await Attachment.create({
      ...attachment.$attributes,
      id: undefined,
      uuid: randomUUID(),
      parentAttachmentId: attachment.id,
      originalName: 'example-thumb.webp',
      storagePath: 'images/example-thumb.webp',
      objectKey: 'images/example-thumb.webp',
      extension: 'webp',
      mimeType: 'image/webp',
      fileType: 'image',
      size: 5,
      hash: sha256(Buffer.from('thumb')),
    })

    await AttachmentService.delete(user, attachment)
    await derivative.refresh()
    if (
      !adapter.deleted.includes('files/example.pdf') ||
      !adapter.deleted.includes('images/example-thumb.webp') ||
      derivative.status !== 'deleted'
    ) {
      throw new Error('Expected source and derived OSS objects to be deleted')
    }

    const sessionAttachment = await Attachment.create({
      ...attachment.$attributes,
      id: undefined,
      uuid: randomUUID(),
      originalName: 'multipart.zip',
      objectKey: null,
      storagePath: null,
      status: 'uploading',
      isComplete: false,
      deletedAt: null,
    })
    const session = await UploadSession.create({
      uploadId: randomUUID(),
      uploadToken: 'oss_session_123',
      attachmentId: sessionAttachment.id,
      originalName: 'multipart.zip',
      mimeType: 'application/zip',
      fileSize: 10,
      fileHash: null,
      chunkSize: 5,
      chunkTotal: 2,
      uploadedChunks: 0,
      storageUploadId: 'oss-upload-id',
      status: 'initialized',
      uploaderId: user.id,
      errorMessage: null,
      expiresAt: DateTime.now().plus({ hours: 1 }),
    })
    const { default: UploadSessionService } =
      await import('#services/upload/upload_session_service')
    await UploadSessionService.abort(user, session.uploadId)
    if (!adapter.aborted.includes('oss-upload-id')) {
      throw new Error('Expected OSS multipart abort to be called')
    }
  })
})
