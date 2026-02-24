import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import { MATURITY_TEST_CONFIG, getProgressPercentage, getRemainingQuestions, getGlobalQuestionNumber } from '@/config/maturityTest';

interface MaturityTestProgressProps {
  totalAnswered: number;
  language: 'en' | 'es';
  variant?: 'compact' | 'full' | 'minimal';
  totalQuestions?: number; // ✅ NUEVO: permitir override del total
}

export const MaturityTestProgress: React.FC<MaturityTestProgressProps> = ({
  totalAnswered,
  language,
  variant = 'full',
  totalQuestions // ✅ NUEVO: recibir total dinámico
}) => {
  // ✅ Usar totalQuestions si se proporciona, sino usar el default
  const effectiveTotal = totalQuestions || MATURITY_TEST_CONFIG.TOTAL_QUESTIONS;
  const percentage = (totalAnswered / effectiveTotal) * 100;
  const remaining = effectiveTotal - totalAnswered;
  const currentQuestion = totalAnswered + 1;

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-neon-green-50 to-white rounded-xl border border-neon-green-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-green-400 to-neon-green-600 flex items-center justify-center shadow-md">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-charcoal">
              {language === 'es' ? 'Test de Madurez' : 'Maturity Test'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {language === 'es' 
                ? `${totalAnswered} de ${MATURITY_TEST_CONFIG.TOTAL_QUESTIONS} completadas`
                : `${totalAnswered} of ${MATURITY_TEST_CONFIG.TOTAL_QUESTIONS} completed`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-neon-green text-deep-green text-sm px-3 py-1 shadow-sm">
            {totalAnswered}/{effectiveTotal}
          </Badge>
          <div className="flex flex-col items-end gap-1">
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-green-400 to-neon-green-600 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {language === 'es' ? `${remaining} restantes` : `${remaining} remaining`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-neon-green text-deep-green text-base px-4 py-2 shadow-sm">
          {totalAnswered}/{effectiveTotal}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {language === 'es' ? `${remaining} restantes` : `${remaining} remaining`}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm border border-border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-green-400 to-neon-green-600 flex items-center justify-center shadow-md">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-charcoal">
              {language === 'es' ? 'Test de Madurez' : 'Maturity Test'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'es' 
                ? `${totalAnswered} de ${effectiveTotal} completadas`
                : `${totalAnswered} of ${effectiveTotal} completed`}
            </p>
          </div>
        </div>
        <Badge className="bg-neon-green text-deep-green text-base px-4 py-2 shadow-sm">
          {totalAnswered}/{MATURITY_TEST_CONFIG.TOTAL_QUESTIONS}
        </Badge>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-neon-green-400 to-neon-green-600"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            {percentage}% {language === 'es' ? 'completado' : 'completed'}
          </p>
          <p className="text-xs font-medium text-neon-green-700">
            {language === 'es' 
              ? `Faltan ${remaining} preguntas`
              : `${remaining} questions remaining`}
          </p>
        </div>
      </div>
    </div>
  );
};
