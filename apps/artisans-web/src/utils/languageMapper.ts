import { type Language } from '@/types/language';

/**
 * Maps the new 4-language system to existing 2-language system for backward compatibility
 */
export const mapToLegacyLanguage = (language: Language): 'es' | 'en' => {
  switch (language) {
    case 'en':
      return 'en';
    case 'es':
    case 'pt':
    case 'fr':
    default:
      return 'es'; // Default to Spanish for Portuguese, French, and fallback
  }
};

/**
 * Safe language getter for components that still use the old type system
 */
export const getLegacyLanguage = (language: Language | 'es' | 'en'): 'es' | 'en' => {
  if (language === 'en' || language === 'es') {
    return language;
  }
  return mapToLegacyLanguage(language as Language);
};

/**
 * Check if a language is supported by the legacy translation system
 */
export const isLegacyLanguageSupported = (language: string): language is 'es' | 'en' => {
  return language === 'es' || language === 'en';
};