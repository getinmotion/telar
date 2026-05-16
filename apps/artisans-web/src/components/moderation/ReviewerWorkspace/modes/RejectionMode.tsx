import React, { useState } from 'react';
import { XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type RejectionReasonType =
  | 'quality_insufficient'
  | 'inconsistent_info'
  | 'policy_violation'
  | 'fraud'
  | 'duplicate'
  | 'invalid_content';

interface RejectionModeProps {
  onReject: (reason: RejectionReasonType, comment: string) => Promise<void>;
  moderating: boolean;
}

const REJECTION_REASONS: { value: RejectionReasonType; label: string; hint: string }[] = [
  {
    value: 'quality_insufficient',
    label: 'Calidad insuficiente',
    hint: 'Imágenes borrosas, descripción muy incompleta o pieza no lista para el marketplace.',
  },
  {
    value: 'inconsistent_info',
    label: 'Información inconsistente',
    hint: 'El nombre, categoría o materiales no corresponden al producto real.',
  },
  {
    value: 'policy_violation',
    label: 'No cumple políticas',
    hint: 'Viola los términos del marketplace (producto prohibido, derechos, etc.).',
  },
  {
    value: 'fraud',
    label: 'Posible fraude',
    hint: 'Producto falso, copiado o de dudosa procedencia.',
  },
  {
    value: 'duplicate',
    label: 'Duplicado grave',
    hint: 'Ya existe esta pieza publicada con información idéntica.',
  },
  {
    value: 'invalid_content',
    label: 'Contenido inválido',
    hint: 'Producto vacío, incompleto o sin relación con artesanías.',
  },
];

export const RejectionMode: React.FC<RejectionModeProps> = ({ onReject, moderating }) => {
  const [selectedReason, setSelectedReason] = useState<RejectionReasonType | null>(null);
  const [comment, setComment] = useState('');

  const canSubmit = selectedReason && comment.trim().length >= 20;

  const handleReject = async () => {
    if (!selectedReason || !comment.trim()) return;
    await onReject(selectedReason, comment.trim());
  };

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
        <p className="text-sm font-medium text-red-800">No disponible para marketplace</p>
        <p className="text-xs text-red-700 mt-0.5">
          Esta pieza necesita ajustes importantes antes de aparecer en el marketplace.
          El artesano recibirá retroalimentación detallada.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Motivo principal</Label>
        <div className="grid grid-cols-1 gap-1.5">
          {REJECTION_REASONS.map(({ value, label, hint }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedReason(value)}
              className={cn(
                'rounded-md border px-3 py-2 text-left text-xs transition-colors',
                selectedReason === value
                  ? 'border-red-300 bg-red-50 ring-1 ring-red-300 text-red-800'
                  : 'border-input bg-card hover:bg-muted/50 text-foreground',
              )}
            >
              <span className="font-medium">{label}</span>
              <span className="block text-[10px] text-muted-foreground mt-0.5">{hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Retroalimentación para el artesano</Label>
        <Textarea
          placeholder="Explica de forma clara y constructiva qué necesita mejorar esta pieza para estar en el marketplace. Mínimo 20 caracteres."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="text-sm"
        />
        <p className="text-[10px] text-muted-foreground">
          {comment.trim().length}/20 caracteres mínimos
        </p>
      </div>

      <Button
        variant="destructive"
        onClick={handleReject}
        disabled={moderating || !canSubmit}
        className="w-full"
      >
        {moderating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <XCircle className="h-4 w-4 mr-2" />
        )}
        Confirmar — no disponible para marketplace
      </Button>
    </div>
  );
};
