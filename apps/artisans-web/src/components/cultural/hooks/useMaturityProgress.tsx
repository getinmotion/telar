
import { useState, useEffect } from 'react';
import { ProfileType } from '@/types/dashboard';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';

interface SavedProgress {
  currentStep: 'profileType' | 'questions' | 'bifurcation' | 'extendedQuestions' | 'results';
  currentQuestionIndex: number;
  profileType: ProfileType | null;
  answers: Record<string, number | string[]>;
  extendedAnswers: Record<string, number | string[]>;
  analysisType: 'quick' | 'deep' | null;
  timestamp: number;
}

export const useMaturityProgress = () => {
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(null);
  const userLocalStorage = useUserLocalStorage();

  useEffect(() => {
    const saved = userLocalStorage.getItem('maturityCalculatorProgress');
    if (saved) {
      try {
        const progress = JSON.parse(saved) as SavedProgress;
        // Check if saved progress is less than 24 hours old
        const hoursSinceLastSave = (Date.now() - progress.timestamp) / (1000 * 60 * 60);
        if (hoursSinceLastSave < 24) {
          setSavedProgress(progress);
          setHasSavedProgress(true);
        } else {
          // Remove old progress
          userLocalStorage.removeItem('maturityCalculatorProgress');
        }
      } catch (error) {
        console.error('Error parsing saved progress:', error);
        userLocalStorage.removeItem('maturityCalculatorProgress');
      }
    }
  }, [userLocalStorage]);

  const saveProgress = (progressData: Omit<SavedProgress, 'timestamp'>) => {
    const dataToSave: SavedProgress = {
      ...progressData,
      timestamp: Date.now()
    };
    userLocalStorage.setItem('maturityCalculatorProgress', JSON.stringify(dataToSave));
  };

  const clearProgress = () => {
    userLocalStorage.removeItem('maturityCalculatorProgress');
    setHasSavedProgress(false);
    setSavedProgress(null);
  };

  const loadProgress = () => {
    return savedProgress;
  };

  return {
    hasSavedProgress,
    savedProgress,
    saveProgress,
    clearProgress,
    loadProgress
  };
};
