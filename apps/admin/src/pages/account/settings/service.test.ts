import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurrentAdmin, updateCurrentAdmin } from '@/services/adminAuth';
import {
  changeCurrentPassword,
  getRequestErrorCode,
  queryCurrent,
  sendSecurityMobileCode,
  updateCurrent,
  updateSecurityMobile,
} from './service';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock('@umijs/max', () => ({ request: mocks.request }));

vi.mock('@/services/adminAuth', () => ({
  getCurrentAdmin: vi.fn(),
  updateCurrentAdmin: vi.fn(),
}));

const user = {
  avatar: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  email: 'admin@example.com',
  fullName: 'Admin User',
  id: 1,
  isSuperAdmin: true,
  lastLoginAt: null,
  mobile: null,
  name: 'Admin User',
  permissions: ['*'],
  profile: null,
  roles: [],
  status: true,
  updatedAt: null,
  username: 'admin',
};

describe('account settings service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentAdmin).mockResolvedValue(user);
    vi.mocked(updateCurrentAdmin).mockResolvedValue(user);
  });

  it('loads the authenticated administrator', async () => {
    await expect(queryCurrent()).resolves.toEqual({ data: user });
    expect(getCurrentAdmin).toHaveBeenCalledOnce();
  });

  it('updates the authenticated administrator', async () => {
    const payload = {
      email: 'new@example.com',
      fullName: 'New Name',
      profile: 'Updated profile',
    };

    await expect(updateCurrent(payload)).resolves.toEqual(user);
    expect(updateCurrentAdmin).toHaveBeenCalledWith(payload);
  });

  it('uses the authenticated security endpoints', async () => {
    mocks.request.mockResolvedValueOnce({ message: 'Password updated' });
    await changeCurrentPassword({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword456!',
    });
    expect(mocks.request).toHaveBeenLastCalledWith(
      '/api/v1/admin/auth/security/password',
      expect.objectContaining({ method: 'PATCH', skipErrorHandler: true }),
    );

    mocks.request.mockResolvedValueOnce({ expiresInSeconds: 300 });
    await sendSecurityMobileCode('13800138000');
    expect(mocks.request).toHaveBeenLastCalledWith(
      '/api/v1/admin/auth/security/mobile/code',
      expect.objectContaining({
        method: 'POST',
        data: { mobile: '13800138000' },
      }),
    );

    mocks.request.mockResolvedValueOnce({ ...user, mobile: '13800138000' });
    await updateSecurityMobile({
      currentPassword: 'OldPassword123!',
      mobile: '13800138000',
      code: '123456',
    });
    expect(mocks.request).toHaveBeenLastCalledWith(
      '/api/v1/admin/auth/security/mobile',
      expect.objectContaining({ method: 'PUT', skipErrorHandler: true }),
    );
  });

  it('extracts structured API error codes safely', () => {
    expect(
      getRequestErrorCode({
        response: { data: { code: 'E_INVALID_SMS_CODE' } },
      }),
    ).toBe('E_INVALID_SMS_CODE');
    expect(getRequestErrorCode(new Error('network'))).toBeUndefined();
  });
});
