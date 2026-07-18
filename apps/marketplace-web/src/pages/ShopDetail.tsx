/**
 * ShopDetail Page — Taller / Tienda (comercio + confianza)
 * Route: /tienda/:shopSlug
 * Foco: productos, identidad del taller, certificaciones, contacto/redes y
 * políticas (FAQ + devoluciones). La historia/técnica/origen viven en /artesano/:slug.
 */

import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import {
  getProductsByStore,
  getPrimaryImageUrl,
  getProductPrice,
  getProductStock,
  getTechniqueName,
  getCraftName,
  type ProductNewCore,
} from "@/services/products-new.actions";
import {
  getStorePoliciesConfig,
  type StorePoliciesConfig,
} from "@/services/store-policies.actions";
import { formatCurrency } from "@/lib/currencyUtils";
import { Footer } from "@/components/Footer";
import { useShopWishlist } from "@/hooks/useShopWishlist";
import { cn } from "@/lib/utils";
import type { ArtisanShop } from "@/types/artisan-shops.types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Heart, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 9;

// ── Badge logic (estado derivado del producto) ──────
function getProductBadge(product: ProductNewCore): {
  label: string;
  className: string;
} | null {
  const stock = getProductStock(product);
  const isNew =
    Date.now() - new Date(product.createdAt).getTime() < 30 * 86400000;

  if (stock === 0) return { label: "Agotado", className: "bg-[#2b2f26] text-white" };
  if (stock > 0 && stock <= 3)
    return { label: "Últimas piezas", className: "bg-[#2e5424] text-white" };
  if (isNew) return { label: "Nuevo", className: "bg-[#2e5424] text-white" };
  return null;
}

function getLogisticsLabel(product: ProductNewCore): string | null {
  const stock = getProductStock(product);
  if (stock === 0) return "Bajo pedido";
  if (stock > 0 && stock <= 5) return `${stock} disponible${stock > 1 ? "s" : ""}`;
  return null;
}

export default function ShopDetail() {
  const { shopSlug } = useParams<{ shopSlug: string }>();
  const { fetchShopBySlug } = useArtisanShops();
  const { isShopInWishlist, toggleWishlist } = useShopWishlist();

  const [shop, setShop] = useState<ArtisanShop | null>(null);
  const [products, setProducts] = useState<ProductNewCore[]>([]);
  const [policies, setPolicies] = useState<StorePoliciesConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch shop + products + policies
  useEffect(() => {
    if (!shopSlug) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setPolicies(null);
      try {
        const shopData = await fetchShopBySlug(shopSlug);
        if (cancelled || !shopData) {
          setLoading(false);
          return;
        }
        setShop(shopData);

        const prods = await getProductsByStore(shopData.id);
        if (!cancelled) setProducts(prods);

        if (shopData.idPoliciesConfig) {
          const pol = await getStorePoliciesConfig(shopData.idPoliciesConfig);
          if (!cancelled) setPolicies(pol);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [shopSlug]);

  // Unique categories from products (for filters)
  const categoryFilters = useMemo(() => {
    const cats = new Map<string, string>();
    products.forEach((p) => {
      if (p.category) cats.set(p.category.slug, p.category.name);
    });
    return Array.from(cats.entries());
  }, [products]);

  // Primary technique (hero meta + oficio block)
  const primaryTechnique = useMemo(() => {
    for (const p of products) {
      const t = getTechniqueName(p);
      if (t) return t;
    }
    return null;
  }, [products]);

  // Primary craft (oficio block)
  const primaryCraft = useMemo(() => {
    for (const p of products) {
      const c = getCraftName(p);
      if (c) return c;
    }
    return null;
  }, [products]);

  // Materials text (oficio block)
  const materialsText = useMemo(() => {
    const mats = new Set<string>();
    products.forEach((p) => {
      p.materials?.forEach((ml) => {
        if (ml.material?.name) mats.add(ml.material.name);
      });
    });
    return Array.from(mats).join(", ") || null;
  }, [products]);

  // Hero images: banner → logo → product media
  const heroImages = useMemo(() => {
    const imgs: string[] = [];
    if (shop?.bannerUrl) imgs.push(shop.bannerUrl);
    if (shop?.logoUrl) imgs.push(shop.logoUrl);
    products.forEach((p) => {
      const url = getPrimaryImageUrl(p);
      if (url && imgs.length < 6) imgs.push(url);
    });
    return imgs;
  }, [products, shop]);

  // Filter + sort
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (activeFilter !== "all") {
      result = result.filter((p) => p.category?.slug === activeFilter);
    }
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => (getProductPrice(a) ?? 0) - (getProductPrice(b) ?? 0));
        break;
      case "price_desc":
        result.sort((a, b) => (getProductPrice(b) ?? 0) - (getProductPrice(a) ?? 0));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return result;
  }, [products, activeFilter, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f1e6]">
        <div className="max-w-[1400px] mx-auto px-6 py-20 animate-pulse space-y-16">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5 space-y-6">
              <div className="h-4 w-32 bg-[#e5e1d8] rounded" />
              <div className="h-16 w-80 bg-[#e5e1d8] rounded" />
              <div className="h-6 w-64 bg-[#e5e1d8] rounded" />
            </div>
            <div className="lg:col-span-7 aspect-[16/10] bg-[#e5e1d8] rounded" />
          </div>
          <div className="grid grid-cols-3 gap-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] bg-[#e5e1d8] rounded" />
                <div className="h-4 w-3/4 bg-[#e5e1d8] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#f5f1e6] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-serif text-4xl">Taller no encontrado</h1>
          <Link
            to="/tiendas"
            className="text-[#2e5424] text-sm font-bold uppercase tracking-widest"
          >
            Volver a talleres
          </Link>
        </div>
      </div>
    );
  }

  // ── Derived (post-guard) ─────────────────────────────
  const logoUrl = shop.logoUrl;
  const imgFitClass = (src?: string) =>
    src && src === logoUrl
      ? "w-full h-full object-contain p-6 md:p-10"
      : "w-full h-full object-cover";

  const certifications = shop.certifications ?? [];
  // Franja de confianza: certificaciones reales del taller si existen, si no las señales de plataforma
  const trustSignals =
    certifications.length > 0
      ? certifications
      : [
          "Origen cultural trazable",
          "Técnica artesanal identificada",
          "Piezas con huella digital",
          "Producción artesanal",
        ];
  const aboutContent = shop.aboutContent;
  // values puede venir como string[] o {name, description}[]
  const aboutValues = (aboutContent?.values ?? [])
    .map((v) =>
      typeof v === "string"
        ? { name: v, description: "" }
        : { name: v?.name ?? "", description: v?.description ?? "" },
    )
    .filter((v) => v.name || v.description);
  const hasAbout =
    !!aboutContent?.mission || !!aboutContent?.vision || aboutValues.length > 0;

  const faq = policies?.faq ?? [];
  const returnPolicy = policies?.returnPolicy?.trim();

  // Historia del taller (la marca cuenta su propia historia — distinta del relato del artesano)
  const editorialStory =
    aboutContent?.story?.trim() || shop.story?.trim() || null;
  const editorialTitle =
    aboutContent?.title?.trim() ||
    shop.brandClaim?.trim() ||
    "La historia del taller";
  const hasOficio = !!(primaryTechnique || primaryCraft || materialsText);

  const eyebrowClass =
    "text-[#2e5424] font-bold uppercase tracking-[0.4em] text-[10px]";

  return (
    <div className="min-h-screen bg-[#f5f1e6] text-[#2b2f26]">
      {/* Breadcrumb */}
      <nav className="max-w-[1400px] mx-auto px-6 py-8">
        <ol className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#2b2f26]/40 font-bold">
          <li>
            <Link to="/" className="hover:text-[#2b2f26]">
              Inicio
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/tiendas" className="hover:text-[#2b2f26]">
              Talleres
            </Link>
          </li>
          <li>/</li>
          <li className="text-[#2b2f26]">{shop.shopName}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 pb-24 grid lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5 space-y-10">
          <div className="space-y-6">
            {shop.region && <span className={eyebrowClass}>{shop.region}</span>}
            <h1 className="text-6xl md:text-8xl leading-[0.95] font-serif italic tracking-tight">
              {shop.shopName}
            </h1>
            {shop.brandClaim && (
              <p className="text-2xl font-serif italic text-[#2e5424]">
                {shop.brandClaim}
              </p>
            )}
            {shop.craftType && (
              <p className="text-xl font-serif italic text-[#2b2f26]/70">
                {shop.craftType}
              </p>
            )}
            {shop.description && (
              <p className="text-lg text-[#2b2f26]/60 leading-relaxed font-light max-w-md">
                {shop.description}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#productos"
              className="bg-[#2b2f26] text-white px-10 py-4 uppercase text-[10px] tracking-widest font-bold hover:bg-[#2e5424] transition-colors text-center"
            >
              Explorar piezas del taller
            </a>
            <Link
              to={`/artesano/${shop.shopSlug}`}
              className="border border-[#2b2f26]/20 px-10 py-4 uppercase text-[10px] tracking-widest font-bold hover:border-[#2b2f26] transition-colors text-center"
            >
              Conocer al artesano
            </Link>
            <button
              onClick={() => toggleWishlist(shop.id)}
              className={cn(
                "border px-10 py-4 uppercase text-[10px] tracking-widest font-bold transition-colors flex items-center justify-center gap-2",
                isShopInWishlist(shop.id)
                  ? "bg-red-500 text-white border-red-500"
                  : "border-[#2b2f26]/20 hover:border-[#2b2f26]",
              )}
            >
              <Heart className={cn("w-3 h-3", isShopInWishlist(shop.id) && "fill-current")} />
              {isShopInWishlist(shop.id) ? "Guardado" : "Guardar taller"}
            </button>
          </div>
          <div className="flex items-center gap-12 pt-8 border-t border-[#2b2f26]/5">
            {primaryTechnique && (
              <div className="flex items-center gap-3">
                <span className="text-[#2e5424] text-lg">✦</span>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                  {primaryTechnique}
                </span>
              </div>
            )}
            {shop.department && (
              <div className="flex items-center gap-3">
                <span className="text-[#2e5424] text-lg">◆</span>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                  {shop.department}, {shop.municipality || shop.region}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-7">
          {heroImages.length > 0 ? (
            <div className="aspect-[16/10] overflow-hidden shadow-sm rounded-sm bg-[#e5e1d8]">
              <img
                src={heroImages[0]}
                alt={shop.shopName}
                className={imgFitClass(heroImages[0])}
              />
            </div>
          ) : (
            <div className="aspect-[16/10] bg-[#e5e1d8] rounded-sm" />
          )}
        </div>
      </section>

      {/* Franja de confianza — certificaciones reales si hay, si no señales de plataforma */}
      <section className="py-12 bg-[#2b2f26]/5 border-y border-[#2b2f26]/5">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-wrap justify-between items-center gap-8">
            {trustSignals.map((signal) => (
              <div key={signal} className="flex items-center gap-3 opacity-60">
                <span className="text-[#2e5424]">✦</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
                  {signal}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos */}
      <section id="productos" className="scroll-mt-24 max-w-[1400px] mx-auto px-6 mt-24 lg:mt-32 mb-32">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8 border-b border-[#2b2f26]/5 pb-8">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">
              Colección {shop.shopName}
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={cn(
                  "px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-colors",
                  activeFilter === "all"
                    ? "bg-[#2e5424] text-white"
                    : "border border-[#2b2f26]/10 hover:border-[#2e5424]",
                )}
              >
                Todos
              </button>
              {categoryFilters.map(([slug, name]) => (
                <button
                  key={slug}
                  onClick={() => setActiveFilter(slug)}
                  className={cn(
                    "px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-colors",
                    activeFilter === slug
                      ? "bg-[#2e5424] text-white"
                      : "border border-[#2b2f26]/10 hover:border-[#2e5424]",
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#2b2f26]/40 font-bold hidden sm:inline">
              {paginatedProducts.length} de {filteredProducts.length} piezas artesanales
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[10px] font-bold uppercase tracking-[0.2em] border-none focus:ring-0 cursor-pointer"
            >
              <option value="newest">Mas recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </div>

        {paginatedProducts.length === 0 ? (
          <div className="py-32 text-center space-y-6">
            <div className="space-y-3">
              <p className="text-4xl md:text-5xl font-serif italic text-[#2b2f26]/30">
                Sin productos disponibles
              </p>
              <p className="text-base text-[#2b2f26]/50 max-w-md mx-auto">
                {activeFilter !== "all"
                  ? "No hay productos en esta categoría. Prueba con otra categoría o revisa todos los productos."
                  : "Este taller aún no tiene productos publicados. Vuelve pronto para ver sus creaciones."}
              </p>
            </div>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="inline-block mt-8 px-8 py-3 bg-[#2b2f26] text-white text-xs uppercase tracking-widest hover:bg-[#2e5424] transition-colors"
              >
                Ver todos los productos
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {paginatedProducts.map((product, i) => {
              const imageUrl = getPrimaryImageUrl(product);
              const price = getProductPrice(product);
              const badge = getProductBadge(product);
              const logistics = getLogisticsLabel(product);
              const primaryMaterial = product.materials?.[0]?.material?.name;

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className={cn(
                    "group relative",
                    i % 3 === 1 && i > 0 ? "md:mt-16" : "",
                    i % 3 === 1 && i > 3 ? "md:-mt-16" : "",
                  )}
                >
                  <div className="aspect-[3/4] mb-6 relative overflow-hidden bg-[#e5e1d8] rounded-sm">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className={cn(
                          "w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]",
                          badge?.label === "Agotado" && "grayscale",
                        )}
                      />
                    )}
                    {badge && (
                      <div
                        className={cn(
                          "absolute top-4 left-0 z-10 text-[8px] font-bold uppercase tracking-[0.2em] px-4 py-1.5",
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </div>
                    )}
                    <button
                      className="absolute top-4 right-4 z-10 text-[#2b2f26] hover:text-[#2e5424] transition-colors opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-serif leading-tight group-hover:text-[#2e5424] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-[#2e5424]">
                        {shop.shopName}
                      </p>
                      <p className="text-[9px] uppercase tracking-widest text-[#2b2f26]/40 font-bold">
                        {shop.region || shop.department}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-[#2b2f26]/5 space-y-3">
                      <p className="text-lg font-bold tracking-tight">
                        {price ? formatCurrency(price) : "Consultar"}
                      </p>
                      {primaryMaterial && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[8px] bg-[#2e5424]/5 text-[#2e5424] border border-[#2e5424]/10 px-2 py-0.5 uppercase tracking-widest font-bold">
                            {primaryMaterial}
                          </span>
                        </div>
                      )}
                      {logistics && (
                        <p className="text-[8px] uppercase tracking-widest text-[#2b2f26]/40 italic font-bold">
                          {logistics}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-32 flex justify-center items-center gap-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="disabled:opacity-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center text-sm font-bold transition-colors",
                    page === currentPage
                      ? "bg-[#2b2f26] text-white"
                      : "text-[#2b2f26]/40 hover:text-[#2b2f26]",
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="disabled:opacity-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* Oficio y materiales — editorial (marco de los productos) */}
      {hasOficio && (
        <section className="max-w-[1400px] mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div className="space-y-12">
              <div className="space-y-6">
                <span className={eyebrowClass}>El oficio</span>
                <h3 className="text-3xl lg:text-5xl font-serif italic leading-tight">
                  {primaryTechnique
                    ? `Técnica: ${primaryTechnique}`
                    : primaryCraft
                      ? `Oficio: ${primaryCraft}`
                      : "Oficio artesanal"}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-8 py-8 border-y border-[#2b2f26]/10">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#2b2f26]/30">
                    Región
                  </span>
                  <p className="font-serif text-xl italic">
                    {shop.region || shop.department || "Colombia"}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#2b2f26]/30">
                    Oficio
                  </span>
                  <p className="font-serif text-xl italic">
                    {primaryCraft || shop.craftType || "Artesanía"}
                  </p>
                </div>
                {materialsText && (
                  <div className="space-y-2 col-span-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#2b2f26]/30">
                      Materiales
                    </span>
                    <p className="font-serif text-xl italic">{materialsText}</p>
                  </div>
                )}
              </div>
              <a
                href="#productos"
                className="border border-[#2b2f26] px-10 py-4 uppercase text-[10px] tracking-widest font-bold hover:bg-[#2b2f26] hover:text-white transition-all inline-block"
              >
                Ver las piezas del taller
              </a>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {heroImages.slice(1, 3).map((img, i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-[3/4] bg-[#e5e1d8] overflow-hidden rounded-sm",
                    i === 0 && "mt-12",
                  )}
                >
                  <img
                    src={img}
                    alt={`${shop.shopName} detalle ${i + 1}`}
                    className={imgFitClass(img)}
                  />
                </div>
              ))}
              {heroImages.length < 3 && (
                <div className="aspect-[3/4] bg-[#e5e1d8] rounded-sm" />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Historia del taller — editorial */}
      {editorialStory && (
        <section className="bg-white py-24 lg:py-32 border-y border-[#2b2f26]/5 overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            <div className="lg:col-span-5 relative">
              <span
                className="hidden lg:block absolute -left-16 top-0 font-serif text-6xl text-[#2e5424]/10 select-none"
                style={{ writingMode: "vertical-rl" }}
              >
                HISTORIA
              </span>
              <div className="aspect-[4/5] bg-[#e5e1d8] shadow-sm overflow-hidden rounded-sm">
                {heroImages[1] ? (
                  <img
                    src={heroImages[1]}
                    alt={shop.shopName}
                    className={imgFitClass(heroImages[1])}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#2b2f26]/20 font-serif italic">
                    {shop.shopName}
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-7 space-y-8">
              <span className={eyebrowClass}>Nuestra historia</span>
              <h2 className="text-4xl lg:text-6xl font-serif italic leading-[1.05]">
                {editorialTitle}
              </h2>
              <p className="text-lg lg:text-xl text-[#2b2f26]/70 leading-relaxed font-light whitespace-pre-line">
                {editorialStory}
              </p>
              <Link
                to={`/artesano/${shop.shopSlug}`}
                className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] border-b-2 border-[#2e5424] pb-3 hover:text-[#2e5424] transition-colors group"
              >
                Conocer al artesano
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Sobre el taller — misión / visión / valores (editorial) */}
      {hasAbout && (
        <section className="bg-[#20291a] text-[#f5f1e6] py-24 lg:py-32">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
              <div className="lg:col-span-4">
                <span className="text-[#2e5424] font-bold uppercase tracking-[0.4em] text-[10px]">
                  Sobre el taller
                </span>
                <h2 className="text-4xl lg:text-5xl font-serif italic leading-[1.05] mt-6">
                  Lo que nos mueve
                </h2>
              </div>
              <div className="lg:col-span-8 space-y-12">
                <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
                  {aboutContent?.mission && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2e5424]">
                        Misión
                      </h3>
                      <p className="text-lg text-[#f5f1e6]/70 leading-relaxed font-light">
                        {aboutContent.mission}
                      </p>
                    </div>
                  )}
                  {aboutContent?.vision && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2e5424]">
                        Visión
                      </h3>
                      <p className="text-lg text-[#f5f1e6]/70 leading-relaxed font-light">
                        {aboutContent.vision}
                      </p>
                    </div>
                  )}
                </div>
                {aboutValues.length > 0 && (
                  <div className="pt-12 border-t border-white/10">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f5f1e6]/40 mb-8">
                      Valores
                    </h3>
                    {aboutValues.some((v) => v.description) ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
                        {aboutValues.map((v, i) => (
                          <div key={`${v.name}-${i}`} className="space-y-3">
                            <p className="font-serif text-2xl text-[#2e5424]/40">
                              {String(i + 1).padStart(2, "0")}
                            </p>
                            {v.name && (
                              <p className="font-serif italic text-xl text-[#f5f1e6]">
                                {v.name}
                              </p>
                            )}
                            {v.description && (
                              <p className="text-sm text-[#f5f1e6]/50 leading-relaxed font-light">
                                {v.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2.5">
                        {aboutValues.map((v, i) => (
                          <span
                            key={`${v.name}-${i}`}
                            className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#f5f1e6]/80"
                          >
                            {v.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section className="bg-white py-24 border-y border-[#2b2f26]/5">
          <div className="max-w-3xl mx-auto px-6">
            <span className={eyebrowClass}>Preguntas frecuentes</span>
            <h2 className="text-4xl lg:text-5xl font-serif italic leading-tight mt-6 mb-10">
              Antes de comprar
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faq.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-[#2b2f26]/10"
                >
                  <AccordionTrigger className="text-left text-xl lg:text-2xl font-serif italic py-6 hover:no-underline hover:text-[#2e5424]">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-[#2b2f26]/70 leading-relaxed font-light pb-6">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* Política de devoluciones */}
      {returnPolicy && (
        <section className="bg-white border-y border-[#2b2f26]/5 py-24">
          <div className="max-w-3xl mx-auto px-6">
            <span className={eyebrowClass}>Política de devoluciones</span>
            <h2 className="text-3xl lg:text-4xl font-serif italic leading-tight mt-6 mb-8">
              Compra con tranquilidad
            </h2>
            <div className="text-lg text-[#2b2f26]/70 leading-relaxed font-light whitespace-pre-line">
              {returnPolicy}
            </div>
          </div>
        </section>
      )}

      {/* CTA — conocer al artesano */}
      <section className="py-32 bg-[#f5f1e6] border-t border-[#2b2f26]/5">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-10">
            <h2 className="text-4xl lg:text-5xl font-serif italic">
              Conoce a la persona detras del taller
            </h2>
            <p className="text-xl text-[#2b2f26]/50 leading-relaxed font-light">
              Descubre la historia, la técnica y el territorio de {shop.shopName}.
            </p>
            <Link
              to={`/artesano/${shop.shopSlug}`}
              className="inline-block bg-[#2b2f26] text-white px-12 py-5 uppercase text-[10px] tracking-[0.4em] font-bold hover:bg-[#2e5424] transition-colors"
            >
              Ver perfil del artesano
            </Link>
          </div>
        </div>
      </section>

      {/* Navegación — otros talleres */}
      <section className="py-24 max-w-[1400px] mx-auto px-6 border-t border-[#2b2f26]/5">
        <Link
          to="/tiendas"
          className="group border border-[#2b2f26]/10 p-12 flex items-center justify-between hover:border-[#2b2f26] transition-colors bg-white/50"
        >
          <div className="space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#2b2f26]/30">
              Explorar mas
            </span>
            <h4 className="text-3xl font-serif italic">Ver todos los talleres</h4>
          </div>
          <ArrowRight className="w-8 h-8 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
        </Link>
      </section>

      <div className="pb-24" />
      <Footer />
    </div>
  );
}
