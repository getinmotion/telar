import React from 'react';
import { useGamificationRewards } from '@/hooks/useGamificationRewards';
import { RewardsNotificationContainer } from './RewardsNotificationContainer';
import { LevelUpModal } from './LevelUpModal';

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    notifications,
    removeNotification,
    levelUpData,
    showLevelUpModal,
    setShowLevelUpModal
  } = useGamificationRewards();

  return (
    <>
      {children}
      
      <RewardsNotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
      
      {levelUpData && (
        <LevelUpModal
          isOpen={showLevelUpModal}
          onClose={() => setShowLevelUpModal(false)}
          newLevel={levelUpData.newLevel}
          levelsGained={levelUpData.levelsGained}
          benefits={levelUpData.benefits}
        />
      )}
    </>
  );
};
