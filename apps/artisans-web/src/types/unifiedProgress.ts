/**
 * Unified Progress System Types
 * Defines the structure for the complete progress tracking system
 */

export interface MilestoneAction {
  id: string;
  label: string;
  completed: boolean;
  route?: string;
}

export interface Milestone {
  id: 'formalization' | 'brand' | 'shop' | 'sales' | 'community';
  label: string;
  progress: number; // 0-100%
  tasksCompleted: number;
  totalTasks: number;
  status: 'locked' | 'active' | 'completed';
  actions: MilestoneAction[];
  threshold: number; // Overall progress threshold to unlock
}

export interface MaturityScores {
  ideaValidation: number;
  userExperience: number;
  marketFit: number;
  monetization: number;
}

export interface GamificationData {
  level: number;
  xp: number;
  nextLevelXP: number;
}

export interface UnifiedProgress {
  totalProgress: number; // 0-100% overall completion
  milestones: {
    formalization: Milestone;
    brand: Milestone;
    shop: Milestone;
    sales: Milestone;
    community: Milestone;
  };
  maturityScores: MaturityScores;
  gamification: GamificationData;
}
