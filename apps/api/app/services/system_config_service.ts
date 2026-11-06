import SystemConfig from '#models/system_config'
import type {
  CreateSystemConfigInput,
  UpdateSystemConfigInput,
  SystemConfigType,
} from '#types/system_config'
import encryption from '@adonisjs/core/services/encryption'
import { Exception } from '@adonisjs/core/exceptions'

export default class SystemConfigService {
  static async list(input: {
    type: SystemConfigType
    keyword?: string
    page?: number
    perPage?: number
  }) {
    const query = SystemConfig.query().where('type', input.type)
    if (input.keyword) {
      query.where((builder) => {
        builder
          .whereLike('name', `%${input.keyword}%`)
          .orWhereLike('config_key', `%${input.keyword}%`)
      })
    }
    const rows = await query.orderBy('id', 'desc').paginate(input.page || 1, input.perPage || 20)
    return { data: rows.all().map((row) => this.serialize(row)), meta: rows.getMeta() }
  }

  static async create(input: CreateSystemConfigInput) {
    try {
      const row = await SystemConfig.create({
        ...input,
        value: this.encode(input.type, input.configKey, input.value),
      })
      return this.serialize(row)
    } catch (error) {
      const code = (error as { code?: string }).code
      if (code === 'SQLITE_CONSTRAINT_UNIQUE' || code === 'ER_DUP_ENTRY') {
        throw new Exception('Configuration key already exists', {
          code: 'E_SYSTEM_CONFIG_KEY_EXISTS',
          status: 422,
        })
      }
      throw error
    }
  }

  static async update(id: number, input: UpdateSystemConfigInput) {
    const row = await SystemConfig.findOrFail(id)
    if (
      (input.type !== undefined && input.type !== row.type) ||
      (input.configKey !== undefined && input.configKey !== row.configKey)
    ) {
      throw new Exception('Configuration key and type cannot be changed', {
        code: 'E_SYSTEM_CONFIG_IMMUTABLE',
        status: 422,
      })
    }
    if (input.name !== undefined) row.name = input.name
    if (input.description !== undefined) row.description = input.description
    // Blank form fields are normalized to null: keep the existing value.
    if (input.value !== undefined && input.value !== null) {
      row.value = this.encode(row.type as SystemConfigType, row.configKey, input.value)
    }
    await row.save()
    return this.serialize(row)
  }

  static async delete(id: number) {
    const row = await SystemConfig.findOrFail(id)
    await row.delete()
  }

  static async publicValues() {
    const rows = await SystemConfig.query()
      .where('type', 'public')
      .select('config_key', 'value')
      .orderBy('id', 'asc')
    return Object.fromEntries(rows.map((row) => [row.configKey, row.value]))
  }

  /** Server-side only. Never return this result from a browser-facing controller. */
  static async get(configKey: string): Promise<string | null> {
    const row = await SystemConfig.findBy('configKey', configKey)
    if (!row) return null
    if (row.type === 'public') return row.value
    const value = encryption.decrypt<string>(row.value, `system-config:${row.configKey}`)
    if (typeof value !== 'string') {
      throw new Exception('System configuration cannot be decrypted', {
        code: 'E_SYSTEM_CONFIG_DECRYPT_FAILED',
        status: 500,
      })
    }
    return value
  }

  private static encode(type: SystemConfigType, configKey: string, value: string) {
    return type === 'internal'
      ? encryption.encrypt(value, { purpose: `system-config:${configKey}` })
      : value
  }

  private static serialize(row: SystemConfig) {
    return {
      id: row.id,
      configKey: row.configKey,
      name: row.name,
      type: row.type as SystemConfigType,
      value: row.type === 'public' ? row.value : null,
      hasValue: row.value.length > 0,
      description: row.description,
      createdAt: row.createdAt.toISO(),
      updatedAt: row.updatedAt?.toISO() ?? null,
    }
  }
}
