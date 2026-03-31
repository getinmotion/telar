import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import {
  getProductsNew,
  getPrimaryImageUrl,
  getProductPrice,
  getProductStock,
  getMaterialNames,
  getCraftName,
  getTechniqueName,
  type ProductNewCore,
} from "@/services/products-new.actions";
import { formatCurrency } from "@/lib/currencyUtils";
import { Heart, SlidersHorizontal, X, ChevronDown } from "lucide-react";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  priceRange: [0, 5000000],
  sortBy: "newest",
};

// ── Component ────────────────────────────────────────
const ExploreProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    categoryHierarchy,
    materials,
    crafts,
    techniques,
    curatorialCategories,
    findCategoryWithChildren,
    loading: taxonomyLoading,
  } = useTaxonomy();

  const [products, setProducts] = useState<ProductNewCore[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<ExploreFilters>(() => ({
    ...INITIAL_FILTERS,
    categorySlug: searchParams.get("categoria") || null,
    sortBy: (searchParams.get("orden") as ExploreFilters["sortBy"]) || "newest",
  }));

  // Resolve active category from taxonomy
  const activeCategory = useMemo(
    () =>
      filters.categorySlug
        ? findCategoryWithChildren(filters.categorySlug)
        : null,
    [filters.categorySlug, findCategoryWithChildren],
  );

  // Determine which categoryId to fetch
  const targetCategoryId = useMemo(() => {
    if (filters.subcategorySlug && activeCategory) {
      const sub = activeCategory.subcategories.find(
        (s) => s.slug === filters.subcategorySlug,
      );
      return sub?.id ?? activeCategory.id;
    }
    return activeCategory?.id ?? undefined;
  }, [filters.subcategorySlug, activeCategory]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: 24,
      };
      if (targetCategoryId && UUID_RE.test(targetCategoryId)) params.categoryId = targetCategoryId;

      const res = await getProductsNew(params);
      if (Array.isArray(res)) {
        setProducts(res as ProductNewCore[]);
        setTotal((res as ProductNewCore[]).length);
      } else {
        setProducts(res.data ?? []);
        setTotal(res.total ?? 0);
      }
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [targetCategoryId, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync filters to URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.categorySlug) params.categoria = filters.categorySlug;
    if (filters.sortBy !== "newest") params.orden = filters.sortBy;
    setSearchParams(params, { replace: true });
  }, [filters.categorySlug, filters.sortBy, setSearchParams]);

  // Client-side filtering (material, technique, craft, price, curatorial)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (filters.techniqueId) {
      result = result.filter(
        (p) => p.artisanalIdentity?.primaryTechnique?.id === filters.techniqueId,
      );
    }
    if (filters.materialId) {
      result = result.filter((p) =>
        (p.materials ?? []).some((m) => m.material?.id === filters.materialId),
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
    result = result.filter((p) => {
      const price = getProductPrice(p) ?? 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });
    // Sort
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
      default:
        // newest — already sorted by API
        break;
    }
    return result;
  }, [products, filters]);

  // Count active filters
  const activeFilterCount = [
    filters.categorySlug,
    filters.subcategorySlug,
    filters.techniqueId,
    filters.materialId,
    filters.craftId,
    filters.curatorialId,
    filters.priceRange[1] < 5000000 ? "price" : null,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const updateFilter = <K extends keyof ExploreFilters>(
    key: K,
    value: ExploreFilters[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
      // Reset subcategory when category changes
      ...(key === "categorySlug" ? { subcategorySlug: null } : {}),
    }));
    setPage(1);
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
          <span className="text-primary font-bold">Explorar</span>
          {activeCategory && (
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
            {activeCategory ? (
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
            {activeCategory?.description ??
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
            <div className="sticky top-32 space-y-8">
              {/* Técnica artesanal */}
              <FilterSection title="Técnica artesanal" defaultOpen>
                <ul className="pt-4 space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans max-h-48 overflow-y-auto">
                  {techniques.slice(0, 20).map((t) => (
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

              {/* Oficio */}
              <FilterSection title="Oficio">
                <ul className="pt-4 space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans max-h-48 overflow-y-auto">
                  {crafts.map((c) => (
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

              {/* Material */}
              <FilterSection title="Material">
                <ul className="pt-4 space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans max-h-48 overflow-y-auto">
                  {materials.slice(0, 20).map((m) => (
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

              {/* Colección curatorial */}
              {curatorialCategories.length > 0 && (
                <FilterSection title="Colección">
                  <ul className="pt-4 space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans">
                    {curatorialCategories.map((cc) => (
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
              <FilterSection title="Precio">
                <div className="pt-6 px-1">
                  <input
                    type="range"
                    className="w-full h-1 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                    min={0}
                    max={5000000}
                    step={50000}
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [0, Number(e.target.value)],
                      }))
                    }
                  />
                  <div className="flex justify-between mt-4 text-[10px] font-bold font-sans uppercase">
                    <span>{formatCurrency(0)}</span>
                    <span>{formatCurrency(filters.priceRange[1])}</span>
                  </div>
                </div>
              </FilterSection>
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
                  {filteredProducts.length} de {total} piezas
                </span>
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
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-charcoal/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">
                  Filtros:
                </span>
                {filters.categorySlug && activeCategory && (
                  <FilterChip
                    label={activeCategory.name}
                    onRemove={() => updateFilter("categorySlug", null as any)}
                  />
                )}
                {filters.techniqueId && (
                  <FilterChip
                    label={
                      techniques.find((t) => t.id === filters.techniqueId)
                        ?.name ?? ""
                    }
                    onRemove={() => updateFilter("techniqueId", null as any)}
                  />
                )}
                {filters.materialId && (
                  <FilterChip
                    label={
                      materials.find((m) => m.id === filters.materialId)
                        ?.name ?? ""
                    }
                    onRemove={() => updateFilter("materialId", null as any)}
                  />
                )}
                {filters.craftId && (
                  <FilterChip
                    label={
                      crafts.find((c) => c.id === filters.craftId)?.name ?? ""
                    }
                    onRemove={() => updateFilter("craftId", null as any)}
                  />
                )}
                {filters.curatorialId && (
                  <FilterChip
                    label={
                      curatorialCategories.find(
                        (c) => c.id === filters.curatorialId,
                      )?.name ?? ""
                    }
                    onRemove={() => updateFilter("curatorialId", null as any)}
                  />
                )}
                <button
                  onClick={clearAllFilters}
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
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-16">
                {filteredProducts.map((product, idx) => (
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
                  No se encontraron piezas con estos filtros.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="border border-primary text-primary px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-primary hover:text-white transition-all font-sans"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Load more */}
            {!loading && filteredProducts.length > 0 && total > products.length && (
              <div className="mt-24 flex justify-center">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="border border-primary text-primary px-16 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all font-sans rounded-sm"
                >
                  Cargar más piezas
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

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
            {/* Same filter sections as sidebar */}
            <div className="space-y-6">
              <FilterSection title="Técnica" defaultOpen>
                <ul className="pt-3 space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans max-h-40 overflow-y-auto">
                  {techniques.slice(0, 15).map((t) => (
                    <li
                      key={t.id}
                      onClick={() => updateFilter("techniqueId", t.id)}
                      className={`cursor-pointer ${filters.techniqueId === t.id ? "font-bold text-charcoal" : ""}`}
                    >
                      {t.name}
                    </li>
                  ))}
                </ul>
              </FilterSection>
              <FilterSection title="Material">
                <ul className="pt-3 space-y-3 text-[11px] uppercase tracking-widest text-charcoal/60 font-sans max-h-40 overflow-y-auto">
                  {materials.slice(0, 15).map((m) => (
                    <li
                      key={m.id}
                      onClick={() => updateFilter("materialId", m.id)}
                      className={`cursor-pointer ${filters.materialId === m.id ? "font-bold text-charcoal" : ""}`}
                    >
                      {m.name}
                    </li>
                  ))}
                </ul>
              </FilterSection>
            </div>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-8 w-full bg-primary text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm"
            >
              Ver {filteredProducts.length} piezas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Product Card ─────────────────────────────────────
function ExploreProductCard({
  product,
  className = "",
}: {
  product: ProductNewCore;
  className?: string;
}) {
  const imageUrl = getPrimaryImageUrl(product);
  const price = getProductPrice(product);
  const craft = getCraftName(product);
  const technique = getTechniqueName(product);
  const stock = getProductStock(product);
  const shopName = product.artisanShop?.shopName;
  const shopSlug = product.artisanShop?.shopSlug;

  return (
    <div className={className}>
      <Link
        to={`/product/${product.legacyProductId ?? product.id}`}
        className="group block"
      >
        <div className="relative aspect-[3/4] bg-[#e5e1d8] mb-6 rounded-sm overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal/20 text-sm font-sans">
              Sin imagen
            </div>
          )}

          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {stock === 0 && (
              <span className="bg-charcoal/50 text-white text-[8px] px-3 py-1 uppercase tracking-widest font-bold rounded-sm">
                Agotado
              </span>
            )}
          </div>

          <button className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="w-4 h-4 text-charcoal" />
          </button>
        </div>

        <div>
          <h3 className="font-bold text-base mb-1 font-sans leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {shopName && (
            <p className="text-[10px] text-charcoal/50 uppercase tracking-widest mb-1 font-sans">
              {shopName}
            </p>
          )}
          {(technique || craft) && (
            <p className="text-[10px] text-charcoal/40 uppercase tracking-widest mb-3 font-sans">
              {[technique, craft].filter(Boolean).join(" · ")}
            </p>
          )}
          {price != null && (
            <p className="text-lg font-bold text-charcoal font-sans">
              {formatCurrency(price)}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}

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
