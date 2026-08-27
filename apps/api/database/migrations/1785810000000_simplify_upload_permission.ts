import { BaseSchema } from '@adonisjs/lucid/schema'

const removedCodes = [
  'admin.attachments.view',
  'admin.attachments.bind',
  'admin.attachments.delete',
  'admin.attachments.cleanup',
]

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const replacement = await db
        .from('admin_permissions')
        .where('code', 'admin.uploads.create')
        .first()
      if (replacement) {
        await db.from('admin_permissions').where('code', 'admin.attachments.upload').delete()
      } else {
        await db
          .from('admin_permissions')
          .where('code', 'admin.attachments.upload')
          .update({ code: 'admin.uploads.create', name: '上传文件' })
      }
      await db.from('admin_permissions').whereIn('code', removedCodes).delete()
    })
  }

  async down() {
    this.defer(async (db) => {
      await db
        .from('admin_permissions')
        .where('code', 'admin.uploads.create')
        .update({ code: 'admin.attachments.upload', name: '上传文件' })
    })
  }
}
