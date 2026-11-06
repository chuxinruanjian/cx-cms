import AdminUser from '#models/admin_user'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

const admin = async (isSuperAdmin = true) => {
  const account = await AdminUser.create({
    username: 'member-admin',
    email: 'members@example.test',
    password: 'Password123!',
    status: true,
    isSuperAdmin,
  })
  const token = await AdminUser.accessTokens.create(account)
  return `Bearer ${token.value!.release()}`
}
const member = (username: string, status = true) =>
  User.create({
    username,
    password: '123456',
    passwordLoginEnabled: false,
    status,
    mobile: null,
    nickname: username,
    avatar: null,
  })

test.group('Member management', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('lists only frontend users with filters, pagination and safe details', async ({
    client,
    assert,
  }) => {
    const authorization = await admin()
    const user = await member('member_one')
    await member('member_two', false)
    const listed = await client
      .get('/api/v1/admin/members')
      .header('Authorization', authorization)
      .qs({ keyword: 'member_', status: false, page: 1, perPage: 1 })
    listed.assertStatus(200)
    listed.assertBodyContains({
      data: [{ username: 'member_two', status: false }],
      meta: { total: 1 },
    })
    assert.notInclude(JSON.stringify(listed.body()), 'password":')
    const detail = await client
      .get(`/api/v1/admin/members/${user.id}`)
      .header('Authorization', authorization)
    detail.assertStatus(200)
    detail.assertBodyContains({
      id: user.id,
      username: user.username,
      mobile: null,
      avatar: null,
      canChangeUsername: true,
      passwordLoginEnabled: false,
    })
    const missing = await client
      .get('/api/v1/admin/members/9999')
      .header('Authorization', authorization)
    missing.assertStatus(404)
  })

  test('edits profile, disables and revokes tokens without changing protected account fields', async ({
    client,
    assert,
  }) => {
    const authorization = await admin()
    const user = await member('original_member')
    const token = await User.accessTokens.create(user)
    const payload = {
      nickname: 'Updated',
      avatar: 'https://example.test/avatar.png',
      status: false,
      username: 'forged',
      mobile: '13800138000',
      password: 'forged',
      passwordLoginEnabled: true,
    }
    const updated = await client
      .patch(`/api/v1/admin/members/${user.id}`)
      .header('Authorization', authorization)
      .json(payload)
    updated.assertStatus(200)
    updated.assertBodyContains({
      nickname: 'Updated',
      avatar: payload.avatar,
      status: false,
      username: 'original_member',
      mobile: null,
      passwordLoginEnabled: false,
    })
    await user.refresh()
    assert.isNull(user.usernameChangedAt)
    const rejected = await client
      .get('/api/v1/auth/me')
      .header('Authorization', `Bearer ${token.value!.release()}`)
    rejected.assertStatus(401)
    const enable = await client
      .patch(`/api/v1/admin/members/${user.id}`)
      .header('Authorization', authorization)
      .json({ status: true })
    enable.assertStatus(200)
    const unsafe = await client
      .patch(`/api/v1/admin/members/${user.id}`)
      .header('Authorization', authorization)
      .json({ avatar: 'data:forged' })
    unsafe.assertStatus(422)
  })

  test('requires management permission and rejects user tokens', async ({ client }) => {
    const authorization = await admin(false)
    const denied = await client.get('/api/v1/admin/members').header('Authorization', authorization)
    denied.assertStatus(403)
    const user = await member('frontend_member')
    const token = await User.accessTokens.create(user)
    const rejected = await client
      .get('/api/v1/admin/members')
      .header('Authorization', `Bearer ${token.value!.release()}`)
    rejected.assertStatus(401)
    const anonymous = await client.get('/api/v1/admin/members')
    anonymous.assertStatus(401)
  })
})
