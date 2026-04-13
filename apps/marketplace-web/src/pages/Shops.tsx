import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import { useSearch } from "@/contexts/SearchContext";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useShopWishlist } from "@/hooks/useShopWishlist";
import { normalizeCraft } from "@/lib/normalizationUtils";

const PAGE_SIZE = 18;

interface Shop {
  id: string;
  shopName: string;
  shopSlug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  craftType?: string;
  region?: string;
  featured: boolean;
  productCount: number;
}

type SortOption = "relevance" | "name_asc" | "recent";

const Shops = () => {
  const { searchQuery } = useSearch();
  const { shops: contextShops, fetchShops: fetchShopsContext } =
    useArtisanShops();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCraft, setSelectedCraft] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [page, setPage] = useState(1);
  const {
    isShopInWishlist,
    toggleWishlist,
    loading: wishlistLoading,
  } = useShopWishlist();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    fetchShopsContext({
      active: true,
      publishStatus: "published",
      marketplaceApproved: true,
      hasApprovedProducts: true,
      sortBy: "created_at",
      order: "DESC",
      limit: 100,
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (contextShops.length > 0) {
      setShops(
        contextShops.map((s) => ({
          id: s.id,
          shopName: s.shopName,
          shopSlug: s.shopSlug,
          description: s.description,
          logoUrl: s.logoUrl,
          bannerUrl: s.bannerUrl,
          craftType: s.craftType,
          region: s.region,
          featured: s.featured,
          productCount: 0,
        })),
      );
      setLoading(false);
    }
  }, [contextShops]);

  // Unique filter values
  const regions = useMemo(
    () =>
      Array.from(new Set(shops.map((s) => s.region).filter(Boolean))).sort(),
    [shops],
  );
  const craftTypes = useMemo(
    () =>
      Array.from(
        new Set(
          shops
            .map((s) => normalizeCraft(s.craftType))
            .filter((c) => c && c !== "Sin especificar"),
        ),
      ).sort(),
    [shops],
  );

  // Filter + sort
  const filtered = useMemo(() => {
    let result = shops.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        s.shopName.toLowerCase().includes(q) ||
        s.craftType?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q);
      const matchesRegion =
        selectedRegion === "all" || s.region === selectedRegion;
      const matchesCraft =
        selectedCraft === "all" ||
        normalizeCraft(s.craftType) === selectedCraft;
      return matchesSearch && matchesRegion && matchesCraft;
    });

    switch (sortBy) {
      case "name_asc":
        result.sort((a, b) => a.shopName.localeCompare(b.shopName));
        break;
      case "recent":
        break; // Already ordered by API
      default:
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
    }
    return result;
  }, [shops, searchQuery, selectedRegion, selectedCraft, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedRegion, selectedCraft, sortBy]);

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSelectedRegion("all");
    setSelectedCraft("all");
    setSortBy("relevance");
    setPage(1);
  };

  const hasActiveFilters =
    selectedRegion !== "all" || selectedCraft !== "all" || searchQuery !== "";

  return (
    <div className="bg-editorial-bg text-charcoal min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <nav className="flex text-[10px] uppercase tracking-widest text-charcoal/50 gap-2 font-sans">
          <Link to="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">Talleres</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 mb-8">
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] tracking-[0.4em] uppercase text-primary font-bold mb-1.5 font-sans">
            Directorio Vivo
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight mb-2 italic text-charcoal">
            Talleres artesanales
          </h1>
          <p className="text-sm text-charcoal/60 max-w-lg mx-auto font-sans mb-6">
            Descubre a quienes crean cada pieza y preservan nuestro legado.
          </p>
        </div>
      </section>

      {/* Exploration Blocks */}
      <section className="max-w-[1400px] mx-auto px-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/tecnicas"
            className="group relative flex items-center justify-between px-8 py-5 bg-white/50 border border-charcoal/5 hover:bg-white hover:border-primary/20 transition-all duration-300"
          >
            <div>
              <h3 className="font-serif text-lg text-charcoal mb-0.5">
                Explorar por técnica
              </h3>
              <span className="text-primary text-[8px] uppercase tracking-[0.2em] font-bold font-sans opacity-80 group-hover:opacity-100 transition-opacity">
                Ver todas las artes →
              </span>
            </div>
          </Link>
          <Link
            to="/territorios"
            className="group relative flex items-center justify-between px-8 py-5 bg-white/50 border border-charcoal/5 hover:bg-white hover:border-primary/20 transition-all duration-300"
          >
            <div>
              <h3 className="font-serif text-lg text-charcoal mb-0.5">
                Explorar por territorio
              </h3>
              <span className="text-primary text-[8px] uppercase tracking-[0.2em] font-bold font-sans opacity-80 group-hover:opacity-100 transition-opacity">
                Ver el mapa →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Filters Toolbar */}
      <section className="max-w-[1400px] mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-charcoal/10 gap-6">
          <div className="flex flex-wrap items-center gap-8">
            <FilterSelect
              label="Región"
              value={selectedRegion}
              onChange={setSelectedRegion}
              options={[
                { value: "all", label: "Todas las regiones" },
                ...regions.map((r) => ({ value: r!, label: r! })),
              ]}
            />
            <FilterSelect
              label="Técnica"
              value={selectedCraft}
              onChange={setSelectedCraft}
              options={[
                { value: "all", label: "Todas las técnicas" },
                ...craftTypes.map((c) => ({ value: c!, label: c! })),
              ]}
            />
            <FilterSelect
              label="Ordenar por"
              value={sortBy}
              onChange={(v) => setSortBy(v as SortOption)}
              options={[
                { value: "relevance", label: "Relevancia" },
                { value: "name_asc", label: "Alfabético (A-Z)" },
                { value: "recent", label: "Recientes" },
              ]}
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary hover:opacity-70 transition-opacity font-sans"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="text-charcoal/50 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2.5 font-sans font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {filtered.length} talleres encontrados
          </div>
        </div>
      </section>

      {/* Workshop Grid */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/5] mb-5" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-8 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-charcoal/40 text-sm font-sans mb-6">
              {hasActiveFilters
                ? "No se encontraron talleres con estos filtros."
                : "No hay talleres publicados aún."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="border border-primary text-primary px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-primary hover:text-white transition-all font-sans"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {paginated.map((shop) => (
              <WorkshopCard
                key={shop.id}
                shop={shop}
                isFavorite={isShopInWishlist(shop.id)}
                wishlistLoading={wishlistLoading}
                onFavoriteToggle={() => toggleWishlist(shop.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-20 flex justify-center items-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-charcoal/10 text-charcoal/50 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 7) return true;
                if (p === 1 || p === totalPages) return true;
                return Math.abs(p - page) <= 1;
              })
              .map((p, idx, arr) => (
                <span key={p} className="contents">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="w-10 h-10 flex items-center justify-center text-[11px] text-charcoal/30 font-sans">
                      …
                    </span>
                  )}
                  <button
                    onClick={() => goToPage(p)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-[11px] font-bold font-sans tracking-wider transition-colors ${
                      page === p
                        ? "bg-primary text-white"
                        : "border border-charcoal/10 text-charcoal/60 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-charcoal/10 text-charcoal/50 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

// ── Workshop Card ────────────────────────────────────
function WorkshopCard({
  shop,
  isFavorite,
  wishlistLoading,
  onFavoriteToggle,
}: {
  shop: Shop;
  isFavorite: boolean;
  wishlistLoading: boolean;
  onFavoriteToggle: () => void;
}) {
  const craft = normalizeCraft(shop.craftType);
  const showCraft = craft && craft !== "Sin especificar";
  const imageUrl = shop.bannerUrl || shop.logoUrl;

  return (
    <div className="group">
      {/* Image */}
      <div className="relative aspect-[4/5] bg-[#e5e1d8] mb-5 overflow-hidden">
        {imageUrl ? (
          <Link
            to={`/tienda/${shop.shopSlug}`}
            className="block w-full h-full"
          >
            <img
              src={imageUrl}
              alt={shop.shopName}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              loading="lazy"
            />
          </Link>
        ) : (
          <Link
            to={`/tienda/${shop.shopSlug}`}
            className="w-full h-full flex items-center justify-center text-charcoal/20 text-sm font-sans"
          >
            Sin imagen
          </Link>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            onFavoriteToggle();
          }}
          disabled={wishlistLoading}
          className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-charcoal hover:text-primary transition-all shadow-sm"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? "fill-primary text-primary" : ""}`}
          />
        </button>
      </div>

      {/* Meta */}
      <div className="mb-2">
        <span className="text-[9px] uppercase tracking-[0.15em] text-charcoal/40 font-bold font-sans">
          {[shop.region, showCraft ? craft : null].filter(Boolean).join(" · ")}
        </span>
      </div>

      {/* Name */}
      <Link to={`/tienda/${shop.shopSlug}`}>
        <h4 className="font-serif text-3xl mb-3 text-charcoal group-hover:text-primary transition-colors cursor-pointer leading-tight">
          {shop.shopName}
        </h4>
      </Link>

      {/* Description */}
      {shop.description && (
        <p className="text-xs text-charcoal/60 mb-6 line-clamp-2 leading-relaxed font-sans">
          {shop.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6">
        <Link
          to={`/tienda/${shop.shopSlug}`}
          className="bg-charcoal text-white px-6 py-3 uppercase text-[10px] font-bold tracking-[0.15em] hover:bg-primary transition-all duration-300 font-sans"
        >
          Ver taller
        </Link>
      </div>
    </div>
  );
}

// ── Filter Select ────────────────────────────────────
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold font-sans">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none p-0 text-[11px] font-bold text-charcoal focus:ring-0 cursor-pointer uppercase tracking-widest font-sans appearance-none pr-6"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%232c2c2c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0 center",
          backgroundSize: "1em",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Shops;
