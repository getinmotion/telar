import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SANS, SERIF } from '@/components/dashboard/dashboardStyles';
import { CorrectionTypeSelector, type CorrectionType, type FieldCorrection } from '../CorrectionTypeSelector';
import { CorrectionSummaryCard } from '../CorrectionSummaryCard';
import type { ModerationProduct } from '@/hooks/useProductModeration';

const C = '#2563eb';
const rgba = (a: number) => `rgba(37,99,235,${a})`;

interface CorrectionModeProps {
  product: ModerationProduct;
  onApproveWithEdits: (edits: Record<string, unknown>, corrections: FieldCorrection[], comment?: string) => Promise<void>;
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

function FieldRow({ label, changed, children }: { label: string; changed: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: 10, border: changed ? `1.5px solid ${rgba(0.4)}` : `1px solid ${rgba(0.12)}`,
      background: changed ? 'white' : rgba(0.02),
      padding: 12, transition: 'all 0.15s',
      ...(changed ? { boxShadow: `0 0 0 3px ${rgba(0.08)}` } : {}),
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: changed ? C : 'rgba(84,67,62,0.5)' }}>{label}</label>
        {changed && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, borderRadius: 9999, background: rgba(0.08), border: `1px solid ${rgba(0.2)}`, padding: '1px 8px', fontFamily: SANS, fontSize: 10, fontWeight: 700, color: C }}>
            <span className="material-symbols-outlined" style={{ fontSize: 11 }}>edit</span>
            Modificado
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export const CorrectionMode: React.FC<CorrectionModeProps> = ({ product, onApproveWithEdits, moderating }) => {
  const [edits, setEdits] = useState<EditState>({
    name: product.name ?? '',
    shortDescription: product.short_description ?? '',
    description: product.description ?? '',
    category: product.category ?? '',
  });

  const [correctionTypes, setCorrectionTypes] = useState<Record<keyof EditState, CorrectionType>>({ ...DEFAULT_CORRECTION_TYPES });
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
    const original = key === 'description' ? (product.description ?? '') : key === 'shortDescription' ? (product.short_description ?? '') : (product[key as 'name' | 'category'] ?? '');
    return edits[key].trim() !== String(original).trim();
  });

  const corrections: FieldCorrection[] = changedFields.map((field) => {
    const original = field === 'description' ? (product.description ?? '') : field === 'shortDescription' ? (product.short_description ?? '') : (product[field as 'name' | 'category'] ?? '');
    return { field, fieldLabel: FIELD_LABELS[field], type: correctionTypes[field], oldValue: String(original), newValue: edits[field] };
  });

  const hasChanges = changedFields.length > 0;

  const handleConfirm = async () => {
    const editMap: Record<string, unknown> = {};
    changedFields.forEach((f) => { if (f === 'description') editMap.history = edits[f]; else editMap[f] = edits[f]; });
    await onApproveWithEdits(editMap, corrections, undefined);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: C, padding: '16px 20px', borderBottom: `1px solid ${rgba(0.3)}` }}>
        <div style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(255,255,255,0.18)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'white' }}>edit</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: 'white', margin: 0 }}>Corrección asistida</p>
          <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
            Edita los campos necesarios. La pieza se aprobará como "Ajustado por TELAR".
          </p>
        </div>
        {hasChanges && (
          <span style={{ flexShrink: 0, borderRadius: 9999, background: 'rgba(255,255,255,0.2)', padding: '4px 10px', fontFamily: SANS, fontSize: 11, fontWeight: 800, color: 'white' }}>
            {corrections.length} cambio{corrections.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Editable fields */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}>
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

        {/* Tipificación */}
        {hasChanges && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
            <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C, margin: 0 }}>
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
                onChange={(type) => setCorrectionTypes((p) => ({ ...p, [c.field]: type }))}
              />
            ))}
          </div>
        )}

        {hasChanges && showSummary && <CorrectionSummaryCard corrections={corrections} />}

        {hasChanges && (
          <button
            type="button"
            onClick={() => setShowSummary((v) => !v)}
            style={{ fontFamily: SANS, fontSize: 11, color: C, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2, padding: 0, textAlign: 'left' }}
          >
            {showSummary ? 'Ocultar resumen' : 'Ver resumen de cambios'}
          </button>
        )}
      </div>

      {/* CTA */}
      <div style={{ borderTop: `1px solid ${rgba(0.15)}`, background: rgba(0.04), padding: 20 }}>
        <button
          onClick={handleConfirm}
          disabled={moderating || !hasChanges}
          style={{
            width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: 10, border: 'none', cursor: (moderating || !hasChanges) ? 'not-allowed' : 'pointer',
            background: C, color: 'white',
            fontFamily: SANS, fontSize: 14, fontWeight: 700,
            opacity: (moderating || !hasChanges) ? 0.4 : 1, transition: 'all 0.15s',
          }}
        >
          {moderating ? (
            <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
          )}
          {hasChanges
            ? `Aprobar con ${corrections.length} ajuste${corrections.length !== 1 ? 's' : ''}`
            : 'Edita al menos un campo para continuar'}
        </button>
      </div>
    </div>
  );
};
