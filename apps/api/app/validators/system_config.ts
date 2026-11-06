import { systemConfigTypes } from '#types/system_config'
import vine from '@vinejs/vine'

const configKey = () =>
  vine
    .string()
    .trim()
    .minLength(2)
    .maxLength(128)
    .regex(/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/)
const value = () => vine.string().minLength(1).maxLength(8000)

export const listSystemConfigsValidator = vine.create({
  type: vine.enum(systemConfigTypes),
  keyword: vine.string().trim().maxLength(100).optional(),
  page: vine.number().withoutDecimals().positive().optional(),
  perPage: vine.number().withoutDecimals().range([1, 100]).optional(),
})

export const createSystemConfigValidator = vine.create({
  configKey: configKey().unique({ table: 'system_configs', column: 'config_key' }),
  name: vine.string().trim().minLength(1).maxLength(100),
  type: vine.enum(systemConfigTypes),
  value: value(),
  description: vine.string().trim().maxLength(255).nullable().optional(),
})

export const updateSystemConfigValidator = vine.create({
  configKey: configKey().optional(),
  type: vine.enum(systemConfigTypes).optional(),
  name: vine.string().trim().minLength(1).maxLength(100).optional(),
  value: value().nullable().optional(),
  description: vine.string().trim().maxLength(255).nullable().optional(),
})
