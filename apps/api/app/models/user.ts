import { UserSchema } from '#database/schema'
import { column } from '@adonisjs/lucid/orm'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

export default class User extends compose(
  UserSchema,
  withAuthFinder(hash, { uids: ['username'], passwordColumnName: 'password' })
) {
  @column({ serializeAs: null })
  declare password: string

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    table: 'user_access_tokens',
    type: 'user_access_token',
    prefix: 'cxusr_',
  })
  declare currentAccessToken?: AccessToken
}
