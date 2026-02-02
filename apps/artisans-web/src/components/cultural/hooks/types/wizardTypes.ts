
export type WizardStepId = 
  | 'culturalProfile'
  | 'businessMaturity' 
  | 'managementStyle'
  | 'bifurcation'
  | 'extendedQuestions'
  | 'dynamicQuestions'
  | 'results';

export interface WizardHookReturn {
  currentStepId: WizardStepId;
  profileData: any;
  totalSteps: number;
  currentStepNumber: number;
  updateProfileData: (data: any) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  calculateMaturityScores: () => any;
  getRecommendedAgents: (scores: any) => any;
  handleCompleteWizard: (scores?: any, recommendedAgents?: any, aiQuestions?: any) => void;
  isCurrentStepValid: () => boolean;
  showBifurcation?: boolean;
  analysisType?: 'quick' | 'deep' | null;
  handleAnalysisChoice?: (type: 'quick' | 'deep') => void;
}
