import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { TelarLoadingAnimation } from '@/components/ui/TelarLoadingAnimation';

interface QuestionGeneratingIndicatorProps {
  language: 'en' | 'es';
  isVisible: boolean;
  personalizationCount?: number;
  context?: string;
}

export const QuestionGeneratingIndicator: React.FC<QuestionGeneratingIndicatorProps> = ({
  language,
  isVisible,
  personalizationCount = 0,
  context
}) => {
  if (!isVisible) return null;

  const baseText = language === 'es' 
    ? 'Creando pregunta personalizada específica para ti...' 
    : 'Creating personalized question specifically for you...';

  const countText = personalizationCount > 0 
    ? (language === 'es' ? `Personalización #${personalizationCount}` : `Personalization #${personalizationCount}`)
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-lg p-4 mb-6 shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <TelarLoadingAnimation size="sm" />
          <motion.div
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="h-4 w-4 text-primary" />
          </motion.div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-primary">
              {language === 'es' ? '🎯 Inteligencia Personalizada' : '🎯 Personalized Intelligence'}
            </p>
            {countText && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                {countText}
              </span>
            )}
          </div>
          <p className="text-xs text-foreground/80 font-medium mb-1">
            {baseText}
          </p>
          {context && (
            <p className="text-xs text-muted-foreground italic">
              {context}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "linear" 
            }}
            className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
          />
          <span className="text-xs text-primary font-medium">
            {language === 'es' ? 'AI' : 'AI'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};