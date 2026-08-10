import { describe, expect, it } from 'vitest';
import type { AdminAuthUser } from '@/types/admin';
import access from './access';

const createUser = (overrides: Partial<AdminAuthUser> = {}): AdminAuthUser => ({
  id: 1,
  username: 'admin',
  name: 'Admin User',
  fullName: 'Admin User',
  email: 'admin@example.com',
  mobile: null,
  profile: null,
  avatar: null,
  status: true,
  isSuperAdmin: false,
  roles: [],
  permissions: [],
  lastLoginAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
  ...overrides,
});

describe('access', () => {
  it('allows an authenticated user into the admin application', () => {
    expect(access({ currentUser: createUser() }).canAdmin).toBe(true);
  });

  it('checks roles and permissions supplied by the API', () => {
    const result = access({
      currentUser: createUser({
        roles: ['content_editor'],
        permissions: ['admin.users.view'],
      }),
    });

    expect(result.hasRole('content_editor')).toBe(true);
    expect(result.hasPermission('admin.users.view')).toBe(true);
    expect(result.hasPermission('admin.roles.delete')).toBe(false);
  });

  it('lets a super administrator bypass role and permission checks', () => {
    const result = access({
      currentUser: createUser({ isSuperAdmin: true }),
    });

    expect(result.hasRole('any_role')).toBe(true);
    expect(result.hasPermission('any.permission')).toBe(true);
  });

  it('denies access when currentUser is missing', () => {
    const result = access(undefined);

    expect(result.canAdmin).toBe(false);
    expect(result.hasRole('content_editor')).toBe(false);
    expect(result.hasPermission('admin.users.view')).toBe(false);
  });
});
