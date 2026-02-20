import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { BlogFilters } from "@/types/blog";

interface ArticleFiltersProps {
  filters: BlogFilters;
  onFiltersChange: (filters: BlogFilters) => void;
}

export function ArticleFilters({ filters, onFiltersChange }: ArticleFiltersProps) {
  const hasActiveFilters = filters.category || filters.search;

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar artículos..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
          className="pl-10"
        />
      </div>
      {hasActiveFilters && (
        <Button variant="ghost" size="icon" onClick={() => onFiltersChange({})}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
