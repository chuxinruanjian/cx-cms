import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.renameTable('users', 'admin_users')
    this.schema.renameTable('auth_access_tokens', 'admin_access_tokens')

    this.schema.alterTable('admin_users', (table) => {
      table.string('username', 64).nullable()
      table.string('avatar').nullable()
      table.boolean('status').notNullable().defaultTo(true)
      table.boolean('is_super_admin').notNullable().defaultTo(false)
      table.timestamp('last_login_at').nullable()
      table.string('last_login_ip', 64).nullable()
    })

    this.defer(async (db) => {
      const users = await db.from('admin_users').select('id', 'email')
      for (const user of users) {
        await db.from('admin_users').where('id', user.id).update({ username: user.email })
      }
    })

    this.schema.alterTable('admin_users', (table) => {
      table.string('username', 64).notNullable().alter()
      table.unique(['username'])
    })

    this.schema.alterTable('admin_access_tokens', (table) => {
      table.index(['tokenable_id'])
    })

    this.schema.createTable('admin_roles', (table) => {
      table.increments('id').notNullable()
      table.string('name', 64).notNullable()
      table.string('code', 64).notNullable().unique()
      table.string('description', 255).nullable()
      table.boolean('status').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('admin_permissions', (table) => {
      table.increments('id').notNullable()
      table.string('name', 64).notNullable()
      table.string('code', 128).notNullable().unique()
      table.string('description', 255).nullable()
      table.boolean('status').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('admin_user_roles', (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('admin_users')
        .onDelete('CASCADE')
      table
        .integer('role_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('admin_roles')
        .onDelete('CASCADE')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['user_id', 'role_id'])
      table.index(['role_id'])
    })

    this.schema.createTable('admin_role_permissions', (table) => {
      table.increments('id').notNullable()
      table
        .integer('role_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('admin_roles')
        .onDelete('CASCADE')
      table
        .integer('permission_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('admin_permissions')
        .onDelete('CASCADE')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['role_id', 'permission_id'])
      table.index(['permission_id'])
    })
  }

  async down() {
    this.schema.dropTable('admin_role_permissions')
    this.schema.dropTable('admin_user_roles')
    this.schema.dropTable('admin_permissions')
    this.schema.dropTable('admin_roles')

    this.schema.alterTable('admin_access_tokens', (table) => {
      table.dropIndex(['tokenable_id'])
    })

    this.schema.alterTable('admin_users', (table) => {
      table.dropUnique(['username'])
      table.dropColumns(
        'username',
        'avatar',
        'status',
        'is_super_admin',
        'last_login_at',
        'last_login_ip'
      )
    })

    this.schema.renameTable('admin_access_tokens', 'auth_access_tokens')
    this.schema.renameTable('admin_users', 'users')
  }
}
