
import { ReactNode } from 'react';
import { UserProfileData } from '../types/wizardTypes';

export interface QuestionOption {
  id: string;
  label: string;
  icon?: ReactNode;
  value?: string;
}

export interface QuestionConfig {
  id: string;
  type: 'radio' | 'checkbox' | 'icon-select';
  title: string;
  subtitle?: string;
  fieldName: keyof UserProfileData | string;
  options: QuestionOption[];
}

export interface TranslatedText {
  title: string;
  subtitle: string;
}

export interface QuestionTranslations {
  [key: string]: {
    en: TranslatedText;
    es: TranslatedText;
  };
}
