/**
 * TypeScript interfaces for User Progress (NestJS Backend)
 */

// ============= Main Entity =============

export interface UserProgress {
  id: string;
  userId: string;
  level: number;
  experiencePoints: number;
  nextLevelXp: number;
  completedMissions: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  totalTimeSpent: number;
  createdAt: string;
  updatedAt: string;
}

// ============= Request Payloads =============

export interface CreateUserProgressPayload {
  userId: string;
  level?: number;
  experiencePoints?: number;
  nextLevelXp?: number;
  completedMissions?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastActivityDate?: string;
  totalTimeSpent?: number;
}

export interface UpdateUserProgressPayload {
  level?: number;
  experiencePoints?: number;
  nextLevelXp?: number;
  completedMissions?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastActivityDate?: string;
  totalTimeSpent?: number;
}

// ============= Update Progress (Auto-calculate) Request =============

export interface UpdateUserProgressRequest {
  xpGained?: number;
  missionCompleted?: boolean;
  timeSpent?: number;
}

export interface UnlockedAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface UpdateUserProgressData {
  level: number;
  experiencePoints: number;
  nextLevelXP: number;
  leveledUp: boolean;
  levelsGained: number[];
  completedMissions: number;
  currentStreak: number;
  longestStreak: number;
  unlockedAchievements: UnlockedAchievement[];
}

export interface UpdateUserProgressSuccessResponse {
  success: boolean;
  data: UpdateUserProgressData;
}

// ============= Response Types =============

export interface GetUserProgressSuccessResponse {
  data: UserProgress;
  message: string;
}

export interface UserProgressErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: {
    response: {
      message: string | string[];
      error: string;
      statusCode: number;
    };
    status: number;
    options: Record<string, any>;
    message: string;
    name: string;
  };
}
