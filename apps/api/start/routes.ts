/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const serveSpa = (entryFile: string, missingMessage: string) => {
  return ({ response }: HttpContext) => {
    response.download(app.publicPath(entryFile), true, () => [missingMessage, 404])
  }
}

router.get('/', () => {
  return { hello: 'world' }
})

router.get('/admin/*', serveSpa('admin/index.html', 'Admin application is not built'))
router.get('/h5/*', serveSpa('h5/index.html', 'H5 application is not built'))

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
