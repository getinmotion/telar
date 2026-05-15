import React from 'react';
import { cn } from '@/lib/utils';
import type { ModerationCounts } from '@/hooks/useProductModeration';
import { MODERATION_STATUS_LABELS } from '@/constants/moderation-copy';

interface ModerationFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: ModerationCounts;
}

// Etiquetas cortas para los botones de filtro (espacio limitado)
const FILTER_SHORT_LABELS: Record<string, string> = {
  pending_moderation: 'Pendientes',
  approved: 'En marketplace',
  approved_with_edits: 'Ajustados',
  changes_requested: 'Esperando artesano',
  rejected: 'No disponibles',
  all: 'Todos',
};

const filters = [
  { key: 'pending_moderation', color: 'bg-amber-500' },
  { key: 'approved',           color: 'bg-emerald-500' },
  { key: 'approved_with_edits',color: 'bg-teal-500' },
  { key: 'changes_requested',  color: 'bg-orange-500' },
  { key: 'rejected',           color: 'bg-red-500' },
  { key: 'all',                color: 'bg-gray-500' },
];

export const ModerationFilters: React.FC<ModerationFiltersProps> = ({
  activeFilter,
  onFilterChange,
  counts,
}) => {
  return (
    <div className="flex flex-wrap gap-1">
      {filters.map(filter => {
        const count = filter.key === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[filter.key as keyof ModerationCounts] || 0;
        const isActive = activeFilter === filter.key;

        return (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={cn(
              'flex items-center gap-1.5 h-7 px-2.5 rounded text-xs font-medium transition-colors',
              isActive
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            )}
          >
            {FILTER_SHORT_LABELS[filter.key] ?? MODERATION_STATUS_LABELS[filter.key] ?? filter.key}
            {count > 0 && (
              <span className={cn(
                'inline-flex items-center justify-center rounded px-1 min-w-[16px] text-[10px] font-semibold',
                isActive ? 'bg-background/20 text-background' : 'bg-background text-foreground'
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};