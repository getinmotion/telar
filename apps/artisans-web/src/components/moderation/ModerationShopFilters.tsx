import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, CheckCircle, XCircle } from 'lucide-react';

interface ModerationShopFilterCounts {
  all: number;
  approved: number;
  not_approved: number;
}

interface ModerationShopFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: ModerationShopFilterCounts;
}

export const ModerationShopFilters: React.FC<ModerationShopFiltersProps> = ({
  activeFilter,
  onFilterChange,
  counts,
}) => {
  const filters = [
    { 
      id: 'all', 
      label: 'Todas las tiendas', 
      icon: Store,
      count: counts.all,
      color: 'default' as const
    },
    { 
      id: 'approved', 
      label: 'Aprobadas para Marketplace', 
      icon: CheckCircle,
      count: counts.approved,
      color: 'default' as const
    },
    { 
      id: 'not_approved', 
      label: 'No aprobadas', 
      icon: XCircle,
      count: counts.not_approved,
      color: 'default' as const
    },
  ];

  const shortLabels: Record<string, string> = {
    all: 'Todas',
    approved: 'Aprobadas',
    not_approved: 'Sin aprobar',
  };

  return (
    <div className="flex flex-wrap gap-1">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-1.5 h-7 px-2.5 rounded text-xs font-medium transition-colors
              ${isActive
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {shortLabels[filter.id] ?? filter.label}
            <span className={`inline-flex items-center justify-center rounded px-1 min-w-[16px] text-[10px] font-semibold
              ${isActive ? 'bg-background/20 text-background' : 'bg-background text-foreground'}`}>
              {filter.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
