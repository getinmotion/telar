import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterState } from "./FilterSidebar";
import { formatCurrency } from "@/lib/currencyUtils";

interface FilterChipsProps {
  filters: FilterState;
  onRemoveFilter: (filterType: keyof FilterState, value?: string) => void;
  onClearAll: () => void;
}

export const FilterChips = ({ filters, onRemoveFilter, onClearAll }: FilterChipsProps) => {
  const activeFilters: Array<{ type: keyof FilterState; label: string; value?: string }> = [];

  // Price range
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
    activeFilters.push({
      type: 'priceRange',
      label: `${formatCurrency(filters.priceRange[0])} - ${formatCurrency(filters.priceRange[1])}`,
    });
  }

  // Categories
  filters.categories.forEach(category => {
    activeFilters.push({
      type: 'categories',
      label: category,
      value: category,
    });
  });

  // Rating
  if (filters.minRating) {
    activeFilters.push({
      type: 'minRating',
      label: `${filters.minRating}+ ⭐`,
    });
  }

  // Free shipping
  if (filters.freeShipping) {
    activeFilters.push({
      type: 'freeShipping',
      label: 'Envío gratis',
    });
  }

  // Materials
  filters.materials?.forEach(material => {
    activeFilters.push({
      type: 'materials',
      label: `🌿 ${material}`,
      value: material,
    });
  });

  // Techniques
  filters.techniques?.forEach(technique => {
    activeFilters.push({
      type: 'techniques',
      label: `✨ ${technique}`,
      value: technique,
    });
  });

  // Crafts (Oficios)
  filters.crafts?.forEach(craft => {
    activeFilters.push({
      type: 'crafts',
      label: `🔨 ${craft}`,
      value: craft,
    });
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm font-medium text-muted-foreground">Filtros activos:</span>
      {activeFilters.map((filter, index) => (
        <Badge
          key={`${filter.type}-${filter.value || index}`}
          variant="secondary"
          className="gap-1 pr-1"
        >
          {filter.label}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter(filter.type, filter.value)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-7 text-xs"
      >
        Limpiar todos
      </Button>
    </div>
  );
};
