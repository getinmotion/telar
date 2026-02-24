/**
 * User Achievement Types
 * Tipos para logros de usuarios
 */

// ============= Nested Types =============

export interface AchievementUser {
  id: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============= Main Types =============

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  createdAt: string;
  deletedAt: string | null;
  user?: AchievementUser;
}

// ============= Request Types =============

export interface CreateUserAchievementPayload {
  userId: string;
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface UpdateUserAchievementPayload {
  title?: string;
  description?: string;
  icon?: string;
  unlockedAt?: string;
}

// ============= Response Types =============

export interface GetUserAchievementsResponse {
  success: true;
  data: UserAchievement[];
}

export interface GetUserAchievementByIdResponse {
  success: true;
  data: UserAchievement;
}

export interface CreateUserAchievementResponse {
  success: true;
  data: UserAchievement;
}

export interface UpdateUserAchievementResponse {
  success: true;
  data: UserAchievement;
}

// ============= Error Types =============

export interface UserAchievementErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

// ============= Union Types =============

export type UserAchievementResponse = 
  | GetUserAchievementsResponse 
  | GetUserAchievementByIdResponse
  | CreateUserAchievementResponse
  | UpdateUserAchievementResponse
  | UserAchievementErrorResponse;
