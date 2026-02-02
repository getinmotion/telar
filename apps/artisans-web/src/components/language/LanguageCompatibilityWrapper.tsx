import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { mapToLegacyLanguage } from '@/utils/languageMapper';

interface LanguageCompatibilityWrapperProps {
  children: (mappedLanguage: 'es' | 'en') => React.ReactNode;
}

/**
 * Wrapper component that provides legacy language compatibility
 * Maps new 4-language system to old 2-language system
 */
export const LanguageCompatibilityWrapper: React.FC<LanguageCompatibilityWrapperProps> = ({ children }) => {
  const { language } = useLanguage();
  const mappedLanguage = mapToLegacyLanguage(language);
  
  return <>{children(mappedLanguage)}</>;
};