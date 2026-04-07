/**
 * ShopDetail Page — Editorial Taller View
 * Route: /tienda/:shopSlug
 * Design reference: stitch_telar_marketplace (5)/code.html
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
import { formatCurrency } from "@/lib/currencyUtils";
import { Footer } from "@/components/Footer";
import { useShopWishlist } from "@/hooks/useShopWishlist";
import { cn } from "@/lib/utils";
import type { ArtisanShop } from "@/types/artisan-shops.types";
import { Heart, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 9;

// ── Badge logic ─────────────────────────────────────
function getProductBadge(product: ProductNewCore): {
  label: string;
  className: string;
} | null {
  const stock = getProductStock(product);
  const isNew =
    Date.now() - new Date(product.createdAt).getTime() < 30 * 86400000;

  if (stock === 0)
    return {
      label: "Agotado",
      className: "bg-[#2c2c2c] text-white",
    };
  if (stock > 0 && stock <= 3)
    return {
      label: "Últimas piezas",
      className: "bg-[#ec6d13] text-white",
    };
  if (isNew)
    return {
      label: "Nuevo",
      className: "bg-[#ec6d13] text-white",
    };
  return null;
}

// ── Logistics micro-state ───────────────────────────
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
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch shop + products
  useEffect(() => {
    if (!shopSlug) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const shopData = await fetchShopBySlug(shopSlug);
        if (cancelled || !shopData) {
          setLoading(false);
          return;
        }
        setShop(shopData);

        const prods = await getProductsByStore(shopData.id);
        if (!cancelled) setProducts(prods);
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

  // Extract unique categories (subcategories) from products
  const categoryFilters = useMemo(() => {
    const cats = new Map<string, string>();
    products.forEach((p) => {
      if (p.category) cats.set(p.category.slug, p.category.name);
    });
    return Array.from(cats.entries()); // [slug, name][]
  }, [products]);

  // Extract primary technique name
  const primaryTechnique = useMemo(() => {
    for (const p of products) {
      const t = getTechniqueName(p);
      if (t) return t;
    }
    return null;
  }, [products]);

  // Extract primary craft name
  const primaryCraft = useMemo(() => {
    for (const p of products) {
      const c = getCraftName(p);
      if (c) return c;
    }
    return null;
  }, [products]);

  // Extract unique materials
  const materialsText = useMemo(() => {
    const mats = new Set<string>();
    products.forEach((p) => {
      p.materials?.forEach((ml) => {
        if (ml.material?.name) mats.add(ml.material.name);
      });
    });
    return Array.from(mats).join(", ") || null;
  }, [products]);

  // Hero images from product media
  const heroImages = useMemo(() => {
    const imgs: string[] = [];
    if (shop?.bannerUrl) imgs.push(shop.bannerUrl);
    products.forEach((p) => {
      const url = getPrimaryImageUrl(p);
      if (url && imgs.length < 6) imgs.push(url);
    });
    return imgs;
  }, [products, shop]);

  // Filter + sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeFilter !== "all") {
      result = result.filter((p) => p.category?.slug === activeFilter);
    }

    switch (sortBy) {
      case "price_asc":
        result.sort(
          (a, b) => (getProductPrice(a) ?? 0) - (getProductPrice(b) ?? 0)
        );
        break;
      case "price_desc":
        result.sort(
          (a, b) => (getProductPrice(b) ?? 0) - (getProductPrice(a) ?? 0)
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
    currentPage * PAGE_SIZE
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f7f2]">
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
      <div className="min-h-screen bg-[#f9f7f2] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-serif text-4xl">Taller no encontrado</h1>
          <Link
            to="/tiendas"
            className="text-[#ec6d13] text-sm font-bold uppercase tracking-widest"
          >
            Volver a talleres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f7f2] text-[#2c2c2c]">
      {/* Breadcrumb */}
      <nav className="max-w-[1400px] mx-auto px-6 py-8">
        <ol className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#2c2c2c]/40 font-bold">
          <li>
            <Link to="/" className="hover:text-[#2c2c2c]">
              Inicio
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/tiendas" className="hover:text-[#2c2c2c]">
              Talleres
            </Link>
          </li>
          <li>/</li>
          <li className="text-[#2c2c2c]">{shop.shopName}</li>
        </ol>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-6 pb-24 grid lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5 space-y-10">
          <div className="space-y-6">
            {shop.region && (
              <span className="text-[#ec6d13] font-bold uppercase tracking-[0.4em] text-[10px]">
                {shop.region}
              </span>
            )}
            <h1 className="text-6xl md:text-8xl leading-[0.95] font-serif italic tracking-tight">
              {shop.shopName}
            </h1>
            {shop.craftType && (
              <p className="text-2xl font-serif italic text-[#2c2c2c]/70">
                {shop.craftType}
              </p>
            )}
            {shop.description && (
              <p className="text-lg text-[#2c2c2c]/60 leading-relaxed font-light max-w-md">
                {shop.description}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#productos"
              className="bg-[#2c2c2c] text-white px-10 py-4 uppercase text-[10px] tracking-widest font-bold hover:bg-[#ec6d13] transition-colors text-center"
            >
              Explorar piezas del taller
            </a>
            <Link
              to={`/artesano/${shop.shopSlug}`}
              className="border border-[#2c2c2c]/20 px-10 py-4 uppercase text-[10px] tracking-widest font-bold hover:border-[#2c2c2c] transition-colors text-center"
            >
              Conocer al artesano
            </Link>
            <button
              onClick={() => toggleWishlist(shop.id)}
              className={cn(
                "border px-10 py-4 uppercase text-[10px] tracking-widest font-bold transition-colors flex items-center justify-center gap-2",
                isShopInWishlist(shop.id)
                  ? "bg-red-500 text-white border-red-500"
                  : "border-[#2c2c2c]/20 hover:border-[#2c2c2c]"
              )}
            >
              <Heart
                className={cn(
                  "w-3 h-3",
                  isShopInWishlist(shop.id) && "fill-current"
                )}
              />
              {isShopInWishlist(shop.id) ? "Guardado" : "Guardar taller"}
            </button>
          </div>
          <div className="flex items-center gap-12 pt-8 border-t border-[#2c2c2c]/5">
            {primaryTechnique && (
              <div className="flex items-center gap-3">
                <span className="text-[#ec6d13] text-lg">✦</span>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                  {primaryTechnique}
                </span>
              </div>
            )}
            {shop.department && (
              <div className="flex items-center gap-3">
                <span className="text-[#ec6d13] text-lg">◆</span>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                  {shop.department}, {shop.municipality || shop.region}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-7">
          {heroImages.length > 0 ? (
            <div className="aspect-[16/10] overflow-hidden shadow-sm rounded-sm">
              <img
                src={heroImages[0]}
                alt={shop.shopName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[16/10] bg-[#e5e1d8] rounded-sm" />
          )}
        </div>
      </section>

      {/* Trust Signals Strip */}
      <section className="py-12 bg-[#2c2c2c]/5 border-y border-[#2c2c2c]/5 mb-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-wrap justify-between items-center gap-8">
            <div className="flex items-center gap-3 opacity-60">
              <span className="text-[#ec6d13]">✦</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
                Origen cultural trazable
              </span>
            </div>
            <div className="flex items-center gap-3 opacity-60">
              <span className="text-[#ec6d13]">✦</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
                Tecnica artesanal identificada
              </span>
            </div>
            <div className="flex items-center gap-3 opacity-60">
              <span className="text-[#ec6d13]">✦</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
                Piezas con huella digital
              </span>
            </div>
            <div className="flex items-center gap-3 opacity-60">
              <span className="text-[#ec6d13]">✦</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
                Produccion artesanal
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Exploration */}
      <section
        id="productos"
        className="max-w-[1400px] mx-auto px-6 mb-32"
      >
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8 border-b border-[#2c2c2c]/5 pb-8">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">
              Coleccion {shop.shopName}
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={cn(
                  "px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-colors",
                  activeFilter === "all"
                    ? "bg-[#ec6d13] text-white"
                    : "border border-[#2c2c2c]/10 hover:border-[#ec6d13]"
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
                      ? "bg-[#ec6d13] text-white"
                      : "border border-[#2c2c2c]/10 hover:border-[#ec6d13]"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#2c2c2c]/40 font-bold hidden sm:inline">
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

        {/* Product Grid */}
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
                  // Staggered effect on middle column
                  i % 3 === 1 && i > 0 ? "md:mt-16" : "",
                  i % 3 === 1 && i > 3 ? "md:-mt-16" : ""
                )}
              >
                <div className="aspect-[3/4] mb-6 relative overflow-hidden bg-[#e5e1d8] rounded-sm">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className={cn(
                        "w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]",
                        badge?.label === "Agotado" && "grayscale"
                      )}
                    />
                  )}
                  {badge && (
                    <div
                      className={cn(
                        "absolute top-4 left-0 z-10 text-[8px] font-bold uppercase tracking-[0.2em] px-4 py-1.5",
                        badge.className
                      )}
                    >
                      {badge.label}
                    </div>
                  )}
                  <button
                    className="absolute top-4 right-4 z-10 text-[#2c2c2c] hover:text-[#ec6d13] transition-colors opacity-0 group-hover:opacity-100"
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
                    <h3 className="text-2xl font-serif leading-tight group-hover:text-[#ec6d13] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-[#ec6d13]">
                      {shop.shopName}
                    </p>
                    <p className="text-[9px] uppercase tracking-widest text-[#2c2c2c]/40 font-bold">
                      {shop.region || shop.department}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#2c2c2c]/5 space-y-3">
                    <p className="text-lg font-bold tracking-tight">
                      {price ? formatCurrency(price) : "Consultar"}
                    </p>
                    {primaryMaterial && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[8px] bg-[#ec6d13]/5 text-[#ec6d13] border border-[#ec6d13]/10 px-2 py-0.5 uppercase tracking-widest font-bold">
                          {primaryMaterial}
                        </span>
                      </div>
                    )}
                    {logistics && (
                      <p className="text-[8px] uppercase tracking-widest text-[#2c2c2c]/40 italic font-bold">
                        {logistics}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination / Load more */}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center text-sm font-bold transition-colors",
                      page === currentPage
                        ? "bg-[#2c2c2c] text-white"
                        : "text-[#2c2c2c]/40 hover:text-[#2c2c2c]"
                    )}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="disabled:opacity-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* Editorial Block — Story */}
      {shop.story && (
        <section className="bg-white py-24 border-y border-[#2c2c2c]/5">
          <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-2 gap-24 items-center">
            <div className="aspect-square bg-[#e5e1d8] shadow-sm overflow-hidden rounded-sm">
              {heroImages.length > 1 && (
                <img
                  src={heroImages[1]}
                  alt={shop.shopName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="space-y-10">
              <h2 className="text-4xl lg:text-5xl font-serif italic leading-tight">
                Un taller que preserva oficio y territorio
              </h2>
              <p className="text-xl text-[#2c2c2c]/60 leading-relaxed font-light italic">
                "{shop.story}"
              </p>
              <Link
                to={
                  shop.contactInfo?.instagram
                    ? `https://instagram.com/${shop.contactInfo.instagram}`
                    : "#"
                }
                className="text-[10px] font-bold uppercase tracking-[0.4em] border-b-2 border-[#ec6d13] pb-3 hover:text-[#ec6d13] transition-all inline-flex items-center gap-3 group"
              >
                Leer historia del artesano
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Technique + Origin Block */}
      {(primaryTechnique || primaryCraft) && (
        <section className="max-w-[1400px] mx-auto px-6 py-32">
          <div className="grid lg:grid-cols-2 gap-24">
            <div className="space-y-12">
              <div className="space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#ec6d13]">
                  Detalles del Oficio
                </span>
                <h3 className="text-3xl lg:text-4xl font-serif italic leading-tight">
                  {primaryTechnique
                    ? `Tecnica principal: ${primaryTechnique}`
                    : primaryCraft
                    ? `Oficio: ${primaryCraft}`
                    : "Oficio artesanal"}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-12 py-8 border-y border-[#2c2c2c]/5">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#2c2c2c]/30">
                    Region
                  </span>
                  <p className="font-serif text-xl italic">
                    {shop.region || shop.department || "Colombia"}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#2c2c2c]/30">
                    Oficio
                  </span>
                  <p className="font-serif text-xl italic">
                    {primaryCraft || shop.craftType || "Artesanía"}
                  </p>
                </div>
                {materialsText && (
                  <div className="space-y-2 col-span-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#2c2c2c]/30">
                      Materiales
                    </span>
                    <p className="font-serif text-xl italic">{materialsText}</p>
                  </div>
                )}
              </div>
              <div>
                <Link
                  to={`/productos`}
                  className="border border-[#2c2c2c] px-10 py-4 uppercase text-[10px] tracking-widest font-bold hover:bg-[#2c2c2c] hover:text-white transition-all inline-block"
                >
                  Ver piezas de esta tecnica
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {heroImages.slice(1, 3).map((img, i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-[3/4] bg-[#e5e1d8] overflow-hidden rounded-sm",
                    i === 0 && "mt-12"
                  )}
                >
                  <img
                    src={img}
                    alt={`${shop.shopName} detalle ${i + 1}`}
                    className="w-full h-full object-cover"
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

      {/* CTA Section */}
      <section className="py-32 bg-[#f9f7f2]">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-10">
            <h2 className="text-4xl lg:text-5xl font-serif italic">
              Conoce a la persona detras del taller
            </h2>
            <p className="text-xl text-[#2c2c2c]/50 leading-relaxed font-light">
              Descubre la trayectoria de los maestros artesanos de{" "}
              {shop.shopName} y su impacto en la comunidad.
            </p>
            <Link
              to={`/artesano/${shop.shopSlug}`}
              className="inline-block bg-[#2c2c2c] text-white px-12 py-5 uppercase text-[10px] tracking-[0.4em] font-bold hover:bg-[#ec6d13] transition-colors"
            >
              Ver perfil del artesano
            </Link>
          </div>
        </div>
      </section>

      {/* Related Navigation */}
      <section className="py-24 max-w-[1400px] mx-auto px-6 border-t border-[#2c2c2c]/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Link
            to="/tiendas"
            className="group border border-[#2c2c2c]/10 p-12 flex items-center justify-between hover:border-[#2c2c2c] transition-colors bg-white/50"
          >
            <div className="space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#2c2c2c]/30">
                Explorar mas
              </span>
              <h4 className="text-3xl font-serif italic">
                Otros talleres similares
              </h4>
            </div>
            <ArrowRight className="w-8 h-8 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
          </Link>
          <Link
            to="/giftcards"
            className="group border border-[#2c2c2c]/10 p-12 flex items-center justify-between hover:border-[#2c2c2c] transition-colors bg-white/50"
          >
            <div className="space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#2c2c2c]/30">
                Curaduria
              </span>
              <h4 className="text-3xl font-serif italic">
                Regalos con historia
              </h4>
            </div>
            <ArrowRight className="w-8 h-8 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
          </Link>
        </div>
      </section>

      <div className="pb-24" />
      <Footer />
    </div>
  );
}
