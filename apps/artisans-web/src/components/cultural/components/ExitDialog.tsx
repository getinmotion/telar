
import React from 'react';
import { X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ExitDialogProps {
  language: 'en' | 'es';
  onExit: () => void;
}

export const ExitDialog: React.FC<ExitDialogProps> = ({ language, onExit }) => {
  const translations = {
    en: {
      exitTitle: "Exit Assessment",
      exitDescription: "Your progress will be saved and you can continue later. Are you sure you want to exit?",
      saveAndExit: "Save & Exit",
      cancel: "Cancel"
    },
    es: {
      exitTitle: "Salir de la Evaluación", 
      exitDescription: "Tu progreso se guardará y podrás continuar después. ¿Estás seguro que quieres salir?",
      saveAndExit: "Guardar y Salir",
      cancel: "Cancelar"
    }
  };

  const t = translations[language];

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all duration-200">
          <X className="h-5 w-5" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.exitTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.exitDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={onExit}>
            {t.saveAndExit}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
