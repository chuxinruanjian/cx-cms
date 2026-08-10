import { isDatabaseMigrationRequiredError } from '#exceptions/handler'
import { test } from '@japa/runner'

test.group('Exception handler', () => {
  test('recognizes missing SQLite and MySQL schema errors', ({ assert }) => {
    assert.isTrue(
      isDatabaseMigrationRequiredError({
        code: 'SQLITE_ERROR',
        message: 'select mobile from admin_users - no such column: mobile',
      })
    )
    assert.isTrue(isDatabaseMigrationRequiredError({ code: 'ER_BAD_FIELD_ERROR' }))
    assert.isTrue(isDatabaseMigrationRequiredError({ code: 'ER_NO_SUCH_TABLE' }))
  })

  test('does not classify unrelated database errors as missing migrations', ({ assert }) => {
    assert.isFalse(
      isDatabaseMigrationRequiredError({ code: 'SQLITE_CONSTRAINT', message: 'unique failed' })
    )
    assert.isFalse(isDatabaseMigrationRequiredError(new Error('Network error')))
  })
})
