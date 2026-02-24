import { type Language } from '@/types/language';

// Utility to handle language compatibility with existing components
export const normalizeLanguage = (language: Language): 'es' | 'en' => {
  // For now, map all non-Spanish languages to English
  // This can be expanded later as translations are added
  return language === 'es' ? 'es' : 'en';
};

// Fallback language mapping for components that only support es/en
export const getCompatibleLanguage = (language: Language): 'es' | 'en' => {
  const mapping: Record<Language, 'es' | 'en'> = {
    'es': 'es',
    'en': 'en', 
    'pt': 'es', // Portuguese maps to Spanish for now (similar language)
    'fr': 'en'  // French maps to English for now
  };
  
  return mapping[language] || 'es';
};