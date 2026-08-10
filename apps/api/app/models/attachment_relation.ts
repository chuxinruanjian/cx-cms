import { AttachmentRelationSchema } from '#database/schema'
import Attachment from '#models/attachment'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class AttachmentRelation extends AttachmentRelationSchema {
  @belongsTo(() => Attachment, { foreignKey: 'attachmentId' })
  declare attachment: BelongsTo<typeof Attachment>
}
