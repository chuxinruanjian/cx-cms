/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_NAME: Env.schema.string(),
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Database
  DB_CONNECTION: Env.schema.enum(['sqlite', 'mysql'] as const),
  SQLITE_DB_PATH: Env.schema.string.optional(),
  DB_HOST: Env.schema.string.optional({ format: 'host' }),
  DB_PORT: Env.schema.number.optional(),
  DB_USER: Env.schema.string.optional(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string.optional(),

  // Runtime storage
  LOG_FILE: Env.schema.string.optional(),
  UPLOAD_DIR: Env.schema.string.optional(),
  PAYMENT_CERT_DIR: Env.schema.string.optional(),
  UPLOAD_DISK: Env.schema.enum.optional(['local', 'oss', 's3'] as const),
  UPLOAD_NORMAL_MAX_MB: Env.schema.number.optional(),
  UPLOAD_IMAGE_MAX_MB: Env.schema.number.optional(),
  UPLOAD_VIDEO_MAX_MB: Env.schema.number.optional(),
  UPLOAD_AUDIO_MAX_MB: Env.schema.number.optional(),
  UPLOAD_DOCUMENT_MAX_MB: Env.schema.number.optional(),
  UPLOAD_ARCHIVE_MAX_MB: Env.schema.number.optional(),
  UPLOAD_OTHER_MAX_MB: Env.schema.number.optional(),
  UPLOAD_MAX_COUNT: Env.schema.number.optional(),
  UPLOAD_CHUNK_SIZE_MB: Env.schema.number.optional(),
  UPLOAD_CHUNK_CONCURRENCY: Env.schema.number.optional(),
  UPLOAD_MAX_RETRIES: Env.schema.number.optional(),
  UPLOAD_TEMPORARY_TTL_HOURS: Env.schema.number.optional(),
  UPLOAD_SESSION_TTL_HOURS: Env.schema.number.optional(),
  UPLOAD_DIRECT_ENABLED: Env.schema.boolean.optional(),
  UPLOAD_DEDUPLICATE: Env.schema.boolean.optional(),
  UPLOAD_VIRUS_SCAN_ENABLED: Env.schema.boolean.optional(),
  UPLOAD_CONTENT_REVIEW_ENABLED: Env.schema.boolean.optional(),
  UPLOAD_IMAGE_QUALITY: Env.schema.number.optional(),

  // Initial administrator (used only by db:seed)
  ADMIN_USERNAME: Env.schema.string.optional(),
  ADMIN_PASSWORD: Env.schema.string.optional(),
  ADMIN_NAME: Env.schema.string.optional(),
  ADMIN_EMAIL: Env.schema.string.optional(),
  ADMIN_MOBILE: Env.schema.string.optional(),

  // Aliyun SMS
  ALIYUN_ACCESS_KEY_ID: Env.schema.string.optional(),
  ALIYUN_ACCESS_KEY_SECRET: Env.schema.string.optional(),
  ALIYUN_SMS_SIGN_NAME: Env.schema.string.optional(),
  ALIYUN_SMS_LOGIN_TEMPLATE_CODE: Env.schema.string.optional(),
  ALIYUN_SMS_SECURITY_MOBILE_TEMPLATE_CODE: Env.schema.string.optional(),
  ALIYUN_SMS_PASSWORD_RESET_TEMPLATE_CODE: Env.schema.string.optional(),
  ALIYUN_SMS_ENDPOINT: Env.schema.string.optional(),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),
})
