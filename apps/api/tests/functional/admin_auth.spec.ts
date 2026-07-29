import AdminPermission from '#models/admin_permission'
import AdminRole from '#models/admin_role'
import AdminUser from '#models/admin_user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Admin authentication and RBAC', (group) => {
  group.each.setup(() => testUtils.db().truncate())

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
