
import { Question } from '../types';
import { ProfileType } from '@/types/dashboard';
import { getIdeaQuestions } from './ideaQuestions';
import { getSoloQuestions } from './soloQuestions';
import { getTeamQuestions } from './teamQuestions';
import { getExtendedIdeaQuestions, getExtendedSoloQuestions, getExtendedTeamQuestions } from './extendedQuestions';

export const getProfileSpecificQuestions = (language: 'en' | 'es', profileType: ProfileType): Question[] => {
  switch (profileType) {
    case 'idea':
      return getIdeaQuestions(language);
    case 'solo':
      return getSoloQuestions(language);
    case 'team':
      return getTeamQuestions(language);
    default:
      return [];
  }
};

export const getExtendedQuestions = (language: 'en' | 'es', profileType: ProfileType): Question[] => {
  switch (profileType) {
    case 'idea':
      return getExtendedIdeaQuestions(language);
    case 'solo':
      return getExtendedSoloQuestions(language);
    case 'team':
      return getExtendedTeamQuestions(language);
    default:
      return [];
  }
};
