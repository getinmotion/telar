import { useState } from 'react';
import { CategoryScore } from '@/components/maturity/types';
import { RecommendedAgents } from '@/types/dashboard';
import { UserProfileData } from '../types/wizardTypes';
import { WizardStepId, WizardHookReturn } from './types/wizardTypes';
import { 
  isStepValid as checkStepValidity
} from './utils/wizardStepUtils';
import { 
  calculateMaturityScores as computeScores,
  getRecommendedAgents as determineRecommendedAgents
} from './utils/scoreCalculation';

interface AIQuestion {
  question: string;
  context: string;
}

export type { WizardStepId } from './types/wizardTypes';

export const useMaturityWizard = (
  onComplete: (scores: CategoryScore, recommendedAgents: RecommendedAgents, profileData: UserProfileData, aiQuestions?: AIQuestion[]) => void,
  language: 'en' | 'es'
): WizardHookReturn => {
  // Start with cultural profile step
  const [currentStepId, setCurrentStepId] = useState<WizardStepId>('culturalProfile');
  const [analysisType, setAnalysisType] = useState<'quick' | 'deep' | null>(null);
  
  const [profileData, setProfileData] = useState<UserProfileData>({
    profileType: 'solo', // Default for cultural entrepreneurs
    industry: '',
    activities: [],
    experience: '',
    paymentMethods: [],
    brandIdentity: '',
    financialControl: '',
    teamStructure: '',
    taskOrganization: '',
    decisionMaking: '',
    analysisPreference: undefined,
    // Extended questions for deep analysis
    pricingMethod: '',
    internationalSales: '',
    formalizedBusiness: '',
    collaboration: '',
    economicSustainability: '',
    // Dynamic questions answers
    dynamicQuestionAnswers: {}
  });
  
  // Define step sequence - now includes dynamic questions
  const stepSequence: WizardStepId[] = [
    'culturalProfile',    
    'businessMaturity',   
    'managementStyle',    
    'bifurcation',        
    'extendedQuestions',  
    'dynamicQuestions',   
    'results'             
  ];
  
  const currentStepIndex = stepSequence.indexOf(currentStepId);
  const totalSteps = analysisType === 'deep' ? 7 : 6;
  const currentStepNumber = currentStepIndex + 1;
  
  // Check if current step is valid
  const isCurrentStepValid = () => {
    if (currentStepId === 'bifurcation') {
      return analysisType !== null;
    }
    if (currentStepId === 'dynamicQuestions') {
      // Dynamic questions step is always considered valid since it can be skipped
      return true;
    }
    return checkStepValidity(currentStepId, profileData);
  };
  
  // Update profile data
  const updateProfileData = (data: Partial<UserProfileData>) => {
    console.log('Updating profile data:', data);
    setProfileData(prev => ({ ...prev, ...data }));
  };
  
  // Handle navigation
  const handleNext = () => {
    console.log('Current step:', currentStepId, 'Analysis type:', analysisType);
    
    if (currentStepId === 'bifurcation') {
      if (analysisType === 'quick') {
        setCurrentStepId('dynamicQuestions'); // Go to dynamic questions for quick path
      } else if (analysisType === 'deep') {
        setCurrentStepId('extendedQuestions');
      }
      updateProfileData({ analysisPreference: analysisType });
      return;
    }
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < stepSequence.length) {
      const nextStep = stepSequence[nextIndex];
      
      // Skip extended questions for quick analysis
      if (nextStep === 'extendedQuestions' && analysisType === 'quick') {
        setCurrentStepId('dynamicQuestions');
      } else {
        setCurrentStepId(nextStep);
      }
    }
  };
  
  const handlePrevious = () => {
    if (currentStepId === 'dynamicQuestions') {
      if (analysisType === 'deep') {
        setCurrentStepId('extendedQuestions');
      } else {
        setCurrentStepId('bifurcation');
      }
      return;
    }
    
    if (currentStepId === 'extendedQuestions') {
      setCurrentStepId('bifurcation');
      return;
    }
    
    if (currentStepId === 'results') {
      setCurrentStepId('dynamicQuestions');
      return;
    }
    
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStepId(stepSequence[prevIndex]);
    }
  };

  // Score calculation functions
  const calculateMaturityScores = (): CategoryScore => {
    return computeScores(profileData, language).scores;
  };
  
  const getRecommendedAgents = (scores: CategoryScore): RecommendedAgents => {
    return determineRecommendedAgents(profileData, scores);
  };
  
  // Handle completion - this function now properly handles the callback signature
  const handleCompleteWizard = (scores?: CategoryScore, recommendedAgents?: RecommendedAgents, aiQuestions?: AIQuestion[]) => {
    console.log('Completing wizard with profile data:', profileData);
    const finalScores = scores || calculateMaturityScores();
    const finalRecommendedAgents = recommendedAgents || getRecommendedAgents(finalScores);
    onComplete(finalScores, finalRecommendedAgents, profileData, aiQuestions);
  };

  // Handle analysis choice
  const handleAnalysisChoice = (type: 'quick' | 'deep') => {
    console.log('Analysis choice selected:', type);
    setAnalysisType(type);
    updateProfileData({ analysisPreference: type });
  };

  return {
    currentStepId,
    profileData,
    totalSteps,
    currentStepNumber,
    updateProfileData,
    handleNext,
    handlePrevious,
    calculateMaturityScores,
    getRecommendedAgents,
    handleCompleteWizard,
    isCurrentStepValid,
    showBifurcation: true,
    analysisType,
    handleAnalysisChoice
  };
};
