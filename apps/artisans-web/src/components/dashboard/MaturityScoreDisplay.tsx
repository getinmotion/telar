
import React from 'react';
import { CategoryScore } from '@/types/dashboard';
import { TrendingUp, User, Target, DollarSign } from 'lucide-react';

interface MaturityScoreDisplayProps {
  scores: CategoryScore;
  language: 'en' | 'es';
  compact?: boolean;
}

export const MaturityScoreDisplay: React.FC<MaturityScoreDisplayProps> = ({
  scores,
  language,
  compact = false
}) => {
  const translations = {
    en: {
      title: 'Your Creative Maturity',
      categories: {
        ideaValidation: 'Idea Validation',
        userExperience: 'User Experience',
        marketFit: 'Market Fit',
        monetization: 'Monetization'
      }
    },
    es: {
      title: 'Tu Madurez Creativa',
      categories: {
        ideaValidation: 'Validación de Idea',
        userExperience: 'Experiencia de Usuario',
        marketFit: 'Ajuste de Mercado',
        monetization: 'Monetización'
      }
    }
  };

  const t = translations[language];

  const categoryIcons = {
    ideaValidation: TrendingUp,
    userExperience: User,
    marketFit: Target,
    monetization: DollarSign
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success bg-success/10';
    if (score >= 40) return 'text-warning-foreground bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className={`font-semibold text-gray-900 mb-4 ${compact ? 'text-sm' : ''}`}>
        {t.title}
      </h3>
      
      <div className="space-y-3">
        {Object.entries(scores).map(([key, value]) => {
          const Icon = categoryIcons[key as keyof typeof categoryIcons];
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500 mr-2`} />
                <span className={`text-gray-700 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {t.categories[key as keyof typeof t.categories]}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(value)}`}>
                {value}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
