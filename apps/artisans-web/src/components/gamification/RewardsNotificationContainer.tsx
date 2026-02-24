import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XPGainedNotification } from './XPGainedNotification';
import { AchievementUnlockedCard } from './AchievementUnlockedCard';

export interface XPNotification {
  id: string;
  type: 'xp';
  xpAmount: number;
  reason: string;
}

export interface AchievementNotification {
  id: string;
  type: 'achievement';
  achievement: {
    id: string;
    title: string;
    description: string;
    icon?: string;
  };
}

export type Notification = XPNotification | AchievementNotification;

interface RewardsNotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const RewardsNotificationContainer: React.FC<RewardsNotificationContainerProps> = ({
  notifications,
  onRemove
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="pointer-events-auto"
          >
            {notification.type === 'xp' ? (
              <XPGainedNotification
                xpAmount={notification.xpAmount}
                reason={notification.reason}
                onComplete={() => onRemove(notification.id)}
              />
            ) : (
              <AchievementUnlockedCard
                achievement={notification.achievement}
                onComplete={() => onRemove(notification.id)}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
