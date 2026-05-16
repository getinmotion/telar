import React from 'react';
import { cn } from '@/lib/utils';
import { Info, Bell, AlertTriangle } from 'lucide-react';

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

const CORRECTION_TYPES: { value: CorrectionType; label: string; description: string; Icon: React.ComponentType<any>; colors: string }[] = [
  {
    value: 'minor',
    label: 'Menor',
    description: 'Ortografía, formato, orden. No notifica al artesano.',
    Icon: Info,
    colors: 'border-blue-200 bg-blue-50 text-blue-700 data-[selected=true]:ring-blue-400',
  },
  {
    value: 'medium',
    label: 'Medio',
    description: 'Categoría, materiales, técnicas. Notifica al artesano.',
    Icon: Bell,
    colors: 'border-amber-200 bg-amber-50 text-amber-700 data-[selected=true]:ring-amber-400',
  },
  {
    value: 'grave',
    label: 'Importante',
    description: 'Cambio comercial. Requiere confirmación del artesano.',
    Icon: AlertTriangle,
    colors: 'border-orange-200 bg-orange-50 text-orange-700 data-[selected=true]:ring-orange-400',
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
    <div className={cn('rounded-lg border bg-card p-3 space-y-2', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs space-y-0.5">
          <p className="font-medium text-foreground">{fieldLabel}</p>
          <p className="text-muted-foreground line-through truncate max-w-[180px]">{oldValue || '(vacío)'}</p>
          <p className="text-foreground truncate max-w-[180px]">{newValue || '(vacío)'}</p>
        </div>
      </div>
      <div className="flex gap-1.5">
        {CORRECTION_TYPES.map(({ value, label, description, Icon, colors }) => (
          <button
            key={value}
            type="button"
            data-selected={currentType === value}
            title={description}
            onClick={() => onChange(value)}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 rounded-md border px-2 py-1.5 text-[10px] font-medium transition-all',
              'data-[selected=true]:ring-2 data-[selected=true]:ring-offset-1',
              colors,
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
