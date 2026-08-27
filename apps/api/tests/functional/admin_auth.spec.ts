import AdminPermission from '#models/admin_permission'
import AdminRole from '#models/admin_role'
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

  test('resets a password with the bound mobile and revokes every session', async ({ client }) => {
    const mobile = '13400134000'
    const user = await AdminUser.create({
      username: 'reset-admin',
      fullName: 'Reset Admin',
      email: 'reset-admin@example.com',
      mobile,
      password: 'StrongPassword123!',
      status: true,
      isSuperAdmin: true,
    })
    const firstToken = await AdminUser.accessTokens.create(user)
    const secondToken = await AdminUser.accessTokens.create(user)

    const unknown = await client.post('/api/v1/admin/auth/password-reset/code').json({
      mobile: '13300133000',
    })
    unknown.assertStatus(422)
    unknown.assertBodyContains({ code: 'E_ADMIN_MOBILE_NOT_BOUND' })
    if (deliveredCodes.has('13300133000')) {
      throw new Error('Expected no password reset SMS for an unknown mobile')
    }

    const sent = await client.post('/api/v1/admin/auth/password-reset/code').json({ mobile })
    sent.assertStatus(200)
    const code = deliveredCodes.get(mobile)
    if (!code) throw new Error('Expected a password reset verification code')

    const invalid = await client.post('/api/v1/admin/auth/password-reset').json({
      mobile,
      code: '000000',
      newPassword: 'NewPassword456!',
    })
    invalid.assertStatus(422)
    invalid.assertBodyContains({ code: 'E_INVALID_SMS_CODE' })

    const reset = await client.post('/api/v1/admin/auth/password-reset').json({
      mobile,
      code,
      newPassword: 'NewPassword456!',
    })
    reset.assertStatus(200)

    await user.refresh()
    if (!(await user.verifyPassword('NewPassword456!'))) {
      throw new Error('Expected the reset password to be persisted')
    }
    if (await user.verifyPassword('StrongPassword123!')) {
      throw new Error('Expected the old password to be rejected after reset')
    }

    for (const token of [firstToken, secondToken]) {
      const session = await client
        .get('/api/v1/admin/auth/me')
        .header('Authorization', `Bearer ${token.value!.release()}`)
      session.assertStatus(401)
    }

    const reused = await client.post('/api/v1/admin/auth/password-reset').json({
      mobile,
      code,
      newPassword: 'AnotherPassword789!',
    })
    reused.assertStatus(422)
    reused.assertBodyContains({ code: 'E_INVALID_SMS_CODE' })
  })

  test('changes the current password and revokes other sessions', async ({ client }) => {
    const user = await AdminUser.create({
      username: 'password-admin',
      fullName: 'Password Admin',
      email: 'password-admin@example.com',
      password: 'StrongPassword123!',
      status: true,
      isSuperAdmin: true,
    })
    const currentToken = await AdminUser.accessTokens.create(user)
    const otherToken = await AdminUser.accessTokens.create(user)
    const authorization = `Bearer ${currentToken.value!.release()}`

    const invalid = await client
      .patch('/api/v1/admin/auth/security/password')
      .header('Authorization', authorization)
      .json({ currentPassword: 'WrongPassword123!', newPassword: 'NewPassword456!' })
    invalid.assertStatus(422)
    invalid.assertBodyContains({ code: 'E_CURRENT_PASSWORD_INVALID' })

    const updated = await client
      .patch('/api/v1/admin/auth/security/password')
      .header('Authorization', authorization)
      .json({ currentPassword: 'StrongPassword123!', newPassword: 'NewPassword456!' })
    updated.assertStatus(200)

    await user.refresh()
    if (!(await user.verifyPassword('NewPassword456!'))) {
      throw new Error('Expected the new password to be persisted')
    }
    if (await user.verifyPassword('StrongPassword123!')) {
      throw new Error('Expected the old password to be rejected')
    }

    const currentSession = await client
      .get('/api/v1/admin/auth/me')
      .header('Authorization', authorization)
    currentSession.assertStatus(200)

    const revokedSession = await client
      .get('/api/v1/admin/auth/me')
      .header('Authorization', `Bearer ${otherToken.value!.release()}`)
    revokedSession.assertStatus(401)
  })

  test('binds and changes the security mobile with one verification flow', async ({ client }) => {
    const user = await AdminUser.create({
      username: 'mobile-admin',
      fullName: 'Mobile Admin',
      email: 'mobile-admin@example.com',
      password: 'StrongPassword123!',
      status: true,
      isSuperAdmin: true,
    })
    await AdminUser.create({
      username: 'mobile-owner',
      fullName: 'Mobile Owner',
      email: 'mobile-owner@example.com',
      mobile: '13700137000',
      password: 'StrongPassword123!',
      status: true,
      isSuperAdmin: false,
    })
    const token = await AdminUser.accessTokens.create(user)
    const authorization = `Bearer ${token.value!.release()}`

    const occupied = await client
      .post('/api/v1/admin/auth/security/mobile/code')
      .header('Authorization', authorization)
      .json({ mobile: '13700137000' })
    occupied.assertStatus(422)
    occupied.assertBodyContains({ code: 'E_ADMIN_MOBILE_ALREADY_BOUND' })
    if (deliveredCodes.size !== 0) throw new Error('Expected no SMS for an occupied mobile')

    const firstMobile = '13600136000'
    const sent = await client
      .post('/api/v1/admin/auth/security/mobile/code')
      .header('Authorization', authorization)
      .json({ mobile: firstMobile })
    sent.assertStatus(200)
    const firstCode = deliveredCodes.get(firstMobile)
    if (!firstCode) throw new Error('Expected a code for the first security mobile')

    const invalidPassword = await client
      .put('/api/v1/admin/auth/security/mobile')
      .header('Authorization', authorization)
      .json({ currentPassword: 'WrongPassword123!', mobile: firstMobile, code: firstCode })
    invalidPassword.assertStatus(422)
    invalidPassword.assertBodyContains({ code: 'E_CURRENT_PASSWORD_INVALID' })

    const bound = await client
      .put('/api/v1/admin/auth/security/mobile')
      .header('Authorization', authorization)
      .json({ currentPassword: 'StrongPassword123!', mobile: firstMobile, code: firstCode })
    bound.assertStatus(200)
    bound.assertBodyContains({ id: user.id, mobile: firstMobile })

    const secondMobile = '13500135000'
    const resent = await client
      .post('/api/v1/admin/auth/security/mobile/code')
      .header('Authorization', authorization)
      .json({ mobile: secondMobile })
    resent.assertStatus(200)
    const secondCode = deliveredCodes.get(secondMobile)
    if (!secondCode) throw new Error('Expected a code for the replacement security mobile')

    const changed = await client
      .put('/api/v1/admin/auth/security/mobile')
      .header('Authorization', authorization)
      .json({ currentPassword: 'StrongPassword123!', mobile: secondMobile, code: secondCode })
    changed.assertStatus(200)
    changed.assertBodyContains({ id: user.id, mobile: secondMobile })

    await user.refresh()
    if (user.mobile !== secondMobile) throw new Error('Expected the security mobile to change')
  })

  test('updates the current profile with an uploaded avatar URL', async ({ client }) => {
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
    const avatarUrl = (upload.body() as { url: string }).url
    const updated = await client
      .patch('/api/v1/admin/auth/me')
      .header('Authorization', authorization)
      .json({
        fullName: 'Updated Admin',
        email: 'updated@example.com',
        profile: 'Reusable project administrator',
        avatar: avatarUrl,
      })

    updated.assertStatus(200)
    updated.assertBodyContains({
      fullName: 'Updated Admin',
      email: 'updated@example.com',
      profile: 'Reusable project administrator',
      avatar: avatarUrl,
    })

    await user.refresh()
    if (user.profile !== 'Reusable project administrator') {
      throw new Error('Expected the profile to be persisted')
    }
    if (user.avatar !== avatarUrl) throw new Error('Expected the avatar URL to be persisted')

    const avatar = await client.get(avatarUrl)
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
