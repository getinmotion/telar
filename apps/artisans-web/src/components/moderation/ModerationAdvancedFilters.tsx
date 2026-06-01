import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Search, Filter } from 'lucide-react';

interface AdvancedFilters {
  search: string;
  category: string;
  region: string;
  onlyNonMarketplace: boolean;
}

interface ModerationAdvancedFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
}

const categories = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'Joyería y Accesorios', label: 'Joyería y Accesorios' },
  { value: 'Textiles y Moda', label: 'Textiles y Moda' },
  { value: 'Bolsos y Carteras', label: 'Bolsos y Carteras' },
  { value: 'Decoración del Hogar', label: 'Decoración del Hogar' },
  { value: 'Vajillas y Cocina', label: 'Vajillas y Cocina' },
  { value: 'Muebles', label: 'Muebles' },
  { value: 'Arte y Esculturas', label: 'Arte y Esculturas' },
  { value: 'Iluminación', label: 'Iluminación' },
];

const regions = [
  { value: 'all', label: 'Todas las regiones' },
  { value: 'Boyacá', label: 'Boyacá' },
  { value: 'Nariño', label: 'Nariño' },
  { value: 'Santander', label: 'Santander' },
  { value: 'Cundinamarca', label: 'Cundinamarca' },
  { value: 'Antioquia', label: 'Antioquia' },
  { value: 'Valle del Cauca', label: 'Valle del Cauca' },
  { value: 'Atlántico', label: 'Atlántico' },
  { value: 'Bolívar', label: 'Bolívar' },
];

export const ModerationAdvancedFilters: React.FC<ModerationAdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const updateFilter = <K extends keyof AdvancedFilters>(key: K, value: AdvancedFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-7 h-7 w-36 text-xs"
        />
      </div>

      <Select value={filters.category} onValueChange={(v) => updateFilter('category', v)}>
        <SelectTrigger className="h-7 text-xs w-32">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value} className="text-xs">{cat.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.region} onValueChange={(v) => updateFilter('region', v)}>
        <SelectTrigger className="h-7 text-xs w-28">
          <SelectValue placeholder="Región" />
        </SelectTrigger>
        <SelectContent>
          {regions.map((reg) => (
            <SelectItem key={reg.value} value={reg.value} className="text-xs">{reg.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1.5">
        <Switch
          id="non-marketplace"
          checked={filters.onlyNonMarketplace}
          onCheckedChange={(v) => updateFilter('onlyNonMarketplace', v)}
          className="scale-75"
        />
        <Label htmlFor="non-marketplace" className="text-xs cursor-pointer whitespace-nowrap text-muted-foreground">
          Sin marketplace
        </Label>
      </div>
    </div>
  );
};

export type { AdvancedFilters };
