import { AdminUserSchema } from '#database/schema'
import AdminRole from '#models/admin_role'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class AdminUser extends compose(
  AdminUserSchema,
  withAuthFinder(hash, {
    uids: ['username'],
    passwordColumnName: 'password',
  })
) {
  static accessTokens = DbAccessTokensProvider.forModel(AdminUser, {
    table: 'admin_access_tokens',
    type: 'admin_access_token',
    prefix: 'cxadm_',
  })

  declare currentAccessToken?: AccessToken

  @manyToMany(() => AdminRole, {
    pivotTable: 'admin_user_roles',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'role_id',
    pivotTimestamps: true,
  })
  declare roles: ManyToMany<typeof AdminRole>
}
