import { useState, useEffect } from "react";
import { telarClient } from "@/lib/telarClient";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductListItem } from "@/components/ProductListItem";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import { FilterChips } from "@/components/FilterChips";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { SortDropdown, SortOption } from "@/components/SortDropdown";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { CategoryBreadcrumb } from "@/components/CategoryBreadcrumb";
import { Search, RefreshCw, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getUniqueCategoriesFromProducts } from "@/lib/categoryUtils";
import { mapArtisanCategory } from "@/lib/productMapper";
import { useToast } from "@/hooks/use-toast";
import { MarketplaceProduct } from "@/lib/mapTelarData";
import { normalizeCraft, normalizeMaterial, normalizeMaterials, normalizeTechniques } from "@/lib/normalizationUtils";
import { useHybridSearch } from "@/hooks/useHybridSearch";
import { SemanticSearchToggle } from "@/components/SemanticSearchToggle";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PRODUCTS_PER_PAGE = 24;

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  store_name?: string;
  store_logo?: string;
  category?: string;
  rating?: number;
  reviews_count?: number;
  is_new?: boolean;
  free_shipping?: boolean;
  stock?: number;
  shop_slug?: string;
  craft?: string;
  materials?: string[];
  techniques?: string[];
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("productViewMode");
    return (saved as ViewMode) || "grid";
  });
  const [semanticSearchEnabled, setSemanticSearchEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("semanticSearchEnabled");
    return saved !== null ? saved === "true" : true; // Por defecto activado
  });
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000000],
    categories: [],
    crafts: [],
    minRating: 0,
    freeShipping: false,
    materials: [],
    techniques: [],
  });
  const { toast } = useToast();

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem("productViewMode", viewMode);
  }, [viewMode]);

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

  const fetchProducts = async () => {
    try {
      const { data, error } = await telarClient
        .from('marketplace_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear productos a formato marketplace
      const { mapProductToMarketplace } = await import('@/lib/productMapper');
      const mappedProducts = (data || []).map(mapProductToMarketplace);
      
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
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
      product.price >= filters.priceRange[0] &&
      product.price <= filters.priceRange[1];

    // Comparar case-insensitive ya que marketplace_products puede tener variaciones
    const productCategory = (product.category || '').toLowerCase().trim();
    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.some(filterCat => 
        productCategory === filterCat.toLowerCase().trim()
      );

    const matchesRating = product.rating >= filters.minRating;

    const matchesFreeShipping =
      !filters.freeShipping || product.free_shipping;

    const productMaterials = normalizeMaterials(product.materials);
    const matchesMaterials =
      filters.materials.length === 0 ||
      filters.materials.some(material => productMaterials.includes(material));

    const productTechniques = normalizeTechniques(product.techniques);
    const matchesTechniques =
      filters.techniques.length === 0 ||
      filters.techniques.some(technique => productTechniques.includes(technique));

    const matchesCrafts =
      filters.crafts.length === 0 ||
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

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "newest":
        return 0;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
              Descubre {products.length} artesanías únicas
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
            {/* FilterSidebar - maneja internamente desktop (sidebar) y mobile (sheet) */}
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              availableCategories={availableCategories}
              products={products}
            />
          
            <div className="flex-1 space-y-6 lg:space-y-8">
              {/* Breadcrumb */}
              <CategoryBreadcrumb 
                categories={filters.categories}
                searchQuery={searchQuery}
              />

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
                      <span className="hidden sm:inline">Sincronizando...</span>
                    </div>
                  )}
                  <ViewToggle view={viewMode} onViewChange={setViewMode} />
                  <SortDropdown value={sortBy} onChange={setSortBy} />
                </div>
              </div>

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
                      Mostrando {sortedProducts.length} {sortedProducts.length === 1 ? 'producto' : 'productos'}
                      {totalPages > 1 && (
                        <span className="ml-1">
                          - Página {currentPage} de {totalPages}
                        </span>
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
                  
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
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
