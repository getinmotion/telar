import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type Language, getLanguageConfig } from '@/types/language';
import { useLanguage } from '@/context/LanguageContext';

interface LanguageSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSwitcherModal: React.FC<LanguageSwitcherModalProps> = ({
  isOpen,
  onClose
}) => {
  const { language: currentLanguage, setLanguage, isLoading } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage);
  const [isSaving, setIsSaving] = useState(false);

  const handleLanguageChange = async () => {
    if (selectedLanguage === currentLanguage) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await setLanguage(selectedLanguage);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedLanguage(currentLanguage); // Reset selection
    onClose();
  };

  // Get texts for current selected language for the modal interface
  const getModalTexts = (lang: Language) => {
    const texts = {
      es: {
        title: "Seleccionar Idioma",
        subtitle: "Elige tu idioma preferido para usar la plataforma",
        cancel: "Cancelar",
        confirm: "Confirmar"
      },
      en: {
        title: "Select Language", 
        subtitle: "Choose your preferred language for using the platform",
        cancel: "Cancel",
        confirm: "Confirm"
      },
      pt: {
        title: "Selecionar Idioma",
        subtitle: "Escolha seu idioma preferido para usar a plataforma", 
        cancel: "Cancelar",
        confirm: "Confirmar"
      },
      fr: {
        title: "Sélectionner la Langue",
        subtitle: "Choisissez votre langue préférée pour utiliser la plateforme",
        cancel: "Annuler", 
        confirm: "Confirmer"
      }
    };
    return texts[lang];
  };

  const modalTexts = getModalTexts(selectedLanguage);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute -top-2 -right-2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {modalTexts.title}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            {modalTexts.subtitle}
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {SUPPORTED_LANGUAGES.map((language) => (
            <Card
              key={language.code}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedLanguage === language.code
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-accent/30'
              }`}
              onClick={() => setSelectedLanguage(language.code)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{language.flag}</span>
                  <div>
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-sm text-muted-foreground">{language.name}</div>
                  </div>
                </div>
                {selectedLanguage === language.code && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline" 
            onClick={handleClose}
            disabled={isSaving}
            className="flex-1"
          >
            {modalTexts.cancel}
          </Button>
          <Button 
            onClick={handleLanguageChange}
            disabled={isSaving || isLoading}
            className="flex-1"
          >
            {isSaving ? "..." : modalTexts.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};