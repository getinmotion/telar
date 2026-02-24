import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Target, Crown, Flame, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface AchievementUnlockedCardProps {
  achievement: Achievement;
  onComplete?: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  trophy: <Trophy className="w-6 h-6" />,
  award: <Award className="w-6 h-6" />,
  target: <Target className="w-6 h-6" />,
  crown: <Crown className="w-6 h-6" />,
  flame: <Flame className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />
};

export const AchievementUnlockedCard: React.FC<AchievementUnlockedCardProps> = ({
  achievement,
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Achievement confetti
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8, x: 0.9 },
      colors: ['#F59E0B', '#FBBF24', '#FCD34D']
    });

    // Auto-hide after 5 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300);
    }, 5000);

    return () => {
      clearTimeout(hideTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          className="bg-gradient-to-r from-warning/90 to-accent/90 text-white rounded-lg shadow-xl p-4 min-w-[300px]"
        >
          <div className="flex items-start gap-3">
            <motion.div
              animate={{ 
                rotate: [0, -15, 15, -15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
              className="bg-white/20 rounded-full p-3 flex-shrink-0"
            >
              {iconMap[achievement.icon || 'trophy'] || <Trophy className="w-6 h-6" />}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">Logro Desbloqueado</span>
              </div>
              
              <h3 className="font-bold text-lg mb-1 truncate">{achievement.title}</h3>
              
              <p className="text-sm text-white/90 line-clamp-2">
                {achievement.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
