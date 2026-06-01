import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { getArtisanShopBySlug } from '@/services/artisanShops.actions';
import { getProductsByShopId, getMarketplaceProductsByShopId } from '@/services/products.actions';
import { ShoppingCartProvider } from '@/contexts/ShoppingCartContext';
import {
  T, glassCard, glassLoom, pageBg, normShop, getHeroImage, getShopLocation,
  getAvailabilityInfo, formatPriceCOP, getProductImage, getMaterialsLabel,
  LabelCaps, HeadingSerif, ShopTopBar, ShopPublicFooter, TrustStrip,
  ProductCardLarge, ProductCardCompact, GlassContainer,
  ShopLoadingState, ShopNotFoundState,
} from '@/components/shop/public/ShopPublicShell';

export default function PublicShopPageNew() {
  const { shopSlug } = useParams<{ shopSlug: string }>();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();

  const [rawShop,   setRawShop]   = useState<any>(null);
  const [products,  setProducts]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [isOwner,   setIsOwner]   = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [filter,    setFilter]    = useState('all');

  const isPreviewRequest = new URLSearchParams(window.location.search).get('preview') === 'true';
  const authLoaded = !isPreviewRequest || !authLoading;

  useEffect(() => {
    if (!authLoaded || !shopSlug) return;
    (async () => {
      try {
        setIsPreview(isPreviewRequest);
        const shopData = await getArtisanShopBySlug(shopSlug);
        if (!shopData) { setLoading(false); return; }

        const ownerCheck = isPreviewRequest && !!currentUser && shopData.userId === currentUser.id;
        setIsOwner(ownerCheck);
        if (!ownerCheck && shopData.publishStatus !== 'published') { navigate('/tiendas'); return; }
        setRawShop(shopData);

        const prods = ownerCheck
          ? await getProductsByShopId(shopData.id)
          : await getMarketplaceProductsByShopId(shopData.id);
        setProducts(prods);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [shopSlug, authLoaded, navigate]);

  const shop = useMemo(() => rawShop ? normShop(rawShop) : null, [rawShop]);

  const artisanProfile  = shop?.artisanProfile ?? null;
  const profileDone     = shop?.artisanProfileCompleted === true;
  const heroImage       = shop ? getHeroImage(shop) : null;
  const location        = shop ? getShopLocation(shop) : '';

  const categories = useMemo(() => {
    const s = new Set<string>();
    products.forEach(p => { if (p.category) s.add(p.category); });
    return Array.from(s);
  }, [products]);

  const filtered = useMemo(() => {
    if (filter === 'all')        return products;
    if (filter === 'disponible') return products.filter(p => {
      const t = p.production?.availabilityType ?? p.availabilityType ?? '';
      return t === 'en_stock' || t === '';
    });
    if (filter === 'pedido')     return products.filter(p =>
      (p.production?.availabilityType ?? p.availabilityType) === 'bajo_pedido');
    if (filter === 'agotado')    return products.filter(p => (p.inventory ?? 999) === 0);
    return products.filter(p => p.category === filter);
  }, [products, filter]);

  const handleProduct = (id: string) =>
    navigate(`/tienda/${shopSlug}/producto/${id}${isPreview ? '?preview=true' : ''}`);

  if (loading) return <ShopLoadingState />;
  if (!shop)   return <ShopNotFoundState message="Tienda no encontrada" />;

  const FILTERS = [
    { key: 'all',        label: 'Todos' },
    { key: 'disponible', label: 'Disponibles' },
    { key: 'pedido',     label: 'Bajo pedido' },
    { key: 'agotado',    label: 'Agotados' },
    ...categories.map(c => ({ key: c, label: c })),
  ];

  return (
    <ShoppingCartProvider>
      <div style={pageBg}>
        <Helmet>
          <title>{`${shop.shopName} · Taller Artesanal TELAR`}</title>
          <meta name="description" content={shop.description ?? shop.brandClaim ?? ''} />
        </Helmet>

        <ShopTopBar shop={shop} shopSlug={shopSlug!} activePage="home"
          isPreviewMode={isPreview} isOwner={isOwner} />

        <TrustStrip />

        <GlassContainer>

          {/* ── 1. Hero ─────────────────────────────────────────────────── */}
          <section className="grid grid-cols-12 border-b" style={{ borderColor: 'rgba(255,255,255,0.6)' }}>
            <div className="col-span-12 md:col-span-7 p-10 flex flex-col justify-center gap-5">
              <div className="space-y-1">
                {location && (
                  <div className="flex items-center gap-1.5" style={{ color: T.orange }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>location_on</span>
                    <LabelCaps color={T.orange}>{location}</LabelCaps>
                  </div>
                )}
                <LabelCaps>Taller verificado por TELAR</LabelCaps>
              </div>

              <HeadingSerif as="h1" size={44} style={{ maxWidth: 520 }}>{shop.shopName}</HeadingSerif>

              {(shop.description || shop.brandClaim) && (
                <p style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 500, color: `${T.muted}90`, maxWidth: 480, lineHeight: 1.6 }}>
                  {shop.description || shop.brandClaim}
                </p>
              )}

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                {shop.marketplaceApproved && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-[800] uppercase tracking-wider"
                    style={{ background: `${T.green}10`, color: T.green, borderColor: `${T.green}25`, fontFamily: T.sans }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13, fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Taller verificado
                  </span>
                )}
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-[800] uppercase tracking-wider"
                  style={{ background: `${T.dark}06`, borderColor: 'rgba(255,255,255,0.65)', fontFamily: T.sans, color: T.dark }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>qr_code_2</span>
                  Pasaporte digital
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-[800] uppercase tracking-wider"
                  style={{ background: `${T.dark}06`, borderColor: 'rgba(255,255,255,0.65)', fontFamily: T.sans, color: T.dark }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>eco</span>
                  Hecho en Colombia
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3.5 rounded-full text-white"
                  style={{ background: T.orange, fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', boxShadow: `0 8px 24px ${T.orange}35` }}
                >
                  Comprar piezas
                </button>
                {profileDone && (
                  <button
                    onClick={() => document.getElementById('historia')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-3.5 rounded-full border transition-colors hover:bg-black/5"
                    style={{ border: `1px solid ${T.dark}15`, color: T.dark, fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}
                  >
                    Conocer historia
                  </button>
                )}
              </div>

              {products.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.green }} />
                  <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}70` }}>
                    {products.length} {products.length === 1 ? 'pieza disponible' : 'piezas en catálogo'}
                  </p>
                </div>
              )}
            </div>

            {/* Hero image */}
            <div className="col-span-12 md:col-span-5 relative min-h-[380px] overflow-hidden">
              {heroImage
                ? <img src={heroImage} alt={shop.shopName} className="absolute inset-0 w-full h-full object-cover" />
                : <div className="absolute inset-0 flex items-center justify-center" style={{ background: `${T.dark}06` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 56, color: `${T.muted}20` }}>storefront</span>
                  </div>
              }
              <div className="absolute inset-0" style={{ background: `linear-gradient(to right, rgba(255,255,255,0.15), transparent)` }} />
            </div>
          </section>

          {/* ── 2. Productos destacados ─────────────────────────────────── */}
          {products.length > 0 && (
            <section className="p-10 border-b space-y-7" style={{ borderColor: 'rgba(255,255,255,0.6)' }}>
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <LabelCaps color={T.orange}>Lanzamientos recientes</LabelCaps>
                  <HeadingSerif size={26}>Piezas seleccionadas</HeadingSerif>
                </div>
                <Link to={`/tienda/${shopSlug}/catalogo`}
                  className="flex items-center gap-1.5 border-b pb-0.5 transition-colors hover:border-orange-400"
                  style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: `${T.muted}70`, borderColor: `${T.muted}30` }}>
                  Ver catálogo completo
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {products.slice(0, 3).map(p => (
                  <ProductCardLarge key={p.id} product={p} onClick={() => handleProduct(p.id)} />
                ))}
              </div>
            </section>
          )}

          {/* ── 3. Catálogo completo con filtros ───────────────────────── */}
          {products.length > 0 && (
            <section id="catalogo" className="p-10 border-b space-y-6" style={{ background: `${T.base}40`, borderColor: 'rgba(255,255,255,0.6)' }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <HeadingSerif size={24}>Todos los productos</HeadingSerif>
                <div className="flex flex-wrap gap-2">
                  {FILTERS.map(({ key, label }) => (
                    <button key={key} onClick={() => setFilter(key)}
                      className="px-4 py-2 rounded-full transition-all"
                      style={{
                        fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                        background: filter === key ? T.dark : 'white',
                        color:      filter === key ? 'white' : `${T.muted}70`,
                        border:     `1px solid ${filter === key ? T.dark : `${T.dark}14`}`,
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {filtered.length === 0
                ? <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}50` }} className="py-10 text-center">
                    No hay productos en esta categoría.
                  </p>
                : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                    {filtered.map(p => (
                      <ProductCardCompact key={p.id} product={p} onClick={() => handleProduct(p.id)} />
                    ))}
                  </div>
              }
            </section>
          )}

          {/* ── 4. Trust signals row ────────────────────────────────────── */}
          <section className="grid grid-cols-2 md:grid-cols-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.28)' }}>
            {[
              { label: 'Años de oficio',  value: artisanProfile?.startAge ? `${artisanProfile.startAge}+` : '—' },
              { label: 'Técnica',         value: artisanProfile?.techniques?.[0] ?? shop.craftType ?? '—' },
              { label: 'Territorio',      value: shop.municipality ?? shop.department ?? shop.region ?? '—' },
              { label: 'Materiales',      value: artisanProfile?.materials?.[0] ?? 'Naturales' },
              { label: 'Piezas',          value: `${products.length}` },
              { label: 'Taller',          value: shop.marketplaceApproved ? 'Verificado' : 'Activo', color: shop.marketplaceApproved ? T.green : T.dark },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-5 text-center space-y-1.5 border-r last:border-r-0" style={{ borderColor: 'rgba(255,255,255,0.65)' }}>
                <LabelCaps>{label}</LabelCaps>
                <p style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 700, color: color ?? T.dark, lineHeight: 1.2 }}>{value}</p>
              </div>
            ))}
          </section>

          {/* ── 5. Historia del artesano ────────────────────────────────── */}
          {profileDone && artisanProfile && (
            <section id="historia" className="grid grid-cols-1 md:grid-cols-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.6)' }}>
              <div className="p-10 flex flex-col justify-center gap-6">
                <LabelCaps color={T.orange}>La voz detrás del taller</LabelCaps>
                <blockquote style={{ fontFamily: T.serif, fontSize: 26, fontWeight: 700, color: T.dark, lineHeight: 1.35, fontStyle: 'italic', maxWidth: 460 }}>
                  "{artisanProfile.learnedFromDetail || artisanProfile.culturalMeaning || 'Cada pieza lleva años de tradición y dedicación.'}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="h-px w-8" style={{ background: `${T.muted}40` }} />
                  <p style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.dark }}>
                    {artisanProfile.artisanName || shop.shopName}
                  </p>
                </div>
                <Link to={`/tienda/${shopSlug}/perfil-artesanal`}
                  className="w-fit border-b pb-0.5"
                  style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.dark, borderColor: `${T.dark}35` }}>
                  Leer historia completa
                </Link>
              </div>
              <div className="relative min-h-[340px] overflow-hidden">
                {artisanProfile.artisanPhoto
                  ? <img src={artisanProfile.artisanPhoto} alt={artisanProfile.artisanName} className="absolute inset-0 w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center" style={{ background: `${T.dark}08` }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 64, color: `${T.muted}20` }}>person</span>
                    </div>
                }
              </div>
            </section>
          )}

          {/* ── 6. Autenticidad TELAR ───────────────────────────────────── */}
          <section className="p-10" style={{ background: T.dark }}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-4 space-y-4">
                <HeadingSerif size={24} style={{ color: 'white' }}>Autenticidad verificada por TELAR</HeadingSerif>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                  Cada pieza del taller incluye un pasaporte digital que documenta su origen, técnica, materiales y trazabilidad completa.
                </p>
                <button className="mt-2 px-7 py-3 rounded-full text-white"
                  style={{ background: T.orange, fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  Saber más
                </button>
              </div>
              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { icon: 'eco',       title: 'Materia prima',   sub: 'Trazabilidad total' },
                  { icon: 'back_hand', title: 'Hecho a mano',    sub: 'Técnica ancestral' },
                  { icon: 'verified',  title: 'Calidad',         sub: 'Revisión editorial' },
                  { icon: 'qr_code_2', title: 'Pasaporte',       sub: 'Origen verificado' },
                ].map(({ icon, title, sub }) => (
                  <div key={title} className="space-y-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border"
                      style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.orange }}>{icon}</span>
                    </div>
                    <div>
                      <p style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'white' }}>{title}</p>
                      <p style={{ fontFamily: T.sans, fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── 7. CTA final ───────────────────────────────────────────── */}
          <section>
            <div className="p-10 flex flex-col items-center text-center gap-7" style={{ paddingTop: 72, paddingBottom: 72 }}>
              <div className="space-y-3 max-w-lg">
                <HeadingSerif size={38}>Lleva una historia hecha a mano</HeadingSerif>
                <p style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 500, color: `${T.muted}80` }}>
                  Apoya directamente el talento local. Cada compra va directo al taller.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-9 py-4 rounded-full text-white"
                  style={{ background: T.orange, fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', boxShadow: `0 12px 28px ${T.orange}30` }}>
                  Ver todas las piezas
                </button>
                {(shop.contactConfig?.phone ?? shop.contactInfo?.phone) && (
                  <a href={`https://wa.me/${String(shop.contactConfig?.phone ?? shop.contactInfo?.phone).replace(/\D/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="px-9 py-4 rounded-full text-white"
                    style={{ background: T.dark, fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Contactar taller
                  </a>
                )}
              </div>
            </div>
          </section>

        </GlassContainer>

        <ShopPublicFooter shop={shop} shopSlug={shopSlug!} />
      </div>
    </ShoppingCartProvider>
  );
}
