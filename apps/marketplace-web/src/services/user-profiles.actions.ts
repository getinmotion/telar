/**
 * User Profiles Service
 * Servicio para gestión de perfiles de usuario con el backend NestJS
 */

import { telarApi } from '@/integrations/api/telarApi';
import type {
  UserProfile,
  UpdateUserProfileRequest,
  UserProfileResponse,
} from '@/types/user-profiles.types';

/**
 * Obtener perfil de un usuario por ID del perfil
 *
 * @param {string} profileId - ID del perfil (UUID)
 * @returns {Promise<UserProfile>} Perfil del usuario
 *
 * @endpoint GET /user-profiles/:id
 *
 * @example
 * const profile = await getUserProfile(profileId);
 */
export const getUserProfile = async (profileId: string): Promise<UserProfile> => {
  try {
    const response = await telarApi.get<UserProfile>(`/user-profiles/${profileId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Obtener perfil de un usuario por ID del usuario
 *
 * Obtiene el perfil usando el user_id en lugar del profile_id.
 * Útil cuando solo tienes el ID del usuario autenticado.
 *
 * @param {string} userId - ID del usuario (UUID)
 * @returns {Promise<UserProfile>} Perfil del usuario
 *
 * @endpoint GET /user-profiles/by-user/:userId
 *
 * @example
 * const profile = await getUserProfileByUserId(user.id);
 */
export const getUserProfileByUserId = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await telarApi.get<UserProfile>(`/user-profiles/by-user/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Actualizar perfil de usuario
 *
 * @param {string} userId - ID del usuario (UUID)
 * @param {UpdateUserProfileRequest} data - Datos a actualizar
 * @returns {Promise<UserProfileResponse>} Perfil actualizado
 *
 * @endpoint PATCH /user-profiles/:id
 *
 * @example
 * const updated = await updateUserProfile(user.id, {
 *   fullName: "Juan Pérez"
 * });
 */
export const updateUserProfile = async (
  userId: string,
  data: UpdateUserProfileRequest
): Promise<UserProfileResponse> => {
  try {
    const response = await telarApi.patch<UserProfileResponse>(
      `/user-profiles/${userId}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
