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
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { AgentTask } from '@/hooks/types/agentTaskTypes';

interface DeleteTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  task: AgentTask | null;
  language: 'en' | 'es';
}

export const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  task,
  language
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const t = {
    en: {
      title: 'Delete Task',
      description: 'Are you sure you want to delete this task? This action cannot be undone.',
      taskTitle: 'Task:',
      warning: 'All progress, subtasks, and notes will be permanently lost.',
      cancel: 'Cancel',
      confirm: 'Delete Task',
      deleting: 'Deleting...'
    },
    es: {
      title: 'Eliminar Tarea',
      description: '¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.',
      taskTitle: 'Tarea:',
      warning: 'Todo el progreso, subtareas y notas se perderán permanentemente.',
      cancel: 'Cancelar',
      confirm: 'Eliminar Tarea',
      deleting: 'Eliminando...'
    }
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
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
            {task && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium text-foreground">
                  {t[language].taskTitle} <span className="font-semibold">{task.title}</span>
                </p>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {task.description}
                  </p>
                )}
              </div>
            )}
            <p className="text-destructive font-medium text-sm">{t[language].warning}</p>
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