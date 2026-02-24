import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Store, Eye, Clock, Ban, CreditCard, Sparkles, RefreshCw } from 'lucide-react';
import { ShopFilter, ShopStats } from '@/hooks/useAdminShops';
import { cn } from '@/lib/utils';

interface ShopFiltersProps {
  filter: ShopFilter;
  setFilter: (filter: ShopFilter) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  stats: ShopStats;
  onRefresh: () => void;
  loading?: boolean;
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  stats,
  onRefresh,
  loading,
}) => {
  const filters: { key: ShopFilter; label: string; count: number; icon: typeof Store; color: string }[] = [
    { key: 'all', label: 'Todas', count: stats.total, icon: Store, color: 'text-foreground' },
    { key: 'marketplace', label: 'Marketplace', count: stats.marketplace_visible, icon: Eye, color: 'text-emerald-600' },
    { key: 'pending', label: 'Pendientes', count: stats.pending_approval, icon: Clock, color: 'text-amber-600' },
    { key: 'inactive', label: 'Inactivas', count: stats.inactive, icon: Ban, color: 'text-red-600' },
    { key: 'no_cobre', label: 'Sin Cobre', count: stats.without_cobre, icon: CreditCard, color: 'text-violet-600' },
    { key: 'new', label: 'Nuevas', count: stats.new_this_week, icon: Sparkles, color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, slug, tipo, región..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.key)}
            className={cn(
              "gap-2",
              filter === f.key && "shadow-md"
            )}
          >
            <f.icon className={cn("h-3.5 w-3.5", filter !== f.key && f.color)} />
            <span>{f.label}</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded-full text-xs font-medium",
              filter === f.key 
                ? "bg-background/20 text-inherit" 
                : "bg-muted text-muted-foreground"
            )}>
              {f.count}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
