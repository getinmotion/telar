
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserProfileData } from '../types/wizardTypes';
import { Zap, Search } from 'lucide-react';

interface AnalysisChoiceStepProps {
  profileData: UserProfileData;
  language: 'en' | 'es';
  selectedAnalysisType?: 'quick' | 'deep' | null;
  onAnalysisChoice: (type: 'quick' | 'deep') => void;
  onNext: () => void;
  onPrevious: () => void;
  currentStepNumber: number;
  totalSteps: number;
}

export const AnalysisChoiceStep: React.FC<AnalysisChoiceStepProps> = ({
  profileData,
  language,
  selectedAnalysisType,
  onAnalysisChoice,
  onNext,
  onPrevious,
  currentStepNumber,
  totalSteps
}) => {
  const translations = {
    en: {
      title: "Choose Your Analysis Depth",
      subtitle: "How detailed would you like your personalized recommendations?",
      quick: "Quick Analysis",
      quickDesc: "Get immediate insights and basic recommendations",
      quickTime: "~2 minutes",
      deep: "Deep Analysis",
      deepDesc: "Comprehensive evaluation with detailed action plans",
      deepTime: "~5 minutes",
      previous: "Back",
      continue: "Continue"
    },
    es: {
      title: "Elige la Profundidad del Análisis",
      subtitle: "¿Qué tan detalladas quieres que sean tus recomendaciones personalizadas?",
      quick: "Análisis Rápido",
      quickDesc: "Obtén insights inmediatos y recomendaciones básicas",
      quickTime: "~2 minutos",
      deep: "Análisis Profundo",
      deepDesc: "Evaluación integral con planes de acción detallados",
      deepTime: "~5 minutos",
      previous: "Atrás",
      continue: "Continuar"
    }
  };

  const t = translations[language];

  const handleOptionSelect = (type: 'quick' | 'deep') => {
    onAnalysisChoice(type);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
            {language === 'en' ? `Step ${currentStepNumber} of ${totalSteps}` : `Paso ${currentStepNumber} de ${totalSteps}`}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-primary mb-4">{t.title}</h2>
        <p className="text-lg text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-6 mb-12"
      >
        {/* Quick Analysis */}
        <motion.div
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
            selectedAnalysisType === 'quick'
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary'
          }`}
          onClick={() => handleOptionSelect('quick')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{t.quick}</h3>
              <span className="text-sm text-muted-foreground">{t.quickTime}</span>
            </div>
          </div>
          <p className="text-muted-foreground">{t.quickDesc}</p>
        </motion.div>

        {/* Deep Analysis */}
        <motion.div
          className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
            selectedAnalysisType === 'deep'
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary'
          }`}
          onClick={() => handleOptionSelect('deep')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{t.deep}</h3>
              <span className="text-sm text-muted-foreground">{t.deepTime}</span>
            </div>
          </div>
          <p className="text-muted-foreground">{t.deepDesc}</p>
        </motion.div>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="px-6 py-3"
        >
          {t.previous}
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!selectedAnalysisType}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3"
        >
          {t.continue}
        </Button>
      </div>
    </div>
  );
};
