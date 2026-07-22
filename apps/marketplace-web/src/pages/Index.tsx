/**
 * Homepage — Editorial Design
 * Matches telar_inicio_refinado_estrategico reference exactly
 */

import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import {
  getProductsNew,
  getPrimaryImageUrl,
  getProductPrice,
  getCraftName,
  getTechniqueName,
  type ProductFeatured,
} from "@/services/products-new.actions";
import { formatCurrency } from "@/lib/currencyUtils";
import escuelasTallerLogo from "@/assets/escuelas-taller-logo.svg";
import culturasLogo from "@/assets/culturas-logo.svg";
import { HeroSectionV2 } from "@/components/HeroSectionV2";
// import { CmsSectionRenderer } from "@/components/cms/CmsSectionRenderer";

// ── Seeded random for consistent daily shuffle ──
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const shuffleArray = <T,>(arr: T[], seed: number): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const Index = () => {
  const { categoryHierarchy, loading: taxonomyLoading } = useTaxonomy();
  const { shops: featuredShops, fetchFeaturedShops } = useArtisanShops();
  const [products, setProducts] = useState<ProductFeatured[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const dailySeed = useMemo(() => {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }, []);

  // Fetch products
  useEffect(() => {
    getProductsNew({ page: 1, limit: 50 })
      .then((res) => {
        const data = Array.isArray(res) ? res : (res.data ?? []);
        setProducts(data as ProductFeatured[]);
      })
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, []);

  // Fetch featured shops
  useEffect(() => {
    fetchFeaturedShops(8);
  }, []);

  // 3 featured products (purchasable, shuffled, from different stores)
  const featuredProducts = useMemo(() => {
    // Filter out archived/draft — keep published or unset status
    const available = products.filter(
      (p) => !p.status || p.status === "published",
    );
    if (available.length === 0 && products.length > 0) {
      // Fallback: if all products have a non-published status, use all
      // (the API likely only returns published products anyway)
      const shuffled = shuffleArray(products, dailySeed);
      return shuffled.slice(0, 3);
    }
    const shuffled = shuffleArray(available, dailySeed);
    // Pick from different stores
    const seen = new Set<string>();
    const picked: ProductFeatured[] = [];
    for (const p of shuffled) {
      const store = p.storeName ?? "";
      if (!seen.has(store)) {
        picked.push(p);
        seen.add(store);
      }
      if (picked.length >= 3) break;
    }
    // If not enough from different stores, fill with any remaining
    if (picked.length < 3) {
      for (const p of shuffled) {
        if (!picked.includes(p)) picked.push(p);
        if (picked.length >= 3) break;
      }
    }
    return picked;
  }, [products, dailySeed]);

  // Featured shop (first one or Karen Dayana if available)
  const featuredShop = useMemo(() => {
    const karen = featuredShops.find((s) =>
      s.shopName?.toLowerCase().includes("karen dayana"),
    );
    return karen || featuredShops[0] || null;
  }, [featuredShops]);

  // Categories for display (up to 8 parent categories)
  const displayCategories = useMemo(() => {
    return categoryHierarchy
      .filter((c) => c.isActive && c.slug !== "cuidado-personal")
      .slice(0, 8);
  }, [categoryHierarchy]);

  return (
    <>
      <Helmet>
        <title>COCREA — Artesanía Colombiana</title>
        <meta
          name="description"
          content="Objetos auténticos creados por talleres artesanales de Colombia. Cada pieza conserva la historia, el origen y el conocimiento de quienes la crean."
        />
      </Helmet>

      <div className="min-h-screen bg-editorial-bg text-charcoal font-sans selection:bg-primary/40 selection:text-white">
        {/* ═══════════════ HERO CAROUSEL (CMS) ═══════════════ */}

        <HeroSectionV2 />

        {/* ═══════════════ VALUE PROPS (CMS) ═══════════════ */}
        {/* {valuePropsSection && <CmsSectionRenderer section={valuePropsSection} />} */}

        {/* ═══════════════ CATEGORIES ═══════════════ */}
        <section className="py-12 border-y border-foreground/10">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex flex-wrap justify-between gap-y-12">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] w-full mb-4 text-primary">
                Explorar por categorías
              </span>
              {displayCategories.map((cat) => (
                <div key={cat.id} className="w-full md:w-1/4 space-y-2 px-2">
                  <Link to={`/productos?categoria=${cat.slug}`}>
                    <div className="aspect-[16/10] bg-[#e5e1d8] mb-4 overflow-hidden relative">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover grayscale-[35%] hover:grayscale-0 hover:scale-[1.03] transition-all duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                    </div>
                  </Link>
                  <Link
                    to={`/productos?categoria=${cat.slug}`}
                    className="text-xl font-serif hover:italic hover:text-[#ec6d13] transition-all"
                  >
                    {cat.name}
                  </Link>
                  <p className="text-[10px] text-charcoal/60 uppercase tracking-widest">
                    {cat.subcategories.length > 0
                      ? cat.subcategories
                          .slice(0, 3)
                          .map((s) => s.name)
                          .join(", ")
                      : "Piezas artesanales únicas"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ FEATURED PRODUCTS ═══════════════ */}
        <section className="py-24 max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-5xl font-serif mb-4">
                Creaciones Destacadas
              </h2>
              <p className="text-charcoal/70 italic font-serif">
                Piezas con alma seleccionadas por su maestría técnica.
              </p>
            </div>
            <Link
              to="/productos"
              className="text-xs font-bold uppercase tracking-widest border-b border-charcoal flex items-center gap-2 pb-1 hover:text-primary hover:border-primary transition-colors"
            >
              Ver colección completa
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {productsLoading || featuredProducts.length === 0
              ? [...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-6 animate-pulse">
                    <div className="aspect-[3/4] bg-muted" />
                    <div className="h-4 w-24 bg-muted" />
                    <div className="h-6 w-3/4 bg-muted" />
                    <div className="h-4 w-1/2 bg-muted" />
                  </div>
                ))
              : featuredProducts.map((product, idx) => {
                  const imageUrl = getPrimaryImageUrl(product);
                  const price = getProductPrice(product);
                  const shopName = product.storeName;
                  const department = product.department;
                  const technique = getTechniqueName(product);

                  return (
                    <article
                      key={product.id}
                      className={`group ${idx === 1 ? "mt-12 md:mt-24" : ""}`}
                    >
                      <Link to={`/product/${product.id}`}>
                        <div className="aspect-[3/4] bg-muted mb-6 rounded-sm border border-foreground/10 overflow-hidden relative">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover grayscale-[35%] hover:grayscale-0 hover:scale-[1.03] transition-all duration-700 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>
                        <div className="space-y-3">
                          <span className="inline-block bg-primary/10 text-primary text-[9px] uppercase tracking-widest px-2 py-0.5 mb-2">
                            Hecho a mano
                          </span>
                          <h3 className="text-2xl font-serif leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-xs uppercase tracking-widest text-charcoal/60">
                            {shopName}
                            {department ? ` — ${department}` : ""}
                          </p>
                          <div className="pt-4 flex items-center justify-between border-t border-foreground/10">
                            <span className="font-medium">
                              {price != null
                                ? formatCurrency(price)
                                : "Consultar"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
          </div>
        </section>

        {/* ═══════════════ UN MARKETPLACE DIFERENTE ═══════════════ */}
        <section className="bg-charcoal text-cream py-32">
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-center mb-20 opacity-80">
              Un marketplace diferente
            </h2>
            <div className="grid md:grid-cols-3 gap-16">
              <div className="col-span-3 text-center space-y-10 max-w-2xl mx-auto">
                <p className="text-2xl font-serif italic opacity-95">
                  Cocrea conecta a compradores con las Escuelas Taller,
                  artesanas y artesanos de todo el país. Cada pieza tiene
                  origen, autor y proceso documentado.
                </p>
                <Link
                  to="/sobre-cocrea"
                  className="inline-block border border-sage text-sage px-10 py-4 uppercase text-xs tracking-widest hover:bg-sage hover:text-charcoal transition-all"
                >
                  Descubrir cómo funciona Cocrea
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ COMERCIO JUSTO (CMS) ═══════════════ */}
        {/* {comercioJustoBlock && (
          <CmsSectionRenderer section={comercioJustoBlock} />
        )} */}

        {/* ═══════════════ HUELLA DIGITAL ═══════════════ */}
        <section className="py-24 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-2 gap-24 items-center">
            <div className="aspect-square bg-muted rounded-sm border border-foreground/10 overflow-hidden">
              {featuredProducts[1] &&
              getPrimaryImageUrl(featuredProducts[1]) ? (
                <img
                  src={getPrimaryImageUrl(featuredProducts[1])!}
                  alt="Huella digital"
                  className="w-full h-full object-cover grayscale-[35%] hover:grayscale-0 hover:scale-[1.03] transition-all duration-700 ease-out"
                />
              ) : null}
            </div>
            <div className="space-y-10">
              <h2 className="text-5xl font-serif leading-tight">
                Cada pieza tiene una huella digital
              </h2>
              <p className="text-xl text-charcoal/70 leading-relaxed font-light mb-8">
                Cada objeto en Cocrea conserva un registro que documenta su
                origen cultural, el taller que lo creó y su proceso artesanal.
              </p>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <span className="text-primary font-serif italic text-3xl">
                    01
                  </span>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-2">
                      Taller artesanal
                    </h4>
                    <p className="text-charcoal/60 text-sm">
                      Ubicación geográfica exacta donde se produjo la pieza.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <span className="text-primary font-serif italic text-3xl">
                    02
                  </span>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-2">
                      Maestro artesano
                    </h4>
                    <p className="text-charcoal/60 text-sm">
                      Nombre y rostro de los maestros artesanos detrás de la
                      creación.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <span className="text-primary font-serif italic text-3xl">
                    03
                  </span>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-2">
                      Proceso documentado
                    </h4>
                    <p className="text-charcoal/60 text-sm">
                      Detalles de la técnica, materiales y tiempo de
                      elaboración.
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="/productos"
                className="inline-block border border-charcoal px-10 py-4 uppercase text-xs tracking-widest hover:bg-charcoal hover:text-white transition-all"
              >
                Explorar el registro de autenticidad
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════ FEATURED SHOP ═══════════════ */}
        <section className="py-14 bg-cream">
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-center mb-20 opacity-80">
              Conoce a los talleres artesanales
            </h2>
            <div className="grid lg:grid-cols-2 gap-20 items-stretch">
              {/* Shop image */}
              <div className="min-h-[500px] bg-muted rounded-sm border border-foreground/10 overflow-hidden">
                {featuredShop?.bannerUrl ? (
                  <img
                    src={featuredShop.bannerUrl}
                    alt={featuredShop.shopName}
                    className="w-full h-full object-cover grayscale-[35%] hover:grayscale-0 hover:scale-[1.03] transition-all duration-700 ease-out"
                  />
                ) : featuredShop?.logoUrl ? (
                  <img
                    src={featuredShop.logoUrl}
                    alt={featuredShop.shopName}
                    className="w-full h-full object-cover grayscale-[35%] hover:grayscale-0 hover:scale-[1.03] transition-all duration-700 ease-out"
                  />
                ) : null}
              </div>
              {/* Shop info */}
              <div className="flex flex-col justify-center py-10 space-y-8">
                {featuredShop ? (
                  <>
                    <div className="space-y-2">
                      <span className="text-primary font-bold uppercase tracking-widest text-[11px]">
                        Taller del Mes
                      </span>
                      <h3 className="text-5xl md:text-6xl font-serif">
                        {featuredShop.shopName}
                      </h3>
                      <p className="text-charcoal/60 italic font-serif text-xl">
                        {featuredShop.municipality && featuredShop.department
                          ? `${featuredShop.municipality}, ${featuredShop.department}`
                          : featuredShop.department || "Colombia"}
                      </p>
                    </div>
                    <div className="space-y-6">
                      {featuredShop.craftType && (
                        <div className="flex items-start gap-4 pb-6 border-b border-foreground/10">
                          <span className="text-primary mt-1 text-xl">★</span>
                          <span className="text-lg font-serif">
                            Especialidad: {featuredShop.craftType}
                          </span>
                        </div>
                      )}
                      <p className="text-lg leading-relaxed text-charcoal/80">
                        {featuredShop.story ||
                          "Taller artesanal dedicado al tejido tradicional con técnicas transmitidas entre generaciones."}
                      </p>
                      <Link
                        to={`/artesano/${featuredShop.shopSlug}`}
                        className="text-xs font-bold uppercase tracking-widest border-b border-charcoal pb-1 hover:text-primary hover:border-primary transition-colors"
                      >
                        Ver perfil del taller
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-muted" />
                    <div className="h-16 w-full bg-muted" />
                    <div className="h-6 w-64 bg-muted" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ REGALOS CON HISTORIA ═══════════════ */}
        <section className="py-10 bg-editorial-bg">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1 space-y-8">
                <h2 className="text-5xl font-serif">Regalos con historia</h2>
                <p className="text-xl text-charcoal/70 leading-relaxed font-light">
                  En Cocrea puedes encontrar piezas especiales para regalar en
                  momentos importantes. Cada objeto hecho a mano lleva consigo
                  tradición, conocimiento y dedicación.
                </p>
                <Link
                  to="/giftcards"
                  className="inline-block bg-charcoal text-white px-10 py-4 uppercase text-xs tracking-widest hover:bg-primary transition-colors"
                >
                  Explorar piezas para regalar
                </Link>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                <div className="aspect-square bg-muted rounded-sm border border-foreground/10 overflow-hidden">
                  {featuredProducts[1] &&
                  getPrimaryImageUrl(featuredProducts[1]) ? (
                    <img
                      src={getPrimaryImageUrl(featuredProducts[1])!}
                      alt="Regalo artesanal"
                      className="w-full h-full object-cover grayscale-[35%] hover:grayscale-0 hover:scale-[1.03] transition-all duration-700 ease-out"
                    />
                  ) : null}
                </div>
                <div className="aspect-square bg-muted rounded-sm border border-foreground/10 mt-12 overflow-hidden">
                  {featuredProducts[2] &&
                  getPrimaryImageUrl(featuredProducts[2]) ? (
                    <img
                      src={getPrimaryImageUrl(featuredProducts[2])!}
                      alt="Regalo artesanal"
                      className="w-full h-full object-cover grayscale-[35%] hover:grayscale-0 hover:scale-[1.03] transition-all duration-700 ease-out"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ COLECCIONES ═══════════════ */}
        <section className="py-10">
          <div className="max-w-[1400px] mx-auto px-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-center mb-16 opacity-40">
              Colecciones
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Link to="/productos" className="group cursor-pointer">
                <div className="aspect-[4/5] bg-muted mb-6 rounded-sm border border-foreground/10 overflow-hidden relative">
                  {displayCategories[0]?.imageUrl && (
                    <img
                      src={displayCategories[0].imageUrl}
                      alt="Piezas para el hogar"
                      className="w-full h-full object-cover grayscale-[35%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                    />
                  )}
                </div>
                <h3 className="text-2xl font-serif italic">
                  Piezas para el hogar
                </h3>
                <p className="text-[10px] uppercase tracking-widest mt-2 opacity-60">
                  Objetos que cuentan historias
                </p>
              </Link>
              <Link to="/productos" className="group cursor-pointer">
                <div className="aspect-[4/5] bg-muted mb-6 rounded-sm border border-foreground/10 overflow-hidden relative">
                  {displayCategories[1]?.imageUrl && (
                    <img
                      src={displayCategories[1].imageUrl}
                      alt="Textiles con historia"
                      className="w-full h-full object-cover grayscale-[35%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                    />
                  )}
                </div>
                <h3 className="text-2xl font-serif italic">
                  Textiles con historia
                </h3>
                <p className="text-[10px] uppercase tracking-widest mt-2 opacity-60">
                  Tejidos a mano en telar
                </p>
              </Link>
              <Link to="/giftcards" className="group cursor-pointer">
                <div className="aspect-[4/5] bg-muted mb-6 rounded-sm border border-foreground/10 overflow-hidden relative">
                  {displayCategories[2]?.imageUrl && (
                    <img
                      src={displayCategories[2].imageUrl}
                      alt="Creaciones para regalar"
                      className="w-full h-full object-cover grayscale-[35%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                    />
                  )}
                </div>
                <h3 className="text-2xl font-serif italic">
                  Creaciones para regalar
                </h3>
                <p className="text-[10px] uppercase tracking-widest mt-2 opacity-60">
                  Detalles con alma
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════ INSTITUCIONAL ═══════════════ */}
        <section className="py-24 border-t border-foreground/10">
          <div className="max-w-3xl mx-auto px-6 text-center space-y-10">
            <h2 className="text-[10px] font-bold text-charcoal/50 uppercase tracking-[0.4em]">
              Una iniciativa de
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16">
              <img
                src={escuelasTallerLogo}
                alt="Escuelas Taller de Colombia — Herramientas de paz"
                className="w-32 h-32 object-contain"
              />
              <img
                src={culturasLogo}
                alt="Ministerio de las Culturas, las Artes y los Saberes"
                className="w-44 h-auto object-contain"
              />
            </div>
            <h3 className="text-2xl font-serif">
              Programa Nacional Escuelas Taller de Colombia · Ministerio de las
              Culturas, las Artes y los Saberes
            </h3>
          </div>
        </section>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <Footer />
      </div>
    </>
  );
};

export default Index;
