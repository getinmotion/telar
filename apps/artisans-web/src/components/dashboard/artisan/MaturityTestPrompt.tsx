import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight } from 'lucide-react';
import { MATURITY_TEST_CONFIG } from '@/config/maturityTest';
import { useLanguage } from '@/context/LanguageContext';

interface MaturityTestPromptProps {
  hasInProgress?: boolean;
  totalAnswered?: number;
}

export const MaturityTestPrompt: React.FC<MaturityTestPromptProps> = ({
  hasInProgress = false,
  totalAnswered = 0,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const translations = {
    es: {
      start: 'Empezar Test de Madurez',
      continue: 'Continuar Test',
      progress: 'Pregunta',
      of: 'de',
      description: 'Evalúa tu negocio para obtener recomendaciones personalizadas'
    },
    en: {
      start: 'Start Maturity Test',
      continue: 'Continue Test',
      progress: 'Question',
      of: 'of',
      description: 'Assess your business for personalized recommendations'
    }
  };

  const t = translations[language as 'es' | 'en'] || translations.es;
  const progressPercentage = Math.round((totalAnswered / MATURITY_TEST_CONFIG.TOTAL_QUESTIONS) * 100);

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Icon and Text */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-charcoal">
                {hasInProgress ? t.continue : t.start}
              </h3>
              {hasInProgress && totalAnswered > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.progress} {totalAnswered}/{MATURITY_TEST_CONFIG.TOTAL_QUESTIONS}
                </p>
              )}
              {!hasInProgress && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.description}
                </p>
              )}
            </div>
          </div>

          {/* Progress Badge */}
          {hasInProgress && totalAnswered > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {progressPercentage}%
            </Badge>
          )}

          {/* CTA Button */}
          <Button
            onClick={() => navigate('/maturity-calculator')}
            size="sm"
            className="flex-shrink-0"
          >
            {hasInProgress ? t.continue : t.start}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
