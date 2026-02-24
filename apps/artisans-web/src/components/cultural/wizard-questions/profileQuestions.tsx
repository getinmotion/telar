import React from 'react';
import { Music, Palette, Drama, BookOpen, Video, Smartphone, Scissors } from 'lucide-react';
import { QuestionConfig } from '../wizard-components/QuestionStep';
import { questionTranslations } from './translations';

export const getProfileQuestions = (language: 'en' | 'es'): Record<string, QuestionConfig> => {
  console.log('getProfileQuestions called with language:', language);
  
  const questions = {
    industry: {
      id: 'industry',
      type: 'radio' as const,
      title: questionTranslations.industry[language].title,
      subtitle: questionTranslations.industry[language].subtitle,
      fieldName: 'industry',
      options: [
        { 
          id: 'music', 
          label: language === 'en' ? 'Music' : 'Música',
          icon: <Music className="w-8 h-8" />
        },
        { 
          id: 'visual-arts', 
          label: language === 'en' ? 'Visual Arts' : 'Artes Visuales',
          icon: <Palette className="w-8 h-8" />
        },
        { 
          id: 'performing-arts', 
          label: language === 'en' ? 'Performing Arts' : 'Artes Escénicas',
          icon: <Drama className="w-8 h-8" />
        },
        { 
          id: 'literature', 
          label: language === 'en' ? 'Literature' : 'Literatura',
          icon: <BookOpen className="w-8 h-8" />
        },
        { 
          id: 'audiovisual', 
          label: language === 'en' ? 'Audiovisual' : 'Audiovisual',
          icon: <Video className="w-8 h-8" />
        },
        { 
          id: 'digital-arts', 
          label: language === 'en' ? 'Digital Arts' : 'Artes Digitales',
          icon: <Smartphone className="w-8 h-8" />
        },
        { 
          id: 'arts-crafts', 
          label: language === 'en' ? 'Arts & Crafts' : 'Artesanías',
          icon: <Scissors className="w-8 h-8" />
        }
      ]
    },
    
    activities: {
      id: 'activities',
      type: 'checkbox' as const,
      title: questionTranslations.activities[language].title,
      subtitle: questionTranslations.activities[language].subtitle,
      fieldName: 'activities',
      options: [
        { id: 'creation', label: language === 'en' ? 'Content Creation' : 'Creación de Contenido' },
        { id: 'performance', label: language === 'en' ? 'Live Performance' : 'Presentaciones en Vivo' },
        { id: 'teaching', label: language === 'en' ? 'Teaching/Workshops' : 'Enseñanza/Talleres' },
        { id: 'collaboration', label: language === 'en' ? 'Collaborations' : 'Colaboraciones' },
        { id: 'production', label: language === 'en' ? 'Production' : 'Producción' }
      ]
    },
    
    experience: {
      id: 'experience',
      type: 'radio' as const,
      title: questionTranslations.experience[language].title,
      subtitle: questionTranslations.experience[language].subtitle,
      fieldName: 'experience',
      options: [
        { id: 'beginner', label: language === 'en' ? 'Beginner (0-2 years)' : 'Principiante (0-2 años)' },
        { id: 'intermediate', label: language === 'en' ? 'Intermediate (3-5 years)' : 'Intermedio (3-5 años)' },
        { id: 'advanced', label: language === 'en' ? 'Advanced (5+ years)' : 'Avanzado (5+ años)' }
      ]
    }
  };
  
  console.log('getProfileQuestions returning:', questions);
  return questions;
};
