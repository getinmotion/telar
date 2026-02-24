
import React from 'react';
import { Lightbulb, Brain } from 'lucide-react';
import { QuestionConfig } from '../wizard-components/QuestionStep';
import { questionTranslations } from './translations';

export const getAnalysisQuestions = (language: 'en' | 'es'): Record<string, QuestionConfig> => {
  return {
    analysisChoice: {
      id: 'analysisChoice',
      type: 'radio',
      title: questionTranslations.analysisChoice[language].title,
      subtitle: questionTranslations.analysisChoice[language].subtitle,
      fieldName: 'analysisPreference',
      options: [
        { 
          id: 'quick', 
          label: language === 'en' ? 'Quick Recommendation' : 'Recomendación Rápida', 
          icon: <Lightbulb className="w-6 h-6 text-indigo-600" /> 
        },
        { 
          id: 'detailed', 
          label: language === 'en' ? 'Detailed Analysis' : 'Análisis Detallado', 
          icon: <Brain className="w-6 h-6 text-purple-600" /> 
        }
      ]
    },
    
    pricingMethod: {
      id: 'pricingMethod',
      type: 'radio',
      title: questionTranslations.pricingMethod[language].title,
      subtitle: questionTranslations.pricingMethod[language].subtitle,
      fieldName: 'pricingMethod',
      options: [
        { id: 'myself', label: language === 'en' ? 'I set my own prices' : 'Yo fijo mis precios' },
        { id: 'client', label: language === 'en' ? 'The client dictates the price' : 'El cliente dicta el precio' },
        { id: 'market', label: language === 'en' ? 'I follow market rates' : 'Sigo las tarifas del mercado' }
      ]
    },
    
    internationalSales: {
      id: 'internationalSales',
      type: 'radio',
      title: questionTranslations.internationalSales[language].title,
      subtitle: questionTranslations.internationalSales[language].subtitle,
      fieldName: 'internationalSales',
      options: [
        { id: 'yes', label: language === 'en' ? 'Yes' : 'Sí' },
        { id: 'no', label: language === 'en' ? 'No' : 'No' },
        { id: 'planning', label: language === 'en' ? 'Planning to' : 'Planeo hacerlo' }
      ]
    },
    
    formalizedBusiness: {
      id: 'formalizedBusiness',
      type: 'radio',
      title: questionTranslations.formalizedBusiness[language].title,
      subtitle: questionTranslations.formalizedBusiness[language].subtitle,
      fieldName: 'formalizedBusiness',
      options: [
        { id: 'yes', label: language === 'en' ? 'Yes' : 'Sí' },
        { id: 'no', label: language === 'en' ? 'No' : 'No' },
        { id: 'in-process', label: language === 'en' ? 'In the process' : 'En proceso' }
      ]
    },
    
    collaboration: {
      id: 'collaboration',
      type: 'radio',
      title: questionTranslations.collaboration[language].title,
      subtitle: questionTranslations.collaboration[language].subtitle,
      fieldName: 'collaboration',
      options: [
        { id: 'yes', label: language === 'en' ? 'Yes, regularly' : 'Sí, regularmente' },
        { id: 'sometimes', label: language === 'en' ? 'Sometimes' : 'A veces' },
        { id: 'no', label: language === 'en' ? 'No' : 'No' }
      ]
    },
    
    economicSustainability: {
      id: 'economicSustainability',
      type: 'radio',
      title: questionTranslations.economicSustainability[language].title,
      subtitle: questionTranslations.economicSustainability[language].subtitle,
      fieldName: 'economicSustainability',
      options: [
        { id: 'yes', label: language === 'en' ? 'Yes' : 'Sí' },
        { id: 'partially', label: language === 'en' ? 'Partially' : 'Parcialmente' },
        { id: 'no', label: language === 'en' ? 'No' : 'No' }
      ]
    }
  };
};
