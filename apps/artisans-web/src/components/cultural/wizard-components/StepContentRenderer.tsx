import React from 'react';
import { motion } from 'framer-motion';
import { UserProfileData } from '../types/wizardTypes';
import { WizardStepId } from '../hooks/useMaturityWizard';
import { CategoryScore } from '@/components/maturity/types';
import { RecommendedAgents } from '@/types/dashboard';
import { StepRouter } from './StepRouter';

// Animation variants for page transitions
export const pageVariants = {
  initial: {
    opacity: 0,
    x: 30,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    x: -30,
    scale: 0.98,
    transition: {
      duration: 0.2
    }
  }
};

interface AIQuestion {
  question: string;
  context: string;
}

interface StepContentRendererProps {
  currentStepId: WizardStepId;
  profileData: UserProfileData;
  updateProfileData: (data: Partial<UserProfileData>) => void;
  language: 'en' | 'es';
  calculateMaturityScores: () => CategoryScore;
  getRecommendedAgents: (scores: CategoryScore) => RecommendedAgents;
  onComplete: (scores?: CategoryScore, recommendedAgents?: RecommendedAgents, aiQuestions?: AIQuestion[]) => void;
  currentStepNumber: number;
  totalSteps: number;
  handleNext: () => void;
  handlePrevious: () => void;
  isCurrentStepValid: () => boolean;
  analysisType?: 'quick' | 'deep' | null;
  handleAnalysisChoice?: (type: 'quick' | 'deep') => void;
}

export const StepContentRenderer: React.FC<StepContentRendererProps> = (props) => {
  return <StepRouter {...props} />;
};
