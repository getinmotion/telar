import { telarApi } from '@/integrations/api/telarApi';

export type AppRole = 'admin' | 'user' | 'artisan' | 'moderator';

export interface UserRole {
  id: string;
  userId: string;
  role: AppRole;
  grantedAt: string;
  grantedBy: string | null;
  createdAt: string;
}

/**
 * Obtener todos los roles de un usuario
 * GET /user-roles/user/:userId
 */
export async function getUserRolesByUserId(userId: string): Promise<UserRole[]> {
  const response = await telarApi.get<UserRole[]>(`/user-roles/user/${userId}`);
  return response.data;
}

/**
 * Verificar si un usuario tiene un rol específico
 * GET /user-roles/user/:userId/has-role/:role
 */
export async function checkUserHasRole(
  userId: string,
  role: AppRole
): Promise<boolean> {
  const response = await telarApi.get<{ hasRole: boolean }>(
    `/user-roles/user/${userId}/has-role/${role}`
  );
  return response.data.hasRole;
}
