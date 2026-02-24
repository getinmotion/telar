import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type Language, getLanguageConfig } from '@/types/language';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onLanguageSelect: (language: Language) => Promise<void>;
}

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  isOpen,
  onLanguageSelect
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('es');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await onLanguageSelect(selectedLanguage);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌍 Textos siempre en español según instrucciones
  const welcomeText = {
    welcome: "¡Bienvenido/a! 👋",
    question: "¿En qué idioma prefieres usar la plataforma?",
    continue: "Continuar"
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {welcomeText.welcome}
          </DialogTitle>
          <p className="text-muted-foreground">
            {welcomeText.question}
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {SUPPORTED_LANGUAGES.map((language) => (
            <Card
              key={language.code}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedLanguage === language.code
                  ? 'ring-2 ring-primary bg-primary-subtle'
                  : 'hover:bg-accent/50'
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

        <Button 
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full mt-6"
          size="lg"
        >
          {isLoading ? "..." : welcomeText.continue}
        </Button>
      </DialogContent>
    </Dialog>
  );
};