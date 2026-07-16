import { configApp } from '@adonisjs/eslint-config'
export default configApp({
  name: 'Ignore generated frontend builds',
  ignores: ['public/admin/**', 'public/h5/**'],
})
