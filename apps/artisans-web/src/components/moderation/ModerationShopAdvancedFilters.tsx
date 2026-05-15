import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, CreditCard, Package, MapPin, Palette } from 'lucide-react';

export interface ShopAdvancedFilters {
  search: string;
  hasBankData: 'all' | 'yes' | 'no';
  minApprovedProducts: 'all' | '0' | '1' | '5';
  region: string;
  craftType: string;
}

interface ModerationShopAdvancedFiltersProps {
  filters: ShopAdvancedFilters;
  onFiltersChange: (filters: ShopAdvancedFilters) => void;
  regions: string[];
  craftTypes: string[];
}

export const ModerationShopAdvancedFilters: React.FC<ModerationShopAdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  regions,
  craftTypes,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleClear = () => {
    setLocalSearch('');
    onFiltersChange({
      search: '',
      hasBankData: 'all',
      minApprovedProducts: 'all',
      region: 'all',
      craftType: 'all',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.hasBankData !== 'all' ||
    filters.minApprovedProducts !== 'all' ||
    filters.region !== 'all' ||
    filters.craftType !== 'all';

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-7 h-7 w-32 text-xs"
        />
      </div>

      <Select
        value={filters.hasBankData}
        onValueChange={(value: 'all' | 'yes' | 'no') =>
          onFiltersChange({ ...filters, hasBankData: value })
        }
      >
        <SelectTrigger className="h-7 text-xs w-28">
          <CreditCard className="w-3 h-3 mr-1 text-muted-foreground shrink-0" />
          <SelectValue placeholder="Banco" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">Banco: todos</SelectItem>
          <SelectItem value="yes" className="text-xs">Con datos</SelectItem>
          <SelectItem value="no" className="text-xs">Sin datos</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.minApprovedProducts}
        onValueChange={(value: 'all' | '0' | '1' | '5') =>
          onFiltersChange({ ...filters, minApprovedProducts: value })
        }
      >
        <SelectTrigger className="h-7 text-xs w-28">
          <Package className="w-3 h-3 mr-1 text-muted-foreground shrink-0" />
          <SelectValue placeholder="Productos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">Productos: todos</SelectItem>
          <SelectItem value="0" className="text-xs">Sin aprobados</SelectItem>
          <SelectItem value="1" className="text-xs">1+ aprobados</SelectItem>
          <SelectItem value="5" className="text-xs">5+ aprobados</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.region}
        onValueChange={(value) => onFiltersChange({ ...filters, region: value })}
      >
        <SelectTrigger className="h-7 text-xs w-28">
          <MapPin className="w-3 h-3 mr-1 text-muted-foreground shrink-0" />
          <SelectValue placeholder="Región" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">Todas las regiones</SelectItem>
          {regions.map((region) => (
            <SelectItem key={region} value={region} className="text-xs">{region}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.craftType}
        onValueChange={(value) => onFiltersChange({ ...filters, craftType: value })}
      >
        <SelectTrigger className="h-7 text-xs w-28">
          <Palette className="w-3 h-3 mr-1 text-muted-foreground shrink-0" />
          <SelectValue placeholder="Oficio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">Todos los oficios</SelectItem>
          {craftTypes.map((type) => (
            <SelectItem key={type} value={type} className="text-xs">{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <button
          onClick={handleClear}
          className="flex items-center gap-1 h-7 px-2 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Limpiar
        </button>
      )}
    </div>
  );
};
