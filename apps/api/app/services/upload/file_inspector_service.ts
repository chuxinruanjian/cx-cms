import uploadConfig from '#config/upload'
import UploadException from '#exceptions/upload_exception'
import type { AttachmentFileType } from '#types/upload'
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { open } from 'node:fs/promises'
import { basename, extname } from 'node:path'

const extensionTypes: Record<string, AttachmentFileType> = {
  'jpg': 'image',
  'jpeg': 'image',
  'png': 'image',
  'gif': 'image',
  'webp': 'image',
  'avif': 'image',
  'mp4': 'video',
  'webm': 'video',
  'mov': 'video',
  'mp3': 'audio',
  'wav': 'audio',
  'ogg': 'audio',
  'pdf': 'document',
  'doc': 'document',
  'docx': 'document',
  'xls': 'document',
  'xlsx': 'document',
  'ppt': 'document',
  'pptx': 'document',
  'txt': 'document',
  'csv': 'document',
  'zip': 'archive',
  'rar': 'archive',
  '7z': 'archive',
  'tar': 'archive',
  'gz': 'archive',
}

const mimePrefixes: Partial<Record<AttachmentFileType, string[]>> = {
  image: ['image/'],
  video: ['video/'],
  audio: ['audio/'],
  document: ['application/pdf', 'application/msword', 'application/vnd.', 'text/plain', 'text/csv'],
  archive: ['application/zip', 'application/x-', 'application/gzip', 'application/octet-stream'],
}

export default class FileInspectorService {
  static sanitizeOriginalName(name: string) {
    const safe = [...basename(name)]
      .filter((character) => {
        const code = character.charCodeAt(0)
        return code > 31 && code !== 127
      })
      .join('')
      .trim()
    if (!safe || safe === '.' || safe === '..') {
      throw new UploadException('Invalid file name', 'E_UPLOAD_FILENAME_INVALID')
    }
    return safe.slice(0, 255)
  }

  static extension(name: string) {
    return extname(name).slice(1).toLowerCase()
  }

  static classify(name: string, mimeType: string): AttachmentFileType {
    const extension = this.extension(name)
    if (!uploadConfig.allowedExtensions.includes(extension as never)) {
      throw new UploadException('File extension is not allowed', 'E_UPLOAD_EXTENSION_NOT_ALLOWED')
    }

    const fileType = extensionTypes[extension] ?? 'other'
    const normalizedMime = mimeType.toLowerCase()
    const allowedMimes = mimePrefixes[fileType]
    if (
      allowedMimes?.length &&
      normalizedMime &&
      normalizedMime !== 'application/octet-stream' &&
      !allowedMimes.some((allowed) => normalizedMime.startsWith(allowed))
    ) {
      throw new UploadException(
        `MIME type "${mimeType}" does not match the file extension`,
        'E_UPLOAD_MIME_MISMATCH'
      )
    }
    return fileType
  }

  static assertSize(fileType: AttachmentFileType, size: number) {
    if (!Number.isSafeInteger(size) || size <= 0) {
      throw new UploadException('Invalid file size', 'E_UPLOAD_SIZE_INVALID')
    }
    if (size > uploadConfig.maxBytes[fileType]) {
      throw new UploadException('File exceeds the configured size limit', 'E_UPLOAD_SIZE_EXCEEDED')
    }
  }

  static async inspect(path: string, name: string, mimeType: string, expectedSize: number) {
    const fileType = this.classify(name, mimeType)
    this.assertSize(fileType, expectedSize)
    const handle = await open(path, 'r')
    const header = Buffer.alloc(16)
    try {
      await handle.read(header, 0, header.length, 0)
    } finally {
      await handle.close()
    }

    if (!this.signatureMatches(header, this.extension(name), fileType)) {
      throw new UploadException(
        'File content does not match its extension',
        'E_UPLOAD_SIGNATURE_MISMATCH'
      )
    }

    return {
      fileType,
      extension: this.extension(name),
      hash: await this.hash(path),
    }
  }

  static async hash(path: string) {
    const hash = createHash('sha256')
    for await (const chunk of createReadStream(path)) {
      hash.update(chunk as Buffer)
    }
    return hash.digest('hex')
  }

  private static signatureMatches(header: Buffer, extension: string, fileType: AttachmentFileType) {
    const hex = header.toString('hex')
    const ascii = header.toString('ascii')
    if (['jpg', 'jpeg'].includes(extension)) return hex.startsWith('ffd8ff')
    if (extension === 'png') return hex.startsWith('89504e470d0a1a0a')
    if (extension === 'gif') return ascii.startsWith('GIF8')
    if (extension === 'webp') return ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP'
    if (extension === 'avif') return ascii.slice(4, 12).includes('ftyp')
    if (['mp4', 'mov'].includes(extension)) return ascii.slice(4, 12).includes('ftyp')
    if (extension === 'webm') return hex.startsWith('1a45dfa3')
    if (extension === 'pdf') return ascii.startsWith('%PDF')
    if (['zip', 'docx', 'xlsx', 'pptx'].includes(extension)) return ascii.startsWith('PK')
    if (['doc', 'xls', 'ppt'].includes(extension)) return hex.startsWith('d0cf11e0a1b11ae1')
    if (extension === 'rar') return ascii.startsWith('Rar!')
    if (extension === '7z') return hex.startsWith('377abcaf271c')
    if (extension === 'gz') return hex.startsWith('1f8b')
    if (fileType === 'audio') {
      return ascii.startsWith('ID3') || hex.startsWith('fff') || ascii.startsWith('RIFF')
    }
    if (['txt', 'csv', 'tar'].includes(extension)) return !header.includes(0)
    return fileType === 'other'
  }
}
