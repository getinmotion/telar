import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';
import { CategoryFilters } from '@/types/category';
import { Filter, X } from 'lucide-react';

interface ProductFiltersProps {
  filters: CategoryFilters;
  onFiltersChange: (filters: CategoryFilters) => void;
  onClearFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const { categories } = useCategories();

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      categoryId: checked ? categoryId : undefined,
    });
  };

  const handlePriceRangeChange = (range: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: {
        min: range[0],
        max: range[1],
      },
    });
  };

  const handleSortChange = (sortBy: CategoryFilters['sortBy']) => {
    onFiltersChange({
      ...filters,
      sortBy,
    });
  };

  const handleInStockChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      inStock: checked ? true : undefined,
    });
  };

  const hasActiveFilters = filters.categoryId || filters.priceRange || filters.inStock || filters.sortBy !== 'newest';

  return (
    <Card className="glass-panel sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <h4 className="font-medium mb-3">Categorías</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={filters.categoryId === category.id}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={category.id} className="cursor-pointer">
                    {category.name}
                  </Label>
                </div>
                {category.children && category.children.length > 0 && (
                  <div className="ml-6 space-y-2">
                    {category.children.map((subcategory) => (
                      <div key={subcategory.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={subcategory.id}
                          checked={filters.subcategoryId === subcategory.id}
                          onCheckedChange={(checked) => 
                            onFiltersChange({
                              ...filters,
                              subcategoryId: checked ? subcategory.id : undefined,
                            })
                          }
                        />
                        <Label htmlFor={subcategory.id} className="cursor-pointer text-sm">
                          {subcategory.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3">Rango de Precio</h4>
          <div className="space-y-4">
            <Slider
              value={[filters.priceRange?.min || 0, filters.priceRange?.max || 1000000]}
              onValueChange={handlePriceRangeChange}
              max={1000000}
              step={10000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatPrice(filters.priceRange?.min || 0)}</span>
              <span>{formatPrice(filters.priceRange?.max || 1000000)}</span>
            </div>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <h4 className="font-medium mb-3">Ordenar por</h4>
          <div className="space-y-2">
            {[
              { value: 'newest', label: 'Más recientes' },
              { value: 'oldest', label: 'Más antiguos' },
              { value: 'price_asc', label: 'Precio: menor a mayor' },
              { value: 'price_desc', label: 'Precio: mayor a menor' },
              { value: 'name', label: 'Nombre A-Z' },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={filters.sortBy === option.value}
                  onCheckedChange={() => 
                    handleSortChange(option.value as CategoryFilters['sortBy'])
                  }
                />
                <Label htmlFor={option.value} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Filter */}
        <div>
          <h4 className="font-medium mb-3">Disponibilidad</h4>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={filters.inStock || false}
              onCheckedChange={handleInStockChange}
            />
            <Label htmlFor="inStock" className="cursor-pointer">
              Solo productos en stock
            </Label>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div>
            <h4 className="font-medium mb-3">Filtros Activos</h4>
            <div className="flex flex-wrap gap-2">
              {filters.categoryId && (
                <Badge variant="secondary" className="text-xs">
                  Categoría seleccionada
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => handleCategoryChange(filters.categoryId!, false)}
                  />
                </Badge>
              )}
              {filters.priceRange && (
                <Badge variant="secondary" className="text-xs">
                  Rango de precio
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => onFiltersChange({ ...filters, priceRange: undefined })}
                  />
                </Badge>
              )}
              {filters.inStock && (
                <Badge variant="secondary" className="text-xs">
                  En stock
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => handleInStockChange(false)}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};