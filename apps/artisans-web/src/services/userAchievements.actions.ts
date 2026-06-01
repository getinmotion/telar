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

export const getUserAchievements = async (): Promise<UserAchievement[]> => {
  const response = await telarApi.get<GetUserAchievementsResponse>('/user-achievements');
  return response.data.data;
};

export const createUserAchievement = async (
  payload: CreateUserAchievementPayload
): Promise<UserAchievement> => {
  const response = await telarApi.post<CreateUserAchievementResponse>(
    '/user-achievements',
    payload
  );
  return response.data.data;
};

export const updateUserAchievement = async (
  achievementId: string,
  payload: UpdateUserAchievementPayload
): Promise<UserAchievement> => {
  const response = await telarApi.patch<UpdateUserAchievementResponse>(
    `/user-achievements/${achievementId}`,
    payload
  );
  return response.data.data;
};

export const getUserAchievementsByUserId = async (
  userId: string
): Promise<UserAchievement[]> => {
  try {
    const response = await telarApi.get<UserAchievement[]>(
      `/user-achievements/user/${userId}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};
