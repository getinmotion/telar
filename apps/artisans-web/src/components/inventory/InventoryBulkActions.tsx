import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import { Eye, EyeOff, Trash2, X, Loader2, AlertTriangle } from 'lucide-react';

const SANS = "'Manrope', sans-serif";

interface InventoryBulkActionsProps {
  selectedCount: number;
  onDeleteAll: () => Promise<void>;
  onActivateAll: () => Promise<void>;
  onDeactivateAll: () => Promise<void>;
  onClearSelection: () => void;
  isProcessing: boolean;
  progress: number;
}

export const InventoryBulkActions: React.FC<InventoryBulkActionsProps> = ({
  selectedCount,
  onDeleteAll,
  onActivateAll,
  onDeactivateAll,
  onClearSelection,
  isProcessing,
  progress,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
        style={{
          background: 'rgba(21,27,45,0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          minWidth: 420,
        }}
      >
        {isProcessing ? (
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2" style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
              <span>Procesando {selectedCount} productos...</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        ) : (
          <>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
              {selectedCount} producto{selectedCount > 1 ? 's' : ''}
            </span>

            <div className="w-px h-5 bg-white/10 mx-1" />

            <div className="flex items-center gap-2">
              <button
                onClick={onActivateAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', color: '#4ade80', fontFamily: SANS, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                <Eye className="w-3.5 h-3.5" />
                Activar
              </button>

              <button
                onClick={onDeactivateAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: SANS, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                <EyeOff className="w-3.5 h-3.5" />
                Desactivar
              </button>

              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:opacity-90"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontFamily: SANS, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      ¿Eliminar {selectedCount} producto{selectedCount > 1 ? 's' : ''}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará permanentemente los {selectedCount} productos seleccionados. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        onDeleteAll();
                        setIsDeleteDialogOpen(false);
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar {selectedCount} producto{selectedCount > 1 ? 's' : ''}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <button
              onClick={onClearSelection}
              className="ml-1 p-1.5 rounded-full hover:bg-white/10 transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', background: 'none', border: 'none' }}
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
