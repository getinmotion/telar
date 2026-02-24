import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserProgressStatus } from '@/utils/userProgress';

interface ProgressState {
  isRecovering: boolean;
  recoveryAttempted: boolean;
  hasValidProgress: boolean;
  progressSource: 'localStorage' | 'supabase' | 'none' | 'error';
  recoveryReason?: string;
}

export const useProgressRecovery = () => {
  const { user } = useAuth();
  const [progressState, setProgressState] = useState<ProgressState>({
    isRecovering: false,
    recoveryAttempted: false,
    hasValidProgress: false,
    progressSource: 'none'
  });

  useEffect(() => {
    if (user && !progressState.recoveryAttempted) {
      performProgressRecovery();
    }
  }, [user, progressState.recoveryAttempted]);

  const performProgressRecovery = async () => {
    if (!user?.id) return;

    console.log('🔄 useProgressRecovery: Starting progress recovery for user:', user.id);
    setProgressState(prev => ({ ...prev, isRecovering: true }));

    try {
      const progressStatus = await getUserProgressStatus(user.id);
      
      console.log('📊 useProgressRecovery: Progress recovery result:', progressStatus);
      
      setProgressState({
        isRecovering: false,
        recoveryAttempted: true,
        hasValidProgress: progressStatus.hasProgress,
        progressSource: progressStatus.source as any,
        recoveryReason: progressStatus.reason
      });

    } catch (error) {
      console.error('💥 useProgressRecovery: Error during progress recovery:', error);
      setProgressState({
        isRecovering: false,
        recoveryAttempted: true,
        hasValidProgress: false,
        progressSource: 'error',
        recoveryReason: 'recovery_failed'
      });
    }
  };

  const resetRecovery = () => {
    console.log('🔄 useProgressRecovery: Resetting recovery state');
    setProgressState({
      isRecovering: false,
      recoveryAttempted: false,
      hasValidProgress: false,
      progressSource: 'none'
    });
  };

  const forceRecovery = async () => {
    if (!user?.id) return;
    
    console.log('🔧 useProgressRecovery: Forcing progress recovery');
    setProgressState(prev => ({ ...prev, recoveryAttempted: false }));
    await performProgressRecovery();
  };

  return {
    progressState,
    resetRecovery,
    forceRecovery,
    isRecovering: progressState.isRecovering
  };
};