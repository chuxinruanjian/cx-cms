import AdminUser from '#models/admin_user'
import SmsService from '#services/sms/sms_service'

export class CurrentPasswordInvalidError extends Error {
  constructor() {
    super('The current password is incorrect')
    this.name = 'CurrentPasswordInvalidError'
  }
}

export class PasswordUnchangedError extends Error {
  constructor() {
    super('The new password must be different from the current password')
    this.name = 'PasswordUnchangedError'
  }
}

export class AdminMobileAlreadyBoundError extends Error {
  constructor() {
    super('This mobile number is already bound to an administrator account')
    this.name = 'AdminMobileAlreadyBoundError'
  }
}

export class AdminMobileUnchangedError extends Error {
  constructor() {
    super('The new mobile number must be different from the current mobile number')
    this.name = 'AdminMobileUnchangedError'
  }
}

export class InvalidMobileCodeError extends Error {
  constructor() {
    super('The verification code is invalid or has expired')
    this.name = 'InvalidMobileCodeError'
  }
}

export default class AdminSecurityService {
  static async changePassword(user: AdminUser, currentPassword: string, newPassword: string) {
    if (!(await user.verifyPassword(currentPassword))) throw new CurrentPasswordInvalidError()
    if (await user.verifyPassword(newPassword)) throw new PasswordUnchangedError()

    user.password = newPassword
    await user.save()

    const currentTokenId = user.currentAccessToken?.identifier
    const tokens = await AdminUser.accessTokens.all(user)
    await Promise.all(
      tokens
        .filter((token) => String(token.identifier) !== String(currentTokenId))
        .map((token) => AdminUser.accessTokens.delete(user, token.identifier))
    )
  }

  static async sendMobileCode(user: AdminUser, mobile: string, requestIp: string) {
    await this.assertMobileAvailable(user, mobile)
    return SmsService.sendCode(mobile, 'admin_mobile', requestIp)
  }

  static async updateMobile(
    user: AdminUser,
    currentPassword: string,
    mobile: string,
    code: string
  ) {
    if (!(await user.verifyPassword(currentPassword))) throw new CurrentPasswordInvalidError()
    await this.assertMobileAvailable(user, mobile)
    if (!(await SmsService.verifyCode(mobile, 'admin_mobile', code))) {
      throw new InvalidMobileCodeError()
    }

    user.mobile = mobile
    try {
      await user.save()
    } catch (error) {
      if (this.isUniqueConstraintError(error)) throw new AdminMobileAlreadyBoundError()
      throw error
    }
  }

  private static async assertMobileAvailable(user: AdminUser, mobile: string) {
    if (user.mobile === mobile) throw new AdminMobileUnchangedError()
    const owner = await AdminUser.query().where('mobile', mobile).whereNot('id', user.id).first()
    if (owner) throw new AdminMobileAlreadyBoundError()
  }

  private static isUniqueConstraintError(error: unknown) {
    if (!error || typeof error !== 'object') return false
    const code = 'code' in error ? error.code : undefined
    return code === 'ER_DUP_ENTRY' || code === 'SQLITE_CONSTRAINT_UNIQUE'
  }
}
