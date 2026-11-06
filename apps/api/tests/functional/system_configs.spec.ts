import AdminUser from '#models/admin_user'
import AdminPermission from '#models/admin_permission'
import AdminRole from '#models/admin_role'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

const adminToken = async (superAdmin = true) => {
  const user = await AdminUser.create({
    username: 'config-admin',
    fullName: 'Config Admin',
    email: 'config@example.test',
    password: 'TestPassword123!',
    status: true,
    isSuperAdmin: superAdmin,
  })
  const token = await AdminUser.accessTokens.create(user)
  return { user, authorization: `Bearer ${token.value!.release()}` }
}

test.group('System configuration', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('encrypts internal values and never returns them through browser APIs', async ({
    client,
    assert,
  }) => {
    const { authorization } = await adminToken()
    const created = await client
      .post('/api/v1/admin/system-configs')
      .header('Authorization', authorization)
      .json({
        name: 'Provider token',
        configKey: 'provider.token',
        type: 'internal',
        value: 'fixture-private-token',
      })
    created.assertStatus(201)
    created.assertBodyContains({
      configKey: 'provider.token',
      type: 'internal',
      value: null,
      hasValue: true,
    })
    const stored = await db
      .from('system_configs')
      .where('id', (created.body() as { id: number }).id)
      .first()
    assert.notEqual(stored.value, 'fixture-private-token')
    assert.notInclude(JSON.stringify(created.body()), stored.value)
    const listed = await client
      .get('/api/v1/admin/system-configs')
      .header('Authorization', authorization)
      .qs({ type: 'internal' })
    listed.assertStatus(200)
    assert.notInclude(JSON.stringify(listed.body()), 'fixture-private-token')
    assert.notInclude(JSON.stringify(listed.body()), stored.value)
    const publicConfigs = await client.get('/api/v1/system-configs/public')
    publicConfigs.assertStatus(200)
    publicConfigs.assertBody({})
    const { default: service } = await import('#services/system_config_service')
    assert.equal(await service.get('provider.token'), 'fixture-private-token')
    assert.isNull(await service.get('missing.key'))
  })

  test('returns a safe duplicate-key error even when creates bypass the validation precheck', async ({
    assert,
  }) => {
    const { default: service } = await import('#services/system_config_service')
    const input = {
      name: 'Provider key',
      configKey: 'provider.key',
      type: 'internal' as const,
      value: 'fixture-token',
    }
    await service.create(input)
    await assert.rejects(() => service.create(input), 'Configuration key already exists')
    const { default: SystemConfig } = await import('#models/system_config')
    const row = await SystemConfig.findByOrFail('configKey', input.configKey)
    assert.notProperty(row.serialize(), 'value')
  })

  test('publishes only public key-value pairs and reflects edits and deletions', async ({
    client,
  }) => {
    const { authorization } = await adminToken()
    const created = await client
      .post('/api/v1/admin/system-configs')
      .header('Authorization', authorization)
      .json({ name: 'Site name', configKey: 'site.name', type: 'public', value: 'Example Site' })
    created.assertStatus(201)
    const publicConfigs = await client.get('/api/v1/system-configs/public')
    publicConfigs.assertBody({ 'site.name': 'Example Site' })
    const updated = await client
      .patch(`/api/v1/admin/system-configs/${(created.body() as { id: number }).id}`)
      .header('Authorization', authorization)
      .json({ value: 'New Site' })
    updated.assertStatus(200)
    const fresh = await client.get('/api/v1/system-configs/public')
    fresh.assertBody({ 'site.name': 'New Site' })
    const deleted = await client
      .delete(`/api/v1/admin/system-configs/${(created.body() as { id: number }).id}`)
      .header('Authorization', authorization)
    deleted.assertStatus(204)
    const empty = await client.get('/api/v1/system-configs/public')
    empty.assertBody({})
  })

  test('keeps an internal value when omitted or blank and accepts an explicit replacement', async ({
    client,
    assert,
  }) => {
    const { authorization } = await adminToken()
    const created = await client
      .post('/api/v1/admin/system-configs')
      .header('Authorization', authorization)
      .json({
        name: 'Payment path',
        configKey: 'payment.certificate',
        type: 'internal',
        value: '../../storage/certificates/payment/example.pem',
      })
    created.assertStatus(201)
    const { default: service } = await import('#services/system_config_service')
    const id = (created.body() as { id: number }).id
    for (const payload of [{ name: 'Updated label' }, { value: '' }]) {
      const response = await client
        .patch(`/api/v1/admin/system-configs/${id}`)
        .header('Authorization', authorization)
        .json(payload)
      response.assertStatus(200)
      response.assertBodyContains({ value: null, hasValue: true })
      assert.equal(
        await service.get('payment.certificate'),
        '../../storage/certificates/payment/example.pem'
      )
    }
    const response = await client
      .patch(`/api/v1/admin/system-configs/${id}`)
      .header('Authorization', authorization)
      .json({ value: 'replacement-fixture' })
    response.assertStatus(200)
    assert.equal(await service.get('payment.certificate'), 'replacement-fixture')
  })

  test('rejects duplicate keys, invalid types, invalid keys and reclassification', async ({
    client,
  }) => {
    const { authorization } = await adminToken()
    const payload = {
      name: 'Private token',
      configKey: 'provider.token',
      type: 'internal',
      value: 'fixture-token',
    }
    const created = await client
      .post('/api/v1/admin/system-configs')
      .header('Authorization', authorization)
      .json(payload)
    created.assertStatus(201)
    for (const extra of [
      {},
      { configKey: 'Uppercase' },
      { configKey: 'new.key', type: 'unknown' },
    ]) {
      const response = await client
        .post('/api/v1/admin/system-configs')
        .header('Authorization', authorization)
        .json({ ...payload, ...extra })
      response.assertStatus(422)
    }
    for (const extra of [{ type: 'public' }, { configKey: 'site.token' }]) {
      const response = await client
        .patch(`/api/v1/admin/system-configs/${(created.body() as { id: number }).id}`)
        .header('Authorization', authorization)
        .json(extra)
      response.assertStatus(422)
    }
    const published = await client.get('/api/v1/system-configs/public')
    published.assertBody({})
  })

  test('filters and paginates only within the selected configuration type', async ({
    client,
    assert,
  }) => {
    const { authorization } = await adminToken()
    for (const [configKey, type, name] of [
      ['site.name', 'public', 'Site name'],
      ['site.logo', 'public', 'Site logo'],
      ['provider.key', 'internal', 'Provider key'],
    ]) {
      const response = await client
        .post('/api/v1/admin/system-configs')
        .header('Authorization', authorization)
        .json({ configKey, type, name, value: 'fixture' })
      response.assertStatus(201)
    }
    const response = await client
      .get('/api/v1/admin/system-configs')
      .header('Authorization', authorization)
      .qs({ type: 'public', keyword: 'site', page: 2, perPage: 1 })
    response.assertStatus(200)
    assert.equal((response.body() as { meta: { total: number } }).meta.total, 2)
    assert.lengthOf((response.body() as { data: { type: string }[] }).data, 1)
    assert.equal((response.body() as { data: { type: string }[] }).data[0].type, 'public')
    const internal = await client
      .get('/api/v1/admin/system-configs')
      .header('Authorization', authorization)
      .qs({ type: 'internal', keyword: 'site' })
    assert.lengthOf((internal.body() as { data: unknown[] }).data, 0)
  })

  test('enforces separate management permissions and resolves revocation immediately', async ({
    client,
  }) => {
    const { authorization, user } = await adminToken(false)
    const anonymous = await client.get('/api/v1/admin/system-configs').qs({ type: 'public' })
    anonymous.assertStatus(401)
    const forbidden = await client
      .get('/api/v1/admin/system-configs')
      .header('Authorization', authorization)
      .qs({ type: 'public' })
    forbidden.assertStatus(403)
    const permission = await AdminPermission.create({
      name: 'View configurations',
      code: 'admin.system_configs.view',
      status: true,
    })
    const role = await AdminRole.create({
      name: 'Config reader',
      code: 'config_reader',
      status: true,
    })
    await role.related('permissions').attach([permission.id])
    await user.related('roles').attach([role.id])
    const allowed = await client
      .get('/api/v1/admin/system-configs')
      .header('Authorization', authorization)
      .qs({ type: 'public' })
    allowed.assertStatus(200)
    for (const method of ['post', 'patch', 'delete'] as const) {
      const request =
        method === 'post'
          ? client.post('/api/v1/admin/system-configs')
          : method === 'patch'
            ? client.patch('/api/v1/admin/system-configs/1')
            : client.delete('/api/v1/admin/system-configs/1')
      const denied = await request.header('Authorization', authorization)
      denied.assertStatus(403)
    }
    await role.related('permissions').detach([permission.id])
    const revoked = await client
      .get('/api/v1/admin/system-configs')
      .header('Authorization', authorization)
      .qs({ type: 'public' })
    revoked.assertStatus(403)
  })
})
