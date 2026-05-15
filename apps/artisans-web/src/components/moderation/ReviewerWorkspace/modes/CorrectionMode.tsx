import React, { useState, useEffect } from 'react';
import { Edit3, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CorrectionTypeSelector, type CorrectionType, type FieldCorrection } from '../CorrectionTypeSelector';
import { CorrectionSummaryCard } from '../CorrectionSummaryCard';
import type { ModerationProduct } from '@/hooks/useProductModeration';

interface CorrectionModeProps {
  product: ModerationProduct;
  onApproveWithEdits: (
    edits: Record<string, unknown>,
    corrections: FieldCorrection[],
    comment?: string,
  ) => Promise<void>;
  moderating: boolean;
}

interface EditState {
  name: string;
  shortDescription: string;
  description: string;
  category: string;
}

const FIELD_LABELS: Record<keyof EditState, string> = {
  name: 'Nombre',
  shortDescription: 'Descripción corta',
  description: 'Historia / descripción larga',
  category: 'Categoría',
};

const DEFAULT_CORRECTION_TYPES: Record<keyof EditState, CorrectionType> = {
  name: 'minor',
  shortDescription: 'minor',
  description: 'minor',
  category: 'medium',
};

export const CorrectionMode: React.FC<CorrectionModeProps> = ({
  product,
  onApproveWithEdits,
  moderating,
}) => {
  const [edits, setEdits] = useState<EditState>({
    name: product.name ?? '',
    shortDescription: product.short_description ?? '',
    description: product.description ?? '',
    category: product.category ?? '',
  });

  const [correctionTypes, setCorrectionTypes] = useState<Record<keyof EditState, CorrectionType>>(
    { ...DEFAULT_CORRECTION_TYPES },
  );

  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    setEdits({
      name: product.name ?? '',
      shortDescription: product.short_description ?? '',
      description: product.description ?? '',
      category: product.category ?? '',
    });
    setCorrectionTypes({ ...DEFAULT_CORRECTION_TYPES });
    setShowSummary(false);
  }, [product.id]);

  const changedFields = (Object.keys(edits) as (keyof EditState)[]).filter((key) => {
    const original = key === 'description'
      ? (product.description ?? '')
      : key === 'shortDescription'
        ? (product.short_description ?? '')
        : (product[key as 'name' | 'category'] ?? '');
    return edits[key].trim() !== String(original).trim();
  });

  const corrections: FieldCorrection[] = changedFields.map((field) => {
    const original = field === 'description'
      ? (product.description ?? '')
      : field === 'shortDescription'
        ? (product.short_description ?? '')
        : (product[field as 'name' | 'category'] ?? '');
    return {
      field,
      fieldLabel: FIELD_LABELS[field],
      type: correctionTypes[field],
      oldValue: String(original),
      newValue: edits[field],
    };
  });

  const hasChanges = changedFields.length > 0;

  const handleConfirm = async () => {
    const editMap: Record<string, unknown> = {};
    changedFields.forEach((f) => {
      if (f === 'description') editMap.history = edits[f];
      else editMap[f] = edits[f];
    });

    const correctionMeta = { corrections };
    await onApproveWithEdits(editMap, corrections, undefined);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
        <p className="text-sm font-medium text-teal-800">Corrección asistida</p>
        <p className="text-xs text-teal-700 mt-0.5">
          Edita campos sin rechazar la pieza. Se aprobará con el estado "Ajustado por el equipo TELAR".
        </p>
      </div>

      {/* Editable fields */}
      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">{FIELD_LABELS.name}</Label>
          <Input
            value={edits.name}
            onChange={(e) => setEdits((p) => ({ ...p, name: e.target.value }))}
            className="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">{FIELD_LABELS.shortDescription}</Label>
          <Textarea
            value={edits.shortDescription}
            onChange={(e) => setEdits((p) => ({ ...p, shortDescription: e.target.value }))}
            rows={2}
            className="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">{FIELD_LABELS.description}</Label>
          <Textarea
            value={edits.description}
            onChange={(e) => setEdits((p) => ({ ...p, description: e.target.value }))}
            rows={3}
            className="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">{FIELD_LABELS.category}</Label>
          <Input
            value={edits.category}
            onChange={(e) => setEdits((p) => ({ ...p, category: e.target.value }))}
            className="text-sm"
          />
        </div>
      </div>

      {/* Correction type selectors for changed fields */}
      {hasChanges && (
        <div className="space-y-2">
          <p className="text-xs font-semibold">Tipifica cada cambio</p>
          {corrections.map((c) => (
            <CorrectionTypeSelector
              key={c.field}
              field={c.field}
              fieldLabel={c.fieldLabel}
              oldValue={c.oldValue}
              newValue={c.newValue}
              currentType={correctionTypes[c.field as keyof EditState]}
              onChange={(type) =>
                setCorrectionTypes((p) => ({ ...p, [c.field]: type }))
              }
            />
          ))}
        </div>
      )}

      {/* Summary preview */}
      {hasChanges && showSummary && (
        <CorrectionSummaryCard corrections={corrections} />
      )}

      <div className="flex gap-2">
        {hasChanges && !showSummary && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSummary(true)}
            className="flex-1 text-xs"
          >
            Ver resumen de cambios
          </Button>
        )}
        {hasChanges && showSummary && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSummary(false)}
            className="flex-1 text-xs"
          >
            Ocultar resumen
          </Button>
        )}
      </div>

      <Button
        onClick={handleConfirm}
        disabled={moderating || !hasChanges}
        className="w-full bg-teal-600 hover:bg-teal-700"
      >
        {moderating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4 mr-2" />
        )}
        {hasChanges
          ? `Aprobar con ${corrections.length} ajuste${corrections.length !== 1 ? 's' : ''}`
          : 'Sin cambios todavía'}
      </Button>
    </div>
  );
};
