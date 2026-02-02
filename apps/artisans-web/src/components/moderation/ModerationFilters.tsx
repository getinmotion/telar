import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ModerationCounts } from '@/hooks/useProductModeration';

interface ModerationFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: ModerationCounts;
}

const filters = [
  { key: 'pending_moderation', label: 'Pendientes', color: 'bg-amber-500' },
  { key: 'approved', label: 'Aprobados', color: 'bg-emerald-500' },
  { key: 'approved_with_edits', label: 'Con ediciones', color: 'bg-teal-500' },
  { key: 'changes_requested', label: 'Cambios', color: 'bg-orange-500' },
  { key: 'rejected', label: 'Rechazados', color: 'bg-red-500' },
  { key: 'all', label: 'Todos', color: 'bg-gray-500' },
];

export const ModerationFilters: React.FC<ModerationFiltersProps> = ({
  activeFilter,
  onFilterChange,
  counts,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(filter => {
        const count = filter.key === 'all' 
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[filter.key as keyof ModerationCounts] || 0;

        return (
          <Button
            key={filter.key}
            variant={activeFilter === filter.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.key)}
            className={cn(
              'relative',
              activeFilter === filter.key && 'ring-2 ring-offset-2'
            )}
          >
            {filter.label}
            {count > 0 && (
              <Badge 
                variant="secondary" 
                className={cn(
                  'ml-2 h-5 min-w-5 flex items-center justify-center text-xs',
                  activeFilter === filter.key ? 'bg-background/20 text-primary-foreground' : ''
                )}
              >
                {count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
};