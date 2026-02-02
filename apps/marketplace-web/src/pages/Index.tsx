import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { telarClient } from "@/lib/telarClient";
import { ProductCard } from "@/components/ProductCard";
import { ProductListItem } from "@/components/ProductListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import { FilterChips } from "@/components/FilterChips";
import { SortDropdown, SortOption } from "@/components/SortDropdown";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { CategoryBreadcrumb } from "@/components/CategoryBreadcrumb";
import { HeroSection } from "@/components/HeroSection";
import { StatsSection } from "@/components/StatsSection";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { FeaturedShops } from "@/components/FeaturedShops";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { ExploreByTrade } from "@/components/ExploreByTrade";
import { PopularMaterials } from "@/components/PopularMaterials";
import { EditorialSection } from "@/components/EditorialSection";
import { NewsletterSection } from "@/components/NewsletterSection";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { getUniqueCategoriesFromProducts } from "@/lib/categoryUtils";
import { mapArtisanCategory } from "@/lib/productMapper";
import { useHybridSearch } from "@/hooks/useHybridSearch";
import { SemanticSearchToggle } from "@/components/SemanticSearchToggle";
import { Sparkles } from "lucide-react";
import { mapProductToMarketplace } from "@/lib/productMapper";
import { normalizeMaterials, normalizeCraft, normalizeTechniques } from "@/lib/normalizationUtils";
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
  images?: string[];
  store_name?: string;
  rating?: number;
  reviews_count?: number;
  is_new?: boolean;
  free_shipping?: boolean;
  stock?: number;
  category?: string;
  craft?: string;
  materials?: string[];
  techniques?: string[];
  created_at?: string;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [currentPage, setCurrentPage] = useState(1);
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
    minRating: null,
    freeShipping: false,
    materials: [],
    techniques: [],
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Detect reset param and clear all filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('reset') === 'true') {
      setFilters({
        priceRange: [0, 10000000],
        categories: [],
        crafts: [],
        minRating: null,
        freeShipping: false,
        materials: [],
        techniques: [],
      });
      setSearchQuery("");
      navigate('/', { replace: true });
    }
  }, [location.search, navigate]);

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

  const fetchProducts = async () => {
    try {
      setError(null);
      
      const { data, error } = await telarClient
        .from('marketplace_products')
        .select('id, name, description, price, image_url, images, store_name, store_slug, rating, reviews_count, is_new, free_shipping, stock, category, craft, materials, techniques, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error de base de datos: ${error.message}`);
      }
      
      setProducts((data || []).map(mapProductToMarketplace));
    } catch (error: any) {
      const errorMessage = error?.message || 'No se pudieron cargar los productos';
      setError(errorMessage);
      toast.error(errorMessage);
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
  const filteredProducts = searchResults.filter(product => {
    // Price range
    const matchesPrice = product.price >= filters.priceRange[0] && 
                        product.price <= filters.priceRange[1];

    // Categories - comparar directamente ya que marketplace_products devuelve categorías mapeadas
    const productCategory = (product.category || '').toLowerCase().trim();
    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.some(filterCat => 
        productCategory === filterCat.toLowerCase().trim()
      );

    // Rating
    const matchesRating = !filters.minRating || 
                         (product.rating && product.rating >= filters.minRating);

    // Free shipping
    const matchesShipping = !filters.freeShipping || product.free_shipping;

    // Materials - normalizar para comparación consistente
    const productMaterialsNormalized = normalizeMaterials(product.materials);
    const matchesMaterials =
      filters.materials.length === 0 ||
      filters.materials.some(material => 
        productMaterialsNormalized.includes(material)
      );

    // Techniques - normalizar para comparación consistente
    const productTechniquesNormalized = normalizeTechniques(product.techniques);
    const matchesTechniques =
      filters.techniques.length === 0 ||
      filters.techniques.some(technique => 
        productTechniquesNormalized.includes(technique)
      );

    // Crafts (Oficios) - normalizar para comparación consistente
    const productCraftNormalized = normalizeCraft(product.craft);
    const matchesCrafts =
      filters.crafts.length === 0 ||
      filters.crafts.includes(productCraftNormalized);

    return matchesPrice && matchesCategory && matchesRating && matchesShipping && matchesMaterials && matchesTechniques && matchesCrafts;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "newest":
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default: // relevance
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
      // Show all pages if total is small
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
      // Show pages with ellipsis
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

  const handleRemoveFilter = (filterType: keyof FilterState, value?: string) => {
    switch (filterType) {
      case 'priceRange':
        setFilters({ ...filters, priceRange: [0, 10000] });
        break;
      case 'categories':
        if (value) {
          setFilters({ 
            ...filters, 
            categories: filters.categories.filter(c => c !== value) 
          });
        }
        break;
      case 'minRating':
        setFilters({ ...filters, minRating: null });
        break;
      case 'freeShipping':
        setFilters({ ...filters, freeShipping: false });
        break;
      case 'materials':
        if (value) {
          setFilters({
            ...filters,
            materials: filters.materials.filter(m => m !== value)
          });
        }
        break;
      case 'techniques':
        if (value) {
          setFilters({
            ...filters,
            techniques: filters.techniques.filter(t => t !== value)
          });
        }
        break;
      case 'crafts':
        if (value) {
          setFilters({
            ...filters,
            crafts: filters.crafts.filter(c => c !== value)
          });
        }
        break;
    }
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 10000000],
      categories: [],
      crafts: [],
      minRating: null,
      freeShipping: false,
      materials: [],
      techniques: [],
    });
    setSearchQuery("");
  };

  const handleHomeClick = () => {
    clearAllFilters();
    navigate("/");
  };

  const handleCategorySearch = (category: string) => {
    setFilters({ ...filters, categories: [category] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHomePage =
    !searchQuery &&
    filters.categories.length === 0 &&
    filters.crafts.length === 0 &&
    filters.materials.length === 0 &&
    filters.techniques.length === 0 &&
    !filters.minRating &&
    !filters.freeShipping &&
    filters.priceRange[0] === 0 &&
    filters.priceRange[1] === 10000000;

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        semanticSearchEnabled={semanticSearchEnabled}
        onSemanticSearchToggle={setSemanticSearchEnabled}
        onHomeClick={handleHomeClick}
      />

      {/* Home Page Sections */}
      {isHomePage ? (
        <>
          <HeroSection />
          <StatsSection />
          <FeaturedCategories onCategoryClick={handleCategorySearch} />
          
          <ExploreByTrade onTradeClick={(craft) => {
            setFilters({ ...filters, crafts: [craft] });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
          
          <FeaturedProducts />
          <PopularMaterials onMaterialClick={(material) => {
            setFilters({ ...filters, materials: [material] });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
          <EditorialSection />
          <FeaturedShops />
          <NewsletterSection />
          <Footer />
        </>
      ) : (
        /* Search & Filter View */
        <div className="container py-8 px-4 lg:px-6" id="products-section">
          {/* Mobile Filters - Collapsible inline */}
          <div className="lg:hidden mb-6">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              availableCategories={availableCategories}
              products={products}
              mobileOnly
            />
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              availableCategories={availableCategories}
              products={products}
              desktopOnly
            />

            {/* Main Content */}
            <main className="flex-1">
            {/* Breadcrumb */}
            <CategoryBreadcrumb 
              categories={filters.categories}
              searchQuery={searchQuery}
              onHomeClick={handleHomeClick}
            />

            {/* Active Filters */}
            <FilterChips
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={clearAllFilters}
            />

            {/* Sort, View Toggle and Results Count */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {sortedProducts.length} {sortedProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                  {totalPages > 1 && (
                    <span className="ml-1">
                      (Página {currentPage} de {totalPages})
                    </span>
                  )}
                </p>
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
              <div className="flex items-center gap-2">
                <ViewToggle view={viewMode} onViewChange={setViewMode} />
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
              }>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 max-w-2xl mx-auto">
                  <p className="text-destructive text-lg font-semibold mb-2">
                    Error al cargar productos
                  </p>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={fetchProducts} variant="outline">
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  {searchQuery || filters.categories.length > 0 || filters.minRating || filters.freeShipping
                    ? 'No se encontraron productos con los filtros seleccionados'
                    : 'No hay productos disponibles'}
                </p>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {paginatedProducts.map((product) => {
                      const imageUrl = product.image_url || (Array.isArray((product as any).images) ? (product as any).images[0] : undefined);
                      return (
                        <ProductCard 
                          key={product.id} 
                          {...product}
                          image_url={imageUrl}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4 mb-8">
                    {paginatedProducts.map((product) => {
                      const imageUrl = product.image_url || (Array.isArray((product as any).images) ? (product as any).images[0] : undefined);
                      return (
                        <ProductListItem 
                          key={product.id} 
                          {...product}
                          image_url={imageUrl}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-8">
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
          </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

