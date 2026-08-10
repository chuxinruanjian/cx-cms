import { AttachmentSchema } from '#database/schema'
import AttachmentRelation from '#models/attachment_relation'
import AdminUser from '#models/admin_user'
import UploadSession from '#models/upload_session'
import { belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'

export default class Attachment extends AttachmentSchema {
  @belongsTo(() => AdminUser, { foreignKey: 'uploaderId' })
  declare uploader: BelongsTo<typeof AdminUser>

  @belongsTo(() => Attachment, { foreignKey: 'parentAttachmentId' })
  declare parent: BelongsTo<typeof Attachment>

  @hasMany(() => Attachment, { foreignKey: 'parentAttachmentId' })
  declare derivatives: HasMany<typeof Attachment>

  @hasMany(() => AttachmentRelation, { foreignKey: 'attachmentId' })
  declare relations: HasMany<typeof AttachmentRelation>

  @hasOne(() => UploadSession, { foreignKey: 'attachmentId' })
  declare uploadSession: HasOne<typeof UploadSession>
}
