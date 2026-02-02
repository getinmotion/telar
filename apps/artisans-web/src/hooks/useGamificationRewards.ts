import { useState, useCallback } from 'react';
import { useUserProgress } from './user/useUserProgress';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import type { Notification } from '@/components/gamification/RewardsNotificationContainer';

interface LevelUpData {
  newLevel: number;
  levelsGained: number;
  benefits: string[];
}

export const useGamificationRewards = () => {
  const { updateProgress } = useUserProgress();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const celebrateSuccess = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#6EE7B7', '#F59E0B']
    });
  }, []);

  const showXPGained = useCallback((xpAmount: number, reason: string) => {
    const notification: Notification = {
      id: `xp-${Date.now()}`,
      type: 'xp',
      xpAmount,
      reason
    };
    
    setNotifications(prev => [...prev, notification]);
  }, []);

  const showAchievements = useCallback((achievements: any[]) => {
    achievements.forEach((achievement, index) => {
      setTimeout(() => {
        const notification: Notification = {
          id: `achievement-${achievement.id}-${Date.now()}`,
          type: 'achievement',
          achievement: {
            id: achievement.id,
            title: achievement.title || achievement.name,
            description: achievement.description,
            icon: achievement.icon
          }
        };
        
        setNotifications(prev => [...prev, notification]);
      }, index * 500); // Stagger achievements
    });
  }, []);

  const showLevelUp = useCallback((newLevel: number, levelsGained: number = 1, benefits: string[] = []) => {
    setLevelUpData({
      newLevel,
      levelsGained,
      benefits: benefits.length > 0 ? benefits : [
        'Nuevas funcionalidades desbloqueadas',
        'Mayor visibilidad en el mercado',
        'Acceso a recursos exclusivos',
        'Insignias especiales'
      ]
    });
    setShowLevelUpModal(true);
    celebrateSuccess();
  }, [celebrateSuccess]);

  const awardXP = useCallback(async (
    amount: number,
    reason: string,
    missionCompleted: boolean = false,
    timeSpent: number = 0
  ) => {
    try {
      console.log(`🎯 Awarding XP: ${amount} for "${reason}"`);
      
      // Show XP notification
      showXPGained(amount, reason);

      // Update progress in backend
      const result = await updateProgress(amount, missionCompleted, timeSpent);

      if (result) {
        // Check for level up
        if (result.leveledUp) {
          console.log(`🎉 Level up detected! New level: ${result.level}`);
          showLevelUp(result.level, result.levelsGained || 1);
        }

        // Check for new achievements
        if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
          console.log(`🏆 Achievements unlocked:`, result.unlockedAchievements);
          showAchievements(result.unlockedAchievements);
        }

        return result;
      }

      return null;
    } catch (error) {
      console.error('❌ Error awarding XP:', error);
      toast.error('Error al otorgar puntos de experiencia');
      return null;
    }
  }, [updateProgress, showXPGained, showLevelUp, showAchievements]);

  return {
    // Actions
    awardXP,
    showXPGained,
    showAchievements,
    showLevelUp: (level: number, gains?: number, benefits?: string[]) => 
      showLevelUp(level, gains, benefits),
    celebrateSuccess,
    
    // State
    notifications,
    removeNotification,
    levelUpData,
    showLevelUpModal,
    setShowLevelUpModal
  };
};
