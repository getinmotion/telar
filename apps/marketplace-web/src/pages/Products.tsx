import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "@/contexts/ProductsContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductListItem } from "@/components/ProductListItem";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import { FilterChips } from "@/components/FilterChips";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { SortDropdown, SortOption } from "@/components/SortDropdown";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { MobileViewToggle, MobileViewMode } from "@/components/MobileViewToggle";
import { CategoryBreadcrumb } from "@/components/CategoryBreadcrumb";
import { Search, RefreshCw, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getUniqueCategoriesFromProducts } from "@/lib/categoryUtils";
import { mapArtisanCategory } from "@/lib/productMapper";
import { useToast } from "@/hooks/use-toast";
import { normalizeCraft, normalizeMaterial, normalizeMaterials, normalizeTechniques, formatArtisanText } from "@/lib/normalizationUtils";
import { useHybridSearch } from "@/hooks/useHybridSearch";
import { SemanticSearchToggle } from "@/components/SemanticSearchToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/types/products.types";


// Helper functions for URL params
// Save current URL to sessionStorage for returning from product detail
const saveProductsUrl = () => {
  sessionStorage.setItem('productsReturnUrl', window.location.search);
};

const parseFiltersFromURL = (searchParams: URLSearchParams): Partial<FilterState> => {
  const filters: Partial<FilterState> = {};
  
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  if (minPrice || maxPrice) {
    filters.priceRange = [
      minPrice ? parseInt(minPrice) : 0,
      maxPrice ? parseInt(maxPrice) : 10000000
    ];
  }
  
  const categories = searchParams.get('categories');
  if (categories) filters.categories = categories.split(',');
  
  const crafts = searchParams.get('crafts');
  if (crafts) filters.crafts = crafts.split(',');
  
  const materials = searchParams.get('materials');
  if (materials) filters.materials = materials.split(',');
  
  const techniques = searchParams.get('techniques');
  if (techniques) filters.techniques = techniques.split(',');
  
  const minRating = searchParams.get('minRating');
  if (minRating) filters.minRating = parseInt(minRating);
  
  const freeShipping = searchParams.get('freeShipping');
  if (freeShipping === 'true') filters.freeShipping = true;
  
  return filters;
};

const serializeFiltersToURL = (
  filters: FilterState, 
  searchQuery: string, 
  sortBy: SortOption, 
  currentPage: number
): Record<string, string> => {
  const params: Record<string, string> = {};
  
  if (searchQuery) params.q = searchQuery;
  if (sortBy !== 'relevance') params.sortBy = sortBy;
  if (currentPage > 1) params.page = String(currentPage);
  
  if (filters.priceRange[0] > 0) params.minPrice = String(filters.priceRange[0]);
  if (filters.priceRange[1] < 10000000) params.maxPrice = String(filters.priceRange[1]);
  
  if (filters.categories.length > 0) params.categories = filters.categories.join(',');
  if (filters.crafts.length > 0) params.crafts = filters.crafts.join(',');
  if (filters.materials.length > 0) params.materials = filters.materials.join(',');
  if (filters.techniques.length > 0) params.techniques = filters.techniques.join(',');
  if (filters.minRating > 0) params.minRating = String(filters.minRating);
  if (filters.freeShipping) params.freeShipping = 'true';
  
  return params;
};


// Fisher-Yates shuffle with seed for consistent randomization
const seededShuffle = <T,>(array: T[], seed: number): T[] => {
  const shuffled = [...array];
  let currentSeed = seed;
  
  const random = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Distributed shuffle that avoids consecutive products from the same store
const distributedShuffle = <T extends { storeName?: string }>(array: T[], seed: number): T[] => {
  if (array.length <= 1) return array;

  // Group by store
  const byStore = new Map<string, T[]>();
  array.forEach(item => {
    const store = item.storeName || 'unknown';
    if (!byStore.has(store)) byStore.set(store, []);
    byStore.get(store)!.push(item);
  });
  
  // Shuffle each group internally
  const shuffledGroups = Array.from(byStore.values()).map(group => 
    seededShuffle(group, seed)
  );
  
  // Sort groups by size (largest first) for better distribution
  shuffledGroups.sort((a, b) => b.length - a.length);
  
  // Interleave products round-robin style
  const result: T[] = [];
  const groupIndices = shuffledGroups.map(() => 0);
  
  while (result.length < array.length) {
    for (let g = 0; g < shuffledGroups.length; g++) {
      if (groupIndices[g] < shuffledGroups[g].length) {
        result.push(shuffledGroups[g][groupIndices[g]]);
        groupIndices[g]++;
      }
    }
  }
  
  return result;
};

// Prioritized shuffle: purchasable products first, then non-purchasable, both distributed by store
const prioritizedDistributedShuffle = <T extends { storeName?: string; canPurchase?: boolean }>(array: T[], seed: number): T[] => {
  // Separate purchasable and non-purchasable products
  const purchasable = array.filter(item => item.canPurchase === true);
  const notPurchasable = array.filter(item => item.canPurchase !== true);

  // Apply distributed shuffle to each group with correct typing
  const shuffledPurchasable = distributedShuffle<T>(purchasable as T[], seed);
  const shuffledNotPurchasable = distributedShuffle<T>(notPurchasable as T[], seed + 1);

  // Concatenate: purchasable first
  return [...shuffledPurchasable, ...shuffledNotPurchasable];
};

type LimitOption = 50 | 100 | 200 | 500;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState<LimitOption>(50);
  const [syncing, setSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("productViewMode");
    return (saved as ViewMode) || "grid";
  });
  const [mobileViewMode, setMobileViewMode] = useState<MobileViewMode>(() => {
    const saved = localStorage.getItem("mobileViewMode");
    return (saved as MobileViewMode) || "2-col";
  });
  const [semanticSearchEnabled, setSemanticSearchEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("semanticSearchEnabled");
    return saved !== null ? saved === "true" : true;
  });
  const isMobile = useIsMobile();
  
  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || "");
  const [sortBy, setSortBy] = useState<SortOption>(() => (searchParams.get('sortBy') as SortOption) || "relevance");
  const [currentPage, setCurrentPage] = useState(() => parseInt(searchParams.get('page') || '1'));
  const [filters, setFilters] = useState<FilterState>(() => {
    const urlFilters = parseFiltersFromURL(searchParams);
    return {
      priceRange: urlFilters.priceRange || [0, 10000000],
      categories: urlFilters.categories || [],
      crafts: urlFilters.crafts || [],
      minRating: urlFilters.minRating || 0,
      freeShipping: urlFilters.freeShipping || false,
      materials: urlFilters.materials || [],
      techniques: urlFilters.techniques || [],
    };
  });
  
  const { toast } = useToast();
  const productsContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  
  // Random seed generated once per session for consistent randomization
  const [randomSeed] = useState(() => Math.floor(Math.random() * 1000000));

  // Sync state to URL (skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const params = serializeFiltersToURL(filters, searchQuery, sortBy, currentPage);
    setSearchParams(params, { replace: true });
    // Save URL for returning from product detail
    saveProductsUrl();
  }, [filters, searchQuery, sortBy, currentPage, setSearchParams]);

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem("productViewMode", viewMode);
  }, [viewMode]);

  // Persist mobile view mode preference
  useEffect(() => {
    localStorage.setItem("mobileViewMode", mobileViewMode);
  }, [mobileViewMode]);

  // Persist semantic search preference
  useEffect(() => {
    localStorage.setItem("semanticSearchEnabled", String(semanticSearchEnabled));
  }, [semanticSearchEnabled]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Sincronización en tiempo real
  useRealtimeSync({
    onProductChange: () => {
      setSyncing(true);
      toast({
        title: "Productos actualizados",
        description: "Sincronizando cambios desde telar.co...",
      });
      fetchProducts().finally(() => setSyncing(false));
    },
    onShopChange: () => {
      setSyncing(true);
      fetchProducts().finally(() => setSyncing(false));
    },
  });

  const {
    products: contextProducts,
    fetchProducts: fetchProductsContext,
    total: totalProducts,
    page: currentPageFromContext,
    limit: limitFromContext,
  } = useProducts();

  useEffect(() => {
    if (contextProducts.length > 0) {
      
      // Convertir price de string a number para cálculos
      const mappedProducts: Product[] = contextProducts.map(p => ({
        ...p,
        category: p.category ? mapArtisanCategory(p.category) : undefined,
        stock: p.stock || p.inventory || 0,
      }));

      setProducts(mappedProducts);
    }
  }, [contextProducts]);

  const fetchProducts = async () => {
    try {
      await fetchProductsContext({
        sortBy: 'created_at',
        order: 'DESC',
        limit: limit,
        page: currentPage,
      });
    } catch (error) {
      // Error already handled by context with toast
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = getUniqueCategoriesFromProducts(products);

  // Búsqueda híbrida (semántica + simple)
  const { 
    filteredProducts: searchResults, 
    isSemanticEnabled, 
    semanticResultsCount 
  } = useHybridSearch({
    products,
    searchQuery,
    semanticEnabled: semanticSearchEnabled,
    filters,
  });


  // Aplicar filtros adicionales sobre los resultados de búsqueda

  const filteredProducts = searchResults.filter((product) => {
    const matchesPrice =
     parseFloat(product.price || "0") >= filters.priceRange[0] &&
      parseFloat(product.price || "0") <= filters.priceRange[1];

    // Comparar case-insensitive ya que marketplace_products puede tener variaciones
    const productCategory = (product?.category || '').toLowerCase().trim();
    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.some(filterCat => 
        productCategory === filterCat.toLowerCase().trim()
      );

    const matchesRating = product?.rating >= filters.minRating;

    const matchesFreeShipping =
      !filters.freeShipping || product.freeShipping;

    // Materials - normalizar AMBOS lados para comparación consistente
    const productMaterials = normalizeMaterials(product?.materials);
    const matchesMaterials =
      filters.materials?.length === 0 ||
      filters.materials.some(material => productMaterials.includes(normalizeMaterial(material)));

    // Techniques - normalizar AMBOS lados para comparación consistente
    const productTechniques = normalizeTechniques(product.techniques);
    const matchesTechniques =
      filters.techniques?.length === 0 ||
      filters.techniques.some(technique => productTechniques.includes(formatArtisanText(technique)));

    const matchesCrafts =
      filters.crafts?.length === 0 ||
      filters.crafts.includes(normalizeCraft(product.craft));

    return (
      matchesPrice &&
      matchesCategory &&
      matchesRating &&
      matchesFreeShipping &&
      matchesMaterials &&
      matchesTechniques &&
      matchesCrafts
    );
  });

  // Sort and shuffle products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => parseFloat(a.price || "0") - parseFloat(b.price || "0"));
      case "price-desc":
        return sorted.sort((a, b) => parseFloat(b.price || "0") - parseFloat(a.price || "0"));
      case "newest":
        return sorted;
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      default: // relevance - random order
        return prioritizedDistributedShuffle(sorted, randomSeed);
    }
  }, [filteredProducts, sortBy, randomSeed]);

  // Pagination
  const totalPages = Math.ceil(totalProducts / limit);
  const paginatedProducts = sortedProducts;

  // Reset to page 1 when filters, search, or limit changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy, limit]);

  // Fetch products when page or limit changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, limit]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(<PaginationEllipsis key="ellipsis-start" />);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(<PaginationEllipsis key="ellipsis-end" />);
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  const handleRemoveFilter = (type: string, value?: string) => {
    if (type === "category" && value) {
      setFilters({
        ...filters,
        categories: filters.categories.filter((c) => c !== value),
      });
    } else if (type === "price") {
      setFilters({ ...filters, priceRange: [0, 10000000] });
    } else if (type === "rating") {
      setFilters({ ...filters, minRating: 0 });
    } else if (type === "shipping") {
      setFilters({ ...filters, freeShipping: false });
    } else if (type === "materials" && value) {
      setFilters({
        ...filters,
        materials: filters.materials.filter((m) => m !== value),
      });
    } else if (type === "techniques" && value) {
      setFilters({
        ...filters,
        techniques: filters.techniques.filter((t) => t !== value),
      });
    } else if (type === "crafts" && value) {
      setFilters({
        ...filters,
        crafts: filters.crafts.filter((c) => c !== value),
      });
    }
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 10000000],
      categories: [],
      crafts: [],
      minRating: 0,
      freeShipping: false,
      materials: [],
      techniques: [],
    });
  };

  const handleCategorySearch = (category: string) => {
    setFilters({
      ...filters,
      categories: [category],
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCategorySearch={handleCategorySearch}
        semanticSearchEnabled={semanticSearchEnabled}
        onSemanticSearchToggle={setSemanticSearchEnabled}
      />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-6 py-8 lg:py-12">
          <div className="mb-8 lg:mb-12">
            <h1 className="text-3xl lg:text-5xl font-bold mb-3 text-foreground">Todos los Productos</h1>
            <p className="text-muted-foreground text-base lg:text-lg">
              Descubre {totalProducts} artesanías únicas
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
            {/* FilterSidebar - Desktop sidebar */}
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              availableCategories={availableCategories}
              products={products}
              desktopOnly
            />
          
            <div className="flex-1 space-y-6 lg:space-y-8">
              {/* Breadcrumb */}
              <CategoryBreadcrumb 
                categories={filters.categories}
                searchQuery={searchQuery}
              />

              {/* Mobile: Filtros + Columnas + Ordenar en una línea */}
              {isMobile ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <FilterSidebar
                      filters={filters}
                      onFiltersChange={setFilters}
                      availableCategories={availableCategories}
                      products={products}
                      mobileOnly
                    />
                    <div className="flex items-center gap-2">
                      <MobileViewToggle mode={mobileViewMode} onModeChange={setMobileViewMode} />
                      <SortDropdown value={sortBy} onChange={setSortBy} />
                    </div>
                  </div>
                  {/* Mobile limit selector */}
                  <div className="flex justify-end">
                    <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v) as LimitOption)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Mostrar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50 por página</SelectItem>
                        <SelectItem value="100">100 por página</SelectItem>
                        <SelectItem value="200">200 por página</SelectItem>
                        <SelectItem value="500">500 por página</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                /* Desktop: Buscador + Controles */
                <div className="flex items-center justify-between gap-6">
                  <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    {syncing && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Sincronizando...</span>
                      </div>
                    )}
                    <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v) as LimitOption)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Mostrar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50 por página</SelectItem>
                        <SelectItem value="100">100 por página</SelectItem>
                        <SelectItem value="200">200 por página</SelectItem>
                        <SelectItem value="500">500 por página</SelectItem>
                      </SelectContent>
                    </Select>
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                    <SortDropdown value={sortBy} onChange={setSortBy} />
                  </div>
                </div>
              )}

              <FilterChips
                filters={filters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={clearAllFilters}
              />

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-lg border border-border/40">
                      <div className="aspect-square bg-muted animate-pulse" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-muted-foreground text-lg">No se encontraron productos</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-sm text-muted-foreground">
                      {totalProducts > 0 ? (
                        <>
                          Mostrando {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, totalProducts)} de {totalProducts} {totalProducts === 1 ? 'producto' : 'productos'}
                          {totalPages > 1 && (
                            <span className="ml-1">
                              (Página {currentPage} de {totalPages})
                            </span>
                          )}
                        </>
                      ) : (
                        'No hay productos'
                      )}
                    </div>
                    {searchQuery && (
                      <>
                        {isSemanticEnabled && semanticResultsCount > 0 ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Búsqueda inteligente: {semanticResultsCount} resultado{semanticResultsCount !== 1 ? 's' : ''}</span>
                          </div>
                        ) : semanticSearchEnabled && !isSemanticEnabled ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Buscando con IA...</span>
                          </div>
                        ) : !semanticSearchEnabled ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                            <span>Búsqueda simple</span>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                  
                  {/* Mobile view rendering */}
                  {isMobile ? (
                    mobileViewMode === "list" ? (
                      <div className="space-y-4">
                        {paginatedProducts.map((product) => (
                          <ProductListItem key={product.id} {...product} />
                        ))}
                      </div>
                    ) : (
                      <div 
                        ref={productsContainerRef} 
                        className={`grid gap-3 py-4 ${mobileViewMode === "1-col" ? "grid-cols-1" : "grid-cols-2"}`}
                      >
                        {paginatedProducts.map((product) => (
                          <ProductCard 
                            key={product.id} 
                            {...product} 
                            compactMode={mobileViewMode === "2-col"}
                          />
                        ))}
                      </div>
                    )
                  ) : (
                    /* Desktop view rendering */
                    viewMode === "grid" ? (
                      <div 
                        ref={productsContainerRef} 
                        className="grid gap-6 py-4 sm:grid-cols-2 lg:grid-cols-3"
                      >
                        {paginatedProducts.map((product) => (
                          <ProductCard key={product.id} {...product} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {paginatedProducts.map((product) => (
                          <ProductListItem key={product.id} {...product} />
                        ))}
                      </div>
                    )
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination className="mt-16">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {renderPaginationItems()}
                        
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
