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
    <div className="flex flex-wrap items-center gap-3 py-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tienda..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Bank Data Filter */}
      <Select
        value={filters.hasBankData}
        onValueChange={(value: 'all' | 'yes' | 'no') =>
          onFiltersChange({ ...filters, hasBankData: value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <CreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Datos bancarios" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="yes">Con datos bancarios</SelectItem>
          <SelectItem value="no">Sin datos bancarios</SelectItem>
        </SelectContent>
      </Select>

      {/* Approved Products Filter */}
      <Select
        value={filters.minApprovedProducts}
        onValueChange={(value: 'all' | '0' | '1' | '5') =>
          onFiltersChange({ ...filters, minApprovedProducts: value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <Package className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Productos aprobados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Cualquier cantidad</SelectItem>
          <SelectItem value="0">Sin productos aprobados</SelectItem>
          <SelectItem value="1">1+ productos aprobados</SelectItem>
          <SelectItem value="5">5+ productos aprobados</SelectItem>
        </SelectContent>
      </Select>

      {/* Region Filter */}
      <Select
        value={filters.region}
        onValueChange={(value) => onFiltersChange({ ...filters, region: value })}
      >
        <SelectTrigger className="w-[160px]">
          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Región" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las regiones</SelectItem>
          {regions.map((region) => (
            <SelectItem key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Craft Type Filter */}
      <Select
        value={filters.craftType}
        onValueChange={(value) => onFiltersChange({ ...filters, craftType: value })}
      >
        <SelectTrigger className="w-[160px]">
          <Palette className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Artesanía" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las artesanías</SelectItem>
          {craftTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1">
          <X className="w-4 h-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
};
