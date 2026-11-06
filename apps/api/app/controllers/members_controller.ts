import User from '#models/user'
import UserAuthService from '#services/user_auth/user_auth_service'
import { listMembersValidator, updateMemberValidator } from '#validators/member_management'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

const serialize = (user: User) => ({
  ...UserAuthService.serialize(user),
  lastLoginAt: user.lastLoginAt,
})

export default class MembersController {
  async index({ request }: HttpContext) {
    const { keyword, status, page, perPage } = await request.validateUsing(listMembersValidator)
    const query = User.query()
    if (keyword)
      query.where((builder) =>
        builder
          .whereLike('username', `%${keyword}%`)
          .orWhereLike('nickname', `%${keyword}%`)
          .orWhereLike('mobile', `%${keyword}%`)
      )
    if (status !== undefined) query.where('status', status)
    const rows = await query.orderBy('id', 'desc').paginate(page || 1, perPage || 20)
    return { data: rows.all().map(serialize), meta: rows.getMeta() }
  }
  async show({ params }: HttpContext) {
    return serialize(await User.findOrFail(params.id))
  }
  async update({ params, request }: HttpContext) {
    const input = await request.validateUsing(updateMemberValidator)
    const user = await db.transaction(async (trx) => {
      const row = await User.query({ client: trx }).where('id', params.id).forUpdate().firstOrFail()
      row.merge(input)
      await row.save()
      if (input.status === false)
        await trx.from('user_access_tokens').where('tokenable_id', row.id).delete()
      return row
    })
    return serialize(user)
  }
}
