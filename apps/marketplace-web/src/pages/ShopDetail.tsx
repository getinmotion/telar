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
import { VillaAdelaidaBadge } from "@/components/VillaAdelaidaBadge";

const PAGE_SIZE = 9;

// ── Badge logic (estado derivado del producto) ──────
function getProductBadge(product: ProductNewCore): {
  label: string;
  className: string;
} | null {
  const stock = getProductStock(product);
  const isNew =
    Date.now() - new Date(product.createdAt).getTime() < 30 * 86400000;

  if (stock === 0)
    return { label: "Agotado", className: "bg-[#1a1a1a] text-white" };
  if (stock > 0 && stock <= 3)
    return { label: "Últimas piezas", className: "bg-[#BC3F1C] text-white" };
  if (isNew) return { label: "Nuevo", className: "bg-[#BC3F1C] text-white" };
  return null;
}

function getLogisticsLabel(product: ProductNewCore): string | null {
  const stock = getProductStock(product);
  if (stock === 0) return "Bajo pedido";
  if (stock > 0 && stock <= 5)
    return `${stock} disponible${stock > 1 ? "s" : ""}`;
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
      <div className="min-h-screen bg-[#F7E7D7]">
        <div className="max-w-[1400px] mx-auto px-6 py-20 animate-pulse space-y-16">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5 space-y-6">
              <div className="h-4 w-32 bg-[#F3E4D3] rounded" />
              <div className="h-16 w-80 bg-[#F3E4D3] rounded" />
              <div className="h-6 w-64 bg-[#F3E4D3] rounded" />
            </div>
            <div className="lg:col-span-7 aspect-[16/10] bg-[#F3E4D3] rounded" />
          </div>
          <div className="grid grid-cols-3 gap-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] bg-[#F3E4D3] rounded" />
                <div className="h-4 w-3/4 bg-[#F3E4D3] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#F7E7D7] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-serif text-4xl">Taller no encontrado</h1>
          <Link
            to="/tiendas"
            className="text-[#BC3F1C] text-sm font-bold uppercase tracking-widest"
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
    "text-[#BC3F1C] font-bold uppercase tracking-[0.4em] text-[10px]";

  return (
    <div className="min-h-screen bg-[#F7E7D7] text-[#1a1a1a]">
      {/* Breadcrumb */}
      <nav className="max-w-[1400px] mx-auto px-6 py-8">
        <ol className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#1a1a1a]/40 font-bold">
          <li>
            <Link to="/" className="hover:text-[#1a1a1a]">
              Inicio
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/tiendas" className="hover:text-[#1a1a1a]">
              Talleres
            </Link>
          </li>
          <li>/</li>
          <li className="text-[#1a1a1a]">{shop.shopName}</li>
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
              <p className="text-2xl font-serif italic text-[#BC3F1C]">
                {shop.brandClaim}
              </p>
            )}
            {shop.craftType && (
              <p className="text-xl font-serif italic text-[#1a1a1a]/70">
                {shop.craftType}
              </p>
            )}
            {shop.description && (
              <p className="text-lg text-[#1a1a1a]/60 leading-relaxed font-light max-w-md">
                {shop.description}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#productos"
              className="bg-[#1a1a1a] text-white px-10 py-4 uppercase text-[10px] tracking-widest font-bold hover:bg-[#BC3F1C] transition-colors text-center"
            >
              Explorar piezas del taller
            </a>
            <Link
              to={`/artesano/${shop.shopSlug}`}
              className="border border-[#1a1a1a]/20 px-10 py-4 uppercase text-[10px] tracking-widest font-bold hover:border-[#1a1a1a] transition-colors text-center"
            >
              Conocer al artesano
            </Link>
            <button
              onClick={() => toggleWishlist(shop.id)}
              className={cn(
                "border px-10 py-4 uppercase text-[10px] tracking-widest font-bold transition-colors flex items-center justify-center gap-2",
                isShopInWishlist(shop.id)
                  ? "bg-red-500 text-white border-red-500"
                  : "border-[#1a1a1a]/20 hover:border-[#1a1a1a]",
              )}
            >
              <Heart
                className={cn(
                  "w-3 h-3",
                  isShopInWishlist(shop.id) && "fill-current",
                )}
              />
              {isShopInWishlist(shop.id) ? "Guardado" : "Guardar taller"}
            </button>
          </div>
          <div className="flex items-center gap-12 pt-8 border-t border-[#1a1a1a]/5">
            {primaryTechnique && (
              <div className="flex items-center gap-3">
                <span className="text-[#BC3F1C] text-lg">✦</span>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                  {primaryTechnique}
                </span>
              </div>
            )}
            {shop.department && (
              <div className="flex items-center gap-3">
                <span className="text-[#BC3F1C] text-lg">◆</span>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                  {shop.department}, {shop.municipality || shop.region}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-7">
          {heroImages.length > 0 ? (
            <div className="aspect-[16/10] overflow-hidden shadow-sm rounded-sm bg-[#F3E4D3]">
              <img
                src={heroImages[0]}
                alt={shop.shopName}
                className={imgFitClass(heroImages[0])}
              />
            </div>
          ) : (
            <div className="aspect-[16/10] bg-[#F3E4D3] rounded-sm" />
          )}
        </div>
      </section>

      {/* Franja de confianza — certificaciones reales si hay, si no señales de plataforma */}
      <section className="py-12 bg-[#1a1a1a]/5 border-y border-[#1a1a1a]/5">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-wrap justify-between items-center gap-8">
            {trustSignals.map((signal) => (
              <div key={signal} className="flex items-center gap-3 opacity-60">
                <span className="text-[#BC3F1C]">✦</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
                  {signal}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos */}
      <section
        id="productos"
        className="scroll-mt-24 max-w-[1400px] mx-auto px-6 mt-24 lg:mt-32 mb-32"
      >
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8 border-b border-[#1a1a1a]/5 pb-8">
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
                    ? "bg-[#BC3F1C] text-white"
                    : "border border-[#1a1a1a]/10 hover:border-[#BC3F1C]",
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
                      ? "bg-[#BC3F1C] text-white"
                      : "border border-[#1a1a1a]/10 hover:border-[#BC3F1C]",
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#1a1a1a]/40 font-bold hidden sm:inline">
              {paginatedProducts.length} de {filteredProducts.length} piezas
              artesanales
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
              <p className="text-4xl md:text-5xl font-serif italic text-[#1a1a1a]/30">
                Sin productos disponibles
              </p>
              <p className="text-base text-[#1a1a1a]/50 max-w-md mx-auto">
                {activeFilter !== "all"
                  ? "No hay productos en esta categoría. Prueba con otra categoría o revisa todos los productos."
                  : "Este taller aún no tiene productos publicados. Vuelve pronto para ver sus creaciones."}
              </p>
            </div>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="inline-block mt-8 px-8 py-3 bg-[#1a1a1a] text-white text-xs uppercase tracking-widest hover:bg-[#BC3F1C] transition-colors"
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
                  <div className="aspect-[3/4] mb-6 relative overflow-hidden bg-[#F3E4D3] rounded-sm">
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
                      className="absolute top-4 right-4 z-10 text-[#1a1a1a] hover:text-[#BC3F1C] transition-colors opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                    {/* VillaAdelaidaBadge superpuesto */}
                    <VillaAdelaidaBadge
                      product={product}
                      className="absolute top-4 left-4 z-20"
                    />
                  </div>
                  <div className="flex justify-between items-end gap-4 px-1">
                    <div>
                      <h3 className="font-serif text-lg md:text-2xl leading-tight group-hover:underline">
                        {product.name}
                      </h3>
                      {primaryMaterial && (
                        <div className="text-xs text-[#1a1a1a]/70 mt-1">
                          {primaryMaterial}
                        </div>
                      )}
                      {/* Etiqueta logística (stock bajo, bajo pedido) */}
                      {logistics && (
                        <div className="mt-1 inline-block text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1 bg-[#BC3F1C]/10 text-[#BC3F1C] rounded">
                          {logistics}
                        </div>
                      )}
                    </div>
                    <div className="text-xl md:text-2xl font-serif text-[#BC3F1C] font-bold">
                      {formatCurrency(price)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        {/* Paginación clásica */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-16">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded disabled:opacity-30"
            >
              <ChevronLeft />
            </button>
            <span className="text-xs font-bold">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded disabled:opacity-30"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </section>

      {/* Bloque editorial — historia del taller */}
      {editorialStory && (
        <section className="max-w-3xl mx-auto mb-32 border-l-8 border-[#BC3F1C] pl-12 py-12">
          <h2 className="text-4xl md:text-5xl font-serif mb-8 text-[#1a1a1a]">
            {editorialTitle}
          </h2>
          <div className="text-lg md:text-xl font-light text-[#1a1a1a]/80 italic leading-relaxed whitespace-pre-line">
            {editorialStory}
          </div>
        </section>
      )}

      {/* Oficio + materiales (bloque compacto) */}
      {hasOficio && (
        <section className="max-w-4xl mx-auto mb-32">
          <div className="bg-white rounded-2xl shadow-sm p-12 border border-[#1a1a1a]/10 flex flex-col md:flex-row gap-12 md:items-center">
            <div className="flex-1 space-y-6">
              {primaryTechnique && (
                <div>
                  <span className="font-bold uppercase text-[10px] tracking-widest text-[#BC3F1C]">
                    Técnica principal
                  </span>
                  <div className="text-xl font-serif italic text-[#1a1a1a] mt-2">
                    {primaryTechnique}
                  </div>
                </div>
              )}
              {primaryCraft && (
                <div>
                  <span className="font-bold uppercase text-[10px] tracking-widest text-[#BC3F1C]">
                    Oficio principal
                  </span>
                  <div className="text-xl font-serif italic text-[#1a1a1a] mt-2">
                    {primaryCraft}
                  </div>
                </div>
              )}
              {materialsText && (
                <div>
                  <span className="font-bold uppercase text-[10px] tracking-widest text-[#BC3F1C]">
                    Materiales principales
                  </span>
                  <div className="text-xl font-serif italic text-[#1a1a1a] mt-2">
                    {materialsText}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Políticas de la tienda (FAQs, cambios, devoluciones) */}
      <section className="max-w-4xl mx-auto mb-32">
        <Accordion type="single" collapsible>
          {faq.length > 0 && (
            <AccordionItem value="faq">
              <AccordionTrigger className="text-xl md:text-2xl font-serif font-bold">
                Preguntas frecuentes
              </AccordionTrigger>
              <AccordionContent>
                <ul className="pl-6 space-y-4 list-disc">
                  {faq.map((q, i) => (
                    <li key={i}>
                      <span className="font-bold">{q.q}</span>
                      <br />
                      {q.a}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
          {returnPolicy && (
            <AccordionItem value="devoluciones">
              <AccordionTrigger className="text-xl md:text-2xl font-serif font-bold">
                Devoluciones y cambios
              </AccordionTrigger>
              <AccordionContent>
                <div className="whitespace-pre-line">{returnPolicy}</div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </section>
      <Footer />
    </div>
  );
}
