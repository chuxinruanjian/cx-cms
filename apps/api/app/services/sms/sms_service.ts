import SmsCode from '#models/sms_code'
import AliyunSmsProvider, {
  AliyunSmsError,
  type SmsSendResult,
} from '#services/sms/aliyun_sms_provider'
import env from '#start/env'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import { randomInt } from 'node:crypto'
import { DateTime } from 'luxon'

export type SmsScene = 'admin_login' | 'admin_mobile'
export type SmsSender = (
  mobile: string,
  code: string,
  templateCode: string | undefined
) => Promise<SmsSendResult>

const TEMPLATE_ENV_KEYS = {
  admin_login: 'ALIYUN_SMS_LOGIN_TEMPLATE_CODE',
  admin_mobile: 'ALIYUN_SMS_SECURITY_MOBILE_TEMPLATE_CODE',
} as const

const CODE_TTL_MINUTES = 5
const RESEND_INTERVAL_SECONDS = 60
const IP_WINDOW_MINUTES = 10
const IP_WINDOW_LIMIT = 10
const MAX_VERIFY_ATTEMPTS = 5

export class SmsRateLimitError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super('SMS sending is rate limited')
    this.name = 'SmsRateLimitError'
  }
}

export default class SmsService {
  private static sender: SmsSender = (mobile, code, templateCode) =>
    AliyunSmsProvider.sendVerificationCode(mobile, code, templateCode)

  static setSender(sender?: SmsSender) {
    this.sender =
      sender ||
      ((mobile, code, templateCode) =>
        AliyunSmsProvider.sendVerificationCode(mobile, code, templateCode))
  }

  static async sendCode(mobile: string, scene: SmsScene, requestIp: string) {
    await this.assertSendAllowed(mobile, scene, requestIp)

    const code = String(randomInt(100000, 1000000))
    const templateCode = env.get(TEMPLATE_ENV_KEYS[scene])
    const smsCode = await SmsCode.create({
      mobile,
      scene,
      templateCode: templateCode || 'unconfigured',
      codeHash: await hash.make(code),
      expiresAt: DateTime.now().plus({ minutes: CODE_TTL_MINUTES }),
      usedAt: null,
      sendStatus: 'pending',
      attemptCount: 0,
      requestIp,
      providerResponse: null,
    })

    try {
      const result = await this.sender(mobile, code, templateCode)
      smsCode.sendStatus = 'sent'
      smsCode.providerResponse = JSON.stringify(result)
      await smsCode.save()
      return { expiresInSeconds: CODE_TTL_MINUTES * 60 }
    } catch (error) {
      smsCode.sendStatus = 'failed'
      smsCode.providerResponse = JSON.stringify(
        error instanceof AliyunSmsError && error.result
          ? error.result
          : { errorName: error instanceof Error ? error.name : 'UnknownError' }
      )
      await smsCode.save()
      throw error
    }
  }

  static async verifyCode(mobile: string, scene: SmsScene, code: string) {
    return db.transaction(async (trx) => {
      const smsCode = await SmsCode.query({ client: trx })
        .where('mobile', mobile)
        .where('scene', scene)
        .where('send_status', 'sent')
        .whereNull('used_at')
        .orderBy('id', 'desc')
        .forUpdate()
        .first()

      if (!smsCode || smsCode.expiresAt <= DateTime.now()) return false

      smsCode.useTransaction(trx)
      smsCode.attemptCount += 1
      const valid = await hash.verify(smsCode.codeHash, code)
      if (valid || smsCode.attemptCount >= MAX_VERIFY_ATTEMPTS) {
        smsCode.usedAt = DateTime.now()
      }
      await smsCode.save()
      return valid
    })
  }

  private static async assertSendAllowed(mobile: string, scene: SmsScene, requestIp: string) {
    const now = DateTime.now()
    const latest = await SmsCode.query()
      .where('mobile', mobile)
      .where('scene', scene)
      .whereIn('send_status', ['pending', 'sent'])
      .orderBy('id', 'desc')
      .first()

    if (latest) {
      const retryAt = latest.createdAt.plus({ seconds: RESEND_INTERVAL_SECONDS })
      if (retryAt > now) {
        throw new SmsRateLimitError(Math.max(1, Math.ceil(retryAt.diff(now, 'seconds').seconds)))
      }
    }

    const ipCount = await SmsCode.query()
      .where('request_ip', requestIp)
      .where('created_at', '>=', now.minus({ minutes: IP_WINDOW_MINUTES }).toSQL())
      .whereIn('send_status', ['pending', 'sent'])
      .count('* as total')
      .first()
    if (Number(ipCount?.$extras.total || 0) >= IP_WINDOW_LIMIT) {
      throw new SmsRateLimitError(IP_WINDOW_MINUTES * 60)
    }
  }
}
