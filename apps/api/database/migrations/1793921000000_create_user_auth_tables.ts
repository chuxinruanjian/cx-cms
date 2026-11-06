import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('users', (table) => {
      table.increments('id').notNullable()
      table.string('username', 64).notNullable().unique('users_username_uq')
      table.string('password', 255).notNullable()
      table.boolean('password_login_enabled').notNullable().defaultTo(false)
      table.timestamp('username_changed_at').nullable()
      table.string('mobile', 20).nullable().unique('users_mobile_uq')
      table.string('nickname', 100).nullable()
      table.string('avatar', 512).nullable()
      table.boolean('status').notNullable().defaultTo(true)
      table.string('union_id', 128).nullable()
      table.string('union_scope', 160).nullable()
      table.string('union_key', 64).nullable().unique('users_union_key_uq')
      table.timestamp('last_login_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
    this.schema.createTable('user_access_tokens', (table) => {
      table.increments('id').notNullable()
      table
        .integer('tokenable_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('type').notNullable()
      table.string('name').nullable()
      table.string('hash').notNullable()
      table.text('abilities').notNullable()
      table.timestamp('created_at').nullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('last_used_at').nullable()
      table.timestamp('expires_at').nullable()
      table.index(['tokenable_id'], 'user_tokens_user_idx')
    })
    this.schema.createTable('user_wechat_accounts', (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('provider', 32).notNullable()
      table.string('app_id', 64).notNullable()
      table.string('open_id', 128).notNullable()
      table.string('identity_key', 64).notNullable().unique('user_wechat_identity_uq')
      table.string('union_id', 128).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.index(['user_id'], 'user_wechat_user_idx')
    })
    this.schema.createTable('user_oauth_states', (table) => {
      table.increments('id').notNullable()
      table.string('state_hash', 64).notNullable().unique('user_oauth_state_uq')
      table.string('browser_hash', 64).notNullable()
      table.string('app_id', 64).notNullable()
      table.timestamp('expires_at').notNullable()
      table.timestamp('used_at').nullable()
      table.timestamp('created_at').notNullable()
      table.index(['expires_at'], 'user_oauth_expires_idx')
    })
    this.schema.createTable('user_auth_limits', (table) => {
      table.string('key_hash', 64).primary()
      table.integer('attempts').unsigned().notNullable().defaultTo(0)
      table.timestamp('expires_at').notNullable()
      table.index(['expires_at'], 'user_auth_limits_expires_idx')
    })
  }

  async down() {
    this.schema.dropTable('user_auth_limits')
    this.schema.dropTable('user_oauth_states')
    this.schema.dropTable('user_wechat_accounts')
    this.schema.dropTable('user_access_tokens')
    this.schema.dropTable('users')
  }
}
