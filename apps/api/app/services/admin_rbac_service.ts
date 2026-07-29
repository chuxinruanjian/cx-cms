import type AdminUser from '#models/admin_user'

export interface AdminAuthorization {
  roles: string[]
  permissions: string[]
}

export interface AuthorizationRequirement {
  roles?: string[]
  permissions?: string[]
  requireAll?: boolean
}

export default class AdminRbacService {
  static async getAuthorization(user: AdminUser): Promise<AdminAuthorization> {
    const roles = await user
      .related('roles')
      .query()
      .where('admin_roles.status', true)
      .preload('permissions', (query) => query.where('admin_permissions.status', true))

    return {
      roles: roles.map((role) => role.code),
      permissions: [
        ...new Set(roles.flatMap((role) => role.permissions.map((permission) => permission.code))),
      ],
    }
  }

  static async allows(user: AdminUser, requirement: AuthorizationRequirement): Promise<boolean> {
    if (user.isSuperAdmin) {
      return true
    }

    const authorization = await this.getAuthorization(user)
    return (
      this.matches(authorization.roles, requirement.roles, requirement.requireAll) &&
      this.matches(authorization.permissions, requirement.permissions, requirement.requireAll)
    )
  }

  private static matches(granted: string[], required?: string[], requireAll = false) {
    if (!required?.length) {
      return true
    }

    return requireAll
      ? required.every((code) => granted.includes(code))
      : required.some((code) => granted.includes(code))
  }
}
