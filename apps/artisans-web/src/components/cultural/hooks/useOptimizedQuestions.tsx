
import { useMemo } from 'react';
import { ProfileType } from '@/types/dashboard';
import { Question } from '@/components/maturity/types';
import { getProfileSpecificQuestions, getExtendedQuestions } from '@/components/maturity/questions';

export const useOptimizedQuestions = (
  language: 'en' | 'es', 
  profileType: ProfileType | null,
  includeExtended: boolean = false
) => {
  const questions = useMemo((): Question[] => {
    if (!profileType) return [];
    const baseQuestions = getProfileSpecificQuestions(language, profileType);
    
    if (includeExtended) {
      const extendedQuestions = getExtendedQuestions(language, profileType);
      return [...baseQuestions, ...extendedQuestions];
    }
    
    return baseQuestions;
  }, [language, profileType, includeExtended]);

  const totalSteps = useMemo(() => {
    if (includeExtended) {
      return questions.length + 3; // +3 for profile type, bifurcation, and results
    }
    return questions.length + 3; // +3 for profile type, bifurcation, and results
  }, [questions.length, includeExtended]);

  return { questions, totalSteps };
};
