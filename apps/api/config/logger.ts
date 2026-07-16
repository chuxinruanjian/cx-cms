import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, targets } from '@adonisjs/core/logger'

const logFile = app.makePath(env.get('LOG_FILE', '../../storage/logs/app.log'))

const loggerConfig = defineConfig({
  default: 'app',

  loggers: {
    app: {
      enabled: true,
      name: env.get('APP_NAME'),
      level: env.get('LOG_LEVEL'),
      transport: {
        targets: [
          targets.file({ destination: logFile, mkdir: true, append: true }),
          ...(app.inDev ? [targets.pretty({ colorize: true, translateTime: 'SYS:standard' })] : []),
        ],
      },
    },
  },
})

export default loggerConfig

declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
