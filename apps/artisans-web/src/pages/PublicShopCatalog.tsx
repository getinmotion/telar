import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { getArtisanShopBySlug } from '@/services/artisanShops.actions';
import { getProductsByShopId, getMarketplaceProductsByShopId } from '@/services/products.actions';
import { ShoppingCartProvider } from '@/contexts/ShoppingCartContext';
import {
  T, pageBg, glassCard, glassLoom,
  LabelCaps, HeadingSerif,
  ShopTopBar, ShopPublicFooter, TrustStrip,
  normShop, getAvailabilityInfo, formatPriceCOP, getProductImage, getMaterialsLabel,
  ProductCardCompact, ProductCardLarge,
  ShopLoadingState, ShopNotFoundState, GlassContainer,
} from '@/components/shop/public/ShopPublicShell';

// ─── Page ─────────────────────────────────────────────────────────────────────
const PublicShopCatalog: React.FC = () => {
  const { shopSlug }   = useParams<{ shopSlug: string }>();
  const location       = useLocation();
  const navigate       = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const isPreviewRequest = new URLSearchParams(location.search).get('preview') === 'true';
  const authLoaded = !isPreviewRequest || !authLoading;

  const [rawShop,   setRawShop]   = useState<any>(null);
  const [products,  setProducts]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [isOwner,   setIsOwner]   = useState(false);
  const [filter,    setFilter]    = useState('all');
  const [search,    setSearch]    = useState('');
  const [viewMode,  setViewMode]  = useState<'grid' | 'large'>('grid');

  useEffect(() => {
    if (!authLoaded || !shopSlug) return;
    (async () => {
      try {
        const shopData = await getArtisanShopBySlug(shopSlug);
        if (!shopData) { setLoading(false); return; }
        const ownerCheck = isPreviewRequest && !!user && (shopData as any).userId === user.id;
        setIsOwner(ownerCheck);
        if (!ownerCheck && (shopData as any).publishStatus !== 'published') {
          navigate('/tiendas'); return;
        }
        setRawShop(shopData);
        const prods = ownerCheck
          ? await getProductsByShopId((shopData as any).id)
          : await getMarketplaceProductsByShopId((shopData as any).id);
        setProducts(prods);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [shopSlug, authLoaded, navigate]);

  const shop = useMemo(() => rawShop ? normShop(rawShop) : null, [rawShop]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    products.forEach(p => { if (p.category) s.add(p.category); });
    return Array.from(s);
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    // availability filter
    if (filter === 'disponible') list = list.filter(p => {
      const t = p.production?.availabilityType ?? p.availabilityType ?? '';
      return t === 'en_stock' || t === '';
    });
    else if (filter === 'pedido') list = list.filter(p =>
      (p.production?.availabilityType ?? p.availabilityType) === 'bajo_pedido');
    else if (filter === 'agotado') list = list.filter(p => (p.inventory ?? 999) === 0);
    else if (filter !== 'all') list = list.filter(p => p.category === filter);
    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        getMaterialsLabel(p).toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, filter, search]);

  const handleProduct = (id: string) =>
    navigate(`/tienda/${shopSlug}/producto/${id}${isPreviewRequest ? '?preview=true' : ''}`);

  const FILTERS = [
    { key: 'all',        label: `Todos (${products.length})` },
    { key: 'disponible', label: 'Disponibles' },
    { key: 'pedido',     label: 'Bajo pedido' },
    ...categories.map(c => ({ key: c, label: c })),
  ];

  if (loading) return <ShopLoadingState />;
  if (!shop)   return <ShopNotFoundState message="Tienda no encontrada" />;

  return (
    <ShoppingCartProvider>
      <div style={pageBg}>
        <Helmet>
          <title>{`Catálogo · ${shop.shopName} · TELAR`}</title>
          <meta name="description" content={`Todas las piezas de ${shop.shopName} — taller artesanal verificado por TELAR`} />
        </Helmet>

        <ShopTopBar shop={shop} shopSlug={shopSlug!} activePage="catalog"
          isPreviewMode={isPreviewRequest} isOwner={isOwner} />

        <TrustStrip />

        {/* ── HEADER CATÁLOGO ─────────────────────────────────────────────── */}
        <div className="max-w-[1400px] mx-auto px-10 pt-10 pb-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <LabelCaps color={T.orange} style={{ display: 'block', marginBottom: 6 }}>Catálogo completo</LabelCaps>
              <HeadingSerif size={40}>{shop.shopName}</HeadingSerif>
              <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70`, marginTop: 6 }}>
                {products.length} {products.length === 1 ? 'pieza' : 'piezas'} · Hecho a mano en {shop.municipality || shop.department || shop.region || 'Colombia'}
              </p>
            </div>

            {/* Buscador */}
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: 18, color: `${T.muted}50` }}>search</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar pieza, material…"
                className="w-full pl-10 pr-4 py-2.5 rounded-full focus:outline-none transition-all"
                style={{ ...glassCard, fontFamily: T.sans, fontSize: 13, color: T.dark, border: `1px solid ${T.dark}12` }}
              />
            </div>
          </div>
        </div>

        <GlassContainer>
          {/* ── FILTROS + VIEW TOGGLE ────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 flex-wrap px-1 pt-1 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.5)' }}>
            <div className="flex items-center gap-1 flex-wrap">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  style={{
                    fontFamily: T.sans, fontSize: 10, fontWeight: 800,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    padding: '6px 14px', borderRadius: 100,
                    background: filter === key ? T.dark : 'transparent',
                    color: filter === key ? 'white' : `${T.muted}70`,
                    border: `1px solid ${filter === key ? T.dark : `${T.dark}15`}`,
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-1" style={{ background: `${T.dark}06`, borderRadius: 8, padding: 3 }}>
              {(['grid', 'large'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="p-1.5 rounded transition-all"
                  style={{ background: viewMode === mode ? 'white' : 'transparent', boxShadow: viewMode === mode ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: viewMode === mode ? T.dark : `${T.muted}50` }}>
                    {mode === 'grid' ? 'grid_view' : 'view_column'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── GRID ─────────────────────────────────────────────────────── */}
          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: `${T.muted}25`, display: 'block', marginBottom: 12 }}>search_off</span>
              <HeadingSerif size={20} style={{ marginBottom: 8 }}>Sin resultados</HeadingSerif>
              <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}60` }}>
                {search ? `No hay piezas que coincidan con "${search}"` : 'No hay piezas en este filtro por ahora.'}
              </p>
              <button onClick={() => { setFilter('all'); setSearch(''); }}
                style={{ marginTop: 16, fontFamily: T.sans, fontSize: 12, color: T.orange, textDecoration: 'underline' }}>
                Ver todos los productos
              </button>
            </div>
          ) : viewMode === 'large' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-5">
              {filtered.map(p => (
                <ProductCardLarge key={p.id} product={p} onClick={() => handleProduct(p.id)} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-5">
              {filtered.map(p => (
                <ProductCardCompact key={p.id} product={p} onClick={() => handleProduct(p.id)} />
              ))}
            </div>
          )}

          {/* ── PIE CONTADOR ─────────────────────────────────────────────── */}
          {filtered.length > 0 && (
            <div className="px-6 py-4 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.5)' }}>
              <LabelCaps color={`${T.muted}40`}>
                {filtered.length} {filtered.length === 1 ? 'pieza' : 'piezas'}
                {filter !== 'all' || search ? ' · ' : ''}
                {filter !== 'all' ? FILTERS.find(f => f.key === filter)?.label ?? '' : ''}
                {search ? `que coinciden con "${search}"` : ''}
              </LabelCaps>
            </div>
          )}
        </GlassContainer>

        {/* ── SECCIÓN AUTENTICIDAD ─────────────────────────────────────── */}
        <div className="max-w-[1400px] mx-auto px-10 pb-10">
          <div className="rounded-2xl px-10 py-8 grid grid-cols-1 md:grid-cols-3 gap-6" style={{ background: T.dark }}>
            {[
              { icon: 'verified',        title: 'Taller verificado', desc: `${shop.shopName} cumple los estándares de autenticidad y comercio justo de TELAR.` },
              { icon: 'handshake',       title: 'Compra directa',    desc: 'Cada compra va directamente al artesano/a. Sin intermediarios.' },
              { icon: 'location_on',     title: 'Origen garantizado', desc: `Piezas elaboradas en ${shop.municipality || shop.region || 'Colombia'}, con materiales y técnicas tradicionales.` },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <span className="material-symbols-outlined mt-0.5 shrink-0" style={{ fontSize: 20, color: T.orange }}>{icon}</span>
                <div>
                  <p style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 800, color: 'white', marginBottom: 4 }}>{title}</p>
                  <p style={{ fontFamily: T.sans, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ShopPublicFooter shop={shop} shopSlug={shopSlug!} />
      </div>
    </ShoppingCartProvider>
  );
};

export default PublicShopCatalog;
