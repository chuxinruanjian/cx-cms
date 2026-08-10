import { UploadChunkSchema } from '#database/schema'
import UploadSession from '#models/upload_session'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class UploadChunk extends UploadChunkSchema {
  @belongsTo(() => UploadSession, { foreignKey: 'uploadSessionId' })
  declare uploadSession: BelongsTo<typeof UploadSession>
}
