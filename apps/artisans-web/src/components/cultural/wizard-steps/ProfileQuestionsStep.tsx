
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserProfileData } from '../types/wizardTypes';
import { RadioCards } from '../wizard-components/RadioCards';
import { CheckboxCards } from '../wizard-components/CheckboxCards';

interface ProfileQuestionsStepProps {
  profileData: UserProfileData;
  updateProfileData: (data: Partial<UserProfileData>) => void;
  language: 'en' | 'es';
  currentStepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isStepValid: boolean;
  illustration?: string;
}

export const ProfileQuestionsStep: React.FC<ProfileQuestionsStepProps> = ({
  profileData,
  updateProfileData,
  language,
  currentStepNumber,
  totalSteps,
  onNext,
  onPrevious,
  isStepValid,
  illustration
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const translations = {
    en: {
      title: "Let's understand your profile better",
      subtitle: "Answer these questions to get personalized recommendations",
      industry: "What's your creative industry?",
      activities: "What activities do you do? (Select all that apply)",
      experience: "What's your experience level?",
      previous: "Back",
      next: "Next",
      continue: "Continue"
    },
    es: {
      title: "Conozcamos mejor tu perfil",
      subtitle: "Responde estas preguntas para obtener recomendaciones personalizadas",
      industry: "¿Cuál es tu industria creativa?",
      activities: "¿Qué actividades realizas? (Selecciona todas las que apliquen)",
      experience: "¿Cuál es tu nivel de experiencia?",
      previous: "Atrás",
      next: "Siguiente",
      continue: "Continuar"
    }
  };

  const t = translations[language];

  const industryOptions = [
    { id: 'music', label: language === 'en' ? 'Music' : 'Música' },
    { id: 'visual-arts', label: language === 'en' ? 'Visual Arts' : 'Artes Visuales' },
    { id: 'performing-arts', label: language === 'en' ? 'Performing Arts' : 'Artes Escénicas' },
    { id: 'literature', label: language === 'en' ? 'Literature' : 'Literatura' },
    { id: 'audiovisual', label: language === 'en' ? 'Audiovisual' : 'Audiovisual' },
    { id: 'digital-arts', label: language === 'en' ? 'Digital Arts' : 'Artes Digitales' }
  ];

  const activityOptions = [
    { id: 'creation', label: language === 'en' ? 'Content Creation' : 'Creación de Contenido' },
    { id: 'performance', label: language === 'en' ? 'Live Performance' : 'Presentaciones en Vivo' },
    { id: 'teaching', label: language === 'en' ? 'Teaching/Workshops' : 'Enseñanza/Talleres' },
    { id: 'collaboration', label: language === 'en' ? 'Collaborations' : 'Colaboraciones' },
    { id: 'production', label: language === 'en' ? 'Production' : 'Producción' }
  ];

  const experienceOptions = [
    { id: 'beginner', label: language === 'en' ? 'Beginner (0-2 years)' : 'Principiante (0-2 años)' },
    { id: 'intermediate', label: language === 'en' ? 'Intermediate (3-5 years)' : 'Intermedio (3-5 años)' },
    { id: 'advanced', label: language === 'en' ? 'Advanced (5+ years)' : 'Avanzado (5+ años)' }
  ];

  const questions = [
    {
      id: 'industry',
      title: t.industry,
      type: 'radio' as const,
      options: industryOptions,
      value: profileData.industry,
      onChange: (value: string) => updateProfileData({ industry: value })
    },
    {
      id: 'activities',
      title: t.activities,
      type: 'checkbox' as const,
      options: activityOptions,
      value: profileData.activities || [],
      onChange: (values: string[]) => updateProfileData({ activities: values })
    },
    {
      id: 'experience',
      title: t.experience,
      type: 'radio' as const,
      options: experienceOptions,
      value: profileData.experience,
      onChange: (value: string) => updateProfileData({ experience: value })
    }
  ];

  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      onNext();
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion === 0) {
      onPrevious();
    } else {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const isCurrentQuestionValid = () => {
    if (currentQ.type === 'radio') {
      return !!currentQ.value;
    }
    if (currentQ.type === 'checkbox') {
      return (currentQ.value as string[]).length > 0;
    }
    return false;
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

      {/* Question */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12"
      >
        <h3 className="text-xl font-semibold text-primary mb-6">{currentQ.title}</h3>
        
        {currentQ.type === 'radio' && (
          <RadioCards
            name={currentQ.id}
            options={currentQ.options}
            selectedValue={currentQ.value as string}
            onChange={currentQ.onChange as (value: string) => void}
          />
        )}
        
        {currentQ.type === 'checkbox' && (
          <CheckboxCards
            options={currentQ.options}
            selectedValues={currentQ.value as string[]}
            onChange={(value: string, checked: boolean) => {
              const currentValues = (currentQ.value as string[]) || [];
              if (checked) {
                currentQ.onChange([...currentValues, value]);
              } else {
                currentQ.onChange(currentValues.filter(v => v !== value));
              }
            }}
          />
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          className="px-6 py-3"
        >
          {t.previous}
        </Button>
        
        <Button
          onClick={handleNextQuestion}
          disabled={!isCurrentQuestionValid()}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3"
        >
          {isLastQuestion ? t.continue : t.next}
        </Button>
      </div>
    </div>
  );
};
