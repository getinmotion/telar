export interface UserBusinessProfile {
  // Basic info
  userId: string;
  fullName: string;
  businessModel: BusinessModel;
  
  // Business details
  businessStage: BusinessStage;
  currentChannels: SalesChannel[];
  desiredChannels: SalesChannel[];
  
  // Resources & capacity
  timeAvailability: TimeAvailability;
  financialResources: FinancialResources;
  teamSize: TeamSize;
  
  // Goals & priorities
  primaryGoals: BusinessGoal[];
  urgentNeeds: string[];
  monthlyRevenueGoal?: number;
  
  // Context from onboarding
  specificAnswers: Record<string, any>;
  skillsAndExpertise: string[];
  currentChallenges: string[];
  
  // Maturity indicators
  maturityLevel: number;
  lastAssessmentDate: string;
  
  // Language preference
  language: 'en' | 'es';
  
  // Enhanced fields from fused maturity calculator
  businessDescription?: string;
  brandName?: string;
  businessLocation?: string;
  yearsInBusiness?: number | null;
  socialMediaPresence?: Record<string, any>;
  initialInvestmentRange?: string;
}

export type BusinessModel = 
  | 'artisan' 
  | 'services' 
  | 'ecommerce' 
  | 'saas' 
  | 'consulting' 
  | 'retail' 
  | 'content' 
  | 'other';

export type BusinessStage = 
  | 'idea' 
  | 'mvp' 
  | 'early' 
  | 'growth' 
  | 'established';

export type SalesChannel = 
  | 'instagram' 
  | 'facebook' 
  | 'whatsapp' 
  | 'website' 
  | 'marketplace' 
  | 'physical_store' 
  | 'word_of_mouth' 
  | 'email' 
  | 'other';

export type TimeAvailability = 
  | 'part_time' 
  | 'full_time' 
  | 'weekends' 
  | 'flexible';

export type FinancialResources = 
  | 'minimal' 
  | 'moderate' 
  | 'substantial' 
  | 'unlimited';

export type TeamSize = 
  | 'solo' 
  | 'small' 
  | 'medium' 
  | 'large';

export type BusinessGoal = 
  | 'increase_revenue' 
  | 'scale_operations' 
  | 'automate_processes' 
  | 'expand_market' 
  | 'improve_efficiency' 
  | 'build_brand' 
  | 'reduce_costs';

export interface PersonalizedRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  estimatedTime: string;
  businessModelRelevance: BusinessModel[];
  stageRelevance: BusinessStage[];
  impact: string;
  agentId: string;
}