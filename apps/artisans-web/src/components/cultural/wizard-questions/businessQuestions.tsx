
import React from 'react';
import { DollarSign, CreditCard, BadgeCheck, Calculator } from 'lucide-react';
import { QuestionConfig } from '../wizard-components/QuestionStep';
import { questionTranslations } from './translations';

export const getBusinessQuestions = (language: 'en' | 'es'): Record<string, QuestionConfig> => {
  return {
    paymentMethods: {
      id: 'paymentMethods',
      type: 'checkbox',
      title: questionTranslations.paymentMethods[language].title,
      subtitle: questionTranslations.paymentMethods[language].subtitle,
      fieldName: 'paymentMethods',
      options: [
        { id: 'cash-or-transfer', label: language === 'en' ? 'Cash or bank transfers only' : 'Solo efectivo o transferencias', icon: <DollarSign className="w-6 h-6 text-blue-500" /> },
        { id: 'digital-platforms', label: language === 'en' ? 'Digital platforms' : 'Plataformas digitales', icon: <CreditCard className="w-6 h-6 text-indigo-500" /> },
        { id: 'billing-system', label: language === 'en' ? 'I have a billing system' : 'Tengo sistema de facturación', icon: <CreditCard className="w-6 h-6 text-purple-500" /> },
        { id: 'managed-by-others', label: language === 'en' ? 'Others manage payments for me' : 'Cobran otros por mí', icon: <CreditCard className="w-6 h-6 text-violet-500" /> }
      ]
    },
    
    brandIdentity: {
      id: 'brandIdentity',
      type: 'radio',
      title: questionTranslations.brandIdentity[language].title,
      subtitle: questionTranslations.brandIdentity[language].subtitle,
      fieldName: 'brandIdentity',
      options: [
        { id: 'yes', label: language === 'en' ? 'Yes, completely' : 'Sí, totalmente', icon: <BadgeCheck className="w-6 h-6 text-emerald-500" /> },
        { id: 'somewhat', label: language === 'en' ? 'I have something' : 'Algo tengo', icon: <BadgeCheck className="w-6 h-6 text-amber-500" /> },
        { id: 'no', label: language === 'en' ? 'No, I use whatever works' : 'No, uso lo que sale', icon: <BadgeCheck className="w-6 h-6 text-gray-400" /> }
      ]
    },
    
    financialControl: {
      id: 'financialControl',
      type: 'radio',
      title: questionTranslations.financialControl[language].title,
      subtitle: questionTranslations.financialControl[language].subtitle,
      fieldName: 'financialControl',
      options: [
        { id: 'detailed', label: language === 'en' ? 'Yes, detailed' : 'Sí, detallado', icon: <Calculator className="w-6 h-6 text-emerald-500" /> },
        { id: 'somewhat', label: language === 'en' ? 'More or less' : 'Más o menos', icon: <Calculator className="w-6 h-6 text-amber-500" /> },
        { id: 'intuition', label: language === 'en' ? 'I go by intuition' : 'Me guío por intuición', icon: <Calculator className="w-6 h-6 text-gray-400" /> }
      ]
    }
  };
};
