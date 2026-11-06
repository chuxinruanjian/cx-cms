import type { AdminAuthUser } from '@/types/admin';

/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(
  initialState: { currentUser?: AdminAuthUser } | undefined,
) {
  const { currentUser } = initialState ?? {};
  const hasPermission = (permission: string) =>
    Boolean(
      currentUser?.isSuperAdmin ||
        currentUser?.permissions.includes('*') ||
        currentUser?.permissions.includes(permission),
    );

  return {
    canViewMembers: hasPermission('admin.members.view'),
    canUpdateMembers: hasPermission('admin.members.update'),
    canAdmin: Boolean(currentUser),
    canViewSystemConfig: hasPermission('admin.system_configs.view'),
    canCreateSystemConfig: hasPermission('admin.system_configs.create'),
    canUpdateSystemConfig: hasPermission('admin.system_configs.update'),
    canDeleteSystemConfig: hasPermission('admin.system_configs.delete'),
    canManageFiles: hasPermission('admin.uploads.create'),
    canUploadFiles: hasPermission('admin.uploads.create'),
    hasRole: (role: string) =>
      Boolean(currentUser?.isSuperAdmin || currentUser?.roles.includes(role)),
    hasPermission,
  };
}
