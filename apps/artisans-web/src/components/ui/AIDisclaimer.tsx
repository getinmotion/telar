import React from 'react';
import { Info, Lightbulb, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AIDisclaimerProps {
  variant?: 'banner' | 'tooltip' | 'inline';
  context?: 'generate' | 'refine';
  className?: string;
}

const messages = {
  generate: {
    icon: Lightbulb,
    title: 'Consejo sobre IA',
    text: 'La IA puede cometer errores. Para mejores resultados, escribe una idea inicial y deja que la IA la mejore.'
  },
  refine: {
    icon: Sparkles,
    title: 'Refinando con IA',
    text: 'La IA refinará tu texto. Revisa siempre el resultado y ajústalo si es necesario.'
  }
};

export const AIDisclaimer: React.FC<AIDisclaimerProps> = ({
  variant = 'inline',
  context = 'generate',
  className
}) => {
  const message = messages[context];
  const Icon = message.icon;

  if (variant === 'tooltip') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className={cn('w-4 h-4 text-muted-foreground cursor-help', className)} />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">{message.text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-start gap-2 text-xs text-muted-foreground', className)}>
        <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <p>{message.text}</p>
      </div>
    );
  }

  // banner variant
  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20',
      className
    )}>
      <Icon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
          {message.title}
        </p>
        <p className="text-xs text-amber-800 dark:text-amber-200">
          {message.text}
        </p>
      </div>
    </div>
  );
};
