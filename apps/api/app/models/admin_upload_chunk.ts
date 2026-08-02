import { AdminUploadChunkSchema } from '#database/schema'
import AdminUploadSession from '#models/admin_upload_session'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class AdminUploadChunk extends AdminUploadChunkSchema {
  @belongsTo(() => AdminUploadSession, { foreignKey: 'uploadSessionId' })
  declare uploadSession: BelongsTo<typeof AdminUploadSession>
}
