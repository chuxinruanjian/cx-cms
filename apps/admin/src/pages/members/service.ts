import { request } from '@umijs/max';

export interface Member {
  id: number;
  username: string;
  mobile: string | null;
  nickname: string | null;
  avatar: string | null;
  status: boolean;
  passwordLoginEnabled: boolean;
  canChangeUsername: boolean;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
}
export interface MemberFilters {
  keyword?: string;
  status?: boolean;
}
const api = '/api/v1/admin/members';
export const listMembers = (
  params: MemberFilters & { page: number; perPage: number },
) => request<{ data: Member[]; meta: { total: number } }>(api, { params });
export const getMember = (id: number) => request<Member>(`${api}/${id}`);
export const updateMember = (
  id: number,
  data: Partial<Pick<Member, 'nickname' | 'avatar' | 'status'>>,
) => request<Member>(`${api}/${id}`, { method: 'PATCH', data });
