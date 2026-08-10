import { request } from '@umijs/max';
import { getCurrentAdmin, updateCurrentAdmin } from '@/services/adminAuth';
import type { AdminAuthUser } from '@/types/admin';

export const queryCurrent = async () => ({ data: await getCurrentAdmin() });

export const updateCurrent = updateCurrentAdmin;

export const changeCurrentPassword = (data: {
  currentPassword: string;
  newPassword: string;
}) =>
  request<{ message: string }>('/api/v1/admin/auth/security/password', {
    method: 'PATCH',
    data,
    skipErrorHandler: true,
  });

export const sendSecurityMobileCode = (mobile: string) =>
  request<{ message: string; expiresInSeconds: number }>(
    '/api/v1/admin/auth/security/mobile/code',
    {
      method: 'POST',
      data: { mobile },
      skipErrorHandler: true,
    },
  );

export const updateSecurityMobile = (data: {
  currentPassword: string;
  mobile: string;
  code: string;
}) =>
  request<AdminAuthUser>('/api/v1/admin/auth/security/mobile', {
    method: 'PUT',
    data,
    skipErrorHandler: true,
  });

export const getRequestErrorCode = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return undefined;
  }
  const response = error.response;
  if (!response || typeof response !== 'object' || !('data' in response)) {
    return undefined;
  }
  const data = response.data;
  if (!data || typeof data !== 'object' || !('code' in data)) return undefined;
  return typeof data.code === 'string' ? data.code : undefined;
};
