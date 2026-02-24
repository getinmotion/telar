import React, { useState } from 'react';
import { LanguagePreferencesCard } from './LanguagePreferencesCard';
import { LanguageConfirmationModal } from './LanguageConfirmationModal';
import { type Language } from '@/types/language';
import { useLanguageSystem } from '@/hooks/useLanguageSystem';

export const LanguageSettings: React.FC = () => {
  const { language, setLanguage, isLoading } = useLanguageSystem();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<Language>(language);

  const handleLanguageChangeRequest = (newLanguage: Language) => {
    setPendingLanguage(newLanguage);
    setShowConfirmation(true);
  };

  const handleConfirmLanguageChange = async () => {
    try {
      await setLanguage(pendingLanguage);
      setShowConfirmation(false);
      // Force page reload to apply language changes
      window.location.reload();
    } catch (error) {
      console.error('Error changing language:', error);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <LanguagePreferencesCard />
      
      <LanguageConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmLanguageChange}
        currentLanguage={language}
        newLanguage={pendingLanguage}
        isLoading={isLoading}
      />
    </>
  );
};