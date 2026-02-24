import { useLanguage } from '@/context/LanguageContext';
import { mapToLegacyLanguage } from '@/utils/languageMapper';

/**
 * Hook that provides backward-compatible language handling
 * Maps new 4-language system to legacy 2-language system
 */
export const useLegacyLanguage = () => {
  const { language, setLanguage, isLoading } = useLanguage();
  
  return {
    language: mapToLegacyLanguage(language),
    originalLanguage: language,
    setLanguage,
    isLoading
  };
};