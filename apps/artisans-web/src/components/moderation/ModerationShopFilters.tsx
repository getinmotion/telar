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

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        
        return (
          <Button
            key={filter.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className="gap-2"
          >
            <Icon className="w-4 h-4" />
            {filter.label}
            <Badge variant={isActive ? 'secondary' : 'outline'} className="ml-1">
              {filter.count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
};
