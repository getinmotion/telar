import { useState, useMemo } from "react";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { normalizeMaterials, normalizeTechniques, normalizeCraft, normalizeMaterial } from "@/lib/normalizationUtils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplaceCategories";

export interface FilterState {
  priceRange: [number, number];
  categories: string[];
  crafts: string[];
  minRating: number | null;
  freeShipping: boolean;
  materials: string[];
  techniques: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCategories: string[];
  products: any[];
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

export const FilterSidebar = ({ filters, onFiltersChange, availableCategories, products, mobileOnly, desktopOnly }: FilterSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [materialSearch, setMaterialSearch] = useState("");
  const [techniqueSearch, setTechniqueSearch] = useState("");
  
  // Extract unique materials and techniques from products with memoization
  const uniqueMaterials = useMemo(() => {
    const allMaterials = products.flatMap(p => p.materials || []).filter(Boolean);
    return normalizeMaterials(allMaterials);
  }, [products]);
  
  const uniqueTechniques = useMemo(() => {
    const allTechniques = products.flatMap(p => p.techniques || []).filter(Boolean);
    return normalizeTechniques(allTechniques);
  }, [products]);

  // Extract unique crafts (oficios) from products with normalization, hiding 'Sin especificar'
  const uniqueCrafts = useMemo(() => {
    const crafts = products.map(p => p.craft).filter(Boolean);
    return Array.from(new Set(crafts.map(c => normalizeCraft(c))))
      .filter(c => c !== 'Sin especificar')
      .sort();
  }, [products]);

  // Count products by marketplace category - comparar case-insensitive
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    MARKETPLACE_CATEGORIES.forEach(cat => {
      const catLower = cat.name.toLowerCase().trim();
      const count = products.filter(p => 
        (p.category || '').toLowerCase().trim() === catLower
      ).length;
      counts.set(cat.name, count);
    });
    return counts;
  }, [products]);

  // Memoized counters for materials and techniques - usando normalización
  const materialCounts = useMemo(() => {
    const counts = new Map<string, number>();
    uniqueMaterials.forEach(material => {
      // Comparar usando normalización para que coincida correctamente
      const count = products.filter(p => 
        normalizeMaterials(p.materials).includes(material)
      ).length;
      counts.set(material, count);
    });
    return counts;
  }, [products, uniqueMaterials]);

  const techniqueCounts = useMemo(() => {
    const counts = new Map<string, number>();
    uniqueTechniques.forEach(technique => {
      const count = products.filter(p => 
        normalizeTechniques(p.techniques).includes(technique)
      ).length;
      counts.set(technique, count);
    });
    return counts;
  }, [products, uniqueTechniques]);

  const craftCounts = useMemo(() => {
    const counts = new Map<string, number>();
    uniqueCrafts.forEach(craft => {
      const count = products.filter(p => normalizeCraft(p.craft) === craft).length;
      counts.set(craft, count);
    });
    return counts;
  }, [products, uniqueCrafts]);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const toggleMaterial = (material: string) => {
    const newMaterials = filters.materials.includes(material)
      ? filters.materials.filter(m => m !== material)
      : [...filters.materials, material];
    updateFilters({ materials: newMaterials });
  };

  const toggleTechnique = (technique: string) => {
    const newTechniques = filters.techniques.includes(technique)
      ? filters.techniques.filter(t => t !== technique)
      : [...filters.techniques, technique];
    updateFilters({ techniques: newTechniques });
  };

  const toggleCraft = (craft: string) => {
    const newCrafts = filters.crafts.includes(craft)
      ? filters.crafts.filter(c => c !== craft)
      : [...filters.crafts, craft];
    updateFilters({ crafts: newCrafts });
  };


  const clearFilters = () => {
    onFiltersChange({
      priceRange: [0, 10000000],
      categories: [],
      crafts: [],
      minRating: null,
      freeShipping: false,
      materials: [],
      techniques: [],
    });
  };

  const activeFiltersCount = 
    filters.categories.length + 
    filters.crafts.length +
    (filters.minRating ? 1 : 0) + 
    (filters.freeShipping ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000 ? 1 : 0) +
    filters.materials.length +
    filters.techniques.length;

  const FilterContent = () => (
    <div className="h-full flex flex-col">
      {/* Sticky Header with Clear Button */}
      <div className="flex items-center justify-between pb-4 border-b mb-4">
        <h3 className="text-base font-semibold">Filtros</h3>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar ({activeFiltersCount})
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-6 pb-4">
          {/* Price Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Precio</Label>
            </div>
            <div className="space-y-4">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                min={0}
                max={10000000}
                step={10000}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>${filters.priceRange[0].toLocaleString()}</span>
                <span>${filters.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

        {/* Categories */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Categorías</Label>
          <div className="space-y-1">
            {MARKETPLACE_CATEGORIES.map((category) => {
              const isActive = filters.categories.includes(category.name);
              const count = categoryCounts.get(category.name) || 0;
              return (
                <div 
                  key={category.name}
                  className={cn(
                    "flex items-center gap-3 py-2 px-2 rounded-md transition-all",
                    "hover:bg-accent/30",
                    isActive && "bg-accent/50 border-l-2 border-primary"
                  )}
                >
                  <Checkbox
                    id={`cat-${category.name}`}
                    checked={isActive}
                    onCheckedChange={() => toggleCategory(category.name)}
                    className="shrink-0"
                  />
                  <Label 
                    htmlFor={`cat-${category.name}`}
                    className={cn(
                      "cursor-pointer text-sm flex-1",
                      isActive && "text-primary font-medium"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">({count})</span>
                        {isActive && <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">✓</Badge>}
                      </div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Oficios Artesanales */}
        {uniqueCrafts.length > 0 && (
          <div className="space-y-4">
            <Label className="text-base font-semibold">Oficios Artesanales</Label>
            <ScrollArea className="h-[200px]">
              <div className="space-y-1">
                {uniqueCrafts.map((craft) => {
                  const isActive = filters.crafts.includes(craft);
                  const count = craftCounts.get(craft) || 0;
                  return (
                    <div 
                      key={craft}
                      className={cn(
                        "flex items-center gap-3 py-2 px-2 rounded-md transition-all",
                        "hover:bg-accent/30",
                        isActive && "bg-accent/50 border-l-2 border-primary"
                      )}
                    >
                      <Checkbox
                        id={`craft-${craft}`}
                        checked={isActive}
                        onCheckedChange={() => toggleCraft(craft)}
                        className="shrink-0"
                      />
                      <Label 
                        htmlFor={`craft-${craft}`}
                        className={cn(
                          "cursor-pointer text-sm flex-1",
                          isActive && "text-primary font-medium"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{craft}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">({count})</span>
                            {isActive && <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">✓</Badge>}
                          </div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Rating */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Valoración mínima</Label>
          <div className="space-y-2">
            {[4, 3, 2].map((rating) => (
              <div key={rating} className={cn("flex items-center space-x-2 p-2 rounded-md transition-colors", filters.minRating === rating && "bg-primary/5 border-l-2 border-primary")}>
                <Checkbox id={`rating-${rating}`} checked={filters.minRating === rating} onCheckedChange={(checked) => updateFilters({ minRating: checked ? rating : null })} />
                <label htmlFor={`rating-${rating}`} className={cn("text-sm font-medium leading-none cursor-pointer flex-1 transition-colors", filters.minRating === rating && "text-primary")}>{rating}+ ⭐</label>
                {filters.minRating === rating && <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">✓</Badge>}
              </div>
            ))}
          </div>
        </div>

        {/* Free Shipping */}
        <div className="space-y-4">
          <div className={cn("flex items-center space-x-2 p-2 rounded-md transition-colors", filters.freeShipping && "bg-primary/5 border-l-2 border-primary")}>
            <Checkbox id="free-shipping" checked={filters.freeShipping} onCheckedChange={(checked) => updateFilters({ freeShipping: checked as boolean })} />
            <label htmlFor="free-shipping" className={cn("text-base font-semibold leading-none cursor-pointer flex-1 transition-colors", filters.freeShipping && "text-primary")}>Envío gratis</label>
            {filters.freeShipping && <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">✓</Badge>}
          </div>
        </div>

        {/* Materials */}
        {uniqueMaterials.length > 0 && (
          <div className="space-y-4">
            <Label className="text-base font-semibold">Materiales</Label>
            <div className="relative">
              <Input type="text" placeholder="Buscar material..." value={materialSearch} onChange={(e) => setMaterialSearch(e.target.value)} className="pl-3 pr-8" />
              {materialSearch && <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0" onClick={() => setMaterialSearch("")}><X className="h-3 w-3" /></Button>}
            </div>
            <ScrollArea className="h-[200px]">
              <div className="space-y-1">
                {uniqueMaterials.filter(m => !materialSearch || m.toLowerCase().includes(materialSearch.toLowerCase())).map((material) => {
                  const isActive = filters.materials.includes(material);
                  const count = materialCounts.get(material) || 0;
                  return (
                    <div key={material} className={cn("flex items-center gap-3 py-2 px-2 rounded-md transition-all", "hover:bg-accent/30", isActive && "bg-accent/50 border-l-2 border-primary", count === 0 && "opacity-50")}>
                      <Checkbox id={`mat-${material}`} checked={isActive} onCheckedChange={() => toggleMaterial(material)} disabled={count === 0} className="shrink-0" />
                      <label htmlFor={`mat-${material}`} className={cn("text-sm leading-none cursor-pointer flex-1", isActive && "text-primary font-medium", count === 0 && "cursor-not-allowed")}>
                        <div className="flex items-center justify-between">
                          <span>{material}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">({count})</span>
                            {isActive && <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">✓</Badge>}
                          </div>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Techniques */}
        {uniqueTechniques.length > 0 && (
          <div className="space-y-4">
            <Label className="text-base font-semibold">Técnicas Artesanales</Label>
            <div className="relative">
              <Input type="text" placeholder="Buscar técnica..." value={techniqueSearch} onChange={(e) => setTechniqueSearch(e.target.value)} className="pl-3 pr-8" />
              {techniqueSearch && <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0" onClick={() => setTechniqueSearch("")}><X className="h-3 w-3" /></Button>}
            </div>
            <ScrollArea className="h-[200px]">
              <div className="space-y-1">
                {uniqueTechniques.filter(t => !techniqueSearch || t.toLowerCase().includes(techniqueSearch.toLowerCase())).map((technique) => {
                  const isActive = filters.techniques.includes(technique);
                  const count = techniqueCounts.get(technique) || 0;
                  return (
                    <div key={technique} className={cn("flex items-center gap-3 py-2 px-2 rounded-md transition-all", "hover:bg-accent/30", isActive && "bg-accent/50 border-l-2 border-primary", count === 0 && "opacity-50")}>
                      <Checkbox id={`tech-${technique}`} checked={isActive} onCheckedChange={() => toggleTechnique(technique)} disabled={count === 0} className="shrink-0" />
                      <label htmlFor={`tech-${technique}`} className={cn("text-sm leading-none cursor-pointer flex-1", isActive && "text-primary font-medium", count === 0 && "cursor-not-allowed")}>
                        <div className="flex items-center justify-between">
                          <span>{technique}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">({count})</span>
                            {isActive && <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">✓</Badge>}
                          </div>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        </div>
      </ScrollArea>
    </div>
  );

  // Mobile only - render just the collapsible
  if (mobileOnly) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 p-4 border rounded-lg bg-card max-h-[60vh] overflow-auto">
          <FilterContent />
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Desktop only - render just the sidebar
  if (desktopOnly) {
    return (
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 border-r bg-card p-4 h-[calc(100vh-5rem)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filtros</h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          <FilterContent />
        </div>
      </div>
    );
  }

  // Default: render both (for backwards compatibility)
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 border-r bg-card p-4 h-[calc(100vh-5rem)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filtros</h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Collapsible */}
      <div className="lg:hidden mb-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 p-4 border rounded-lg bg-card">
            <FilterContent />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  );
};
