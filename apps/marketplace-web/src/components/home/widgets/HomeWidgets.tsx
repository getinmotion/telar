/**
 * HomeWidgets — bloques "duros" de la homepage (data-driven pero no editables
 * via CMS payload). El CMS solo controla DÓNDE aparecen via `embedded_widget`.
 *
 * Cada widget es independiente: trae su propia data (productos, talleres,
 * categorías) y se renderiza igual que estaba en Index.tsx.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTaxonomy } from '@/hooks/useTaxonomy';
import { useArtisanShops } from '@/contexts/ArtisanShopsContext';
import {
  getFeaturedProductsNew,
  type ProductFeatured,
} from '@/services/products-new.actions';
import { formatCurrency } from '@/lib/currencyUtils';

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
        else if (data && Array.isArray((data as any).data)) setProducts((data as any).data);
        else if (data && Array.isArray((data as any).products)) setProducts((data as any).products);
        else setProducts([]);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = useMemo(() => {
    const safe = Array.isArray(products) ? products : [];
    const available = safe.filter(
      (p) => !p.status || p.status === 'published' || p.status === 'approved',
    );
    if (available.length === 0 && safe.length > 0) {
      return shuffleArray(safe, dailySeed).slice(0, 3);
    }
    const shuffled = shuffleArray(available, dailySeed);
    const seen = new Set<string>();
    const picked: ProductFeatured[] = [];
    for (const p of shuffled) {
      const store = p.storeName ?? '';
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
        .filter((c) => c.isActive && c.slug !== 'cuidado-personal')
        .slice(0, 8),
    [categoryHierarchy],
  );

  return (
    <section className="py-12 border-y border-[#2c2c2c]/10">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-wrap justify-between gap-y-12">
          {kicker && (
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] w-full mb-4 opacity-40">
              {kicker}
            </span>
          )}
          {displayCategories.map((cat) => (
            <div key={cat.id} className="w-full md:w-1/4 space-y-2 px-2">
              <Link to={`/categoria/${cat.slug}`}>
                <div className="aspect-[16/10] bg-[#e5e1d8] mb-4 overflow-hidden relative">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#e5e1d8]" />
                  )}
                </div>
              </Link>
              <Link
                to={`/categoria/${cat.slug}`}
                className="text-xl font-serif hover:italic hover:text-[#ec6d13] transition-all"
              >
                {cat.name}
              </Link>
              <p className="text-[10px] text-[#2c2c2c]/50 uppercase tracking-widest">
                {cat.subcategories.length > 0
                  ? cat.subcategories.slice(0, 3).map((s) => s.name).join(', ')
                  : 'Piezas artesanales únicas'}
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
          {title && <h2 className="text-4xl md:text-5xl font-serif">{title}</h2>}
          {subtitle && (
            <p className="text-[#2c2c2c]/60 italic font-light">{subtitle}</p>
          )}
          {ctaLabel && ctaHref && (
            <Link
              to={ctaHref}
              className="inline-block mt-4 text-xs font-bold uppercase tracking-widest border-b border-[#2c2c2c] pb-1 hover:text-[#ec6d13] hover:border-[#ec6d13]"
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
                <div className="aspect-[3/4] bg-[#e5e1d8]" />
                <div className="h-4 w-24 bg-[#e5e1d8]" />
                <div className="h-6 w-3/4 bg-[#e5e1d8]" />
                <div className="h-4 w-1/2 bg-[#e5e1d8]" />
              </div>
            ))
          : featured.map((product, idx) => (
              <article
                key={product.id}
                className={`group ${idx === 1 ? 'mt-12 md:mt-24' : ''}`}
              >
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-[3/4] bg-[#e5e1d8] mb-6 grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#e5e1d8]" />
                    )}
                  </div>
                  <div className="space-y-3">
                    <span className="inline-block bg-[#ec6d13]/10 text-[#ec6d13] text-[9px] uppercase tracking-widest px-2 py-0.5 mb-2">
                      Hecho a mano
                    </span>
                    <h3 className="text-2xl font-serif leading-tight">{product.name}</h3>
                    <p className="text-xs uppercase tracking-widest text-[#2c2c2c]/50">
                      {product.storeName}
                      {product.department ? ` — ${product.department}` : ''}
                    </p>
                    <div className="pt-4 flex items-center justify-between border-t border-[#2c2c2c]/5">
                      <span className="font-medium">
                        {product.price != null ? formatCurrency(product.price) : 'Consultar'}
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
        <div className="aspect-square bg-[#e5e1d8]">
          {featured[1]?.imageUrl && (
            <img src={featured[1].imageUrl} alt="Huella digital" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="space-y-10">
          <h2 className="text-5xl font-serif leading-tight">Cada pieza tiene una huella digital</h2>
          <p className="text-xl text-[#2c2c2c]/70 leading-relaxed font-light mb-8">
            Cada objeto en Telar conserva un registro que documenta su origen cultural, el taller que lo creó y su proceso artesanal.
          </p>
          <div className="space-y-8">
            {[
              { n: '01', t: 'Taller artesanal', b: 'Ubicación geográfica exacta donde se produjo la pieza.' },
              { n: '02', t: 'Maestro artesano', b: 'Nombre y rostro de los maestros artesanos detrás de la creación.' },
              { n: '03', t: 'Proceso documentado', b: 'Detalles de la técnica, materiales y tiempo de elaboración.' },
            ].map(({ n, t, b }) => (
              <div key={n} className="flex gap-6">
                <span className="text-[#ec6d13] font-serif italic text-3xl">{n}</span>
                <div>
                  <h4 className="font-bold uppercase tracking-widest text-xs mb-2">{t}</h4>
                  <p className="text-[#2c2c2c]/60 text-sm">{b}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/productos"
            className="inline-block border border-[#2c2c2c] px-10 py-4 uppercase text-xs tracking-widest hover:bg-[#2c2c2c] hover:text-white transition-all"
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
    const karen = safe.find((s) => s.shopName?.toLowerCase().includes('karen dayana'));
    return karen || safe[0] || null;
  }, [shops]);

  return (
    <section className="py-32 bg-[#fdfaf6]">
      <div className="max-w-[1400px] mx-auto px-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-center mb-20 opacity-40">
          Conoce a los talleres artesanales
        </h2>
        <div className="grid lg:grid-cols-2 gap-20 items-stretch">
          <div className="min-h-[500px] bg-[#e5e1d8] overflow-hidden">
            {featuredShop?.bannerUrl ? (
              <img src={featuredShop.bannerUrl} alt={featuredShop.shopName} className="w-full h-full object-cover" />
            ) : featuredShop?.logoUrl ? (
              <img src={featuredShop.logoUrl} alt={featuredShop.shopName} className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="flex flex-col justify-center py-10 space-y-8">
            {featuredShop ? (
              <>
                <div className="space-y-2">
                  <span className="text-[#ec6d13] font-bold uppercase tracking-widest text-[11px]">
                    Taller del Mes
                  </span>
                  <h3 className="text-5xl md:text-6xl font-serif">{featuredShop.shopName}</h3>
                  <p className="text-[#2c2c2c]/50 italic font-serif text-xl">
                    {featuredShop.municipality && featuredShop.department
                      ? `${featuredShop.municipality}, ${featuredShop.department}`
                      : featuredShop.department || 'Colombia'}
                  </p>
                </div>
                <div className="space-y-6">
                  {featuredShop.craftType && (
                    <div className="flex items-start gap-4 pb-6 border-b border-[#2c2c2c]/10">
                      <span className="text-[#ec6d13] mt-1 text-xl">★</span>
                      <span className="text-lg font-serif">Especialidad: {featuredShop.craftType}</span>
                    </div>
                  )}
                  <p className="text-lg leading-relaxed text-[#2c2c2c]/80">
                    {featuredShop.story ||
                      'Taller artesanal dedicado al tejido tradicional con técnicas transmitidas entre generaciones.'}
                  </p>
                  <Link
                    to={`/artesano/${featuredShop.shopSlug}`}
                    className="text-xs font-bold uppercase tracking-widest border-b border-[#2c2c2c] pb-1 hover:text-[#ec6d13] hover:border-[#ec6d13] transition-colors"
                  >
                    Ver perfil del taller
                  </Link>
                </div>
              </>
            ) : (
              <div className="animate-pulse space-y-4">
                <div className="h-8 w-48 bg-[#e5e1d8]" />
                <div className="h-16 w-full bg-[#e5e1d8]" />
                <div className="h-6 w-64 bg-[#e5e1d8]" />
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
    <section className="py-24 bg-[#f9f7f2]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <h2 className="text-5xl font-serif">Regalos con historia</h2>
            <p className="text-xl text-[#2c2c2c]/70 leading-relaxed font-light">
              En Telar puedes encontrar piezas especiales para regalar en momentos importantes. Cada objeto hecho a mano lleva consigo tradición, conocimiento y dedicación.
            </p>
            <Link
              to="/giftcards"
              className="inline-block bg-[#2c2c2c] text-white px-10 py-4 uppercase text-xs tracking-widest hover:bg-[#ec6d13] transition-colors"
            >
              Explorar piezas para regalar
            </Link>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div className="aspect-square bg-[#e5e1d8] overflow-hidden">
              {featured[1]?.imageUrl && (
                <img src={featured[1].imageUrl} alt="Regalo artesanal" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="aspect-square bg-[#e5e1d8] mt-12 overflow-hidden">
              {featured[2]?.imageUrl && (
                <img src={featured[2].imageUrl} alt="Regalo artesanal" className="w-full h-full object-cover" />
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
        .filter((c) => c.isActive && c.slug !== 'cuidado-personal')
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
            { to: '/productos', img: 0, title: 'Piezas para el hogar', sub: 'Objetos que cuentan historias' },
            { to: '/productos', img: 1, title: 'Textiles con historia', sub: 'Tejidos a mano en telar' },
            { to: '/giftcards', img: 2, title: 'Creaciones para regalar', sub: 'Detalles con alma' },
          ].map(({ to, img, title, sub }) => (
            <Link key={to + title} to={to} className="group cursor-pointer">
              <div className="aspect-[4/5] bg-[#e5e1d8] mb-6 overflow-hidden relative">
                {displayCategories[img]?.imageUrl && (
                  <img
                    src={displayCategories[img].imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-serif italic">{title}</h3>
              <p className="text-[10px] uppercase tracking-widest mt-2 opacity-50">{sub}</p>
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
    <section className="py-24 border-t border-[#2c2c2c]/10">
      <div className="max-w-2xl mx-auto px-6 text-center space-y-8">
        <h2 className="text-[10px] font-bold text-[#2c2c2c]/40 uppercase tracking-[0.4em]">Aliados</h2>
        <div className="flex flex-col items-center gap-6">
          <img
            src="https://telar-prod-bucket.s3.us-east-1.amazonaws.com/marketplace-home/artesanias_de_colombia.png"
            alt="Artesanías de Colombia"
            className="w-48 h-auto object-contain"
          />
          <h3 className="text-2xl font-serif">Con el apoyo de Artesanías de Colombia</h3>
        </div>
      </div>
    </section>
  );
}
