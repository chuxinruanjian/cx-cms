import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.dropTable('attachment_relations')
  }

  async down() {
    this.schema.createTable('attachment_relations', (table) => {
      table.increments('id').notNullable()
      table
        .integer('attachment_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('attachments')
        .withKeyName('att_rel_attachment_fk')
        .onDelete('CASCADE')
      table.string('business_type', 64).notNullable()
      table.string('business_id', 64).notNullable()
      table.string('field_name', 64).notNullable()
      table.integer('sort').unsigned().notNullable().defaultTo(0)
      table.timestamp('created_at').notNullable()
      table.unique(
        ['attachment_id', 'business_type', 'business_id', 'field_name'],
        'att_rel_business_uq'
      )
      table.index(['business_type', 'business_id', 'field_name'], 'att_rel_business_idx')
    })
  }
}
