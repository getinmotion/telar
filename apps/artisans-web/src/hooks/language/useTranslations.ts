import { getTranslations, getTranslation, type Translations } from '@/translations';
import { useLanguage } from '@/context/LanguageContext';

export function useTranslations() {
  const { language } = useLanguage();
  
  return {
    t: getTranslations(),
    language,
    getText: (path: string, fallback?: string) => getTranslation(path, fallback)
  };
}

export type UseTranslationsReturn = {
  t: Translations;
  language: string;
  getText: (path: string, fallback?: string) => string;
};