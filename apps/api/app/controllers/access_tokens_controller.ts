import AdminUser from '#models/admin_user'
import Attachment from '#models/attachment'
import UploadException from '#exceptions/upload_exception'
import AdminAuthService from '#services/admin_auth_service'
import AttachmentService from '#services/upload/attachment_service'
import { adminLoginValidator, updateAdminProfileValidator } from '#validators/admin_auth'
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

    user.lastLoginAt = DateTime.now()
    user.lastLoginIp = request.ip()
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
