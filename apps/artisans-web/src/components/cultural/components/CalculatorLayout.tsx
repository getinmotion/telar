
import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { CalculatorHeader } from './CalculatorHeader';
import { CalculatorNavigation } from './CalculatorNavigation';

interface CalculatorLayoutProps {
  children: React.ReactNode;
  currentStepNumber: number;
  totalSteps: number;
  title: string;
  language: 'en' | 'es';
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  showNext: boolean;
  nextLabel: string;
  backLabel: string;
  onExit: () => void;
}

export const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  children,
  currentStepNumber,
  totalSteps,
  title,
  language,
  onBack,
  onNext,
  canGoBack,
  showNext,
  nextLabel,
  backLabel,
  onExit
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="w-full">
      {/* Header */}
      <CalculatorHeader
        title={title}
        currentStep={currentStepNumber}
        totalSteps={totalSteps}
        language={language}
        onExit={onExit}
        isMobile={isMobile}
      />

      {/* Content Container */}
      <div className={`relative bg-card/80 backdrop-blur-sm ${isMobile ? 'pt-2 pb-20' : 'p-8'} rounded-2xl border border-border/50 shadow-lg`}>
        {children}
      </div>

      {/* Navigation */}
      <CalculatorNavigation
        onBack={onBack}
        onNext={onNext}
        canGoBack={canGoBack}
        showNext={showNext}
        nextLabel={nextLabel}
        backLabel={backLabel}
        isMobile={isMobile}
      />
    </div>
  );
};
