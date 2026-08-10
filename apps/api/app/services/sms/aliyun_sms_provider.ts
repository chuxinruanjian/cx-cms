import env from '#start/env'
import { SendSmsRequest } from '@alicloud/dysmsapi20170525'
import { Config } from '@alicloud/openapi-client'
import { RuntimeOptions } from '@alicloud/tea-util'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { default: AliyunSmsClient } = require('@alicloud/dysmsapi20170525') as {
  default: typeof import('@alicloud/dysmsapi20170525').default
}

export type SmsSendResult = {
  bizId?: string
  providerCode: string
  providerMessage?: string
  requestId?: string
}

export class AliyunSmsError extends Error {
  constructor(
    message: string,
    readonly result?: SmsSendResult
  ) {
    super(message)
    this.name = 'AliyunSmsError'
  }
}

export default class AliyunSmsProvider {
  static async sendVerificationCode(mobile: string, code: string): Promise<SmsSendResult> {
    const accessKeyId = env.get('ALIYUN_ACCESS_KEY_ID')
    const accessKeySecret = env.get('ALIYUN_ACCESS_KEY_SECRET')
    const signName = env.get('ALIYUN_SMS_SIGN_NAME')
    const templateCode = env.get('ALIYUN_SMS_LOGIN_TEMPLATE_CODE')

    if (!accessKeyId || !accessKeySecret || !signName || !templateCode) {
      throw new AliyunSmsError('Aliyun SMS is not configured')
    }

    const config = new Config({ accessKeyId, accessKeySecret })
    config.endpoint = env.get('ALIYUN_SMS_ENDPOINT', 'dysmsapi.aliyuncs.com')
    const client = new AliyunSmsClient(config)
    const response = await client.sendSmsWithOptions(
      new SendSmsRequest({
        phoneNumbers: mobile,
        signName,
        templateCode,
        templateParam: JSON.stringify({ code }),
      }),
      new RuntimeOptions({})
    )
    const result: SmsSendResult = {
      bizId: response.body?.bizId,
      providerCode: response.body?.code || 'UNKNOWN',
      providerMessage: response.body?.message,
      requestId: response.body?.requestId,
    }

    if (result.providerCode !== 'OK') {
      throw new AliyunSmsError(result.providerMessage || 'Aliyun SMS rejected the request', result)
    }

    return result
  }
}
