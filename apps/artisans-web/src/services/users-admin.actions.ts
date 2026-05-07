/**
 * users-admin.actions — super_admin-only client for users + user_roles.
 *
 * Backend contracts:
 *  GET    /users?search=&limit=&offset=  → { data: AdminUser[]; total; limit; offset }
 *  PATCH  /users/:id                     → { id, email, isSuperAdmin }
 *  POST   /user-roles                    → assigns AppRole to userId
 *  DELETE /user-roles/user/:userId/role/:role → removes that role
 */
import { telarApi } from '@/integrations/api/telarApi';

export type AppRole = 'admin' | 'user' | 'artisan' | 'moderator';

export const APP_ROLES: { value: AppRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'artisan', label: 'Artesano' },
  { value: 'user', label: 'Comprador' },
];

export interface AdminUser {
  id: string;
  email: string | null;
  role: string | null;
  isSuperAdmin: boolean | null;
  createdAt: string;
  roles: AppRole[];
}

export interface ListUsersResponse {
  data: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

export const listUsers = async (params: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ListUsersResponse> => {
  const res = await telarApi.get<ListUsersResponse>('/users', { params });
  return res.data;
};

export const setSuperAdmin = async (
  userId: string,
  isSuperAdmin: boolean,
): Promise<void> => {
  await telarApi.patch(`/users/${userId}`, { isSuperAdmin });
};

export const assignRole = async (
  userId: string,
  role: AppRole,
): Promise<void> => {
  await telarApi.post('/user-roles', { userId, role });
};

export const removeRole = async (
  userId: string,
  role: AppRole,
): Promise<void> => {
  await telarApi.delete(`/user-roles/user/${userId}/role/${role}`);
};
