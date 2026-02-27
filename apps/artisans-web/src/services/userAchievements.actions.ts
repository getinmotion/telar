/**
 * User Achievements Service
 * Servicio para gestión de logros de usuarios en el backend NestJS
 */

import { telarApi } from '@/integrations/api/telarApi';
import {
  GetUserAchievementsResponse,
  CreateUserAchievementResponse,
  UpdateUserAchievementResponse,
  UserAchievement,
  CreateUserAchievementPayload,
  UpdateUserAchievementPayload
} from '@/types/userAchievement.types';

/**
 * Obtener todos los logros del usuario autenticado
 * @returns Array de logros con relación a user
 * @throws Error si la petición falla
 * 
 * Endpoint: GET /user-achievements
 */
export const getUserAchievements = async (): Promise<UserAchievement[]> => {
  try {
    const response = await telarApi.get<GetUserAchievementsResponse>(
      '/user-achievements'
    );

    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Crear un nuevo logro para el usuario
 * @param payload - Datos del logro a crear
 * @returns El logro creado
 * @throws Error si la petición falla
 * 
 * Endpoint: POST /user-achievements
 */
export const createUserAchievement = async (
  payload: CreateUserAchievementPayload
): Promise<UserAchievement> => {
  try {
    const response = await telarApi.post<CreateUserAchievementResponse>(
      '/user-achievements',
      payload
    );

    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Actualizar un logro existente
 * @param achievementId - ID del logro
 * @param payload - Datos a actualizar
 * @returns El logro actualizado
 * @throws Error si la petición falla
 * 
 * Endpoint: PATCH /user-achievements/{id}
 */
export const updateUserAchievement = async (
  achievementId: string,
  payload: UpdateUserAchievementPayload
): Promise<UserAchievement> => {
  try {
    const response = await telarApi.patch<UpdateUserAchievementResponse>(
      `/user-achievements/${achievementId}`,
      payload
    );

    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};
