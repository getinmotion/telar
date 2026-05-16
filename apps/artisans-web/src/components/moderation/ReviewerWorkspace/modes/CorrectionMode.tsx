import React, { useState, useEffect } from 'react';
import { Edit3, Loader2, CheckCircle, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
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

function FieldRow({
  label,
  changed,
  children,
}: {
  label: string;
  changed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      'rounded-lg border p-3 transition-colors',
      changed
        ? 'border-blue-300 bg-white ring-1 ring-blue-200'
        : 'border-blue-100/70 bg-white/60',
    )}>
      <div className="flex items-center justify-between mb-1.5">
        <Label className="text-xs font-semibold text-blue-900 uppercase tracking-wide">{label}</Label>
        {changed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            <Pencil className="h-2.5 w-2.5" />
            Modificado
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

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
    const original =
      key === 'description'
        ? (product.description ?? '')
        : key === 'shortDescription'
          ? (product.short_description ?? '')
          : (product[key as 'name' | 'category'] ?? '');
    return edits[key].trim() !== String(original).trim();
  });

  const corrections: FieldCorrection[] = changedFields.map((field) => {
    const original =
      field === 'description'
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
    await onApproveWithEdits(editMap, corrections, undefined);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header editorial */}
      <div className="flex items-start gap-3 border-b border-blue-100 bg-blue-600 px-5 py-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
          <Edit3 className="h-5 w-5 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Corrección asistida</p>
          <p className="text-xs text-blue-100 mt-0.5">
            Edita los campos necesarios. La pieza se aprobará como "Ajustado por TELAR".
          </p>
        </div>
        {hasChanges && (
          <span className="ml-auto flex-shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white">
            {corrections.length} cambio{corrections.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Campos editables */}
      <div className="flex-1 space-y-3 p-4">
        <FieldRow label={FIELD_LABELS.name} changed={changedFields.includes('name')}>
          <Input
            value={edits.name}
            onChange={(e) => setEdits((p) => ({ ...p, name: e.target.value }))}
            className="text-sm border-0 bg-transparent p-0 h-auto focus-visible:ring-0 font-medium"
          />
        </FieldRow>

        <FieldRow label={FIELD_LABELS.shortDescription} changed={changedFields.includes('shortDescription')}>
          <Textarea
            value={edits.shortDescription}
            onChange={(e) => setEdits((p) => ({ ...p, shortDescription: e.target.value }))}
            rows={2}
            className="text-sm border-0 bg-transparent p-0 resize-none focus-visible:ring-0"
          />
        </FieldRow>

        <FieldRow label={FIELD_LABELS.description} changed={changedFields.includes('description')}>
          <Textarea
            value={edits.description}
            onChange={(e) => setEdits((p) => ({ ...p, description: e.target.value }))}
            rows={4}
            className="text-sm border-0 bg-transparent p-0 resize-none focus-visible:ring-0"
          />
        </FieldRow>

        <FieldRow label={FIELD_LABELS.category} changed={changedFields.includes('category')}>
          <Input
            value={edits.category}
            onChange={(e) => setEdits((p) => ({ ...p, category: e.target.value }))}
            className="text-sm border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
          />
        </FieldRow>

        {/* Tipificación de cambios */}
        {hasChanges && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
              Tipifica cada cambio
            </p>
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

        {hasChanges && showSummary && (
          <CorrectionSummaryCard corrections={corrections} />
        )}

        {hasChanges && (
          <button
            type="button"
            onClick={() => setShowSummary((v) => !v)}
            className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2"
          >
            {showSummary ? 'Ocultar resumen' : 'Ver resumen de cambios'}
          </button>
        )}
      </div>

      {/* CTA */}
      <div className="border-t border-blue-100 bg-blue-50/80 p-5">
        <Button
          onClick={handleConfirm}
          disabled={moderating || !hasChanges}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-40"
        >
          {moderating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          {hasChanges
            ? `Aprobar con ${corrections.length} ajuste${corrections.length !== 1 ? 's' : ''}`
            : 'Edita al menos un campo para continuar'}
        </Button>
      </div>
    </div>
  );
};
