export const systemConfigTypes = ['public', 'internal'] as const
export type SystemConfigType = (typeof systemConfigTypes)[number]

export interface CreateSystemConfigInput {
  configKey: string
  name: string
  type: SystemConfigType
  value: string
  description?: string | null
}

export interface UpdateSystemConfigInput {
  configKey?: string
  type?: SystemConfigType
  name?: string
  value?: string | null
  description?: string | null
}
