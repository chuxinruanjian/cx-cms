import { request } from '@umijs/max';
import type {
  AdminAuthUser,
  AdminLoginParams,
  AdminLoginResponse,
} from '@/types/admin';
import {
  clearAdminToken,
  getAdminToken,
  saveAdminToken,
} from '@/utils/adminAuth';

const avatarObjectUrls = new Map<string, string>();

const resolvePrivateAvatar = async (user: AdminAuthUser) => {
  const source = user.avatar;
  if (!source?.startsWith('/api/v1/admin/attachments/')) return user;
  const cached = avatarObjectUrls.get(source);
  if (cached) return { ...user, avatar: cached };

  try {
    const token = getAdminToken();
    const response = await fetch(source, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) return { ...user, avatar: null };
    const objectUrl = URL.createObjectURL(await response.blob());
    avatarObjectUrls.set(source, objectUrl);
    return { ...user, avatar: objectUrl };
  } catch {
    return { ...user, avatar: null };
  }
};

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

export const getCurrentAdmin = async (options?: {
  skipErrorHandler?: boolean;
}) => {
  const user = await request<AdminAuthUser>('/api/v1/admin/auth/me', {
    method: 'GET',
    ...options,
  });
  return resolvePrivateAvatar(user);
};

export const updateCurrentAdmin = async (data: {
  fullName: string;
  email: string;
  profile?: string | null;
  avatarAttachmentId?: number | null;
}) => {
  await request<AdminAuthUser>('/api/v1/admin/auth/me', {
    method: 'PATCH',
    data,
  });
  return getCurrentAdmin();
};

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
