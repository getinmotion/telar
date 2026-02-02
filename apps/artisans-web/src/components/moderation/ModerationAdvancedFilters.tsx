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
    <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="w-4 h-4" />
        Filtros:
      </div>
      
      <div className="flex-1 min-w-[200px] max-w-[300px]">
        <Label className="text-xs text-muted-foreground mb-1.5 block">Buscar</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Nombre, tienda..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <div className="min-w-[180px]">
        <Label className="text-xs text-muted-foreground mb-1.5 block">Categoría</Label>
        <Select value={filters.category} onValueChange={(v) => updateFilter('category', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[160px]">
        <Label className="text-xs text-muted-foreground mb-1.5 block">Región</Label>
        <Select value={filters.region} onValueChange={(v) => updateFilter('region', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {regions.map((reg) => (
              <SelectItem key={reg.value} value={reg.value}>{reg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-md border">
        <Switch
          id="non-marketplace"
          checked={filters.onlyNonMarketplace}
          onCheckedChange={(v) => updateFilter('onlyNonMarketplace', v)}
        />
        <Label htmlFor="non-marketplace" className="text-xs cursor-pointer">
          Solo tiendas sin aprobar marketplace
        </Label>
      </div>
    </div>
  );
};

export type { AdvancedFilters };
