import env from '#start/env'
import app from '@adonisjs/core/services/app'

const uploadRoot = app.makePath(env.get('UPLOAD_DIR', '../../storage/uploads'))

export default {
  uploads: {
    root: uploadRoot,
    images: app.makePath(uploadRoot, 'images'),
    videos: app.makePath(uploadRoot, 'videos'),
    files: app.makePath(uploadRoot, 'files'),
  },
  certificates: {
    payment: app.makePath(env.get('PAYMENT_CERT_DIR', '../../storage/certificates/payment')),
  },
}
