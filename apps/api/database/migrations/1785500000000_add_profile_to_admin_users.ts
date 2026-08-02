import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('admin_users', (table) => {
      table.text('profile').nullable()
    })
  }

  async down() {
    this.schema.alterTable('admin_users', (table) => {
      table.dropColumn('profile')
    })
  }
}
