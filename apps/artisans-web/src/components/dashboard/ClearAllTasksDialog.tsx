
import React, { useState } from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface ClearAllTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  taskCount: number;
  language: 'en' | 'es';
}

export const ClearAllTasksDialog: React.FC<ClearAllTasksDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskCount,
  language
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const t = {
    en: {
      title: 'Delete All Tasks',
      description: `Are you sure you want to delete all ${taskCount} tasks? This action cannot be undone.`,
      warning: 'This will permanently delete all your tasks, including completed ones.',
      cancel: 'Cancel',
      confirm: 'Delete All Tasks',
      deleting: 'Deleting...'
    },
    es: {
      title: 'Eliminar Todas las Tareas',
      description: `¿Estás seguro de que quieres eliminar todas las ${taskCount} tareas? Esta acción no se puede deshacer.`,
      warning: 'Esto eliminará permanentemente todas tus tareas, incluyendo las completadas.',
      cancel: 'Cancelar',
      confirm: 'Eliminar Todas las Tareas',
      deleting: 'Eliminando...'
    }
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting tasks:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {t[language].title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{t[language].description}</p>
            <p className="text-destructive font-medium">{t[language].warning}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t[language].cancel}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t[language].deleting}
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                {t[language].confirm}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
