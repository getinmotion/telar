import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuestionHelpTooltipProps {
  helpText: string;
  marketData?: string;
}

export const QuestionHelpTooltip: React.FC<QuestionHelpTooltipProps> = ({
  helpText,
  marketData
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2">
            <p className="text-sm">{helpText}</p>
            {marketData && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground font-medium mb-1">📊 Datos de mercado:</p>
                <p className="text-xs text-muted-foreground">{marketData}</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
