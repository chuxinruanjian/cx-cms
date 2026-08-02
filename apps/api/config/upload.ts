import env from '#start/env'
import app from '@adonisjs/core/services/app'

const mb = 1024 * 1024

const uploadConfig = {
  defaultDisk: env.get('UPLOAD_DISK', 'local'),
  root: app.makePath(env.get('UPLOAD_DIR', '../../storage/uploads')),
  normalMaxBytes: env.get('UPLOAD_NORMAL_MAX_MB', 20) * mb,
  maxBytes: {
    image: env.get('UPLOAD_IMAGE_MAX_MB', 20) * mb,
    video: env.get('UPLOAD_VIDEO_MAX_MB', 2048) * mb,
    audio: env.get('UPLOAD_AUDIO_MAX_MB', 200) * mb,
    document: env.get('UPLOAD_DOCUMENT_MAX_MB', 100) * mb,
    archive: env.get('UPLOAD_ARCHIVE_MAX_MB', 2048) * mb,
    other: env.get('UPLOAD_OTHER_MAX_MB', 100) * mb,
  },
  maxCount: env.get('UPLOAD_MAX_COUNT', 20),
  chunkSize: env.get('UPLOAD_CHUNK_SIZE_MB', 5) * mb,
  chunkConcurrency: env.get('UPLOAD_CHUNK_CONCURRENCY', 3),
  maxRetries: env.get('UPLOAD_MAX_RETRIES', 3),
  temporaryTtlHours: env.get('UPLOAD_TEMPORARY_TTL_HOURS', 24),
  sessionTtlHours: env.get('UPLOAD_SESSION_TTL_HOURS', 24),
  directUploadEnabled: env.get('UPLOAD_DIRECT_ENABLED', false),
  deduplicate: env.get('UPLOAD_DEDUPLICATE', false),
  virusScanEnabled: env.get('UPLOAD_VIRUS_SCAN_ENABLED', false),
  contentReviewEnabled: env.get('UPLOAD_CONTENT_REVIEW_ENABLED', false),
  imageQuality: env.get('UPLOAD_IMAGE_QUALITY', 85),
  allowedExtensions: [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'avif',
    'mp4',
    'webm',
    'mov',
    'mp3',
    'wav',
    'ogg',
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'txt',
    'csv',
    'zip',
    'rar',
    '7z',
    'tar',
    'gz',
  ],
} as const

export default uploadConfig
