import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { getArtisanShopBySlug } from '@/services/artisanShops.actions';
import { getProductById, getMarketplaceProductsByShopId } from '@/services/products.actions';
import { Product } from '@/types/artisan';
import { ShoppingCartProvider, useCart } from '@/contexts/ShoppingCartContext';
import { toast } from 'sonner';
import {
  T, pageBg, glassCard, glassLoom,
  LabelCaps, HeadingSerif,
  ShopTopBar, ShopPublicFooter, TrustStrip,
  normShop, getProductImage, formatPriceCOP, getAvailabilityInfo,
  getMaterialsLabel, getTechniqueLabel, ProductCardCompact,
  ShopLoadingState, ShopNotFoundState,
} from '@/components/shop/public/ShopPublicShell';

// ─── Outer wrapper ─────────────────────────────────────────────────────────────
export const PublicProductPage: React.FC = () => {
  const { shopSlug, productId } = useParams<{ shopSlug: string; productId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const isPreview = searchParams.get('preview') === 'true';
  const authLoaded = !isPreview || !authLoading;

  const [rawShop,   setRawShop]   = useState<any>(null);
  const [product,   setProduct]   = useState<Product | null>(null);
  const [related,   setRelated]   = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [isOwner,   setIsOwner]   = useState(false);

  useEffect(() => {
    if (!authLoaded || !shopSlug || !productId) return;
    (async () => {
      try {
        const shopData = await getArtisanShopBySlug(shopSlug);
        if (!shopData) { navigate('/tiendas'); return; }

        const ownerCheck = !!user && (shopData as any).userId === user.id;
        setIsOwner(ownerCheck);
        if (!ownerCheck && (shopData as any).publishStatus !== 'published') {
          navigate('/tiendas'); return;
        }
        setRawShop(shopData);

        const prod = await getProductById(productId);
        if (!prod) { navigate(`/tienda/${shopSlug}`); return; }
        // Consider visible any product that was returned by the API (it passed server-side filters).
        // Explicit block only for clearly inactive statuses.
        const prodStatus = (prod as any).moderation_status ?? '';
        const blocked = ['rejected', 'draft'].includes(prodStatus);
        if (!ownerCheck && blocked) { navigate(`/tienda/${shopSlug}`); return; }
        setProduct(prod);

        const relatedAll = await getMarketplaceProductsByShopId((shopData as any).id).catch(() => []);
        setRelated(relatedAll.filter((p: Product) => p.id !== productId).slice(0, 6));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [shopSlug, productId, authLoaded, navigate, user]);

  const shop = useMemo(() => rawShop ? normShop(rawShop) : null, [rawShop]);

  if (loading) return <ShopLoadingState />;
  if (!shop || !product) return <ShopNotFoundState message="Producto no encontrado" />;

  return (
    <ShoppingCartProvider>
      <ProductDetail
        shop={shop} shopSlug={shopSlug!}
        product={product} related={related}
        isOwner={isOwner} isPreview={isPreview}
      />
    </ShoppingCartProvider>
  );
};

// ─── Detail (inside cart provider) ────────────────────────────────────────────
interface DetailProps {
  shop: ReturnType<typeof normShop>;
  shopSlug: string;
  product: Product;
  related: Product[];
  isOwner: boolean;
  isPreview: boolean;
}

const ProductDetail: React.FC<DetailProps> = ({ shop, shopSlug, product, related, isOwner, isPreview }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [adding, setAdding] = useState(false);

  const p = product as any;

  // ─── Image handling ───────────────────────────────────────────────
  const images: Array<{ url: string; is_primary?: boolean }> = useMemo(() => {
    const raw = p.images ?? [];
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return raw.map((img: any) =>
      typeof img === 'string' ? { url: img } : img
    ).filter((img: any) => img?.url);
  }, [p.images]);

  const mainImageUrl = images[selectedIdx]?.url ?? images[0]?.url ?? null;

  // ─── Data extraction ──────────────────────────────────────────────
  const price       = p.price ?? 0;
  const priceLabel  = formatPriceCOP(product);
  const avail       = getAvailabilityInfo(product);
  const mats        = Array.isArray(p.materials) ? p.materials as string[] : [];
  const techs       = Array.isArray(p.techniques) ? (p.techniques as any[]).map((t: any) =>
    typeof t === 'string' ? t : (t?.material?.name ?? t?.name ?? '')).filter(Boolean) : [];
  const location    = [shop.municipality, shop.department].filter(Boolean).join(', ');
  const isOutOfStock = (p.inventory ?? 1) === 0;

  // ─── Cart ────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setAdding(true);
    try {
      await addToCart(product.id, 1, price, (p.shop_id ?? ''), product.name, images);
      toast.success('Pieza agregada al carrito', { description: product.name });
    } catch {
      toast.error('No se pudo agregar al carrito');
    } finally {
      setAdding(false);
    }
  };

  const backUrl = `${isPreview ? `?preview=true` : ''}`;

  return (
    <div style={pageBg}>
      <Helmet>
        <title>{`${product.name} · ${shop.shopName} · TELAR`}</title>
        <meta name="description" content={p.description || `${product.name} — ${shop.shopName}`} />
        <meta property="og:title" content={product.name} />
        <meta property="og:image" content={mainImageUrl ?? ''} />
      </Helmet>

      <ShopTopBar shop={shop} shopSlug={shopSlug} activePage="product"
        isPreviewMode={isPreview} isOwner={isOwner} />

      <TrustStrip />

      {/* ── BREADCRUMB ─────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-10 py-4 flex items-center gap-3">
        <Link to={`/tienda/${shopSlug}/catalogo${backUrl}`}
          className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
          style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: `${T.muted}70`, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_back</span>
          Catálogo
        </Link>
        <span style={{ color: `${T.dark}18` }}>/</span>
        <span style={{ fontFamily: T.sans, fontSize: 11, color: `${T.dark}40`, letterSpacing: '0.05em' }}
          className="truncate max-w-xs">{product.name}</span>
      </div>

      {/* ── MAIN SECTION ───────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-10 pb-8">
        <div style={{ ...glassLoom, borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 60px -10px rgba(0,0,0,0.07)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* LEFT: Gallery */}
            <div className="border-r" style={{ borderColor: 'rgba(255,255,255,0.5)' }}>
              {/* Main image */}
              <div className="aspect-square overflow-hidden bg-[#f7f4ef]">
                {mainImageUrl
                  ? <img src={mainImageUrl} alt={product.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined" style={{ fontSize: 60, color: `${T.muted}15` }}>image</span>
                    </div>
                }
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto" style={{ background: 'rgba(255,255,255,0.5)' }}>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIdx(i)}
                      className="shrink-0 overflow-hidden transition-all"
                      style={{
                        width: 64, height: 64, borderRadius: 10,
                        border: `2px solid ${selectedIdx === i ? T.orange : 'transparent'}`,
                        outline: selectedIdx === i ? `2px solid ${T.orange}20` : 'none',
                      }}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product info */}
            <div className="p-10 flex flex-col gap-5">
              {/* Location + availability */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                {location && (
                  <div className="flex items-center gap-1.5" style={{ color: `${T.muted}70` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                    <LabelCaps color={`${T.muted}70`}>{location}</LabelCaps>
                  </div>
                )}
                <span className="px-3 py-1.5 rounded-full text-white text-[9px] font-[800] uppercase tracking-wider"
                  style={{ background: avail.dark ? `${T.dark}dd` : T.orange, fontFamily: T.sans }}>
                  {avail.label}
                </span>
              </div>

              {/* Name */}
              <HeadingSerif as="h1" size={36} style={{ lineHeight: 1.1 }}>{product.name}</HeadingSerif>

              {/* Subtitle: technique + category */}
              {(techs[0] || p.category) && (
                <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}60`, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {[techs[0], p.category].filter(Boolean).join(' · ')}
                </p>
              )}

              {/* Price */}
              {priceLabel && (
                <div className="flex items-baseline gap-3">
                  <span style={{ fontFamily: T.serif, fontSize: 34, fontWeight: 700, color: T.orange }}>
                    {priceLabel}
                  </span>
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                  className="flex-1 h-12 rounded-full text-white flex items-center justify-center gap-2 transition-opacity"
                  style={{
                    background: isOutOfStock ? `${T.dark}40` : T.dark,
                    fontFamily: T.sans, fontSize: 11, fontWeight: 800,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    opacity: adding ? 0.7 : 1,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {isOutOfStock ? 'remove_shopping_cart' : 'shopping_bag'}
                  </span>
                  {isOutOfStock ? 'Agotado' : adding ? 'Agregando…' : avail.ctaLabel}
                </button>
                <button className="w-12 h-12 rounded-full flex items-center justify-center border transition-colors hover:border-orange-400"
                  style={{ border: `1px solid ${T.dark}15` }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.muted }}>favorite</span>
                </button>
              </div>

              {/* Stock indicator */}
              {p.inventory > 0 && p.inventory <= 10 && (
                <div className="flex items-center gap-2" style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}80` }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: T.orange }}>inventory_2</span>
                  Solo quedan {p.inventory} disponibles
                </div>
              )}

              {/* Materials */}
              {mats.length > 0 && (
                <div className="space-y-2">
                  <LabelCaps>Materiales</LabelCaps>
                  <div className="flex flex-wrap gap-1.5">
                    {mats.map((m: string) => (
                      <span key={m} className="px-3 py-1 rounded-full"
                        style={{ background: `${T.dark}07`, fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: `${T.muted}cc`, border: `1px solid ${T.dark}10` }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Production info */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: `${T.dark}08` }}>
                {[
                  { icon: 'store',         label: 'Tienda',   value: shop.shopName },
                  { icon: 'handshake',     label: 'Compra',   value: 'Directa al artesano' },
                  p.production_time && { icon: 'schedule',    label: 'Elaboración', value: `~${p.production_time}` },
                  p.weight           && { icon: 'scale',      label: 'Peso',        value: `${p.weight} kg` },
                ].filter(Boolean).map(({ icon, label, value }: any) => (
                  <div key={label} className="flex items-start gap-2">
                    <span className="material-symbols-outlined mt-0.5 shrink-0" style={{ fontSize: 14, color: T.orange }}>{icon}</span>
                    <div>
                      <p style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: `${T.muted}50`, textTransform: 'uppercase' }}>{label}</p>
                      <p style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 600, color: T.dark }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESCRIPCIÓN ────────────────────────────────────────────── */}
      {p.description && (
        <div className="max-w-[1400px] mx-auto px-10 pb-8">
          <div style={{ ...glassCard, borderRadius: 20, boxShadow: '0 4px 24px -6px rgba(0,0,0,0.05)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="md:col-span-2 p-10 border-r" style={{ borderColor: `${T.dark}06` }}>
                <LabelCaps color={T.orange} style={{ display: 'block', marginBottom: 12 }}>Historia de la pieza</LabelCaps>
                <p style={{ fontFamily: T.sans, fontSize: 15, color: `${T.muted}cc`, lineHeight: 1.85 }}>
                  {p.description}
                </p>
              </div>
              <div className="p-8 space-y-5">
                <LabelCaps color={T.orange} style={{ display: 'block', marginBottom: 4 }}>Especificaciones</LabelCaps>
                {[
                  p.dimensions?.height && { label: 'Alto',       value: `${p.dimensions.height} cm` },
                  p.dimensions?.width  && { label: 'Ancho',      value: `${p.dimensions.width} cm` },
                  p.dimensions?.length && { label: 'Largo',      value: `${p.dimensions.length} cm` },
                  p.weight             && { label: 'Peso',        value: `${p.weight} kg` },
                  p.sku                && { label: 'Referencia',  value: p.sku },
                  techs.length > 0     && { label: 'Técnica',    value: techs.join(', ') },
                ].filter(Boolean).map(({ label, value }: any) => (
                  <div key={label} className="flex justify-between gap-3 py-2 border-b last:border-0"
                    style={{ borderColor: `${T.dark}07` }}>
                    <span style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}60`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
                    <span style={{ fontFamily: T.sans, fontSize: 13, color: T.dark, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
                {[p.dimensions?.height, p.dimensions?.width, p.dimensions?.length, p.weight, p.sku, techs.length > 0].every(v => !v) && (
                  <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}40` }}>Sin especificaciones adicionales.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AUTENTICIDAD ──────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-10 pb-8">
        <div className="rounded-xl px-8 py-6 flex items-center gap-8 flex-wrap" style={{ background: `${T.orange}08`, border: `1px solid ${T.orange}18` }}>
          {[
            { icon: 'verified',      text: `Pieza verificada por TELAR — hecha en ${shop.municipality || shop.region || 'Colombia'}` },
            { icon: 'person',        text: `Compra directa a ${shop.shopName}` },
            { icon: 'local_shipping',text: 'Envío a todo Colombia disponible' },
          ].map(({ icon, text }) => (
            <div key={icon} className="flex items-center gap-2.5">
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: 18, color: T.orange }}>{icon}</span>
              <span style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}cc` }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── OTRAS PIEZAS ──────────────────────────────────────────── */}
      {related.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-10 pb-12">
          <div className="flex items-center justify-between mb-5">
            <HeadingSerif size={24}>Más piezas del taller</HeadingSerif>
            <Link to={`/tienda/${shopSlug}/catalogo`}
              style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.orange }}>
              Ver catálogo →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related.map(r => (
              <ProductCardCompact
                key={r.id}
                product={r}
                onClick={() => navigate(`/tienda/${shopSlug}/producto/${r.id}${isPreview ? '?preview=true' : ''}`)}
              />
            ))}
          </div>
        </div>
      )}

      <ShopPublicFooter shop={shop} shopSlug={shopSlug} />
    </div>
  );
};
