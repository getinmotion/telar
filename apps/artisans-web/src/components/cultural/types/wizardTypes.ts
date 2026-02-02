
import { CraftType } from '@/types/artisan';

export type ProfileType = 'idea' | 'solo' | 'team';

export interface UserProfileData {
  profileType?: ProfileType;
  
  // Cultural profile questions
  industry?: string;
  activities?: string[];
  experience?: string;
  craftType?: CraftType; // Auto-detected craft type
  
  // Business maturity questions
  paymentMethods?: string[];
  brandIdentity?: string;
  financialControl?: string;
  
  // Management style questions
  teamStructure?: string;
  taskOrganization?: string;
  decisionMaking?: string;
  
  // Analysis preference
  analysisPreference?: 'quick' | 'deep';
  
  // Extended questions for deep analysis
  internationalSales?: string;
  formalizedBusiness?: string;
  collaboration?: string;
  economicSustainability?: string;
  
  // Dynamic questions answers
  dynamicQuestionAnswers?: Record<string, string>;
  
  // Conversational agent specific fields (12 optimized questions)
  businessDescription?: string;
  experienceTime?: 'less_than_1' | '1_to_3' | '3_to_5' | 'more_than_5';
  workStructure?: 'solo' | 'occasional_help' | 'partner' | 'small_team';
  salesStatus?: 'not_yet' | 'first_sales' | 'occasional' | 'regular' | 'consistent';
  pricingMethod?: string;
  profitClarity?: number;
  targetCustomer?: 'individuals' | 'businesses' | 'both' | 'unsure';
  customerKnowledge?: number;
  promotionChannels?: string[];
  biggestChallenge?: string;
  growthGoal?: 'validate_idea' | 'get_consistent' | 'increase_volume' | 'scale_business' | 'expand_market' | 'improve_profitability';
  businessLocation?: 'local_physical' | 'local_delivery' | 'national_online' | 'international' | 'mixed' | 'not_selling_yet';
  
  // Legacy fields (kept for compatibility)
  targetAudience?: string;
  customerClarity?: number;
  hasSold?: boolean;
  salesConsistency?: string;
  delegationComfort?: number;
  marketingConfidence?: number;
  mainObstacles?: string[];
  urgencyLevel?: number;
  businessGoals?: string[];
  supportPreference?: string;
  
  // Additional BusinessProfileCapture fields
  brandName?: string;
  monthlyRevenueGoal?: number;
  yearsInBusiness?: number;
  teamSize?: string;
  timeAvailability?: string;
  currentChallenges?: string[];
  salesChannels?: string[];
  primarySkills?: string[];
  businessType?: string;
  uniqueValue?: string;
  competition?: string;
  currentSales?: string;
  pricing?: string;

  // AI extraction fields (from business_description)
  aiExtracted?: boolean;
  extractionConfidence?: number;
}

export interface WizardStepProps {
  profileData: UserProfileData;
  updateProfileData: (data: Partial<UserProfileData>) => void;
  language: 'en' | 'es';
  currentStepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious?: () => void;
  isStepValid: boolean;
}
