
import React from 'react';
import { motion } from 'framer-motion';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  language: 'en' | 'es';
  isOnboardingMode?: boolean; // Nuevo: para mostrar "3 de 3" en onboarding
}

export const StepProgress: React.FC<StepProgressProps> = ({ 
  currentStep, 
  totalSteps,
  language,
  isOnboardingMode = false
}) => {
  // En modo onboarding, mostrar "3 de 3" para no asustar
  // En modo completo, mostrar el total real
  const displayTotal = isOnboardingMode ? 3 : totalSteps;
  const displayCurrent = isOnboardingMode ? Math.min(currentStep, 3) : currentStep;
  
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-muted-foreground font-semibold">
          {displayCurrent} {language === 'es' ? 'de' : 'of'} {displayTotal}
        </p>
      </div>
      
      <div className="flex w-full">
        {/* Step indicators */}
        {Array.from({ length: totalSteps }).map((_, i) => {
          const isCompleted = i < currentStep - 1;
          const isCurrent = i === currentStep - 1;
          const isLast = i === totalSteps - 1;
          
          return (
            <div 
              key={i} 
              className="relative flex-1 flex items-center"
            >
              {/* Step circle */}
              <motion.div 
                className={`h-2 w-2 rounded-full ${
                  isCompleted || isCurrent 
                    ? 'bg-neon-green-500 shadow-neon' 
                    : 'bg-gray-200'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Connecting line */}
              {!isLast && (
                <div className="flex-1 h-[2px] mx-1">
                  <motion.div 
                    className={`h-full ${
                      isCompleted ? 'bg-neon-green-500' : 'bg-gray-200'
                    }`}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
