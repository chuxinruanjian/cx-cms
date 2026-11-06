import UploadsController from '#controllers/uploads_controller'
import type { UploadActor } from '#types/upload'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserUploadsController extends UploadsController {
  protected actor(auth: HttpContext['auth']): UploadActor {
    return { type: 'user', id: auth.use('user').getUserOrFail().id }
  }
}
