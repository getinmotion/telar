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

interface Props {
  open: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  usageCount?: number;
  countLabel?: string;
}

export function TaxonomyDeleteConfirm({ open, itemName, onConfirm, onCancel, loading, usageCount, countLabel = 'elementos' }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar "{itemName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El término será eliminado permanentemente de la base de datos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {(usageCount ?? 0) > 0 && (
          <div style={{
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.4)',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <p style={{ margin: 0, fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
              <strong>{usageCount} {countLabel.toLowerCase()}</strong> están vinculados a este término.
              Al eliminarlo, perderán esta taxonomía.
            </p>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={onConfirm}
            style={{ background: '#dc2626', color: '#fff' }}
          >
            {loading ? 'Eliminando…' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
