
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.round((current / total) * 100);
  
  // Generate step dots
  const steps = Array.from({ length: total }, (_, i) => i + 1);
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex space-x-2">
          {steps.map(step => (
            <motion.div
              key={step}
            className={`relative rounded-full ${
                step <= current ? 'bg-primary' : 'bg-muted'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: step === current ? 1 : 0.8
              }}
              transition={{
                duration: 0.3
              }}
              style={{
                width: step === current ? 12 : 8, 
                height: step === current ? 12 : 8
              }}
            >
              {step === current && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/30"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 0, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
        <span className="font-semibold text-sm text-primary">
          {percentage}%
        </span>
      </div>
      
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary to-primary-foreground"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};
