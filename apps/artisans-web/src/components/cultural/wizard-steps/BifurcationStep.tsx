
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Zap, Brain } from 'lucide-react';
import { UserProfileData } from '../types/wizardTypes';

interface BifurcationStepProps {
  profileData: UserProfileData;
  language: 'en' | 'es';
  selectedAnalysisType: 'quick' | 'deep' | null;
  onAnalysisChoice: (type: 'quick' | 'deep') => void;
  onNext: () => void;
  onPrevious: () => void;
  currentStepNumber: number;
  totalSteps: number;
}

export const BifurcationStep: React.FC<BifurcationStepProps> = ({
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
      title: "Choose Your Analysis Type",
      subtitle: "Do you want a quick recommendation or would you prefer a deeper analysis?",
      quickTitle: "Quick Recommendation",
      quickDesc: "Get 2-3 personalized agents based on your current answers",
      deepTitle: "Deep Analysis", 
      deepDesc: "Answer additional questions for a more detailed recommendation",
      previous: "Back",
      continue: "Continue"
    },
    es: {
      title: "Elegí tu Tipo de Análisis",
      subtitle: "¿Querés una recomendación rápida o preferís un análisis más profundo?",
      quickTitle: "Recomendación Rápida",
      quickDesc: "Obtené 2-3 agentes personalizados basados en tus respuestas actuales",
      deepTitle: "Análisis Profundo",
      deepDesc: "Respondé preguntas adicionales para una recomendación más detallada",
      previous: "Atrás",
      continue: "Continuar"
    }
  };

  const t = translations[language];

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-6">
          <span className="text-sm bg-gradient-to-r from-neon-green-400 to-neon-green-700 text-white px-4 py-2 rounded-full font-semibold shadow-sm">
            {language === 'en' ? `Step ${currentStepNumber} of ${totalSteps}` : `Paso ${currentStepNumber} de ${totalSteps}`}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-charcoal mb-4">{t.title}</h2>
        <p className="text-lg text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Analysis Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-8 mb-12"
      >
        {/* Quick Analysis */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAnalysisChoice('quick')}
          className={`p-8 rounded-2xl border-2 transition-all duration-300 text-left shadow-float hover:shadow-hover ${
            selectedAnalysisType === 'quick' 
              ? 'border-neon-green bg-neon-green-50 shadow-neon' 
              : 'border-border hover:border-neon-green-300'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-sm transition-all duration-300 ${
              selectedAnalysisType === 'quick' ? 'bg-gradient-to-br from-neon-green-400 to-neon-green-700' : 'bg-gradient-to-br from-neon-green-100 to-neon-green-200'
            }`}>
              <Zap className={`h-10 w-10 ${
                selectedAnalysisType === 'quick' ? 'text-white' : 'text-deep-green'
              }`} />
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-3">{t.quickTitle}</h3>
            <p className="text-muted-foreground leading-relaxed text-base">{t.quickDesc}</p>
          </div>
        </motion.button>

        {/* Deep Analysis */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAnalysisChoice('deep')}
          className={`p-8 rounded-2xl border-2 transition-all duration-300 text-left shadow-float hover:shadow-hover ${
            selectedAnalysisType === 'deep' 
              ? 'border-neon-green bg-neon-green-50 shadow-neon' 
              : 'border-border hover:border-neon-green-300'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-sm transition-all duration-300 ${
              selectedAnalysisType === 'deep' ? 'bg-gradient-to-br from-neon-green-400 to-neon-green-700' : 'bg-gradient-to-br from-neon-green-100 to-neon-green-200'
            }`}>
              <Brain className={`h-10 w-10 ${
                selectedAnalysisType === 'deep' ? 'text-white' : 'text-deep-green'
              }`} />
            </div>
            <h3 className="text-2xl font-bold text-charcoal mb-3">{t.deepTitle}</h3>
            <p className="text-muted-foreground leading-relaxed text-base">{t.deepDesc}</p>
          </div>
        </motion.button>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="px-8 py-6 hover:border-neon-green hover:bg-neon-green-50 transition-all duration-300"
        >
          {t.previous}
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!selectedAnalysisType}
          variant="neon"
          className="px-8 py-6 shadow-neon hover:shadow-glow-intense transition-all duration-300 hover:scale-105"
        >
          {t.continue}
        </Button>
      </div>
    </div>
  );
};
