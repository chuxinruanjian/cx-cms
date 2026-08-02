import { AdminUploadSessionSchema } from '#database/schema'
import AdminAttachment from '#models/admin_attachment'
import AdminUploadChunk from '#models/admin_upload_chunk'
import AdminUser from '#models/admin_user'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

export default class AdminUploadSession extends AdminUploadSessionSchema {
  @belongsTo(() => AdminAttachment, { foreignKey: 'attachmentId' })
  declare attachment: BelongsTo<typeof AdminAttachment>

  @belongsTo(() => AdminUser, { foreignKey: 'uploaderId' })
  declare uploader: BelongsTo<typeof AdminUser>

  @hasMany(() => AdminUploadChunk, { foreignKey: 'uploadSessionId' })
  declare chunks: HasMany<typeof AdminUploadChunk>
}
