import { Exception } from '@adonisjs/core/exceptions'

export default class UploadException extends Exception {
  constructor(message: string, code: string, status = 422) {
    super(message, { code, status })
  }
}
