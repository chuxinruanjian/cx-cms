import AdminUser from '#models/admin_user'
import Attachment from '#models/attachment'
import UploadException from '#exceptions/upload_exception'
import AdminAuthService from '#services/admin_auth_service'
import SmsService, { SmsRateLimitError } from '#services/sms/sms_service'
import AttachmentService from '#services/upload/attachment_service'
import {
  adminLoginValidator,
  adminSmsLoginValidator,
  adminSmsSendValidator,
  updateAdminProfileValidator,
} from '#validators/admin_auth'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class AccessTokensController {
  async store({ request, response }: HttpContext) {
    const {
      username,
      password,
      remember = false,
    } = await request.validateUsing(adminLoginValidator)

    const user = await AdminUser.verifyCredentials(username, password)
    if (!user.status) {
      return response.forbidden({
        code: 'E_ADMIN_DISABLED',
        message: 'This administrator account has been disabled',
      })
    }

    return this.issueToken(user, request.ip(), remember)
  }

  async sendSms({ request, response, logger }: HttpContext) {
    const { mobile } = await request.validateUsing(adminSmsSendValidator)
    const user = await AdminUser.query().where('mobile', mobile).where('status', true).first()

    if (!user) {
      return response.unprocessableEntity({
        code: 'E_ADMIN_MOBILE_NOT_BOUND',
        message: 'This mobile number is not bound to an administrator account',
      })
    }

    try {
      const result = await SmsService.sendCode(mobile, 'admin_login', request.ip())
      return {
        message: 'Verification code sent',
        expiresInSeconds: result.expiresInSeconds,
      }
    } catch (error) {
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
        'Failed to send admin login SMS'
      )
      return response.badGateway({
        code: 'E_SMS_SEND_FAILED',
        message: 'Failed to send verification code',
      })
    }
  }

  async smsLogin({ request, response }: HttpContext) {
    const { mobile, code, remember = false } = await request.validateUsing(adminSmsLoginValidator)
    const user = await AdminUser.query().where('mobile', mobile).where('status', true).first()
    if (!user || !(await SmsService.verifyCode(mobile, 'admin_login', code))) {
      return response.unauthorized({
        code: 'E_INVALID_SMS_CODE',
        message: 'The verification code is invalid or has expired',
      })
    }

    return this.issueToken(user, request.ip(), remember)
  }

  private async issueToken(user: AdminUser, requestIp: string, remember: boolean) {
    user.lastLoginAt = DateTime.now()
    user.lastLoginIp = requestIp
    await user.save()

    const token = await AdminUser.accessTokens.create(user, ['*'], {
      name: 'admin-web',
      expiresIn: remember ? '30 days' : '12 hours',
    })

    return {
      user: await AdminAuthService.serializeUser(user),
      token: {
        type: 'Bearer',
        value: token.value!.release(),
        expiresAt: token.expiresAt,
      },
    }
  }

  async show({ auth }: HttpContext) {
    return AdminAuthService.serializeUser(auth.getUserOrFail())
  }

  async update({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { avatarAttachmentId, ...profile } = await request.validateUsing(
      updateAdminProfileValidator
    )
    const emailOwner = await AdminUser.query()
      .where('email', profile.email)
      .whereNot('id', user.id)
      .first()
    if (emailOwner) {
      return response.unprocessableEntity({
        code: 'E_ADMIN_EMAIL_TAKEN',
        message: 'Email is already in use',
      })
    }

    if (avatarAttachmentId !== undefined) {
      if (avatarAttachmentId === null) {
        await AttachmentService.bind(user, {
          attachmentIds: [],
          businessType: 'admin_user',
          businessId: String(user.id),
          fieldName: 'avatar',
        })
        user.avatar = null
      } else {
        const attachment = await Attachment.findOrFail(avatarAttachmentId)
        if (attachment.fileType !== 'image') {
          throw new UploadException('Avatar attachment must be an image', 'E_AVATAR_NOT_IMAGE')
        }
        const [avatar] = await AttachmentService.bind(user, {
          attachmentIds: [avatarAttachmentId],
          businessType: 'admin_user',
          businessId: String(user.id),
          fieldName: 'avatar',
        })
        user.avatar = avatar.previewUrl
      }
    }

    user.merge(profile)
    await user.save()
    return AdminAuthService.serializeUser(user)
  }

  async destroy({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken) {
      await AdminUser.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return { message: 'Logged out successfully' }
  }
}
