import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurrentAdmin, updateCurrentAdmin } from '@/services/adminAuth';
import { queryCurrent, updateCurrent } from './service';

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
});
