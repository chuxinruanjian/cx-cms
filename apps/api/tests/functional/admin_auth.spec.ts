import AdminPermission from '#models/admin_permission'
import AdminRole from '#models/admin_role'
import AttachmentRelation from '#models/attachment_relation'
import AdminUser from '#models/admin_user'
import SmsService from '#services/sms/sms_service'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Admin authentication and RBAC', (group) => {
  let deliveredCodes = new Map<string, string>()

  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(() => {
    deliveredCodes = new Map()
    SmsService.setSender(async (mobile, code) => {
      deliveredCodes.set(mobile, code)
      return { providerCode: 'OK', requestId: 'test-request' }
    })
    return () => SmsService.setSender()
  })

  test('logs in, returns the current administrator, and revokes the token', async ({ client }) => {
    const user = await AdminUser.create({
      username: 'admin',
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'StrongPassword123!',
      status: true,
      isSuperAdmin: true,
    })

    const login = await client.post('/api/v1/admin/auth/login').json({
      username: 'admin',
      password: 'StrongPassword123!',
      remember: false,
    })

    login.assertStatus(200)
    login.assertBodyContains({
      user: {
        id: user.id,
        username: 'admin',
        isSuperAdmin: true,
        permissions: ['*'],
      },
      token: { type: 'Bearer' },
    })

    const token = login.body().token.value
    const profile = await client
      .get('/api/v1/admin/auth/me')
      .header('Authorization', `Bearer ${token}`)

    profile.assertStatus(200)
    profile.assertBodyContains({ id: user.id, username: 'admin' })

    user.status = false
    await user.save()
    const disabledProfile = await client
      .get('/api/v1/admin/auth/me')
      .header('Authorization', `Bearer ${token}`)
    disabledProfile.assertStatus(403)
    disabledProfile.assertBodyContains({ code: 'E_ADMIN_DISABLED' })

    user.status = true
    await user.save()
    const logout = await client
      .delete('/api/v1/admin/auth/logout')
      .header('Authorization', `Bearer ${token}`)
    logout.assertStatus(200)

    const profileAfterLogout = await client
      .get('/api/v1/admin/auth/me')
      .header('Authorization', `Bearer ${token}`)
    profileAfterLogout.assertStatus(401)
  })

  test('rejects a disabled administrator', async ({ client }) => {
    await AdminUser.create({
      username: 'disabled',
      fullName: 'Disabled User',
      email: 'disabled@example.com',
      password: 'StrongPassword123!',
      status: false,
      isSuperAdmin: false,
    })

    const response = await client.post('/api/v1/admin/auth/login').json({
      username: 'disabled',
      password: 'StrongPassword123!',
    })

    response.assertStatus(403)
    response.assertBodyContains({ code: 'E_ADMIN_DISABLED' })
  })

  test('sends a rate-limited code and logs in once with SMS', async ({ client }) => {
    const mobile = '13800138000'
    const user = await AdminUser.create({
      username: 'sms-admin',
      fullName: 'SMS Admin',
      email: 'sms-admin@example.com',
      mobile,
      password: 'StrongPassword123!',
      status: true,
      isSuperAdmin: true,
    })

    const sent = await client.post('/api/v1/admin/auth/sms/send').json({ mobile })
    sent.assertStatus(200)
    sent.assertBodyContains({ message: 'Verification code sent', expiresInSeconds: 300 })

    const rateLimited = await client.post('/api/v1/admin/auth/sms/send').json({ mobile })
    rateLimited.assertStatus(429)
    rateLimited.assertBodyContains({ code: 'E_SMS_RATE_LIMITED' })

    const invalid = await client.post('/api/v1/admin/auth/sms/login').json({
      mobile,
      code: '000000',
    })
    invalid.assertStatus(401)
    invalid.assertBodyContains({ code: 'E_INVALID_SMS_CODE' })

    const code = deliveredCodes.get(mobile)
    if (!code) throw new Error('Expected the fake SMS sender to capture a code')
    const login = await client.post('/api/v1/admin/auth/sms/login').json({
      mobile,
      code,
      remember: true,
    })
    login.assertStatus(200)
    login.assertBodyContains({
      user: { id: user.id, mobile },
      token: { type: 'Bearer' },
    })

    const reused = await client.post('/api/v1/admin/auth/sms/login').json({ mobile, code })
    reused.assertStatus(401)
    reused.assertBodyContains({ code: 'E_INVALID_SMS_CODE' })
  })

  test('rejects an unbound administrator mobile without sending SMS', async ({ client }) => {
    const response = await client.post('/api/v1/admin/auth/sms/send').json({
      mobile: '13900139000',
    })

    response.assertStatus(422)
    response.assertBodyContains({
      code: 'E_ADMIN_MOBILE_NOT_BOUND',
      message: 'This mobile number is not bound to an administrator account',
    })
    if (deliveredCodes.size !== 0) throw new Error('Expected no SMS for an unknown mobile')
  })

  test('updates the current profile and binds an uploaded avatar', async ({ client }) => {
    const user = await AdminUser.create({
      username: 'profile-admin',
      fullName: 'Profile Admin',
      email: 'profile@example.com',
      password: 'StrongPassword123!',
      status: true,
      isSuperAdmin: true,
    })
    const token = await AdminUser.accessTokens.create(user)
    const authorization = `Bearer ${token.value!.release()}`
    const png = Buffer.alloc(128)
    Buffer.from('89504e470d0a1a0a', 'hex').copy(png)

    const upload = await client
      .post('/api/v1/admin/uploads')
      .header('Authorization', authorization)
      .fields({ uploadToken: 'profile_avatar_token' })
      .file('file', png, { filename: 'avatar.png', contentType: 'image/png' })

    upload.assertStatus(201)
    const attachmentId = (upload.body() as { id: number }).id
    const updated = await client
      .patch('/api/v1/admin/auth/me')
      .header('Authorization', authorization)
      .json({
        fullName: 'Updated Admin',
        email: 'updated@example.com',
        profile: 'Reusable project administrator',
        avatarAttachmentId: attachmentId,
      })

    updated.assertStatus(200)
    updated.assertBodyContains({
      fullName: 'Updated Admin',
      email: 'updated@example.com',
      profile: 'Reusable project administrator',
      avatar: `/api/v1/admin/attachments/${attachmentId}/content`,
    })

    await user.refresh()
    if (user.profile !== 'Reusable project administrator') {
      throw new Error('Expected the profile to be persisted')
    }
    const relation = await AttachmentRelation.query()
      .where('attachment_id', attachmentId)
      .where('business_type', 'admin_user')
      .where('business_id', String(user.id))
      .where('field_name', 'avatar')
      .first()
    if (!relation) throw new Error('Expected the avatar attachment to be bound')

    const avatar = await client
      .get(`/api/v1/admin/attachments/${attachmentId}/content`)
      .header('Authorization', authorization)
    avatar.assertStatus(200)
  })

  test('rejects a profile email already used by another administrator', async ({ client }) => {
    await AdminUser.create({
      username: 'existing-admin',
      fullName: 'Existing Admin',
      email: 'existing@example.com',
      password: 'StrongPassword123!',
      status: true,
      isSuperAdmin: false,
    })
    const user = await AdminUser.create({
      username: 'editing-admin',
      fullName: 'Editing Admin',
      email: 'editing@example.com',
      password: 'StrongPassword123!',
      status: true,
      isSuperAdmin: false,
    })
    const token = await AdminUser.accessTokens.create(user)

    const response = await client
      .patch('/api/v1/admin/auth/me')
      .header('Authorization', `Bearer ${token.value!.release()}`)
      .json({
        fullName: 'Editing Admin',
        email: 'existing@example.com',
        profile: null,
      })

    response.assertStatus(422)
    response.assertBodyContains({ code: 'E_ADMIN_EMAIL_TAKEN' })
  })

  test('evaluates permissions from the database for every request', async ({ client }) => {
    const user = await AdminUser.create({
      username: 'operator',
      fullName: 'Operator',
      email: 'operator@example.com',
      password: 'StrongPassword123!',
      status: true,
      isSuperAdmin: false,
    })
    const role = await AdminRole.create({
      name: 'Role manager',
      code: 'role_manager',
      description: null,
      status: true,
    })
    const permission = await AdminPermission.create({
      name: 'View roles',
      code: 'admin.roles.view',
      description: null,
      status: true,
    })
    await role.related('permissions').attach([permission.id])
    await user.related('roles').attach([role.id])

    const login = await client.post('/api/v1/admin/auth/login').json({
      username: 'operator',
      password: 'StrongPassword123!',
    })
    const token = login.body().token.value

    const allowed = await client
      .get('/api/v1/admin/roles')
      .header('Authorization', `Bearer ${token}`)
    allowed.assertStatus(200)

    permission.status = false
    await permission.save()

    const denied = await client
      .get('/api/v1/admin/roles')
      .header('Authorization', `Bearer ${token}`)
    denied.assertStatus(403)
    denied.assertBodyContains({ code: 'E_ADMIN_FORBIDDEN' })
  })
})
