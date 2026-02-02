import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getCompatibleLanguage } from '@/utils/languageCompatibility';
import { type Language } from '@/types/language';

interface LanguageAwareComponentProps<T> {
  component: React.ComponentType<T & { language: 'es' | 'en' }>;
  componentProps: T;
}

// Wrapper component to handle language compatibility
export function LanguageAwareComponent<T>({ 
  component: Component, 
  componentProps 
}: LanguageAwareComponentProps<T>) {
  const { language } = useLanguage();
  const compatibleLanguage = getCompatibleLanguage(language);
  
  return <Component {...componentProps} language={compatibleLanguage} />;
}