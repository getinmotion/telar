import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import * as ProductsActions from "@/services/products.actions";
import { ProductCard } from "@/components/ProductCard";
import { ProductListItem } from "@/components/ProductListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/contexts/SearchContext";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import { FilterChips } from "@/components/FilterChips";
import { SortDropdown, SortOption } from "@/components/SortDropdown";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { CategoryBreadcrumb } from "@/components/CategoryBreadcrumb";
// HeroSection original (comentado temporalmente)
// import { HeroSection } from "@/components/HeroSection";
// Nuevo HeroSectionV2
import { HeroSectionV2 } from "@/components/HeroSectionV2";
// StatsSection original (comentado temporalmente)
// import { StatsSection } from "@/components/StatsSection";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { FeaturedShops } from "@/components/FeaturedShops";
import { FeaturedProducts } from "@/components/FeaturedProducts";
// ExploreByTrade (comentado temporalmente)
// import { ExploreByTrade } from "@/components/ExploreByTrade";
// PopularMaterials - Materiales Naturales (comentado temporalmente)
// import { PopularMaterials } from "@/components/PopularMaterials";
import { FeaturedArticles } from "@/components/blog/FeaturedArticles";
import { NewsletterSection } from "@/components/NewsletterSection";
import { Footer } from "@/components/Footer";
import heroTextiles from "@/assets/hero-textiles.png";
import { toast } from "sonner";
import { getUniqueCategoriesFromProducts } from "@/lib/categoryUtils";
import { mapArtisanCategory } from "@/lib/productMapper";
import { useHybridSearch } from "@/hooks/useHybridSearch";
import { SemanticSearchToggle } from "@/components/SemanticSearchToggle";
import { Sparkles } from "lucide-react";
import {
  normalizeMaterials,
  normalizeMaterial,
  normalizeCraft,
  normalizeTechniques,
  formatArtisanText,
} from "@/lib/normalizationUtils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Product } from "@/types/products.types";

const PRODUCTS_PER_PAGE = 24;

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
const distributedShuffle = <T extends { storeName?: string }>(
  array: T[],
  seed: number,
): T[] => {
  if (array.length <= 1) return array;

  // Group by store
  const byStore = new Map<string, T[]>();
  array.forEach((item) => {
    const store = item.storeName || "unknown";
    if (!byStore.has(store)) byStore.set(store, []);
    byStore.get(store)!.push(item);
  });

  // Shuffle each group internally
  const shuffledGroups = Array.from(byStore.values()).map((group) =>
    seededShuffle(group, seed),
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
const prioritizedDistributedShuffle = <
  T extends { storeName?: string; canPurchase?: boolean },
>(
  array: T[],
  seed: number,
): T[] => {
  // Separate purchasable and non-purchasable products
  const purchasable = array.filter((item) => item.canPurchase === true);
  const notPurchasable = array.filter((item) => item.canPurchase !== true);

  // Apply distributed shuffle to each group
  const shuffledPurchasable = distributedShuffle(purchasable, seed);
  const shuffledNotPurchasable = distributedShuffle(notPurchasable, seed + 1);

  // Concatenate: purchasable first
  return [...shuffledPurchasable, ...shuffledNotPurchasable];
};

const Index = () => {
  const { searchQuery, setSearchQuery, semanticSearchEnabled, setSemanticSearchEnabled, clearSearch } = useSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("productViewMode");
    return (saved as ViewMode) || "grid";
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
  const productsContainerRef = useRef<HTMLDivElement>(null);

  // Random seed generated once per session for consistent randomization
  const [randomSeed] = useState(() => Math.floor(Math.random() * 1000000));

  // Detect reset param and clear all filters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("reset") === "true") {
      setFilters({
        priceRange: [0, 10000000],
        categories: [],
        crafts: [],
        minRating: null,
        freeShipping: false,
        materials: [],
        techniques: [],
      });
      clearSearch();
      navigate("/", { replace: true });
    }
  }, [location.search, navigate, clearSearch]);

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

      // Fetch all products from the products service (includes inventory, shop info, category, etc.)
      const response = await ProductsActions.getProducts({
        order: "DESC",
        limit: 50, // Get all products
      });


      // Map from camelCase Product type to snake_case local Product interface
      const mappedProducts = response.data.map((product) => {
        return {
          ...product,
          price: product.price
        };
      });

      setProducts(mappedProducts);
    } catch (error: any) {
      const errorMessage =
        error?.message || "No se pudieron cargar los productos";
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
    semanticResultsCount,
  } = useHybridSearch({
    products,
    filters,
  });

  // Aplicar filtros adicionales sobre los resultados de búsqueda
  const filteredProducts = searchResults.filter((product) => {
    // Price range
    const matchesPrice =
      parseFloat(product.price.toString()) >= filters.priceRange[0] &&
      parseFloat(product.price.toString()) <= filters.priceRange[1];

    // Categories - comparar directamente ya que marketplace_products devuelve categorías mapeadas
    const productCategory = (product.category || "").toLowerCase().trim();
    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.some(
        (filterCat) =>
          filterCat && productCategory === filterCat.toLowerCase().trim(),
      );

    // Rating
    const matchesRating =
      !filters.minRating ||
      (product.rating && product.rating >= filters.minRating);

    // Free shipping
    const matchesShipping = !filters.freeShipping 

    // Materials - normalizar AMBOS lados para comparación consistente
    const productMaterialsNormalized = normalizeMaterials(product.materials);
    const matchesMaterials =
      filters.materials.length === 0 ||
      filters.materials.some((material) =>
        productMaterialsNormalized.includes(normalizeMaterial(material)),
      );

    // Techniques - normalizar AMBOS lados para comparación consistente
    const productTechniquesNormalized = normalizeTechniques(product.techniques);
    const matchesTechniques =
      filters.techniques.length === 0 ||
      filters.techniques.some((technique) =>
        productTechniquesNormalized.includes(formatArtisanText(technique)),
      );

    // Crafts (Oficios) - normalizar para comparación consistente
    const productCraftNormalized = normalizeCraft(product.craft);
    const matchesCrafts =
      filters.crafts.length === 0 ||
      filters.crafts.includes(productCraftNormalized);

    return (
      matchesPrice &&
      matchesCategory &&
      matchesRating &&
      matchesShipping &&
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
        return sorted.sort((a, b) => parseFloat(a.price.toString()) - parseFloat(b.price.toString()));
      case "price-desc":
        return sorted.sort((a, b) => parseFloat(b.price.toString()) - parseFloat(a.price.toString()));
      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );
      case "rating":
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default: // relevance - random order
        return prioritizedDistributedShuffle(sorted, randomSeed);
    }
  }, [filteredProducts, sortBy, randomSeed]);

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
    // Scroll to products container for better UX
    if (productsContainerRef.current) {
      productsContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
          </PaginationItem>,
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
        </PaginationItem>,
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
          </PaginationItem>,
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
        </PaginationItem>,
      );
    }

    return items;
  };

  const handleRemoveFilter = (
    filterType: keyof FilterState,
    value?: string,
  ) => {
    switch (filterType) {
      case "priceRange":
        setFilters({ ...filters, priceRange: [0, 10000] });
        break;
      case "categories":
        if (value) {
          setFilters({
            ...filters,
            categories: filters.categories.filter((c) => c !== value),
          });
        }
        break;
      case "minRating":
        setFilters({ ...filters, minRating: null });
        break;
      case "freeShipping":
        setFilters({ ...filters, freeShipping: false });
        break;
      case "materials":
        if (value) {
          setFilters({
            ...filters,
            materials: filters.materials.filter((m) => m !== value),
          });
        }
        break;
      case "techniques":
        if (value) {
          setFilters({
            ...filters,
            techniques: filters.techniques.filter((t) => t !== value),
          });
        }
        break;
      case "crafts":
        if (value) {
          setFilters({
            ...filters,
            crafts: filters.crafts.filter((c) => c !== value),
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
    clearSearch();
  };

  const handleHomeClick = () => {
    clearAllFilters();
    navigate("/");
  };

  const handleCategorySearch = (category: string) => {
    setFilters({ ...filters, categories: [category] });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      {/* Home Page Sections */}
      {isHomePage ? (
        <>
          {/* HeroSection original (comentado temporalmente) */}
          {/* <HeroSection /> */}
          {/* Nuevo HeroSectionV2 */}
          <HeroSectionV2 />

          {/* StatsSection original (comentado temporalmente) */}
          {/* <StatsSection /> */}

          {/* Nueva sección de valores */}
          <section className="w-full bg-muted/30 py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">

                {/* Hecho a mano */}
                <div className="flex flex-col gap-3 text-center">
                  <h3 className="text-lg md:text-xl font-serif italic text-foreground">
                    Hecho a mano
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide leading-relaxed">
                    Cada pieza es creada por talleres artesanales reales que mantienen vivas técnicas tradicionales.
                  </p>
                </div>

                {/* Origen cultural */}
                <div className="flex flex-col gap-3 text-center">
                  <h3 className="text-lg md:text-xl font-serif italic text-foreground">
                    Origen cultural
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide leading-relaxed">
                    Los objetos conservan la historia de la región y las comunidades donde fueron creados.
                  </p>
                </div>

                {/* Autenticidad registrada */}
                <div className="flex flex-col gap-3 text-center">
                  <h3 className="text-lg md:text-xl font-serif italic text-foreground">
                    Autenticidad registrada
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide leading-relaxed">
                    Cada pieza cuenta con una huella digital que documenta su origen, su taller y su proceso artesanal.
                  </p>
                </div>

              </div>
            </div>
          </section>

          <FeaturedCategories onCategoryClick={handleCategorySearch} />

          {/* ExploreByTrade - Explora por Oficio Artesanal (comentado temporalmente) */}
          {/* <ExploreByTrade
            onTradeClick={(craft) => {
              setFilters({ ...filters, crafts: [craft] });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          /> */}

          <FeaturedProducts />

          {/* PopularMaterials - Materiales Naturales (comentado temporalmente) */}
          {/* <PopularMaterials
            onMaterialClick={(material) => {
              setFilters({ ...filters, materials: [material] });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          /> */}

          {/* Nueva sección: Un Marketplace Diferente */}
          <section className="w-full bg-[#2a2a2a] py-20 md:py-32">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="flex flex-col items-center justify-center gap-8 text-center">
                {/* Subtítulo superior */}
                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-[0.3em]">
                  Un marketplace diferente
                </p>

                {/* Texto principal en cursiva */}
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-white leading-relaxed max-w-3xl">
                  Telar conecta a compradores con talleres artesanales reales. Cada pieza tiene origen, autor y proceso documentado.
                </h2>

                {/* Botón */}
                <Link to="/about">
                  <Button
                    variant="outline"
                    size="lg"
                    className="mt-4 border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white bg-transparent uppercase tracking-wider text-sm font-semibold px-8 py-6"
                  >
                    Descubrir cómo funciona Telar
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <FeaturedArticles />
          <FeaturedShops />

          {/* Nueva sección: Comercio Justo */}
          <section className="w-full bg-muted/20 py-8 md:py-10">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mx-[10%]">

                {/* Columna 1: Contenido de texto */}
                <div className="flex flex-col gap-6">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground">
                    Comercio justo para quienes crean
                  </h2>

                  <p className="text-base md:text-lg text-muted-foreground italic leading-relaxed">
                    Trabajamos directamente con talleres artesanales para asegurar que quienes crean las piezas reciban una compensación justa por su trabajo. Construimos relaciones directas entre quienes crean las piezas y quienes las valoran.
                  </p>

                  <Link
                    to="/about"
                    className="text-foreground hover:text-foreground/80 underline transition-colors text-base font-medium w-fit"
                  >
                    Conocer más
                  </Link>
                </div>

                {/* Columna 2: Imagen */}
                <div className="relative rounded-lg overflow-hidden shadow-2xl">
                  <img
                    src={heroTextiles}
                    alt="Artesanía textil colombiana"
                    className="w-full h-full min-h-[250px] md:min-h-[300px] object-cover"
                  />
                </div>

              </div>
            </div>
          </section>

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
                    {sortedProducts.length}{" "}
                    {sortedProducts.length === 1
                      ? "producto encontrado"
                      : "productos encontrados"}
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
                          <span>
                            Búsqueda inteligente: {semanticResultsCount}{" "}
                            resultado{semanticResultsCount !== 1 ? "s" : ""}
                          </span>
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
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                  }
                >
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
                    {searchQuery ||
                    filters.categories.length > 0 ||
                    filters.minRating ||
                    filters.freeShipping
                      ? "No se encontraron productos con los filtros seleccionados"
                      : "No hay productos disponibles"}
                  </p>
                </div>
              ) : (
                <>
                  {viewMode === "grid" ? (
                    <div
                      ref={productsContainerRef}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
                    >
                      {paginatedProducts.map((product) => {
                        const imageUrl =
                          product.imageUrl ||
                          (Array.isArray((product as any).images)
                            ? (product as any).images[0]
                            : undefined);
                        return (
                          <ProductCard
                            key={product.id}
                            {...product}
                            imageUrl={imageUrl}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4 mb-8">
                      {paginatedProducts.map((product) => {
                        const imageUrl =
                          product.imageUrl ||
                          (Array.isArray((product as any).images)
                            ? (product as any).images[0]
                            : undefined);
                        return (
                          <ProductListItem
                            key={product.id}
                            {...product}
                            imageUrl={imageUrl}
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
                            onClick={() =>
                              currentPage > 1 &&
                              handlePageChange(currentPage - 1)
                            }
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>

                        {renderPaginationItems()}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              currentPage < totalPages &&
                              handlePageChange(currentPage + 1)
                            }
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
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
