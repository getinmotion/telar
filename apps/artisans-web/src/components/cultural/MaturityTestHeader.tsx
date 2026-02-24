import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MotionLogo } from '@/components/MotionLogo';

interface MaturityTestHeaderProps {
  onBack?: () => void;
  totalAnswered: number;
  totalQuestions: number;
  language: 'en' | 'es';
}

export const MaturityTestHeader: React.FC<MaturityTestHeaderProps> = ({
  onBack,
  totalAnswered,
  totalQuestions,
  language
}) => {
  const progress = Math.round((totalAnswered / totalQuestions) * 100);
  
  const translations = {
    en: {
      back: 'Volver al Taller Digital',
      progress: 'Progress',
      questions: 'questions'
    },
    es: {
      back: 'Volver al Panel',
      progress: 'Progreso',
      questions: 'preguntas'
    }
  };
  
  const t = translations[language];
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side: Logo + Back button */}
          <div className="flex items-center gap-4">
            <MotionLogo variant="dark" size="sm" />
            
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t.back}</span>
              </Button>
            )}
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t.progress}:</span>
              <Badge variant="secondary" className="font-mono">
                {totalAnswered}/{totalQuestions}
              </Badge>
            </div>
            
            {/* Progress bar */}
            <div className="w-32 sm:w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <span className="text-sm font-medium text-foreground">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
