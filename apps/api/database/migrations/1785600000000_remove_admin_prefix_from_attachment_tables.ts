import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.renameTable('admin_attachments', 'attachments')
    this.schema.renameTable('admin_attachment_relations', 'attachment_relations')
    this.schema.renameTable('admin_upload_sessions', 'upload_sessions')
    this.schema.renameTable('admin_upload_chunks', 'upload_chunks')
  }

  async down() {
    this.schema.renameTable('upload_chunks', 'admin_upload_chunks')
    this.schema.renameTable('upload_sessions', 'admin_upload_sessions')
    this.schema.renameTable('attachment_relations', 'admin_attachment_relations')
    this.schema.renameTable('attachments', 'admin_attachments')
  }
}
