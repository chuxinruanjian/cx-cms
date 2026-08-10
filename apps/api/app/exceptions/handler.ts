import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'

type DatabaseError = {
  code?: string
  message?: string
}

export function isDatabaseMigrationRequiredError(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const { code, message = '' } = error as DatabaseError
  return (
    code === 'ER_BAD_FIELD_ERROR' ||
    code === 'ER_NO_SUCH_TABLE' ||
    (code === 'SQLITE_ERROR' && /no such (column|table)/i.test(message))
  )
}

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (isDatabaseMigrationRequiredError(error)) {
      return ctx.response.serviceUnavailable({
        code: 'E_DATABASE_MIGRATION_REQUIRED',
        message: 'Database schema is out of date. Run npm run db:migrate and restart the API.',
      })
    }

    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    if (isDatabaseMigrationRequiredError(error)) {
      ctx.logger.error(
        { code: 'E_DATABASE_MIGRATION_REQUIRED' },
        'Database schema is out of date. Run npm run db:migrate and restart the API.'
      )
      return
    }

    return super.report(error, ctx)
  }
}
