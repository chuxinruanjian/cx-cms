import { AdminAttachmentRelationSchema } from '#database/schema'
import AdminAttachment from '#models/admin_attachment'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class AdminAttachmentRelation extends AdminAttachmentRelationSchema {
  @belongsTo(() => AdminAttachment, { foreignKey: 'attachmentId' })
  declare attachment: BelongsTo<typeof AdminAttachment>
}
