/**
 * Tipos para Master Coordinator Service
 */

export interface MaturityScores {
  ideaValidation: number;
  userExperience: number;
  marketFit: number;
  monetization: number;
}

export interface TaskData {
  title: string;
  description: string;
  agentId?: string;
  agent_id?: string;
  status?: string;
  relevance?: string;
  priority?: number;
  estimatedTime?: string;
  category?: string;
  steps?: TaskStep[];
}

export interface TaskStep {
  title: string;
  description: string;
  deliverable: string;
  step_number?: number;
  input_type?: string;
  validation_criteria?: string;
  ai_context_prompt?: string;
}

export interface UserProfileData {
  fullName?: string;
  brandName?: string;
  businessDescription?: string;
  businessType?: string;
  targetMarket?: string;
  currentStage?: string;
  businessLocation?: string;
  teamSize?: string;
  timeAvailability?: string;
  salesChannels?: string[];
  monthlyRevenueGoal?: number;
  yearsInBusiness?: number;
  initialInvestmentRange?: string;
  primarySkills?: string[];
  currentChallenges?: string[];
  businessGoals?: string[];
  socialMediaPresence?: Record<string, unknown>;
  collectedAnswers?: CollectedAnswer[];
}

export interface CollectedAnswer {
  question: string;
  answer: string;
}

export interface TaskSuggestion {
  id: string;
  title: string;
  description: string;
  reason: string;
  impact: 'high' | 'medium' | 'low';
  agentId: string;
  priority: number;
  unlockReason?: string;
}

export interface AITaskSuggestion {
  title: string;
  description: string;
  reason: string;
  impact: 'high' | 'medium' | 'low';
  agentId: string;
  priority: number;
}

export interface StepInputData {
  title: string;
  userInput: unknown;
}

export interface BrandAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: BrandRecommendation[];
  next_steps: string[];
}

export interface BrandRecommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: string;
}

export interface IntelligentQuestion {
  question: string;
  context: string;
  category: 'pricing' | 'marketing' | 'operations' | 'strategy' | 'product';
}
