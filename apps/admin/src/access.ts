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
    canAdmin: Boolean(currentUser),
    canManageFiles:
      hasPermission('admin.attachments.upload') ||
      hasPermission('admin.attachments.view'),
    canUploadFiles: hasPermission('admin.attachments.upload'),
    canViewFiles: hasPermission('admin.attachments.view'),
    canCleanupFiles: hasPermission('admin.attachments.cleanup'),
    hasRole: (role: string) =>
      Boolean(currentUser?.isSuperAdmin || currentUser?.roles.includes(role)),
    hasPermission,
  };
}
