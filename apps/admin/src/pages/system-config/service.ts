import { request } from '@umijs/max';

export type ConfigType = 'public' | 'internal';

export interface SystemConfig {
  id: number;
  configKey: string;
  name: string;
  type: ConfigType;
  value: string | null;
  hasValue: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ConfigInput {
  configKey: string;
  name: string;
  value?: string;
  description?: string;
}

const api = '/api/v1/admin/system-configs';

export const listConfigs = (params: {
  type: ConfigType;
  keyword?: string;
  page: number;
  perPage: number;
}) =>
  request<{ data: SystemConfig[]; meta: { total: number } }>(api, { params });

export const createConfig = (data: ConfigInput & { type: ConfigType }) =>
  request<SystemConfig>(api, { method: 'POST', data });

export const updateConfig = (
  id: number,
  data: Omit<ConfigInput, 'configKey'>,
) => request<SystemConfig>(`${api}/${id}`, { method: 'PATCH', data });

export const deleteConfig = (id: number) =>
  request<void>(`${api}/${id}`, { method: 'DELETE' });
