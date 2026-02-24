import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { CheckCircle, XCircle, X, Loader2, Trash2, AlertTriangle } from 'lucide-react';

interface ModerationShopBulkActionsProps {
  selectedCount: number;
  onApproveAll: () => Promise<void>;
  onRejectAll: () => Promise<void>;
  onDeleteAll?: (reason: string) => Promise<void>;
  onClearSelection: () => void;
  isProcessing: boolean;
  progress: number;
  isAdmin?: boolean;
}

export const ModerationShopBulkActions: React.FC<ModerationShopBulkActionsProps> = ({
  selectedCount,
  onApproveAll,
  onRejectAll,
  onDeleteAll,
  onClearSelection,
  isProcessing,
  progress,
  isAdmin = false,
}) => {
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (selectedCount === 0) return null;

  const handleDeleteAll = async () => {
    if (onDeleteAll && deleteReason.trim().length >= 10) {
      await onDeleteAll(deleteReason);
      setDeleteReason('');
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-card border shadow-lg rounded-lg p-4 flex items-center gap-4 min-w-[500px]">
        {isProcessing ? (
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Procesando {selectedCount} tiendas...</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedCount} tienda{selectedCount > 1 ? 's' : ''} seleccionada{selectedCount > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="sm"
                onClick={onApproveAll}
                className="gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Aprobar todas
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={onRejectAll}
                className="gap-1"
              >
                <XCircle className="w-4 h-4" />
                Rechazar todas
              </Button>

              {/* Delete button - Admin only */}
              {isAdmin && onDeleteAll && (
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar todas
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        ¿Eliminar {selectedCount} tiendas?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          Esta acción eliminará permanentemente las {selectedCount} tiendas seleccionadas, 
                          incluyendo todos sus productos, analytics e historial.
                        </p>
                        <p className="font-medium text-destructive">
                          Esta acción NO se puede deshacer.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2 py-4">
                      <Label htmlFor="bulk-delete-reason" className="font-medium">
                        Razón de eliminación (obligatorio, mín. 10 caracteres)
                      </Label>
                      <Textarea
                        id="bulk-delete-reason"
                        placeholder="Explica por qué eliminas estas tiendas..."
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      {deleteReason.length > 0 && deleteReason.length < 10 && (
                        <p className="text-xs text-destructive">
                          Mínimo 10 caracteres ({deleteReason.length}/10)
                        </p>
                      )}
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteAll();
                        }}
                        disabled={deleteReason.trim().length < 10}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sí, Eliminar {selectedCount} Tiendas
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={onClearSelection}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
