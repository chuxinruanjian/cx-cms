import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('system_configs', (table) => {
      table.increments('id').notNullable()
      table.string('config_key', 128).notNullable().unique('system_configs_key_uq')
      table.string('name', 100).notNullable()
      table.string('type', 16).notNullable()
      table.text('value').notNullable()
      table.string('description', 255).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.index(['type', 'id'], 'system_configs_type_id_idx')
    })
  }

  async down() {
    this.schema.dropTable('system_configs')
  }
}
