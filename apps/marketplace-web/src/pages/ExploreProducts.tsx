import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { useSearch } from "@/contexts/SearchContext";
import { semanticSearch } from "@/lib/semanticSearchClient";
import {
  getProductsNew,
  getProductPrice,
  type ProductNewCore,
} from "@/services/products-new.actions";
import { formatCurrency } from "@/lib/currencyUtils";
import { Footer } from "@/components/Footer";
import { ExploreProductCard } from "@/components/ExploreProductCard";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PAGE_SIZE = 24;

// ── Filter state ─────────────────────────────────────
interface ExploreFilters {
  categorySlug: string | null;
  subcategorySlug: string | null;
  techniqueId: string | null;
  materialId: string | null;
  craftId: string | null;
  curatorialId: string | null;
  priceRange: [number, number];
  sortBy: "newest" | "price_asc" | "price_desc" | "name";
}

const INITIAL_FILTERS: ExploreFilters = {
  categorySlug: null,
  subcategorySlug: null,
  techniqueId: null,
  materialId: null,
  craftId: null,
  curatorialId: null,
  priceRange: [0, 0],
  sortBy: "newest",
};

// ── Component ────────────────────────────────────────
const ExploreProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchQuery, setSearchQuery } = useSearch();
  const {
    categoryHierarchy,
    findCategoryWithChildren,
    loading: taxonomyLoading,
  } = useTaxonomy();

  const [allProducts, setAllProducts] = useState<ProductNewCore[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalFromApi, setTotalFromApi] = useState(0);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const isInitialMount = useRef(true);
  const [isSearching, setIsSearching] = useState(false);
  const [semanticResults, setSemanticResults] = useState<Array<{ id: string; similarity: number }>>([]);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<ExploreFilters>(() => ({
    ...INITIAL_FILTERS,
    categorySlug: searchParams.get("categoria") || null,
    sortBy:
      (searchParams.get("orden") as ExploreFilters["sortBy"]) || "newest",
  }));

  // Sync searchQuery from URL on mount and when URL changes
  useEffect(() => {
    const queryFromUrl = searchParams.get("q");
    if (queryFromUrl && queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl);
    } else if (!queryFromUrl && searchQuery) {
      setSearchQuery("");
    }
  }, [searchParams]); // Solo depender de searchParams, no de setSearchQuery

  // Perform semantic search when searchQuery changes
  useEffect(() => {
    const performSemanticSearch = async () => {
      // Si no hay query o es muy corto, limpiar resultados semánticos
      if (!searchQuery || searchQuery.trim().length < 3) {
        setSemanticResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await semanticSearch({
          query: searchQuery,
          limit: 50,
          min_similarity: 0.3,
        });

        console.log('[ExploreProducts] Semantic search results:', response);

        // Guardar IDs con scores, ya ordenados por relevancia
        const results = response.results
          .filter(result => result.product_id)
          .map(result => ({
            id: result.product_id,
            similarity: result.similarity
          }));

        setSemanticResults(results);
      } catch (error) {
        console.error('[ExploreProducts] Semantic search error:', error);
        setSemanticResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce: esperar 500ms después de que el usuario deje de escribir
    const timeoutId = setTimeout(() => {
      performSemanticSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Resolve active category from taxonomy
  const activeCategory = useMemo(
    () =>
      filters.categorySlug
        ? findCategoryWithChildren(filters.categorySlug)
        : null,
    [filters.categorySlug, findCategoryWithChildren],
  );

  // Determine which categoryIds to match (parent + its subcategories)
  const targetCategoryIds = useMemo(() => {
    if (filters.subcategorySlug && activeCategory) {
      const sub = activeCategory.subcategories.find(
        (s) => s.slug === filters.subcategorySlug,
      );
      return sub ? [sub.id] : [activeCategory.id];
    }
    if (activeCategory) {
      // Include parent + all subcategory IDs
      return [
        activeCategory.id,
        ...activeCategory.subcategories.map((s) => s.id),
      ];
    }
    return undefined;
  }, [filters.subcategorySlug, activeCategory]);

  // ── Fetch ALL products then filter client-side by category ──
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Always fetch all products — category filtering is done client-side
      // because the API only supports single categoryId, not parent+children
      const res = await getProductsNew({ page: 1, limit: 500 });
      let products: ProductNewCore[] = [];
      if (Array.isArray(res)) {
        products = res as ProductNewCore[];
      } else {
        products = res.data ?? [];
      }

      // Filter by category client-side (parent includes subcategories)
      if (targetCategoryIds && targetCategoryIds.length > 0) {
        const catSet = new Set(targetCategoryIds);
        products = products.filter((p) => catSet.has(p.categoryId));
      }

      setAllProducts(products);
      setTotalFromApi(products.length);
    } catch {
      setAllProducts([]);
      setTotalFromApi(0);
    } finally {
      setLoading(false);
    }
  }, [targetCategoryIds]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── CROSS-INTERSECTION: each filter's options are derived from products
  //    that match ALL OTHER active filters (excluding itself).
  //    This way selecting a technique narrows materials, and vice versa. ──

  /** Apply all filters EXCEPT the one named `exclude` */
  const productsExcluding = useCallback(
    (exclude: keyof ExploreFilters) => {
      let result = allProducts;
      if (exclude !== "techniqueId" && filters.techniqueId) {
        result = result.filter(
          (p) =>
            p.artisanalIdentity?.primaryTechnique?.id === filters.techniqueId,
        );
      }
      if (exclude !== "craftId" && filters.craftId) {
        result = result.filter(
          (p) => p.artisanalIdentity?.primaryCraft?.id === filters.craftId,
        );
      }
      if (exclude !== "materialId" && filters.materialId) {
        result = result.filter((p) =>
          (p.materials ?? []).some(
            (m) => m.material?.id === filters.materialId,
          ),
        );
      }
      if (exclude !== "curatorialId" && filters.curatorialId) {
        result = result.filter(
          (p) =>
            p.artisanalIdentity?.curatorialCategory?.id === filters.curatorialId,
        );
      }
      return result;
    },
    [allProducts, filters.techniqueId, filters.craftId, filters.materialId, filters.curatorialId],
  );

  const availableTechniques = useMemo(() => {
    const map = new Map<string, string>();
    productsExcluding("techniqueId").forEach((p) => {
      const t = p.artisanalIdentity?.primaryTechnique;
      if (t?.id && t.name) map.set(t.id, t.name);
    });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [productsExcluding]);

  const availableCrafts = useMemo(() => {
    const map = new Map<string, string>();
    productsExcluding("craftId").forEach((p) => {
      const c = p.artisanalIdentity?.primaryCraft;
      if (c?.id && c.name) map.set(c.id, c.name);
    });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [productsExcluding]);

  const availableMaterials = useMemo(() => {
    const map = new Map<string, string>();
    productsExcluding("materialId").forEach((p) => {
      (p.materials ?? []).forEach((ml) => {
        if (ml.material?.id && ml.material.name)
          map.set(ml.material.id, ml.material.name);
      });
    });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [productsExcluding]);

  const availableCuratorial = useMemo(() => {
    const map = new Map<string, string>();
    productsExcluding("curatorialId").forEach((p) => {
      const cc = p.artisanalIdentity?.curatorialCategory;
      if (cc?.id && cc.name) map.set(cc.id, cc.name);
    });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [productsExcluding]);

  // ── Dynamic price range from loaded products ──
  const priceExtent = useMemo(() => {
    const prices = allProducts
      .map((p) => getProductPrice(p))
      .filter((p): p is number => p != null && p > 0);
    if (prices.length === 0) return { min: 0, max: 5000000 };
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [allProducts]);

  // Initialize price range when products load
  useEffect(() => {
    setFilters((prev) => {
      // Only update if user hasn't manually set a price filter
      if (prev.priceRange[1] === 0 || prev.priceRange[1] === 5000000) {
        return { ...prev, priceRange: [0, priceExtent.max] };
      }
      return prev;
    });
  }, [priceExtent.max]);

  // ── Sync filters and search to URL (skip on initial mount) ──
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const params: Record<string, string> = {};
    if (searchQuery) params.q = searchQuery;
    if (filters.categorySlug) params.categoria = filters.categorySlug;
    if (filters.sortBy !== "newest") params.orden = filters.sortBy;
    setSearchParams(params, { replace: true });
  }, [filters.categorySlug, filters.sortBy, searchQuery, setSearchParams]);

  // ── Client-side filtering ──
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Semantic search filter (takes priority over local text search)
    if (searchQuery && searchQuery.trim().length >= 3 && semanticResults.length > 0) {
      // Crear map de productos por ID para búsqueda rápida
      const productMap = new Map(allProducts.map(p => [p.id, p]));

      // Mapear resultados semánticos a productos, MANTENIENDO EL ORDEN de relevancia
      result = semanticResults
        .map(sr => productMap.get(sr.id))
        .filter((p): p is ProductNewCore => p !== undefined);

      console.log('[ExploreProducts] Usando orden de búsqueda semántica:', result.length, 'productos');
    } else if (searchQuery && searchQuery.trim().length > 0) {
      // Fallback: búsqueda local si no hay resultados semánticos
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const productName = p.name?.toLowerCase() || "";
        const shopName = p.artisanShop?.shopName?.toLowerCase() || "";
        const technique = p.artisanalIdentity?.primaryTechnique?.name?.toLowerCase() || "";
        const craft = p.artisanalIdentity?.primaryCraft?.name?.toLowerCase() || "";
        const description = p.description?.toLowerCase() || "";
        const department = p.artisanShop?.department?.toLowerCase() || "";

        return (
          productName.includes(query) ||
          shopName.includes(query) ||
          technique.includes(query) ||
          craft.includes(query) ||
          description.includes(query) ||
          department.includes(query)
        );
      });
    }

    if (filters.techniqueId) {
      result = result.filter(
        (p) =>
          p.artisanalIdentity?.primaryTechnique?.id === filters.techniqueId,
      );
    }
    if (filters.materialId) {
      result = result.filter((p) =>
        (p.materials ?? []).some(
          (m) => m.material?.id === filters.materialId,
        ),
      );
    }
    if (filters.craftId) {
      result = result.filter(
        (p) => p.artisanalIdentity?.primaryCraft?.id === filters.craftId,
      );
    }
    if (filters.curatorialId) {
      result = result.filter(
        (p) =>
          p.artisanalIdentity?.curatorialCategory?.id === filters.curatorialId,
      );
    }
    // Price filter
    if (filters.priceRange[1] > 0) {
      result = result.filter((p) => {
        const price = getProductPrice(p) ?? 0;
        return (
          price >= filters.priceRange[0] && price <= filters.priceRange[1]
        );
      });
    }

    // Sort - NO reordenar si estamos usando búsqueda semántica con orden por defecto
    const usingSemanticOrder = semanticResults.length > 0 && filters.sortBy === "newest";

    if (!usingSemanticOrder) {
      switch (filters.sortBy) {
        case "price_asc":
          result.sort(
            (a, b) => (getProductPrice(a) ?? 0) - (getProductPrice(b) ?? 0),
          );
          break;
        case "price_desc":
          result.sort(
            (a, b) => (getProductPrice(b) ?? 0) - (getProductPrice(a) ?? 0),
          );
          break;
        case "name":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "newest":
          // Solo ordenar por fecha si NO estamos usando orden semántico
          if (semanticResults.length === 0) {
            // Mantener orden original (por fecha de creación)
          }
          break;
        default:
          break;
      }
    } else {
      console.log('[ExploreProducts] Manteniendo orden de relevancia semántica');
    }

    return result;
  }, [allProducts, filters, searchQuery, semanticResults]);

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(
    () => filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredProducts, page],
  );

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [
    filters.categorySlug,
    filters.subcategorySlug,
    filters.techniqueId,
    filters.materialId,
    filters.craftId,
    filters.curatorialId,
    filters.priceRange[1],
    filters.sortBy,
    searchQuery,
  ]);

  // ── Active filter count ──
  const activeFilterCount = [
    filters.categorySlug,
    filters.subcategorySlug,
    filters.techniqueId,
    filters.materialId,
    filters.craftId,
    filters.curatorialId,
    filters.priceRange[1] > 0 && filters.priceRange[1] < priceExtent.max
      ? "price"
      : null,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setFilters({ ...INITIAL_FILTERS, priceRange: [0, priceExtent.max] });
    setPage(1);
  };

  const updateFilter = <K extends keyof ExploreFilters>(
    key: K,
    value: ExploreFilters[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
      // Reset dependent filters when category changes
      ...(key === "categorySlug"
        ? {
            subcategorySlug: null,
            techniqueId: null,
            materialId: null,
            craftId: null,
            curatorialId: null,
            priceRange: [0, 0] as [number, number],
          }
        : {}),
    }));
  };

  // ── Pagination helpers ──
  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  // ── Sidebar content (shared between desktop & mobile) ──
  const renderFilters = (isMobile = false) => {
    const maxH = isMobile ? "max-h-40" : "max-h-48";
    return (
      <div className="space-y-8">
        {/* Oficio */}
        {availableCrafts.length > 0 && (
          <FilterSection title="Oficio" defaultOpen>
            <ul
              className={`pt-4 space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans ${maxH} overflow-y-auto`}
            >
              {availableCrafts.map((c) => (
                <li
                  key={c.id}
                  onClick={() => updateFilter("craftId", c.id)}
                  className={`hover:text-primary cursor-pointer transition-colors flex items-center gap-2 ${
                    filters.craftId === c.id
                      ? "font-bold text-charcoal"
                      : ""
                  }`}
                >
                  {filters.craftId === c.id && (
                    <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                  )}
                  {c.name}
                </li>
              ))}
            </ul>
          </FilterSection>
        )}

        {/* Técnica artesanal */}
        {availableTechniques.length > 0 && (
          <FilterSection title="Técnica artesanal">
            <ul
              className={`pt-4 space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans ${maxH} overflow-y-auto`}
            >
              {availableTechniques.map((t) => (
                <li
                  key={t.id}
                  onClick={() => updateFilter("techniqueId", t.id)}
                  className={`hover:text-primary cursor-pointer transition-colors flex items-center gap-2 ${
                    filters.techniqueId === t.id
                      ? "font-bold text-charcoal"
                      : ""
                  }`}
                >
                  {filters.techniqueId === t.id && (
                    <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                  )}
                  {t.name}
                </li>
              ))}
            </ul>
          </FilterSection>
        )}

        {/* Material */}
        {availableMaterials.length > 0 && (
          <FilterSection title="Material">
            <ul
              className={`pt-4 space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans ${maxH} overflow-y-auto`}
            >
              {availableMaterials.map((m) => (
                <li
                  key={m.id}
                  onClick={() => updateFilter("materialId", m.id)}
                  className={`hover:text-primary cursor-pointer transition-colors flex items-center gap-2 ${
                    filters.materialId === m.id
                      ? "font-bold text-charcoal"
                      : ""
                  }`}
                >
                  {filters.materialId === m.id && (
                    <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                  )}
                  {m.name}
                </li>
              ))}
            </ul>
          </FilterSection>
        )}

        {/* Colección curatorial */}
        {availableCuratorial.length > 0 && (
          <FilterSection title="Colección">
            <ul className="pt-4 space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans">
              {availableCuratorial.map((cc) => (
                <li
                  key={cc.id}
                  onClick={() => updateFilter("curatorialId", cc.id)}
                  className={`hover:text-primary cursor-pointer transition-colors flex items-center gap-2 ${
                    filters.curatorialId === cc.id
                      ? "font-bold text-charcoal"
                      : ""
                  }`}
                >
                  {filters.curatorialId === cc.id && (
                    <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                  )}
                  {cc.name}
                </li>
              ))}
            </ul>
          </FilterSection>
        )}

        {/* Precio */}
        {priceExtent.max > 0 && (
          <FilterSection title="Precio">
            <div className="pt-6 px-1">
              <input
                type="range"
                className="w-full h-1 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                min={0}
                max={priceExtent.max}
                step={Math.max(1000, Math.round(priceExtent.max / 100))}
                value={filters.priceRange[1] || priceExtent.max}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    priceRange: [0, Number(e.target.value)],
                  }))
                }
              />
              <div className="flex justify-between mt-4 text-[10px] font-bold font-sans uppercase">
                <span>{formatCurrency(0)}</span>
                <span>
                  {formatCurrency(filters.priceRange[1] || priceExtent.max)}
                </span>
              </div>
            </div>
          </FilterSection>
        )}
      </div>
    );
  };

  return (
    <div className="bg-editorial-bg text-charcoal min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <nav className="flex text-[10px] uppercase tracking-widest text-charcoal/50 gap-2 font-sans">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">
            {searchQuery && searchQuery.trim().length > 0 ? "Búsqueda" : "Explorar"}
          </span>
          {searchQuery && searchQuery.trim().length > 0 && (
            <>
              <span>/</span>
              <span className="text-charcoal">"{searchQuery}"</span>
            </>
          )}
          {!searchQuery && activeCategory && (
            <>
              <span>/</span>
              <span className="text-charcoal">{activeCategory.name}</span>
            </>
          )}
        </nav>
      </div>

      {/* Header */}
      <section className="max-w-[1400px] mx-auto px-6 mb-12">
        <div className="py-8 border-b border-charcoal/5">
          <h1 className="text-5xl md:text-7xl leading-[0.85] font-serif mb-6 text-charcoal tracking-tight">
            {searchQuery && searchQuery.trim().length > 0 ? (
              <>
                RESULTADOS <br />
                <span className="italic text-primary">DE BÚSQUEDA</span>
              </>
            ) : activeCategory ? (
              <>
                {activeCategory.name.split(" ")[0].toUpperCase()}
                <br />
                <span className="italic text-primary">
                  {activeCategory.name.split(" ").slice(1).join(" ").toUpperCase() || "ARTESANAL"}
                </span>
              </>
            ) : (
              <>
                EXPLORAR <br />
                <span className="italic text-primary">PIEZAS</span>
              </>
            )}
          </h1>
          <p className="text-sm text-charcoal/70 max-w-lg font-sans leading-relaxed">
            {searchQuery && searchQuery.trim().length > 0
              ? `Mostrando resultados para "${searchQuery}"`
              : activeCategory?.description ??
                "Descubre piezas artesanales únicas de Colombia. Cada objeto cuenta la historia de un artesano, una técnica y un territorio."}
          </p>
        </div>
      </section>

      {/* Category Pills */}
      <section className="max-w-[1400px] mx-auto px-6 mb-8 overflow-hidden">
        <div className="flex gap-3 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => updateFilter("categorySlug", null as any)}
            className={`px-8 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap rounded-full font-sans transition-colors ${
              !filters.categorySlug
                ? "bg-primary text-white"
                : "border border-charcoal/10 hover:border-primary"
            }`}
          >
            Todos
          </button>
          {categoryHierarchy.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter("categorySlug", cat.slug)}
              className={`px-8 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap rounded-full font-sans transition-colors ${
                filters.categorySlug === cat.slug
                  ? "bg-primary text-white"
                  : "border border-charcoal/10 hover:border-primary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Subcategory pills */}
        {activeCategory && activeCategory.subcategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => updateFilter("subcategorySlug", null as any)}
              className={`px-6 py-2 text-[9px] font-bold uppercase tracking-[0.15em] whitespace-nowrap rounded-full font-sans transition-colors ${
                !filters.subcategorySlug
                  ? "bg-charcoal text-white"
                  : "border border-charcoal/10 hover:border-charcoal/30"
              }`}
            >
              Todos en {activeCategory.name}
            </button>
            {activeCategory.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => updateFilter("subcategorySlug", sub.slug)}
                className={`px-6 py-2 text-[9px] font-bold uppercase tracking-[0.15em] whitespace-nowrap rounded-full font-sans transition-colors ${
                  filters.subcategorySlug === sub.slug
                    ? "bg-charcoal text-white"
                    : "border border-charcoal/10 hover:border-charcoal/30"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Main Layout */}
      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-32 max-h-[calc(100vh-160px)] overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-charcoal/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              {renderFilters()}
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 border border-charcoal/10 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest font-sans hover:border-primary transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filtros
                  {activeFilterCount > 0 && (
                    <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px]">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <span className="text-[11px] uppercase tracking-[0.2em] text-charcoal/50 font-sans">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "pieza" : "piezas"}
                </span>

                {/* Search indicator */}
                {searchQuery && searchQuery.trim().length > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                    <Sparkles className={`h-3.5 w-3.5 ${isSearching ? 'animate-pulse' : ''}`} />
                    <span>
                      {isSearching
                        ? 'Buscando con IA...'
                        : semanticResults.length > 0
                          ? `Búsqueda inteligente (${semanticResults.length})`
                          : 'Búsqueda activa'}
                    </span>
                  </div>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    updateFilter(
                      "sortBy",
                      e.target.value as ExploreFilters["sortBy"],
                    )
                  }
                  className="appearance-none bg-transparent border border-charcoal/10 px-6 py-2 pr-10 rounded-full text-[10px] font-bold uppercase tracking-widest font-sans cursor-pointer hover:border-primary transition-colors"
                >
                  <option value="newest">Más recientes</option>
                  <option value="price_asc">Precio: menor a mayor</option>
                  <option value="price_desc">Precio: mayor a menor</option>
                  <option value="name">Nombre A-Z</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-charcoal/40" />
              </div>
            </div>

            {/* Active filter chips */}
            {(activeFilterCount > 0 || (searchQuery && searchQuery.trim().length > 0)) && (
              <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-charcoal/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">
                  {searchQuery && searchQuery.trim().length > 0 ? "Búsqueda:" : "Filtros:"}
                </span>
                {searchQuery && searchQuery.trim().length > 0 && (
                  <FilterChip
                    label={`"${searchQuery}"`}
                    onRemove={() => setSearchQuery("")}
                  />
                )}
                {filters.categorySlug && activeCategory && (
                  <FilterChip
                    label={activeCategory.name}
                    onRemove={() =>
                      updateFilter("categorySlug", null as any)
                    }
                  />
                )}
                {filters.techniqueId && (
                  <FilterChip
                    label={
                      availableTechniques.find(
                        (t) => t.id === filters.techniqueId,
                      )?.name ?? ""
                    }
                    onRemove={() =>
                      updateFilter("techniqueId", null as any)
                    }
                  />
                )}
                {filters.materialId && (
                  <FilterChip
                    label={
                      availableMaterials.find(
                        (m) => m.id === filters.materialId,
                      )?.name ?? ""
                    }
                    onRemove={() =>
                      updateFilter("materialId", null as any)
                    }
                  />
                )}
                {filters.craftId && (
                  <FilterChip
                    label={
                      availableCrafts.find((c) => c.id === filters.craftId)
                        ?.name ?? ""
                    }
                    onRemove={() => updateFilter("craftId", null as any)}
                  />
                )}
                {filters.curatorialId && (
                  <FilterChip
                    label={
                      availableCuratorial.find(
                        (c) => c.id === filters.curatorialId,
                      )?.name ?? ""
                    }
                    onRemove={() =>
                      updateFilter("curatorialId", null as any)
                    }
                  />
                )}
                <button
                  onClick={() => {
                    clearAllFilters();
                    setSearchQuery("");
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary hover:opacity-70 transition-opacity ml-2"
                >
                  Limpiar todo
                </button>
              </div>
            )}

            {/* Product Grid */}
            {loading || taxonomyLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-24">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-[#e5e1d8] aspect-[3/4] mb-6 rounded-sm" />
                    <div className="h-4 bg-[#e5e1d8] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#e5e1d8] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-24">
                {paginatedProducts.map((product, idx) => (
                  <ExploreProductCard
                    key={product.id}
                    product={product}
                    className={
                      idx % 3 === 1
                        ? "md:mt-12"
                        : idx % 3 === 2
                          ? "md:-mt-6"
                          : ""
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32">
                <p className="text-charcoal/40 text-sm font-sans mb-6">
                  {searchQuery && searchQuery.trim().length > 0
                    ? `No se encontraron resultados para "${searchQuery}"`
                    : "No se encontraron piezas con estos filtros."}
                </p>
                <button
                  onClick={() => {
                    clearAllFilters();
                    setSearchQuery("");
                  }}
                  className="border border-primary text-primary px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-primary hover:text-white transition-all font-sans"
                >
                  Limpiar {searchQuery && searchQuery.trim().length > 0 ? "búsqueda y filtros" : "filtros"}
                </button>
              </div>
            )}

            {/* ── Numbered Pagination ── */}
            {!loading && totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center gap-2">
                {/* Previous */}
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-charcoal/10 text-charcoal/50 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {pageNumbers.map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`dots-${i}`}
                      className="w-10 h-10 flex items-center justify-center text-[11px] text-charcoal/30 font-sans"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p as number)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full text-[11px] font-bold font-sans tracking-wider transition-colors ${
                        page === p
                          ? "bg-primary text-white"
                          : "border border-charcoal/10 text-charcoal/60 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

                {/* Next */}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-charcoal/10 text-charcoal/50 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="pb-24" />
      <Footer />

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-editorial-bg overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold font-sans">Filtros</h3>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderFilters(true)}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-8 w-full bg-primary text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm"
            >
              Ver {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "pieza" : "piezas"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Shared components ────────────────────────────────
function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="bg-charcoal text-white text-[9px] px-3 py-1 flex items-center gap-2 rounded-full font-bold uppercase tracking-wider">
      {label}
      <button onClick={onRemove} className="text-white/70 hover:text-white">
        ×
      </button>
    </span>
  );
}

function FilterSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-primary/20 pb-4">
      <details className="group" open={defaultOpen || undefined}>
        <summary className="flex justify-between items-center cursor-pointer list-none py-2">
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold font-sans">
            {title}
          </h3>
          <span className="text-lg group-open:rotate-180 transition-transform select-none">
            ▾
          </span>
        </summary>
        {children}
      </details>
    </div>
  );
}

export default ExploreProducts;
