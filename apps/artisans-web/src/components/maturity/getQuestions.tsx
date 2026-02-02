
import React from 'react';
import { Lightbulb, User, Users } from 'lucide-react';
import { Question, Language, ProfileType } from './types';

export const getQuestions = (language: Language, profileType?: ProfileType): Question[] => {
  // Common questions for all profiles
  const commonQuestions = {
    en: [
      {
        id: 'vision',
        question: 'How clear is your project vision?',
        type: 'radio' as const,
        category: 'ideaValidation' as const,
        options: [
          { id: 'vision-1', text: 'Just starting to form ideas', value: 1, icon: <Lightbulb size={20} /> },
          { id: 'vision-2', text: 'I have a general direction', value: 2, icon: <Lightbulb size={20} /> },
          { id: 'vision-3', text: 'Very clear and documented', value: 3, icon: <Lightbulb size={20} /> }
        ]
      },
      {
        id: 'audience',
        question: 'How well do you know your audience?',
        type: 'radio' as const,
        category: 'marketFit' as const,
        options: [
          { id: 'audience-1', text: 'Not sure who they are yet', value: 1, icon: <User size={20} /> },
          { id: 'audience-2', text: 'Have a general idea', value: 2, icon: <User size={20} /> },
          { id: 'audience-3', text: 'Clear understanding with data', value: 3, icon: <Users size={20} /> }
        ]
      }
    ],
    es: [
      {
        id: 'vision',
        question: '¿Qué tan clara es la visión de tu proyecto?',
        type: 'radio' as const,
        category: 'ideaValidation' as const,
        options: [
          { id: 'vision-1', text: 'Recién empiezo a formar ideas', value: 1, icon: <Lightbulb size={20} /> },
          { id: 'vision-2', text: 'Tengo una dirección general', value: 2, icon: <Lightbulb size={20} /> },
          { id: 'vision-3', text: 'Muy clara y documentada', value: 3, icon: <Lightbulb size={20} /> }
        ]
      },
      {
        id: 'audience',
        question: '¿Qué tan bien conoces a tu audiencia?',
        type: 'radio' as const,
        category: 'marketFit' as const,
        options: [
          { id: 'audience-1', text: 'Aún no estoy seguro/a quiénes son', value: 1, icon: <User size={20} /> },
          { id: 'audience-2', text: 'Tengo una idea general', value: 2, icon: <User size={20} /> },
          { id: 'audience-3', text: 'Entendimiento claro con datos', value: 3, icon: <Users size={20} /> }
        ]
      }
    ]
  };

  // Profile-specific questions
  const profileQuestions = {
    idea: {
      en: [
        {
          id: 'research',
          question: 'Have you done market research?',
          type: 'radio' as const,
          category: 'ideaValidation' as const,
          options: [
            { id: 'research-1', text: 'Not yet', value: 1, icon: undefined },
            { id: 'research-2', text: 'Some basic research', value: 2, icon: undefined },
            { id: 'research-3', text: 'Extensive research', value: 3, icon: undefined }
          ]
        }
      ],
      es: [
        {
          id: 'research',
          question: '¿Has realizado investigación de mercado?',
          type: 'radio' as const,
          category: 'ideaValidation' as const,
          options: [
            { id: 'research-1', text: 'Todavía no', value: 1, icon: undefined },
            { id: 'research-2', text: 'Algo de investigación básica', value: 2, icon: undefined },
            { id: 'research-3', text: 'Investigación extensa', value: 3, icon: undefined }
          ]
        }
      ]
    },
    solo: {
      en: [
        {
          id: 'processes',
          question: 'Do you have defined workflows?',
          type: 'radio' as const,
          category: 'userExperience' as const,
          options: [
            { id: 'processes-1', text: 'Ad-hoc as I go', value: 1, icon: undefined },
            { id: 'processes-2', text: 'Some processes defined', value: 2, icon: undefined },
            { id: 'processes-3', text: 'Well-documented processes', value: 3, icon: undefined }
          ]
        }
      ],
      es: [
        {
          id: 'processes',
          question: '¿Tienes flujos de trabajo definidos?',
          type: 'radio' as const,
          category: 'userExperience' as const,
          options: [
            { id: 'processes-1', text: 'Improvisados sobre la marcha', value: 1, icon: undefined },
            { id: 'processes-2', text: 'Algunos procesos definidos', value: 2, icon: undefined },
            { id: 'processes-3', text: 'Procesos bien documentados', value: 3, icon: undefined }
          ]
        }
      ]
    },
    team: {
      en: [
        {
          id: 'team',
          question: 'How organized is your team?',
          type: 'radio' as const,
          category: 'userExperience' as const,
          options: [
            { id: 'team-1', text: "We're figuring it out", value: 1, icon: undefined },
            { id: 'team-2', text: 'Some structure but could improve', value: 2, icon: undefined },
            { id: 'team-3', text: 'Clear roles and responsibilities', value: 3, icon: undefined }
          ]
        }
      ],
      es: [
        {
          id: 'team',
          question: '¿Qué tan organizado está tu equipo?',
          type: 'radio' as const,
          category: 'userExperience' as const,
          options: [
            { id: 'team-1', text: 'Estamos resolviéndolo', value: 1, icon: undefined },
            { id: 'team-2', text: 'Algo de estructura pero podríamos mejorar', value: 2, icon: undefined },
            { id: 'team-3', text: 'Roles y responsabilidades claras', value: 3, icon: undefined }
          ]
        }
      ]
    }
  };

  // Combine common questions with profile-specific questions if a profile type is provided
  let questions: Question[] = [...commonQuestions[language]];
  
  if (profileType && profileQuestions[profileType]) {
    questions = [...questions, ...profileQuestions[profileType][language]] as Question[];
  }

  return questions;
};
