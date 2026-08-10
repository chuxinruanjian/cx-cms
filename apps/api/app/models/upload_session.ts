import { UploadSessionSchema } from '#database/schema'
import Attachment from '#models/attachment'
import AdminUser from '#models/admin_user'
import UploadChunk from '#models/upload_chunk'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

export default class UploadSession extends UploadSessionSchema {
  @belongsTo(() => Attachment, { foreignKey: 'attachmentId' })
  declare attachment: BelongsTo<typeof Attachment>

  @belongsTo(() => AdminUser, { foreignKey: 'uploaderId' })
  declare uploader: BelongsTo<typeof AdminUser>

  @hasMany(() => UploadChunk, { foreignKey: 'uploadSessionId' })
  declare chunks: HasMany<typeof UploadChunk>
}
