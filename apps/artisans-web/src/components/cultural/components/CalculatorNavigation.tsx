
import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { DebouncedButton } from './DebouncedButton';

interface CalculatorNavigationProps {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  showNext: boolean;
  nextLabel: string;
  backLabel: string;
  isMobile: boolean;
}

export const CalculatorNavigation: React.FC<CalculatorNavigationProps> = ({
  onBack,
  onNext,
  canGoBack,
  showNext,
  nextLabel,
  backLabel,
  isMobile
}) => {
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 shadow-lg z-30">
        <div className="flex justify-between items-center max-w-4xl mx-auto gap-4">
          <DebouncedButton 
            variant="outline"
            onClick={onBack}
            disabled={!canGoBack}
            className="flex items-center gap-2 px-4 py-3 min-w-[100px] h-12 flex-1"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </DebouncedButton>

          {showNext && (
            <DebouncedButton 
              onClick={onNext}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 flex items-center gap-2 px-4 py-3 min-w-[100px] h-12 flex-1"
              size="lg"
            >
              {nextLabel}
              <ArrowRight className="h-4 w-4" />
            </DebouncedButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between pt-4 mt-6 border-t border-border">
      <DebouncedButton
        variant="outline"
        onClick={onBack}
        disabled={!canGoBack}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </DebouncedButton>

      {showNext && (
        <DebouncedButton 
          onClick={onNext}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 flex items-center gap-2"
        >
          {nextLabel}
          <ArrowRight className="h-4 w-4" />
        </DebouncedButton>
      )}
    </div>
  );
};
