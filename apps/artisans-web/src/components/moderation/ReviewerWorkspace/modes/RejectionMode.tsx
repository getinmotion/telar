import React, { useState } from 'react';
import { XCircle, Loader2, AlertTriangle } from 'lucide-react';
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

const REJECTION_REASONS: {
  value: RejectionReasonType;
  label: string;
  hint: string;
  severity: 'high' | 'medium';
}[] = [
  {
    value: 'quality_insufficient',
    label: 'Calidad insuficiente',
    hint: 'Imágenes borrosas, descripción muy incompleta o pieza no lista para el marketplace.',
    severity: 'medium',
  },
  {
    value: 'inconsistent_info',
    label: 'Información inconsistente',
    hint: 'El nombre, categoría o materiales no corresponden al producto real.',
    severity: 'medium',
  },
  {
    value: 'policy_violation',
    label: 'No cumple políticas',
    hint: 'Viola los términos del marketplace (producto prohibido, derechos, etc.).',
    severity: 'high',
  },
  {
    value: 'fraud',
    label: 'Posible fraude',
    hint: 'Producto falso, copiado o de dudosa procedencia.',
    severity: 'high',
  },
  {
    value: 'duplicate',
    label: 'Duplicado grave',
    hint: 'Ya existe esta pieza publicada con información idéntica.',
    severity: 'medium',
  },
  {
    value: 'invalid_content',
    label: 'Contenido inválido',
    hint: 'Producto vacío, incompleto o sin relación con artesanías.',
    severity: 'medium',
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
    <div className="flex flex-col min-h-full">
      {/* Header de advertencia */}
      <div className="flex items-start gap-3 border-b border-red-200 bg-red-700 px-5 py-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
          <AlertTriangle className="h-5 w-5 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">No disponible para el marketplace</p>
          <p className="text-xs text-red-100 mt-0.5">
            Acción permanente. El artesano recibirá tu retroalimentación por correo.
          </p>
        </div>
      </div>

      {/* Motivos */}
      <div className="flex-1 space-y-4 p-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-red-900 uppercase tracking-wide">
            Motivo principal
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {REJECTION_REASONS.map(({ value, label, hint, severity }) => {
              const isSelected = selectedReason === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedReason(value)}
                  className={cn(
                    'rounded-xl border-2 px-4 py-3 text-left transition-all',
                    isSelected
                      ? severity === 'high'
                        ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                        : 'border-red-400 bg-red-50 ring-2 ring-red-100'
                      : 'border-gray-200 bg-white hover:border-red-200 hover:bg-red-50/40',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'text-sm font-semibold',
                      isSelected ? 'text-red-800' : 'text-gray-700',
                    )}>
                      {label}
                    </span>
                    {severity === 'high' && (
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold',
                        isSelected ? 'bg-red-200 text-red-800' : 'bg-gray-100 text-gray-500',
                      )}>
                        GRAVE
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    'text-xs mt-0.5 leading-relaxed',
                    isSelected ? 'text-red-600' : 'text-gray-500',
                  )}>
                    {hint}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Retroalimentación */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-red-900 uppercase tracking-wide">
              Retroalimentación al artesano
            </Label>
            <span className={cn(
              'text-[10px] font-medium',
              comment.trim().length >= 20 ? 'text-red-500' : 'text-gray-400',
            )}>
              {comment.trim().length}/20 mín.
            </span>
          </div>
          <Textarea
            placeholder="Explica de forma clara y constructiva qué necesita mejorar esta pieza para estar en el marketplace."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="text-sm bg-white border-red-200 focus-visible:ring-red-400 resize-none"
          />
        </div>
      </div>

      {/* CTA con peso visual fuerte */}
      <div className="border-t-2 border-red-200 bg-red-50 p-5 space-y-2">
        {selectedReason && (
          <p className="text-center text-xs text-red-600 font-medium">
            Motivo seleccionado: <span className="font-bold">
              {REJECTION_REASONS.find(r => r.value === selectedReason)?.label}
            </span>
          </p>
        )}
        <Button
          onClick={handleReject}
          disabled={moderating || !canSubmit}
          className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-40"
        >
          {moderating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          Confirmar — no publicar esta pieza
        </Button>
      </div>
    </div>
  );
};
