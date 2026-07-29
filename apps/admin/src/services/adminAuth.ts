import { request } from '@umijs/max';
import type {
  AdminAuthUser,
  AdminLoginParams,
  AdminLoginResponse,
} from '@/types/admin';
import { clearAdminToken, saveAdminToken } from '@/utils/adminAuth';

export const loginAdmin = async (params: AdminLoginParams) => {
  const result = await request<AdminLoginResponse>(
    '/api/v1/admin/auth/login',
    {
      method: 'POST',
      data: {
        username: params.username,
        password: params.password,
        remember: params.autoLogin ?? false,
      },
      skipErrorHandler: true,
    },
  );

  saveAdminToken(result.token.value, params.autoLogin ?? false);
  return result;
};

export const getCurrentAdmin = (options?: { skipErrorHandler?: boolean }) =>
  request<AdminAuthUser>('/api/v1/admin/auth/me', {
    method: 'GET',
    ...options,
  });

export const logoutAdmin = async () => {
  try {
    await request('/api/v1/admin/auth/logout', {
      method: 'DELETE',
      skipErrorHandler: true,
    });
  } finally {
    clearAdminToken();
  }
};
