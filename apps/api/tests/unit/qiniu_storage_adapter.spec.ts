import QiniuStorageAdapter from '#services/upload/storage/qiniu_storage_adapter'
import { test } from '@japa/runner'

test.group('Qiniu storage adapter', () => {
  test('creates an upload token with the runtime SDK export', ({ assert }) => {
    const adapter = new QiniuStorageAdapter({
      accessKey: 'test-access-key',
      secretKey: 'test-secret-key',
      bucket: 'test-bucket',
      domain: 'https://cdn.example.test',
      uploadUrl: 'https://upload.example.test',
      uploadTokenTtlSeconds: 600,
    })
    const authorization = adapter.createDirectUpload('images/2026/08/example.png', 128, 'image/png')

    assert.equal(authorization.objectKey, 'images/2026/08/example.png')
    assert.equal(authorization.uploadUrl, 'https://upload.example.test')
    assert.match(authorization.token, /^test-access-key:/)
  })
})
