import { SystemConfigSchema } from '#database/schema'
import { column } from '@adonisjs/lucid/orm'

export default class SystemConfig extends SystemConfigSchema {
  // Values must go through the service's visibility-aware serialization.
  @column({ serializeAs: null })
  declare value: string
}
