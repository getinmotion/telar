
import React from 'react';

export interface QuestionOption {
  id: string;
  text: string;
  value: number;
  icon?: React.ReactNode;
}

export interface Question {
  id: string;
  question: string;
  type?: 'radio' | 'checkbox';
  category: 'ideaValidation' | 'userExperience' | 'marketFit' | 'monetization';
  options: QuestionOption[];
}

export type ProfileType = 'idea' | 'solo' | 'team';
export type Language = 'en' | 'es';

export interface CategoryScore {
  ideaValidation: number;
  userExperience: number;
  marketFit: number;
  monetization: number;
}

export type CalculatorStep = 'start' | 'initialization' | 'ideaValidation' | 'userExperience' | 'marketFit' | 'monetization' | 'results';

export interface MaturityStepProps {
  language: Language;
  profileType?: ProfileType;
  onNext: () => void;
  onBack?: () => void;
  onSelectOption: (questionId: string, value: number | string[]) => void;
  answers: Record<string, number | string[]>;
  currentQuestions: Question[];
  step: CalculatorStep;
}
