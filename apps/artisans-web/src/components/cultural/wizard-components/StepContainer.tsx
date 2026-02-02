
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { StepProgress } from './StepProgress';
import { WizardNavigation } from './WizardNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface StepContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  illustration?: string;
  industry?: string;
  fullWidth?: boolean;
  currentStep?: number;
  totalSteps?: number;
  language?: 'en' | 'es';
  showNavigation?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  currentStepId?: string;
  profileData?: any;
  isStepValid?: boolean;
  stickyHeader?: ReactNode;
}

export const StepContainer: React.FC<StepContainerProps> = ({ 
  title, 
  subtitle,
  children,
  className = "",
  illustration,
  industry,
  fullWidth = false,
  currentStep,
  totalSteps,
  language = 'en',
  showNavigation = false,
  onNext,
  onPrevious,
  isFirstStep = false,
  currentStepId = '',
  profileData,
  isStepValid = true,
  stickyHeader
}) => {
  const isMobile = useIsMobile();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className={`w-full h-full flex flex-col ${className}`}
    >
      {stickyHeader && (
        <div className="sticky top-0 z-10 w-full">
          {stickyHeader}
        </div>
      )}
      
      <div className={`flex-1 flex ${isMobile ? 'flex-col gap-4' : 'flex-col md:flex-row gap-6'} ${isMobile ? 'p-3' : 'p-4'}`}>
        {/* Left column with all content */}
        <div className="flex-1 flex flex-col">
          <div className={`bg-white rounded-xl shadow-sm ${isMobile ? 'p-4' : 'p-6'}`}>
            {/* Step progress indicator at the top if provided */}
            {currentStep && totalSteps && (
              <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
                <StepProgress 
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  language={language}
                />
              </div>
            )}
            
            <div className={`text-left ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <h2 className={`${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} font-bold text-purple-800 mb-2`}>
                {title}
              </h2>
              {subtitle && (
                <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {subtitle}
                </p>
              )}
            </div>
            
            <div className="flex-1">
              {children}
            </div>
            
            {/* Navigation buttons - Only show on desktop when enabled */}
            {showNavigation && onNext && onPrevious && !isMobile && (
              <div className="mt-8">
                <WizardNavigation 
                  onNext={onNext}
                  onPrevious={onPrevious}
                  isFirstStep={isFirstStep}
                  isLastStep={false}
                  language={language}
                  currentStepId={currentStepId}
                  profileData={profileData}
                  isValid={isStepValid}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Right column with illustration - Hide on mobile */}
        {illustration && !isMobile && (
          <div className="w-full md:w-1/2 lg:w-2/5 h-auto md:min-h-[400px] flex justify-center items-center">
            <motion.div 
              className="relative w-full h-full min-h-[300px] md:min-h-[400px]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.5,
                delay: 0.2,
                type: "spring",
                stiffness: 100
              }}
            >
              <img 
                src={illustration} 
                alt="Step illustration"
                className="w-full h-full object-cover object-center rounded-xl" 
              />
            </motion.div>
          </div>
        )}
      </div>

      {/* Mobile Navigation - Sticky bottom */}
      {showNavigation && onNext && onPrevious && isMobile && (
        <div className="sticky bottom-0 z-30 mt-4 px-4 py-3">
          <WizardNavigation 
            onNext={onNext}
            onPrevious={onPrevious}
            isFirstStep={isFirstStep}
            isLastStep={false}
            language={language}
            currentStepId={currentStepId}
            profileData={profileData}
            isValid={isStepValid}
          />
        </div>
      )}
    </motion.div>
  );
};
