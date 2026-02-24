import { useState, useCallback, useMemo } from 'react';
import { CategoryScore, ProfileType, RecommendedAgents } from '@/types/dashboard';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIQuestion {
  question: string;
  context: string;
}

export const useMaturityCalculatorLogic = (
  language: 'en' | 'es',
  onComplete: (scores: CategoryScore, recommendedAgents: RecommendedAgents, aiQuestions?: AIQuestion[]) => void
) => {
  const [currentStep, setCurrentStep] = useState<'profileType' | 'questions' | 'bifurcation' | 'extendedQuestions' | 'results'>('profileType');
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string[]>>({});
  const [extendedAnswers, setExtendedAnswers] = useState<Record<string, number | string[]>>({});
  const [analysisType, setAnalysisType] = useState<'quick' | 'deep' | null>(null);
  const [scores, setScores] = useState<CategoryScore | null>(null);
  const [recommendedAgents, setRecommendedAgents] = useState<RecommendedAgents | null>(null);
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { toast } = useToast();

  // Enhanced score calculation that includes extended answers and multi-select responses
  const calculateScores = useCallback((): CategoryScore => {
    const allAnswers = { ...answers, ...extendedAnswers };
    
    // Calculate total considering both single values and arrays
    let total = 0;
    let maxPossible = 0;
    
    Object.values(allAnswers).forEach(answer => {
      if (Array.isArray(answer)) {
        // For arrays, sum all values and count each selection
        total += answer.reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
        maxPossible += answer.length * 3; // Assuming max value is 3
      } else if (typeof answer === 'number') {
        total += answer;
        maxPossible += 3;
      }
    });
    
    const percentage = maxPossible > 0 ? (total / maxPossible) * 100 : 0;
    const baseScore = Math.min(100, Math.round(percentage));
    
    // Enhanced scoring with extended questions
    const extendedBonus = Object.keys(extendedAnswers).length > 0 ? 5 : 0;
    
    if (profileType === 'idea') {
      return {
        ideaValidation: Math.min(100, Math.round(baseScore * 0.9) + extendedBonus),
        userExperience: Math.min(100, Math.round(baseScore * 0.7) + extendedBonus),
        marketFit: Math.min(100, Math.round(baseScore * 0.8) + extendedBonus),
        monetization: Math.min(100, Math.round(baseScore * 0.6) + extendedBonus)
      };
    } else if (profileType === 'solo') {
      return {
        ideaValidation: Math.min(100, Math.round(baseScore * 0.8) + extendedBonus),
        userExperience: Math.min(100, Math.round(baseScore * 0.9) + extendedBonus),
        marketFit: Math.min(100, Math.round(baseScore * 0.85) + extendedBonus),
        monetization: Math.min(100, Math.round(baseScore * 0.8) + extendedBonus)
      };
    } else {
      return {
        ideaValidation: Math.min(100, Math.round(baseScore * 0.85) + extendedBonus),
        userExperience: Math.min(100, Math.round(baseScore * 0.8) + extendedBonus),
        marketFit: Math.min(100, Math.round(baseScore * 0.9) + extendedBonus),
        monetization: Math.min(100, Math.round(baseScore * 0.85) + extendedBonus)
      };
    }
  }, [answers, extendedAnswers, profileType]);

  const getRecommendations = useCallback((scores: CategoryScore): RecommendedAgents => {
    const scoresArray = [
      { category: 'idea-validator', score: scores.ideaValidation },
      { category: 'ux-designer', score: scores.userExperience },
      { category: 'market-analyst', score: scores.marketFit },
      { category: 'finance-advisor', score: scores.monetization }
    ];

    scoresArray.sort((a, b) => a.score - b.score);

    // Base recommendations
    const recommendations: RecommendedAgents = {
      primary: scoresArray.slice(0, 2).map(item => item.category),
      secondary: scoresArray.slice(2, 4).map(item => item.category)
    };

    // Add extended flag if extended analysis was completed
    if (Object.keys(extendedAnswers).length > 0) {
      recommendations.extended = {
        primary: recommendations.primary,
        secondary: recommendations.secondary
      };
    }

    return recommendations;
  }, [extendedAnswers]);

  const getAIQuestions = useCallback(async (scores: CategoryScore, profileData: any): Promise<AIQuestion[]> => {
    try {
      setIsLoadingAI(true);
      
      const { data, error } = await supabase.functions.invoke('maturity-analysis', {
        body: {
          scores,
          profileType,
          profileData,
          language
        }
      });

      if (error) {
        console.error('Error calling AI analysis:', error);
        return [];
      }

      return data?.questions || [];
    } catch (error) {
      console.error('Error getting AI questions:', error);
      return [];
    } finally {
      setIsLoadingAI(false);
    }
  }, [profileType, language]);

  // Optimized handlers
  const handleProfileSelect = useCallback((type: ProfileType) => {
    setProfileType(type);
  }, []);

  const handleSelectOption = useCallback((questionId: string, value: number | string[]) => {
    if (questionId.startsWith('extended_')) {
      setExtendedAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    }
  }, []);

  const handleAnalysisChoice = useCallback((type: 'quick' | 'deep') => {
    setAnalysisType(type);
  }, []);

  const handleComplete = useCallback(async () => {
    if (scores && recommendedAgents) {
      // Get AI questions before completing
      const profileData = { ...answers, ...extendedAnswers, profileType, analysisType };
      const aiQs = await getAIQuestions(scores, profileData);
      setAiQuestions(aiQs);
      
      onComplete(scores, recommendedAgents, aiQs);
    }
  }, [scores, recommendedAgents, answers, extendedAnswers, profileType, analysisType, getAIQuestions, onComplete]);

  return {
    currentStep,
    setCurrentStep,
    profileType,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    extendedAnswers,
    analysisType,
    setAnalysisType,
    scores,
    setScores,
    recommendedAgents,
    setRecommendedAgents,
    aiQuestions,
    isLoadingAI,
    toast,
    calculateScores,
    getRecommendations,
    handleProfileSelect,
    handleSelectOption,
    handleAnalysisChoice,
    handleComplete
  };
};
