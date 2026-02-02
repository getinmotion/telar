
import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { DebouncedButton } from './DebouncedButton';

interface MobileNavigationProps {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  showNext: boolean;
  nextLabel: string;
  backLabel: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onBack,
  onNext,
  canGoBack,
  showNext,
  nextLabel,
  backLabel
}) => {
  return (
    <div className="sticky bottom-0 z-30 mt-6 px-4 py-3">
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
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 flex items-center gap-2 px-4 py-3 min-w-[100px] h-12 flex-1"
            size="lg"
          >
            {nextLabel}
            <ArrowRight className="h-4 w-4" />
          </DebouncedButton>
        )}
      </div>
    </div>
  );
};
