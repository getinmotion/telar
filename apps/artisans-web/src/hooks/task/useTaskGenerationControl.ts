import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserLocalStorage } from '../user/useUserLocalStorage';

export const useTaskGenerationControl = () => {
  const { user } = useAuth();
  const userLocalStorage = useUserLocalStorage();
  const [allowAutoGeneration, setAllowAutoGeneration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAutoGenerationStatus();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const checkAutoGenerationStatus = () => {
    try {
      // Check user-namespaced localStorage first for quick response
      const localStatus = userLocalStorage.getItem('allowTaskAutoGeneration');
      const hasCompletedMaturity = userLocalStorage.getItem('onboardingCompleted') === 'true';
      
      console.log('🔍 Checking task generation status:', { localStatus, hasCompletedMaturity });
      
      // Allow auto-generation only if maturity test has been completed
      const shouldAllow = localStatus === 'true' && hasCompletedMaturity;
      setAllowAutoGeneration(shouldAllow);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auto-generation status:', error);
      setAllowAutoGeneration(false);
      setIsLoading(false);
    }
  };

  const enableAutoGeneration = () => {
    console.log('✅ Enabling automatic task generation');
    userLocalStorage.setItem('allowTaskAutoGeneration', 'true');
    setAllowAutoGeneration(true);
  };

  const disableAutoGeneration = () => {
    console.log('🚫 Disabling automatic task generation');
    userLocalStorage.setItem('allowTaskAutoGeneration', 'false');
    setAllowAutoGeneration(false);
  };

  const resetGenerationControl = () => {
    console.log('🔄 Resetting task generation control');
    userLocalStorage.removeItem('allowTaskAutoGeneration');
    setAllowAutoGeneration(false);
  };

  return {
    allowAutoGeneration,
    isLoading,
    enableAutoGeneration,
    disableAutoGeneration,
    resetGenerationControl,
    checkAutoGenerationStatus
  };
};