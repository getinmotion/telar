
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface MobileWizardNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isValid: boolean;
  nextLabel?: string;
  previousLabel?: string;
}

export const MobileWizardNavigation: React.FC<MobileWizardNavigationProps> = ({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  isValid,
  nextLabel,
  previousLabel
}) => {
  const { toast } = useToast();
  
  const labels = {
    next: nextLabel || 'Continue',
    previous: previousLabel || 'Back',
    finish: 'Finish',
    validationError: 'Please answer this question before continuing'
  };

  const handleNext = () => {
    if (!isValid) {
      toast({
        title: labels.validationError,
        variant: "destructive"
      });
      return;
    }
    onNext();
  };

  if (isLastStep) {
    return null;
  }
  
  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep}
        className="flex-1 h-12 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {labels.previous}
      </Button>
      
      <Button
        onClick={handleNext}
        disabled={!isValid}
        className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {labels.next}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};
