import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface ContinueMaturityBannerProps {
  totalAnswered: number;
  totalQuestions: number;
  onContinue: () => void;
  language?: 'en' | 'es';
}

export const ContinueMaturityBanner: React.FC<ContinueMaturityBannerProps> = ({
  totalAnswered,
  totalQuestions,
  onContinue,
  language = 'es'
}) => {
  const percentComplete = Math.round((totalAnswered / totalQuestions) * 100);
  
  // Solo mostrar si completó onboarding (3 preguntas) pero no todo (36 preguntas)
  if (totalAnswered < 3 || totalAnswered >= totalQuestions) return null;
  
  const translations = {
    es: {
      title: 'Continúa conociendo tu negocio',
      description: 'Has completado {answered} de {total} preguntas. Sigue respondiendo para recibir mejores recomendaciones personalizadas.',
      percentComplete: '{percent}% completado',
      questionsRemaining: '{remaining} preguntas restantes',
      continueButton: 'Continuar Evaluación'
    },
    en: {
      title: 'Continue learning about your business',
      description: 'You have completed {answered} of {total} questions. Keep answering to receive better personalized recommendations.',
      percentComplete: '{percent}% complete',
      questionsRemaining: '{remaining} questions remaining',
      continueButton: 'Continue Assessment'
    }
  };
  
  const t = translations[language];
  const remaining = totalQuestions - totalAnswered;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {t.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ¡Sigue conociendo tu negocio!
                  </p>
                </div>
              </div>
              <p className="text-base text-foreground mb-4 leading-relaxed">
                {t.description.replace('{answered}', totalAnswered.toString()).replace('{total}', totalQuestions.toString())}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-primary">
                    {t.percentComplete.replace('{percent}', percentComplete.toString())}
                  </span>
                  <span className="font-medium text-muted-foreground">
                    {t.questionsRemaining.replace('{remaining}', remaining.toString())}
                  </span>
                </div>
                <Progress value={percentComplete} className="h-3 bg-gray-200" />
              </div>
            </div>
            <Button 
              onClick={onContinue} 
              size="lg" 
              className="ml-auto shadow-lg hover:shadow-xl transition-shadow text-lg py-6 px-8"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              {t.continueButton}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
