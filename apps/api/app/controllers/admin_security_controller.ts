import AdminAuthService from '#services/admin_auth_service'
import AdminSecurityService, {
  AdminMobileAlreadyBoundError,
  AdminMobileNotBoundError,
  AdminMobileUnchangedError,
  CurrentPasswordInvalidError,
  InvalidMobileCodeError,
  PasswordUnchangedError,
} from '#services/admin_security_service'
import { SmsRateLimitError } from '#services/sms/sms_service'
import {
  changeAdminPasswordValidator,
  resetAdminPasswordCodeValidator,
  resetAdminPasswordValidator,
  sendAdminMobileCodeValidator,
  updateAdminMobileValidator,
} from '#validators/admin_auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminSecurityController {
  async sendPasswordResetCode({ request, response, logger }: HttpContext) {
    const { mobile } = await request.validateUsing(resetAdminPasswordCodeValidator)

    try {
      const result = await AdminSecurityService.sendPasswordResetCode(mobile, request.ip())
      return { message: 'Verification code sent', expiresInSeconds: result.expiresInSeconds }
    } catch (error) {
      if (error instanceof AdminMobileNotBoundError) {
        return response.unprocessableEntity({
          code: 'E_ADMIN_MOBILE_NOT_BOUND',
          message: error.message,
        })
      }
      if (error instanceof SmsRateLimitError) {
        response.header('Retry-After', String(error.retryAfterSeconds))
        return response.tooManyRequests({
          code: 'E_SMS_RATE_LIMITED',
          message: 'Please wait before requesting another verification code',
          retryAfterSeconds: error.retryAfterSeconds,
        })
      }

      logger.error(
        { errorName: error instanceof Error ? error.name : 'UnknownError' },
        'Failed to send administrator password reset SMS'
      )
      return response.badGateway({
        code: 'E_SMS_SEND_FAILED',
        message: 'Failed to send verification code',
      })
    }
  }

  async resetPassword({ request, response }: HttpContext) {
    const { mobile, code, newPassword } = await request.validateUsing(resetAdminPasswordValidator)

    try {
      await AdminSecurityService.resetPassword(mobile, code, newPassword)
      return { message: 'Password reset' }
    } catch (error) {
      if (error instanceof AdminMobileNotBoundError) {
        return response.unprocessableEntity({
          code: 'E_ADMIN_MOBILE_NOT_BOUND',
          message: error.message,
        })
      }
      if (error instanceof InvalidMobileCodeError) {
        return response.unprocessableEntity({
          code: 'E_INVALID_SMS_CODE',
          message: error.message,
        })
      }
      if (error instanceof PasswordUnchangedError) {
        return response.unprocessableEntity({
          code: 'E_PASSWORD_UNCHANGED',
          message: error.message,
        })
      }
      throw error
    }
  }

  async updatePassword({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { currentPassword, newPassword } = await request.validateUsing(
      changeAdminPasswordValidator
    )

    try {
      await AdminSecurityService.changePassword(user, currentPassword, newPassword)
      return { message: 'Password updated' }
    } catch (error) {
      if (error instanceof CurrentPasswordInvalidError) {
        return response.unprocessableEntity({
          code: 'E_CURRENT_PASSWORD_INVALID',
          message: error.message,
        })
      }
      if (error instanceof PasswordUnchangedError) {
        return response.unprocessableEntity({
          code: 'E_PASSWORD_UNCHANGED',
          message: error.message,
        })
      }
      throw error
    }
  }

  async sendMobileCode({ auth, request, response, logger }: HttpContext) {
    const user = auth.getUserOrFail()
    const { mobile } = await request.validateUsing(sendAdminMobileCodeValidator)

    try {
      const result = await AdminSecurityService.sendMobileCode(user, mobile, request.ip())
      return { message: 'Verification code sent', expiresInSeconds: result.expiresInSeconds }
    } catch (error) {
      if (this.handleMobileBusinessError(response, error)) return
      if (error instanceof SmsRateLimitError) {
        response.header('Retry-After', String(error.retryAfterSeconds))
        return response.tooManyRequests({
          code: 'E_SMS_RATE_LIMITED',
          message: 'Please wait before requesting another verification code',
          retryAfterSeconds: error.retryAfterSeconds,
        })
      }

      logger.error(
        { errorName: error instanceof Error ? error.name : 'UnknownError' },
        'Failed to send administrator mobile verification SMS'
      )
      return response.badGateway({
        code: 'E_SMS_SEND_FAILED',
        message: 'Failed to send verification code',
      })
    }
  }

  async updateMobile({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { currentPassword, mobile, code } = await request.validateUsing(
      updateAdminMobileValidator
    )

    try {
      await AdminSecurityService.updateMobile(user, currentPassword, mobile, code)
      return AdminAuthService.serializeUser(user)
    } catch (error) {
      if (this.handleMobileBusinessError(response, error)) return
      if (error instanceof CurrentPasswordInvalidError) {
        return response.unprocessableEntity({
          code: 'E_CURRENT_PASSWORD_INVALID',
          message: error.message,
        })
      }
      if (error instanceof InvalidMobileCodeError) {
        return response.unprocessableEntity({
          code: 'E_INVALID_SMS_CODE',
          message: error.message,
        })
      }
      throw error
    }
  }

  private handleMobileBusinessError(response: HttpContext['response'], error: unknown) {
    if (error instanceof AdminMobileAlreadyBoundError) {
      response.unprocessableEntity({
        code: 'E_ADMIN_MOBILE_ALREADY_BOUND',
        message: error.message,
      })
      return true
    }
    if (error instanceof AdminMobileUnchangedError) {
      response.unprocessableEntity({
        code: 'E_ADMIN_MOBILE_UNCHANGED',
        message: error.message,
      })
      return true
    }
    return false
  }
}
