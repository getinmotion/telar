import React from 'react';
import { cn } from '@/lib/utils';

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
    <div className={cn('rounded-lg border border-stone-900/10 bg-white/85 p-3 flex flex-col gap-2', className)}>
      <div className="flex flex-col gap-0.5">
        <p className="text-xs font-semibold text-[#151b2d] m-0">{fieldLabel}</p>
        <p className="text-[11px] text-stone-400/70 line-through overflow-hidden text-ellipsis whitespace-nowrap max-w-[240px] m-0">{oldValue || '(vacío)'}</p>
        <p className="text-[11px] text-[#151b2d] overflow-hidden text-ellipsis whitespace-nowrap max-w-[240px] m-0">{newValue || '(vacío)'}</p>
      </div>
      <div className="flex gap-1.5">
        {CORRECTION_TYPES.map(({ value, label, description, icon, color, rgba }) => {
          const isSelected = currentType === value;
          return (
            <button
              key={value}
              type="button"
              title={description}
              onClick={() => onChange(value)}
              className="flex-1 flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-bold cursor-pointer transition-all"
              style={{
                background: isSelected ? rgba(0.08) : 'transparent',
                border: isSelected ? `1.5px solid ${rgba(0.35)}` : '1.5px solid rgba(84,67,62,0.1)',
                color: isSelected ? color : 'rgba(84,67,62,0.45)',
                outline: isSelected ? `2px solid ${rgba(0.2)}` : 'none',
                outlineOffset: 1,
              }}
            >
              <span className="material-symbols-outlined text-[13px]">{icon}</span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
