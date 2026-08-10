import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('admin_users', (table) => {
      table.string('mobile', 20).nullable()
      table.unique(['mobile'], 'admin_users_mobile_uq')
    })

    this.schema.createTable('sms_codes', (table) => {
      table.increments('id').notNullable()
      table.string('mobile', 20).notNullable()
      table.string('scene', 32).notNullable()
      table.string('template_code', 64).notNullable()
      table.string('code_hash', 255).notNullable()
      table.timestamp('expires_at').notNullable()
      table.timestamp('used_at').nullable()
      table.string('send_status', 16).notNullable().defaultTo('pending')
      table.integer('attempt_count').unsigned().notNullable().defaultTo(0)
      table.string('request_ip', 64).nullable()
      table.text('provider_response').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['mobile', 'scene', 'send_status', 'created_at'], 'sms_lookup_idx')
      table.index(['request_ip', 'created_at'], 'sms_ip_created_idx')
      table.index(['expires_at'], 'sms_expires_idx')
    })
  }

  async down() {
    this.schema.dropTable('sms_codes')
    this.schema.alterTable('admin_users', (table) => {
      table.dropUnique(['mobile'], 'admin_users_mobile_uq')
      table.dropColumn('mobile')
    })
  }
}
