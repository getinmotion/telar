
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserProfileData } from '../types/wizardTypes';
import { RadioCards } from '../wizard-components/RadioCards';
import { getAnalysisQuestions } from '../wizard-questions/analysisQuestions';

interface ExtendedQuestionsStepProps {
  profileData: UserProfileData;
  updateProfileData: (data: Partial<UserProfileData>) => void;
  language: 'en' | 'es';
  currentStepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isStepValid: boolean;
}

export const ExtendedQuestionsStep: React.FC<ExtendedQuestionsStepProps> = ({
  profileData,
  updateProfileData,
  language,
  currentStepNumber,
  totalSteps,
  onNext,
  onPrevious,
  isStepValid
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const questions = getAnalysisQuestions(language);
  const questionsArray = Object.values(questions);
  const currentQuestion = questionsArray[currentQuestionIndex];

  const handleSingleSelect = (value: string) => {
    if (currentQuestion) {
      updateProfileData({ [currentQuestion.fieldName]: value });
    }
  };

  const handleNext = () => {
    const totalQuestions = questionsArray.length;
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      onPrevious();
    }
  };

  const isCurrentQuestionValid = () => {
    return currentQuestion ? !!profileData[currentQuestion.fieldName as keyof UserProfileData] : false;
  };

  const t = {
    en: {
      step: `Step ${currentStepNumber} of ${totalSteps}`,
      question: `Question ${currentQuestionIndex + 1} of ${questionsArray.length}`,
      previous: "Previous",
      next: "Next",
      continue: "Continue"
    },
    es: {
      step: `Paso ${currentStepNumber} de ${totalSteps}`,
      question: `Pregunta ${currentQuestionIndex + 1} de ${questionsArray.length}`,
      previous: "Anterior",
      next: "Siguiente",
      continue: "Continuar"
    }
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  const totalQuestions = questionsArray.length;

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <span className="text-sm bg-gradient-to-r from-neon-green-400 to-neon-green-700 text-white px-4 py-2 rounded-full font-semibold shadow-sm">
          {t[language].step}
        </span>
        <h2 className="text-3xl font-bold text-charcoal mt-6 mb-3">{currentQuestion.title}</h2>
        {currentQuestion.subtitle && (
          <p className="text-gray-600 text-lg">{currentQuestion.subtitle}</p>
        )}
        <p className="text-sm text-muted-foreground mt-3 font-medium">{t[language].question}</p>
      </div>

      {/* Question Content */}
      <div className="max-w-2xl mx-auto">
        <RadioCards
          name={currentQuestion.id}
          options={currentQuestion.options}
          selectedValue={profileData[currentQuestion.fieldName as keyof UserProfileData] as string}
          onChange={handleSingleSelect}
          withIcons
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between max-w-2xl mx-auto">
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="px-8 py-6 hover:border-neon-green hover:bg-neon-green-50 transition-all duration-300"
        >
          {t[language].previous}
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isCurrentQuestionValid()}
          variant="neon"
          className="px-8 py-6 shadow-neon hover:shadow-glow-intense transition-all duration-300 hover:scale-105"
        >
          {currentQuestionIndex === (totalQuestions - 1) ? t[language].continue : t[language].next}
        </Button>
      </div>
    </div>
  );
};
