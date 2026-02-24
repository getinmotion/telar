import React, { createContext, useContext, ReactNode } from 'react';
import { useLanguageSystem } from '@/hooks/useLanguageSystem';
import { LanguageSelectionModal } from '@/components/language/LanguageSelectionModal';
import { type Language } from '@/types/language';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { 
    language, 
    setLanguage, 
    isLoading, 
    needsLanguageSelection 
  } = useLanguageSystem();

  // ✅ Siempre renderizar - el idioma tiene un valor por defecto
  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading }}>
      <LanguageSelectionModal
        isOpen={needsLanguageSelection}
        onLanguageSelect={setLanguage}
      />
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};