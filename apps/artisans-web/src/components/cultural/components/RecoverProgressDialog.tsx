
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RecoverProgressDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  onStartNew: () => void;
  language: 'en' | 'es';
  lastSaveTime?: number;
}

export const RecoverProgressDialog: React.FC<RecoverProgressDialogProps> = ({
  isOpen,
  onContinue,
  onStartNew,
  language,
  lastSaveTime
}) => {
  const translations = {
    en: {
      title: "Continue Previous Assessment",
      description: "We found a previous assessment in progress. Would you like to continue where you left off or start a new assessment?",
      continue: "Continue",
      startNew: "Start New"
    },
    es: {
      title: "Continuar Evaluación Anterior",
      description: "Encontramos una evaluación en progreso. ¿Te gustaría continuar donde lo dejaste o empezar una nueva evaluación?",
      continue: "Continuar",
      startNew: "Empezar Nueva"
    }
  };

  const t = translations[language];

  const formatLastSaveTime = () => {
    if (!lastSaveTime) return '';
    const hours = Math.floor((Date.now() - lastSaveTime) / (1000 * 60 * 60));
    const minutes = Math.floor(((Date.now() - lastSaveTime) % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return language === 'en' 
        ? `(${hours} hour${hours > 1 ? 's' : ''} ago)`
        : `(hace ${hours} hora${hours > 1 ? 's' : ''})`;
    } else {
      return language === 'en'
        ? `(${minutes} minute${minutes > 1 ? 's' : ''} ago)`
        : `(hace ${minutes} minuto${minutes > 1 ? 's' : ''})`;
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.description}
            {lastSaveTime && (
              <span className="block mt-2 text-sm text-muted-foreground">
                {formatLastSaveTime()}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStartNew}>
            {t.startNew}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>
            {t.continue}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
