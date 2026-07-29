import AdminRbacService from '#services/admin_rbac_service'
import type AdminUser from '#models/admin_user'

export default class AdminAuthService {
  static async serializeUser(user: AdminUser) {
    const authorization = await AdminRbacService.getAuthorization(user)

    return {
      id: user.id,
      username: user.username,
      name: user.fullName || user.username,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      status: Boolean(user.status),
      isSuperAdmin: Boolean(user.isSuperAdmin),
      roles: authorization.roles,
      permissions: user.isSuperAdmin ? ['*'] : authorization.permissions,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
