
import React from 'react';
import { Users, ListTodo, MessageSquare, Smartphone, Check, X } from 'lucide-react';
import { QuestionConfig } from '../wizard-components/QuestionStep';
import { questionTranslations } from './translations';

export const getManagementQuestions = (language: 'en' | 'es'): Record<string, QuestionConfig> => {
  return {
    teamStructure: {
      id: 'teamStructure',
      type: 'radio',
      title: questionTranslations.teamStructure[language].title,
      subtitle: questionTranslations.teamStructure[language].subtitle,
      fieldName: 'teamStructure',
      options: [
        { id: 'alone', label: language === 'en' ? 'Completely alone' : 'Completamente solo/a', icon: <Users className="w-6 h-6 text-blue-500" /> },
        { id: 'occasional', label: language === 'en' ? 'Someone helps me occasionally' : 'Me ayuda alguien a veces', icon: <Users className="w-6 h-6 text-indigo-500" /> },
        { id: 'team', label: language === 'en' ? 'I have someone permanent or a team' : 'Tengo alguien fijo o un equipo', icon: <Users className="w-6 h-6 text-purple-500" /> }
      ]
    },
    
    taskOrganization: {
      id: 'taskOrganization',
      type: 'radio',
      title: questionTranslations.taskOrganization[language].title,
      subtitle: questionTranslations.taskOrganization[language].subtitle,
      fieldName: 'taskOrganization',
      options: [
        { id: 'paper', label: language === 'en' ? 'Paper or memory' : 'Papel o memoria', icon: <ListTodo className="w-6 h-6 text-amber-500" /> },
        { id: 'messaging', label: language === 'en' ? 'WhatsApp' : 'WhatsApp', icon: <MessageSquare className="w-6 h-6 text-green-500" /> },
        { id: 'digital-tools', label: language === 'en' ? 'Digital tools (Notion, Trello, Excel)' : 'Herramientas digitales', icon: <Smartphone className="w-6 h-6 text-indigo-500" /> }
      ]
    },
    
    decisionMaking: {
      id: 'decisionMaking',
      type: 'radio',
      title: questionTranslations.decisionMaking[language].title,
      subtitle: questionTranslations.decisionMaking[language].subtitle,
      fieldName: 'decisionMaking',
      options: [
        { id: 'yes', label: language === 'en' ? 'Yes' : 'Sí', icon: <Check className="w-6 h-6 text-emerald-500" /> },
        { id: 'sometimes', label: language === 'en' ? 'Sometimes' : 'A veces', icon: <Check className="w-6 h-6 text-amber-500" /> },
        { id: 'no', label: language === 'en' ? 'No' : 'No', icon: <X className="w-6 h-6 text-red-500" /> }
      ]
    }
  };
};
