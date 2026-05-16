import React from 'react';
import { Info, Bell, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FieldCorrection, CorrectionType } from './CorrectionTypeSelector';

interface CorrectionSummaryCardProps {
  corrections: FieldCorrection[];
  className?: string;
}

const TYPE_CONFIG: Record<CorrectionType, { label: string; Icon: React.ComponentType<any>; colors: string; note: string }> = {
  minor: {
    label: 'Menor',
    Icon: Info,
    colors: 'text-blue-600 bg-blue-50 border-blue-100',
    note: 'No notifica al artesano',
  },
  medium: {
    label: 'Medio',
    Icon: Bell,
    colors: 'text-amber-600 bg-amber-50 border-amber-100',
    note: 'Artesano será notificado',
  },
  grave: {
    label: 'Importante',
    Icon: AlertTriangle,
    colors: 'text-orange-600 bg-orange-50 border-orange-100',
    note: 'Requiere confirmación del artesano',
  },
};

const ORDER: CorrectionType[] = ['grave', 'medium', 'minor'];

export const CorrectionSummaryCard: React.FC<CorrectionSummaryCardProps> = ({
  corrections,
  className,
}) => {
  if (corrections.length === 0) return null;

  const grouped = ORDER.reduce<Record<CorrectionType, FieldCorrection[]>>(
    (acc, t) => {
      acc[t] = corrections.filter((c) => c.type === t);
      return acc;
    },
    { grave: [], medium: [], minor: [] },
  );

  return (
    <div className={cn('rounded-lg border bg-card space-y-0 overflow-hidden', className)}>
      <div className="px-3 py-2 border-b bg-muted/40">
        <p className="text-xs font-semibold text-foreground">
          Resumen de cambios — {corrections.length} campo{corrections.length !== 1 ? 's' : ''} modificado{corrections.length !== 1 ? 's' : ''}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Esto quedará en el historial de auditoría TELAR.
        </p>
      </div>

      {ORDER.map((type) => {
        const items = grouped[type];
        if (items.length === 0) return null;
        const { label, Icon, colors, note } = TYPE_CONFIG[type];

        return (
          <div key={type} className="px-3 py-2 border-b last:border-b-0">
            <div className={cn('flex items-center gap-1.5 mb-1.5 rounded px-1.5 py-0.5 border w-fit', colors)}>
              <Icon className="h-3 w-3" />
              <span className="text-[10px] font-semibold">{label}</span>
              <span className="text-[10px] opacity-70">— {note}</span>
            </div>
            <div className="space-y-1 pl-1">
              {items.map((c) => (
                <div key={c.field} className="flex items-center gap-1.5 text-xs">
                  <span className="font-medium text-muted-foreground w-24 flex-shrink-0 truncate">{c.fieldLabel}</span>
                  <span className="line-through text-muted-foreground/60 truncate max-w-[90px]">{c.oldValue || '(vacío)'}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium truncate max-w-[90px]">{c.newValue || '(vacío)'}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
