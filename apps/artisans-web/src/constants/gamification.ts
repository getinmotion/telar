/**
 * Gamification System Constants
 * Define XP rewards for different actions across the platform
 */

export const XP_REWARDS = {
  // Wizards
  BRAND_WIZARD_COMPLETE: 150,
  PRODUCT_UPLOAD: 50,
  FIRST_PRODUCT: 100, // Bonus por el primer producto
  
  // Tareas
  TASK_COMPLETE_EASY: 30,
  TASK_COMPLETE_MEDIUM: 50,
  TASK_COMPLETE_HARD: 80,
  TASK_COMPLETE_PRIORITY: 120,
  
  // Misiones especiales
  MATURITY_TEST_COMPLETE: 200,
  RUT_ADDED: 50,
  SHOP_CREATED: 100,
  
  // Streaks
  DAILY_LOGIN: 10,
  STREAK_MILESTONE_7_DAYS: 100,
  STREAK_MILESTONE_30_DAYS: 500
} as const;

export type XPRewardKey = keyof typeof XP_REWARDS;

/**
 * Calculate XP based on task priority
 */
export const calculateTaskXP = (priority?: 'low' | 'medium' | 'high' | string): number => {
  const baseXP: Record<string, number> = {
    'low': XP_REWARDS.TASK_COMPLETE_EASY,
    'medium': XP_REWARDS.TASK_COMPLETE_MEDIUM,
    'high': XP_REWARDS.TASK_COMPLETE_HARD
  };
  
  const normalizedPriority = priority?.toLowerCase() || 'medium';
  return baseXP[normalizedPriority] || XP_REWARDS.TASK_COMPLETE_MEDIUM;
};
