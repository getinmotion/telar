import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface XPGainedNotificationProps {
  xpAmount: number;
  reason: string;
  onComplete?: () => void;
}

export const XPGainedNotification: React.FC<XPGainedNotificationProps> = ({
  xpAmount,
  reason,
  onComplete
}) => {
  const [displayXP, setDisplayXP] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Animate counter from 0 to xpAmount
    const duration = 1000;
    const steps = 30;
    const stepValue = xpAmount / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setDisplayXP(Math.min(Math.round(stepValue * currentStep), xpAmount));
      
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    // Mini confetti effect
    confetti({
      particleCount: 20,
      spread: 50,
      origin: { y: 0.8, x: 0.9 },
      colors: ['#10B981', '#34D399', '#6EE7B7']
    });

    // Auto-hide after 5 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(hideTimer);
    };
  }, [xpAmount, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="bg-gradient-to-r from-primary/90 to-accent/90 text-primary-foreground rounded-lg shadow-lg p-4 min-w-[280px]"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="bg-white/20 rounded-full p-2"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <motion.span
                  key={displayXP}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold"
                >
                  +{displayXP} XP
                </motion.span>
              </div>
              <p className="text-sm text-primary-foreground/90">{reason}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
