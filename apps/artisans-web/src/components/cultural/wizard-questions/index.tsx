
import React from 'react';
import { QuestionConfig } from '../wizard-components/QuestionStep';
import { getProfileQuestions } from './profileQuestions';
import { getBusinessQuestions } from './businessQuestions';
import { getManagementQuestions } from './managementQuestions';
import { getAnalysisQuestions } from './analysisQuestions';

export const getQuestions = (language: 'en' | 'es'): Record<string, QuestionConfig> => {
  return {
    ...getProfileQuestions(language),
    ...getBusinessQuestions(language),
    ...getManagementQuestions(language),
    ...getAnalysisQuestions(language)
  };
};
