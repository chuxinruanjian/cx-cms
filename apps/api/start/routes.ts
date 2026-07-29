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

const AccessTokensController = () => import('#controllers/access_tokens_controller')
const AdminUsersController = () => import('#controllers/admin_users_controller')
const AdminRolesController = () => import('#controllers/admin_roles_controller')
const AdminPermissionsController = () => import('#controllers/admin_permissions_controller')

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
    router.post('auth/login', [AccessTokensController, 'store']).as('auth.login')

    router
      .group(() => {
        router.get('auth/me', [AccessTokensController, 'show']).as('auth.me')
        router.delete('auth/logout', [AccessTokensController, 'destroy']).as('auth.logout')

        router
          .get('users', [AdminUsersController, 'index'])
          .use(middleware.adminRbac({ permissions: ['admin.users.view'] }))
        router
          .patch('users/:id', [AdminUsersController, 'update'])
          .use(middleware.adminRbac({ permissions: ['admin.users.update'] }))
        router
          .put('users/:id/roles', [AdminUsersController, 'syncRoles'])
          .use(middleware.adminRbac({ permissions: ['admin.users.roles'] }))

        router
          .get('roles', [AdminRolesController, 'index'])
          .use(middleware.adminRbac({ permissions: ['admin.roles.view'] }))
        router
          .post('roles', [AdminRolesController, 'store'])
          .use(middleware.adminRbac({ permissions: ['admin.roles.create'] }))
        router
          .patch('roles/:id', [AdminRolesController, 'update'])
          .use(middleware.adminRbac({ permissions: ['admin.roles.update'] }))
        router
          .delete('roles/:id', [AdminRolesController, 'destroy'])
          .use(middleware.adminRbac({ permissions: ['admin.roles.delete'] }))
        router
          .put('roles/:id/permissions', [AdminRolesController, 'syncPermissions'])
          .use(middleware.adminRbac({ permissions: ['admin.roles.permissions'] }))

        router
          .get('permissions', [AdminPermissionsController, 'index'])
          .use(middleware.adminRbac({ permissions: ['admin.permissions.view'] }))
        router
          .post('permissions', [AdminPermissionsController, 'store'])
          .use(middleware.adminRbac({ permissions: ['admin.permissions.create'] }))
        router
          .patch('permissions/:id', [AdminPermissionsController, 'update'])
          .use(middleware.adminRbac({ permissions: ['admin.permissions.update'] }))
        router
          .delete('permissions/:id', [AdminPermissionsController, 'destroy'])
          .use(middleware.adminRbac({ permissions: ['admin.permissions.delete'] }))
      })
      .use(middleware.auth())
  })
  .prefix('/api/v1/admin')
  .as('admin')
