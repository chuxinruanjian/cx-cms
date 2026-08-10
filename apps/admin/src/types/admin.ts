export interface AdminAuthUser {
  id: number;
  username: string;
  name: string;
  fullName: string | null;
  email: string;
  mobile: string | null;
  profile: string | null;
  avatar: string | null;
  status: boolean;
  isSuperAdmin: boolean;
  roles: string[];
  permissions: string[];
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminLoginResponse {
  user: AdminAuthUser;
  token: {
    type: 'Bearer';
    value: string;
    expiresAt: string | null;
  };
}

export interface AdminLoginParams {
  username: string;
  password: string;
  autoLogin?: boolean;
}

export interface AdminSmsLoginParams {
  mobile: string;
  code: string;
  autoLogin?: boolean;
}

export interface AdminLoginFormValues {
  username?: string;
  password?: string;
  mobile?: string;
  code?: string;
  autoLogin?: boolean;
}
