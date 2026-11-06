import { AttachmentSchema } from '#database/schema'
import UploadSession from '#models/upload_session'
import { belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'

export default class Attachment extends AttachmentSchema {
  @belongsTo(() => Attachment, { foreignKey: 'parentAttachmentId' })
  declare parent: BelongsTo<typeof Attachment>

  @hasMany(() => Attachment, { foreignKey: 'parentAttachmentId' })
  declare derivatives: HasMany<typeof Attachment>

  @hasOne(() => UploadSession, { foreignKey: 'attachmentId' })
  declare uploadSession: HasOne<typeof UploadSession>
}
