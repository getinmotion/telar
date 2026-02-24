
import React from 'react';
import { motion } from 'framer-motion';
import { UserProfileData } from '../types/wizardTypes';
import { Button } from '@/components/ui/button';

interface ProfileQuestionStepProps {
  profileData: UserProfileData;
  updateProfileData: (data: Partial<UserProfileData>) => void;
  language: 'en' | 'es';
  currentStepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isStepValid: boolean;
}

export const ProfileQuestionStep: React.FC<ProfileQuestionStepProps> = ({
  profileData,
  updateProfileData,
  language,
  currentStepNumber,
  totalSteps,
  onNext,
  onPrevious,
  isStepValid
}) => {
  const translations = {
    en: {
      title: "Tell us about your profile",
      subtitle: "This helps us provide better recommendations",
      previous: "Back",
      next: "Next"
    },
    es: {
      title: "Cuéntanos sobre tu perfil",
      subtitle: "Esto nos ayuda a brindarte mejores recomendaciones",
      previous: "Atrás",
      next: "Siguiente"
    }
  };

  const t = translations[language];

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

      {/* Content based on analysis preference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 mb-12"
      >
        {profileData.analysisPreference === 'deep' ? (
          <div className="text-center p-8 bg-primary/10 rounded-lg">
            <h3 className="text-xl font-semibold text-primary mb-4">
              {language === 'en' ? 'Deep Analysis Selected' : 'Análisis Profundo Seleccionado'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'You will receive comprehensive recommendations with detailed action plans.'
                : 'Recibirás recomendaciones integrales con planes de acción detallados.'}
            </p>
          </div>
        ) : (
          <div className="text-center p-8 bg-success/10 rounded-lg">
            <h3 className="text-xl font-semibold text-success mb-4">
              {language === 'en' ? 'Quick Analysis Selected' : 'Análisis Rápido Seleccionado'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'You will receive immediate insights and basic recommendations.'
                : 'Recibirás insights inmediatos y recomendaciones básicas.'}
            </p>
          </div>
        )}
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
          disabled={!isStepValid}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3"
        >
          {t.next}
        </Button>
      </div>
    </div>
  );
};
