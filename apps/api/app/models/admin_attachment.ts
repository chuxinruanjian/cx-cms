import { AdminAttachmentSchema } from '#database/schema'
import AdminAttachmentRelation from '#models/admin_attachment_relation'
import AdminUploadSession from '#models/admin_upload_session'
import AdminUser from '#models/admin_user'
import { belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'

export default class AdminAttachment extends AdminAttachmentSchema {
  @belongsTo(() => AdminUser, { foreignKey: 'uploaderId' })
  declare uploader: BelongsTo<typeof AdminUser>

  @belongsTo(() => AdminAttachment, { foreignKey: 'parentAttachmentId' })
  declare parent: BelongsTo<typeof AdminAttachment>

  @hasMany(() => AdminAttachment, { foreignKey: 'parentAttachmentId' })
  declare derivatives: HasMany<typeof AdminAttachment>

  @hasMany(() => AdminAttachmentRelation, { foreignKey: 'attachmentId' })
  declare relations: HasMany<typeof AdminAttachmentRelation>

  @hasOne(() => AdminUploadSession, { foreignKey: 'attachmentId' })
  declare uploadSession: HasOne<typeof AdminUploadSession>
}
