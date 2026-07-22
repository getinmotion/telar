/**
 * HomeWidgets — bloques "duros" de la homepage (data-driven pero no editables
 * via CMS payload). El CMS solo controla DÓNDE aparecen via `embedded_widget`.
 *
 * Cada widget es independiente: trae su propia data (productos, talleres,
 * categorías) y se renderiza igual que estaba en Index.tsx.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { useArtisanShops } from "@/contexts/ArtisanShopsContext";
import {
  getFeaturedProductsNew,
  type ProductFeatured,
} from "@/services/products-new.actions";
import { formatCurrency } from "@/lib/currencyUtils";
import escuelasTallerLogo from "@/assets/escuelas-taller-logo.svg";
import culturasLogo from "@/assets/culturas-logo.svg";

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

const useDailySeed = () =>
  useMemo(() => {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }, []);

const useFeaturedProducts = () => {
  const [products, setProducts] = useState<ProductFeatured[]>([]);
  const [loading, setLoading] = useState(true);
  const dailySeed = useDailySeed();

  useEffect(() => {
    getFeaturedProductsNew()
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else if (data && Array.isArray((data as any).data))
          setProducts((data as any).data);
        else if (data && Array.isArray((data as any).products))
          setProducts((data as any).products);
        else setProducts([]);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = useMemo(() => {
    const safe = Array.isArray(products) ? products : [];
    const available = safe.filter(
      (p) => !p.status || p.status === "published" || p.status === "approved",
    );
    if (available.length === 0 && safe.length > 0) {
      return shuffleArray(safe, dailySeed).slice(0, 3);
    }
    const shuffled = shuffleArray(available, dailySeed);
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
    if (picked.length < 3) {
      for (const p of shuffled) {
        if (!picked.includes(p)) picked.push(p);
        if (picked.length >= 3) break;
      }
    }
    return picked;
  }, [products, dailySeed]);

  return { featured, loading };
};

// ────────────────────────────────────────────────────────────
// Widget: Categories Grid
// ────────────────────────────────────────────────────────────
export function CategoriesGridWidget({ kicker }: { kicker?: string }) {
  const { categoryHierarchy } = useTaxonomy();
  const displayCategories = useMemo(
    () =>
      categoryHierarchy
        .filter((c) => c.isActive && c.slug !== "cuidado-personal")
        .slice(0, 8),
    [categoryHierarchy],
  );

  return (
    <section className="py-12 border-y border-foreground/10">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-wrap justify-between gap-y-12">
          {kicker && (
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] w-full mb-4 text-primary">
              {kicker}
            </span>
          )}
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
  );
}

// ────────────────────────────────────────────────────────────
// Widget: Featured Products Grid
// ────────────────────────────────────────────────────────────
export function FeaturedProductsWidget({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const { featured, loading } = useFeaturedProducts();

  return (
    <section className="py-24 max-w-[1400px] mx-auto px-6">
      {(title || subtitle) && (
        <div className="text-center mb-16 space-y-3">
          {title && (
            <h2 className="text-4xl md:text-5xl font-serif">{title}</h2>
          )}
          {subtitle && (
            <p className="text-charcoal/70 italic font-light">{subtitle}</p>
          )}
          {ctaLabel && ctaHref && (
            <Link
              to={ctaHref}
              className="inline-block mt-4 text-xs font-bold uppercase tracking-widest border-b border-charcoal pb-1 hover:text-primary hover:border-primary"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {loading || featured.length === 0
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="space-y-6 animate-pulse">
                <div className="aspect-[3/4] bg-muted" />
                <div className="h-4 w-24 bg-muted" />
                <div className="h-6 w-3/4 bg-muted" />
                <div className="h-4 w-1/2 bg-muted" />
              </div>
            ))
          : featured.map((product, idx) => (
              <article
                key={product.id}
                className={`group ${idx === 1 ? "mt-12 md:mt-24" : ""}`}
              >
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-[3/4] bg-muted mb-6 rounded-sm border border-foreground/10 transition-all duration-700 overflow-hidden relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover grayscale-[35%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700 ease-out"
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
                      {product.storeName}
                      {product.department ? ` — ${product.department}` : ""}
                    </p>
                    <div className="pt-4 flex items-center justify-between border-t border-foreground/10">
                      <span className="font-medium">
                        {product.price != null
                          ? formatCurrency(product.price)
                          : "Consultar"}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Widget: Huella Digital
// ────────────────────────────────────────────────────────────
export function HuellaDigitalWidget() {
  const { featured } = useFeaturedProducts();
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-2 gap-24 items-center">
        <div className="aspect-square bg-muted rounded-sm border border-foreground/10 overflow-hidden">
          {featured[1]?.imageUrl && (
            <img
              src={featured[1].imageUrl}
              alt="Huella digital"
              className="w-full h-full object-cover grayscale-[35%] hover:grayscale-0 hover:scale-[1.03] transition-all duration-700 ease-out"
            />
          )}
        </div>
        <div className="space-y-10">
          <h2 className="text-5xl font-serif leading-tight">
            Cada pieza tiene una huella digital
          </h2>
          <p className="text-xl text-charcoal/70 leading-relaxed font-light mb-8">
            Cada objeto en Cocrea conserva un registro que documenta su origen
            cultural, el taller que lo creó y su proceso artesanal.
          </p>
          <div className="space-y-8">
            {[
              {
                n: "01",
                t: "Taller artesanal",
                b: "Ubicación geográfica exacta donde se produjo la pieza.",
              },
              {
                n: "02",
                t: "Maestro artesano",
                b: "Nombre y rostro de los maestros artesanos detrás de la creación.",
              },
              {
                n: "03",
                t: "Proceso documentado",
                b: "Detalles de la técnica, materiales y tiempo de elaboración.",
              },
            ].map(({ n, t, b }) => (
              <div key={n} className="flex gap-6">
                <span className="text-primary font-serif italic text-3xl">
                  {n}
                </span>
                <div>
                  <h4 className="font-bold uppercase tracking-widest text-xs mb-2">
                    {t}
                  </h4>
                  <p className="text-charcoal/60 text-sm">{b}</p>
                </div>
              </div>
            ))}
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
  );
}

// ────────────────────────────────────────────────────────────
// Widget: Featured Shop
// ────────────────────────────────────────────────────────────
export function FeaturedShopWidget() {
  const { shops, fetchFeaturedShops } = useArtisanShops();
  useEffect(() => {
    fetchFeaturedShops(8);
  }, []);
  const featuredShop = useMemo(() => {
    const safe = Array.isArray(shops) ? shops : [];
    const karen = safe.find((s) =>
      s.shopName?.toLowerCase().includes("karen dayana"),
    );
    return karen || safe[0] || null;
  }, [shops]);

  return (
    <section className="py-32 bg-cream">
      <div className="max-w-[1400px] mx-auto px-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-center mb-20 opacity-60">
          Conoce a los talleres artesanales
        </h2>
        <div className="grid lg:grid-cols-2 gap-20 items-stretch">
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
  );
}

// ────────────────────────────────────────────────────────────
// Widget: Regalos con historia
// ────────────────────────────────────────────────────────────
export function RegalosConHistoriaWidget() {
  const { featured } = useFeaturedProducts();
  return (
    <section className="py-24 bg-editorial-bg">
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
              {featured[1]?.imageUrl && (
                <img
                  src={featured[1].imageUrl}
                  alt="Regalo artesanal"
                  className="w-full h-full object-cover grayscale-[35%] hover:grayscale-0 hover:scale-[1.03] transition-all duration-700 ease-out"
                />
              )}
            </div>
            <div className="aspect-square bg-muted rounded-sm border border-foreground/10 mt-12 overflow-hidden">
              {featured[2]?.imageUrl && (
                <img
                  src={featured[2].imageUrl}
                  alt="Regalo artesanal"
                  className="w-full h-full object-cover grayscale-[35%] hover:grayscale-0 hover:scale-[1.03] transition-all duration-700 ease-out"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Widget: Colecciones overview (3-card teaser)
// ────────────────────────────────────────────────────────────
export function ColeccionesOverviewWidget() {
  const { categoryHierarchy } = useTaxonomy();
  const displayCategories = useMemo(
    () =>
      categoryHierarchy
        .filter((c) => c.isActive && c.slug !== "cuidado-personal")
        .slice(0, 8),
    [categoryHierarchy],
  );

  return (
    <section className="py-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-center mb-16 opacity-40">
          Colecciones
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              to: "/productos",
              img: 0,
              title: "Piezas para el hogar",
              sub: "Objetos que cuentan historias",
            },
            {
              to: "/productos",
              img: 1,
              title: "Textiles con historia",
              sub: "Tejidos a mano en telar",
            },
            {
              to: "/giftcards",
              img: 2,
              title: "Creaciones para regalar",
              sub: "Detalles con alma",
            },
          ].map(({ to, img, title, sub }) => (
            <Link key={to + title} to={to} className="group cursor-pointer">
              <div className="aspect-[4/5] bg-muted mb-6 rounded-sm border border-foreground/10 overflow-hidden relative">
                {displayCategories[img]?.imageUrl && (
                  <img
                    src={displayCategories[img].imageUrl}
                    alt={title}
                    className="w-full h-full object-cover grayscale-[35%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                  />
                )}
              </div>
              <h3 className="text-2xl font-serif italic">{title}</h3>
              <p className="text-[10px] uppercase tracking-widest mt-2 opacity-60">
                {sub}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Widget: Aliados
// ────────────────────────────────────────────────────────────
export function AliadosWidget() {
  return (
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
  );
}
