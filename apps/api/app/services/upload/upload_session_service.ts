import uploadConfig from '#config/upload'
import UploadException from '#exceptions/upload_exception'
import Attachment from '#models/attachment'
import UploadChunk from '#models/upload_chunk'
import UploadSession from '#models/upload_session'
import type AdminUser from '#models/admin_user'
import AttachmentService from '#services/upload/attachment_service'
import FileInspectorService from '#services/upload/file_inspector_service'
import StorageManager from '#services/upload/storage/storage_manager'
import logger from '@adonisjs/core/services/logger'
import { randomUUID } from 'node:crypto'
import { constants, copyFile, mkdir, rm, stat } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { DateTime } from 'luxon'

interface InitInput {
  originalName: string
  mimeType: string
  fileSize: number
  fileHash?: string | null
  uploadToken: string
  chunkSize?: number
}

export default class UploadSessionService {
  static async initialize(user: AdminUser, input: InitInput) {
    const originalName = FileInspectorService.sanitizeOriginalName(input.originalName)
    const fileType = FileInspectorService.classify(originalName, input.mimeType)
    FileInspectorService.assertSize(fileType, input.fileSize)

    const chunkSize = Math.min(
      Math.max(input.chunkSize || uploadConfig.chunkSize, 1024 * 1024),
      uploadConfig.normalMaxBytes
    )
    const chunkTotal = Math.ceil(input.fileSize / chunkSize)
    const uploadId = randomUUID()
    const expiresAt = DateTime.now().plus({ hours: uploadConfig.sessionTtlHours })

    const attachment = await Attachment.create({
      uuid: randomUUID(),
      parentAttachmentId: null,
      originalName,
      storageDisk: uploadConfig.defaultDisk,
      storagePath: null,
      objectKey: null,
      url: null,
      extension: FileInspectorService.extension(originalName),
      mimeType: input.mimeType,
      fileType,
      size: input.fileSize,
      hash: input.fileHash?.toLowerCase() ?? null,
      width: null,
      height: null,
      duration: null,
      status: 'uploading',
      uploadMode: 'multipart',
      uploadToken: input.uploadToken,
      uploaderId: user.id,
      isComplete: false,
      errorMessage: null,
      lastUsedAt: DateTime.now(),
      boundAt: null,
      expiresAt,
      deletedAt: null,
    })
    const session = await UploadSession.create({
      uploadId,
      uploadToken: input.uploadToken,
      attachmentId: attachment.id,
      originalName,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      fileHash: input.fileHash?.toLowerCase() ?? null,
      chunkSize,
      chunkTotal,
      uploadedChunks: 0,
      storageUploadId: null,
      status: 'initialized',
      uploaderId: user.id,
      errorMessage: null,
      expiresAt,
    })

    logger.info(
      {
        operation: 'upload_initialized',
        userId: user.id,
        attachmentId: attachment.id,
        uploadId,
      },
      'Multipart upload initialized'
    )
    return this.serialize(session, [])
  }

  static async uploadChunk(
    user: AdminUser,
    uploadId: string,
    input: {
      chunkIndex: number
      chunkHash: string
      sourcePath: string
      size: number
    }
  ) {
    const session = await this.ownedSession(user, uploadId)
    this.assertWritable(session)
    if (input.chunkIndex < 0 || input.chunkIndex >= session.chunkTotal) {
      throw new UploadException('Chunk index is out of range', 'E_UPLOAD_CHUNK_INDEX')
    }

    const expectedSize =
      input.chunkIndex === session.chunkTotal - 1
        ? Number(session.fileSize) - session.chunkSize * (session.chunkTotal - 1)
        : session.chunkSize
    if (input.size !== expectedSize) {
      throw new UploadException('Chunk size does not match', 'E_UPLOAD_CHUNK_SIZE')
    }

    const actualHash = await FileInspectorService.hash(input.sourcePath)
    if (actualHash !== input.chunkHash.toLowerCase()) {
      throw new UploadException('Chunk hash does not match', 'E_UPLOAD_CHUNK_HASH')
    }

    const existing = await UploadChunk.query()
      .where('upload_session_id', session.id)
      .where('chunk_index', input.chunkIndex)
      .first()
    if (existing) {
      if (existing.hash !== actualHash || existing.size !== input.size) {
        throw new UploadException(
          'A different chunk already exists at this index',
          'E_UPLOAD_CHUNK_CONFLICT',
          409
        )
      }
      return this.status(user, uploadId)
    }

    const relativePath = `.chunks/${uploadId}/${input.chunkIndex}.part`
    const destination = this.chunkPath(relativePath)
    await mkdir(dirname(destination), { recursive: true })
    try {
      await copyFile(input.sourcePath, destination, constants.COPYFILE_EXCL)
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
      const diskHash = await FileInspectorService.hash(destination)
      if (diskHash !== actualHash) {
        throw new UploadException(
          'Stored chunk conflicts with request',
          'E_UPLOAD_CHUNK_CONFLICT',
          409
        )
      }
    }

    await UploadChunk.create({
      uploadSessionId: session.id,
      chunkIndex: input.chunkIndex,
      size: input.size,
      hash: actualHash,
      etag: null,
      storagePath: relativePath,
      isComplete: true,
      uploadedAt: DateTime.now(),
    })
    session.status = 'uploading'
    session.uploadedChunks = await UploadChunk.query()
      .where('upload_session_id', session.id)
      .count('* as total')
      .then((rows) => Number(rows[0].$extras.total))
    await session.save()

    logger.info(
      {
        operation: 'upload_chunk_completed',
        userId: user.id,
        attachmentId: session.attachmentId,
        uploadId,
        chunkIndex: input.chunkIndex,
      },
      'Upload chunk completed'
    )
    return this.status(user, uploadId)
  }

  static async status(user: AdminUser, uploadId: string) {
    const session = await this.ownedSession(user, uploadId)
    const chunks = await UploadChunk.query()
      .where('upload_session_id', session.id)
      .orderBy('chunk_index', 'asc')
    return this.serialize(
      session,
      chunks.map((chunk) => chunk.chunkIndex)
    )
  }

  static async complete(user: AdminUser, uploadId: string) {
    const session = await this.ownedSession(user, uploadId)
    if (session.status === 'completed') {
      return AttachmentService.findAndSerialize(session.attachmentId)
    }
    this.assertWritable(session)

    const chunks = await UploadChunk.query()
      .where('upload_session_id', session.id)
      .where('is_complete', true)
      .orderBy('chunk_index', 'asc')
    if (
      chunks.length !== session.chunkTotal ||
      chunks.some((chunk, index) => chunk.chunkIndex !== index)
    ) {
      throw new UploadException('Not all chunks have been uploaded', 'E_UPLOAD_CHUNKS_INCOMPLETE')
    }

    const assembledPath = this.chunkPath(`.chunks/${uploadId}/assembled.tmp`)
    await rm(assembledPath, { force: true })
    for (const chunk of chunks) {
      await pipeline(
        createReadStream(this.chunkPath(chunk.storagePath)),
        createWriteStream(assembledPath, { flags: 'a' })
      )
    }
    const assembledStat = await stat(assembledPath)
    if (assembledStat.size !== Number(session.fileSize)) {
      throw new UploadException('Assembled file size does not match', 'E_UPLOAD_SIZE_MISMATCH')
    }

    const attachment = await Attachment.findOrFail(session.attachmentId)
    try {
      await AttachmentService.finalize(attachment, {
        sourcePath: assembledPath,
        mimeType: session.mimeType,
        expectedSize: Number(session.fileSize),
        expectedHash: session.fileHash,
      })
      session.status = 'completed'
      session.uploadedChunks = session.chunkTotal
      session.errorMessage = null
      await session.save()
      await this.removeChunkDirectory(uploadId)
      return AttachmentService.findAndSerialize(attachment.id)
    } catch (error) {
      session.status = 'failed'
      session.errorMessage = error instanceof Error ? error.message : 'Upload completion failed'
      attachment.status = 'failed'
      attachment.errorMessage = session.errorMessage
      await Promise.all([session.save(), attachment.save()])
      throw error
    }
  }

  static async abort(user: AdminUser | null, uploadId: string, system = false) {
    const session = system
      ? await UploadSession.findByOrFail('uploadId', uploadId)
      : await this.ownedSession(user!, uploadId)
    if (['aborted', 'expired'].includes(session.status)) {
      return this.serialize(session, [])
    }
    const attachment = await Attachment.find(session.attachmentId)
    if (session.storageUploadId) {
      await StorageManager.disk(
        (attachment?.storageDisk || uploadConfig.defaultDisk) as 'local' | 'oss' | 's3'
      ).abortMultipart(session.storageUploadId)
    }
    await this.removeChunkDirectory(uploadId)
    session.status = system ? 'expired' : 'aborted'
    await session.save()

    if (attachment && attachment.status === 'uploading') {
      attachment.status = 'failed'
      attachment.errorMessage = system ? 'Upload session expired' : 'Upload canceled'
      await attachment.save()
    }

    logger.info(
      {
        operation: system ? 'upload_session_expired' : 'upload_aborted',
        userId: system ? null : user?.id,
        attachmentId: session.attachmentId,
        uploadId,
      },
      'Upload session ended'
    )
    return this.serialize(session, [])
  }

  static serialize(session: UploadSession, uploadedChunks: number[]) {
    const progress =
      session.chunkTotal > 0 ? Math.round((uploadedChunks.length / session.chunkTotal) * 100) : 0
    return {
      uploadId: session.uploadId,
      uploadToken: session.uploadToken,
      attachmentId: session.attachmentId,
      originalName: session.originalName,
      fileSize: Number(session.fileSize),
      mimeType: session.mimeType,
      chunkSize: session.chunkSize,
      chunkTotal: session.chunkTotal,
      uploadedChunks,
      missingChunks: Array.from({ length: session.chunkTotal }, (_, index) => index).filter(
        (index) => !uploadedChunks.includes(index)
      ),
      uploadMode: 'multipart' as const,
      status: session.status,
      progress: session.status === 'completed' ? 100 : progress,
      errorMessage: session.errorMessage,
      expiresAt: session.expiresAt,
    }
  }

  private static async ownedSession(user: AdminUser, uploadId: string) {
    const session = await UploadSession.findByOrFail('uploadId', uploadId)
    if (!user.isSuperAdmin && session.uploaderId !== user.id) {
      throw new UploadException('Upload session belongs to another user', 'E_UPLOAD_FORBIDDEN', 403)
    }
    return session
  }

  private static assertWritable(session: UploadSession) {
    if (session.expiresAt < DateTime.now()) {
      throw new UploadException('Upload session has expired', 'E_UPLOAD_SESSION_EXPIRED', 410)
    }
    if (!['initialized', 'uploading', 'failed'].includes(session.status)) {
      throw new UploadException('Upload session is not writable', 'E_UPLOAD_SESSION_CLOSED', 409)
    }
  }

  private static chunkPath(relativePath: string) {
    const root = resolve(uploadConfig.root)
    const path = resolve(root, relativePath)
    if (!path.startsWith(`${root}${sep}`)) {
      throw new UploadException('Invalid chunk path', 'E_UPLOAD_PATH_INVALID')
    }
    return path
  }

  private static async removeChunkDirectory(uploadId: string) {
    await rm(this.chunkPath(`.chunks/${uploadId}`), { recursive: true, force: true })
  }
}
