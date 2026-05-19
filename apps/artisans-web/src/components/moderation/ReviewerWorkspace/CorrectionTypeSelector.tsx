import React from 'react';
import { SANS } from '@/components/dashboard/dashboardStyles';

export type CorrectionType = 'minor' | 'medium' | 'grave';

export interface FieldCorrection {
  field: string;
  fieldLabel: string;
  type: CorrectionType;
  oldValue: string;
  newValue: string;
}

interface CorrectionTypeSelectorProps {
  fieldLabel: string;
  field: string;
  oldValue: string;
  newValue: string;
  currentType: CorrectionType;
  onChange: (type: CorrectionType) => void;
  className?: string;
}

const CORRECTION_TYPES: { value: CorrectionType; label: string; description: string; icon: string; color: string; rgba: (a: number) => string }[] = [
  {
    value: 'minor',
    label: 'Menor',
    description: 'Ortografía, formato, orden. No notifica al artesano.',
    icon: 'info',
    color: '#2563eb',
    rgba: (a) => `rgba(37,99,235,${a})`,
  },
  {
    value: 'medium',
    label: 'Medio',
    description: 'Categoría, materiales, técnicas. Notifica al artesano.',
    icon: 'notifications',
    color: '#d97706',
    rgba: (a) => `rgba(245,158,11,${a})`,
  },
  {
    value: 'grave',
    label: 'Importante',
    description: 'Cambio comercial. Requiere confirmación del artesano.',
    icon: 'warning',
    color: '#ea580c',
    rgba: (a) => `rgba(234,88,12,${a})`,
  },
];

export const CorrectionTypeSelector: React.FC<CorrectionTypeSelectorProps> = ({
  fieldLabel,
  oldValue,
  newValue,
  currentType,
  onChange,
  className,
}) => {
  return (
    <div style={{ borderRadius: 10, border: '1px solid rgba(84,67,62,0.1)', background: 'rgba(255,255,255,0.85)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }} className={className}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: '#151b2d', margin: 0 }}>{fieldLabel}</p>
        <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.4)', textDecoration: 'line-through', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240, margin: 0 }}>{oldValue || '(vacío)'}</p>
        <p style={{ fontFamily: SANS, fontSize: 11, color: '#151b2d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240, margin: 0 }}>{newValue || '(vacío)'}</p>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {CORRECTION_TYPES.map(({ value, label, description, icon, color, rgba }) => {
          const isSelected = currentType === value;
          return (
            <button
              key={value}
              type="button"
              title={description}
              onClick={() => onChange(value)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                borderRadius: 8, padding: '6px 4px',
                background: isSelected ? rgba(0.08) : 'transparent',
                border: isSelected ? `1.5px solid ${rgba(0.35)}` : '1.5px solid rgba(84,67,62,0.1)',
                color: isSelected ? color : 'rgba(84,67,62,0.45)',
                fontFamily: SANS, fontSize: 10, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.12s',
                outline: isSelected ? `2px solid ${rgba(0.2)}` : 'none',
                outlineOffset: 1,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{icon}</span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
