import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArtisanShopBySlug } from '@/services/artisanShops.actions';
import { getProductsNewByStoreId } from '@/services/products-new.actions';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return `$${price.toLocaleString('es-CO')}`;
}

// ─── Componente ───────────────────────────────────────────────────────────────

const BioLinkPage: React.FC = () => {
  const { shopSlug } = useParams<{ shopSlug: string }>();
  const [shop, setShop] = useState<any>(null);
  const [latestProduct, setLatestProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!shopSlug) return;
    setLoading(true);
    getArtisanShopBySlug(shopSlug)
      .then(async (data) => {
        setShop(data);
        // Cargar el último producto publicado
        if (data?.id) {
          try {
            const products = await getProductsNewByStoreId(data.id);
            const published = products.filter((p: any) => p.status === 'published' || p.active);
            if (published.length > 0) setLatestProduct(published[0]);
          } catch {
            // Sin productos, no bloquear
          }
        }
      })
      .catch(() => setShop(null))
      .finally(() => setLoading(false));
  }, [shopSlug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: shop?.shopName, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const socialLinks = shop?.socialLinks || shop?.social_links || {};
  const logoUrl = shop?.logoUrl || shop?.logo_url;
  const brandClaim = shop?.brandClaim || shop?.brand_claim;
  const shopName = shop?.shopName || shop?.shop_name;
  const aboutContent = shop?.aboutContent || shop?.about_content;
  const artisanProfile = shop?.artisanProfile || shop?.artisan_profile;

  const description =
    brandClaim ||
    aboutContent?.story?.slice(0, 120) ||
    artisanProfile?.story?.slice(0, 120) ||
    'Artesano en Telar';

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at top left, #fdfaf6 0%, #f9f7f2 50%, #fdfaf6 100%)',
        }}
      >
        <div className="w-10 h-10 rounded-full border-2 border-[#ec6d13] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 text-[#54433e]"
        style={{
          background: 'radial-gradient(circle at top left, #fdfaf6 0%, #f9f7f2 50%, #fdfaf6 100%)',
        }}
      >
        <span style={{ fontFamily: 'Noto Serif, serif', fontSize: 48, fontWeight: 700, letterSpacing: '-0.05em' }}>
          404
        </span>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 500 }}>
          No encontramos este perfil artesanal.
        </p>
        <Link
          to="/tiendas"
          style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, color: '#ec6d13', fontSize: 14 }}
        >
          Ver todas las tiendas →
        </Link>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@700&family=Manrope:wght@500;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
        }
        .bio-glass-loom {
          background: rgba(255,255,255,0.45);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.65);
        }
        .bio-glass-card {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.65);
        }
        .bio-glass-secondary {
          background: rgba(255,255,255,0.68);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.65);
        }
        .bio-link-btn {
          transition: all 0.2s ease;
        }
        .bio-link-btn:active { transform: scale(0.97); }
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center p-4 md:p-10"
        style={{
          background: 'radial-gradient(circle at top left, #fdfaf6 0%, #f9f7f2 50%, #fdfaf6 100%)',
          fontFamily: 'Manrope, sans-serif',
        }}
      >
        <main className="bio-glass-loom w-full max-w-md rounded-2xl overflow-hidden shadow-[0_80px_100px_-20px_rgba(0,0,0,0.08)] flex flex-col items-center">

          {/* Header */}
          <header className="w-full py-8 flex flex-col items-center gap-2 px-6">
            <span
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.2em',
                color: '#54433e',
                textTransform: 'uppercase',
              }}
            >
              TELAR
            </span>

            {/* Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#ec6d13] p-1 shadow-lg shadow-[#ec6d13]/10 mt-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={shopName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#ec6d13]/10 flex items-center justify-center">
                  <span
                    style={{
                      fontFamily: 'Noto Serif, serif',
                      fontSize: 32,
                      fontWeight: 700,
                      color: '#ec6d13',
                    }}
                  >
                    {shopName?.charAt(0)?.toUpperCase() || 'T'}
                  </span>
                </div>
              )}
            </div>

            {/* Nombre y descripción */}
            <div className="text-center mt-4 px-4">
              <h1
                style={{
                  fontFamily: 'Noto Serif, serif',
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#151b2d',
                  lineHeight: 1.3,
                }}
              >
                {shopName}
              </h1>
              {description && (
                <p
                  className="mt-2 max-w-xs mx-auto"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#54433e',
                    lineHeight: 1.6,
                  }}
                >
                  {description}
                </p>
              )}
            </div>
          </header>

          {/* Links */}
          <section className="w-full px-6 flex flex-col gap-3 mb-4">

            {/* Link principal: Mi tienda */}
            <Link
              to={`/tienda/${shopSlug}`}
              className="bio-link-btn bio-glass-card group relative flex items-center justify-between p-6 rounded-2xl shadow-sm hover:shadow-[#ec6d13]/20"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#ec6d13]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  storefront
                </span>
                <span
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#151b2d',
                  }}
                >
                  Mi tienda
                </span>
              </div>
              <span className="material-symbols-outlined text-[#ec6d13] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
              <div className="absolute inset-0 bg-[#ec6d13]/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
            </Link>

            {/* Link secundario: Mi perfil artesanal */}
            <Link
              to={`/tienda/${shopSlug}/perfil-artesanal`}
              className="bio-link-btn bio-glass-secondary group flex items-center justify-between p-6 rounded-2xl hover:bg-white/82 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#54433e]">person</span>
                <span
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#54433e',
                  }}
                >
                  Mi perfil artesanal
                </span>
              </div>
              <span className="material-symbols-outlined text-[#54433e] group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </Link>

            {/* Último producto */}
            {latestProduct && (
              <div className="mt-6">
                <p
                  className="text-center mb-3"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    color: '#54433e',
                    textTransform: 'uppercase',
                  }}
                >
                  ÚLTIMA CREACIÓN
                </p>
                <Link
                  to={`/tienda/${shopSlug}/producto/${latestProduct.id}`}
                  className="bio-glass-card overflow-hidden rounded-2xl block hover:opacity-95 transition-opacity"
                >
                  {latestProduct.images?.[0]?.url ? (
                    <img
                      src={latestProduct.images[0].url}
                      alt={latestProduct.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-[#ec6d13]/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#ec6d13]/30 text-6xl">inventory_2</span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#151b2d',
                        }}
                      >
                        {latestProduct.name}
                      </span>
                      <div className="flex items-center gap-1 bg-[#ec6d13]/10 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-[#ec6d13]" />
                        <span
                          style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: 8,
                            fontWeight: 900,
                            letterSpacing: '0.1em',
                            color: '#ec6d13',
                            textTransform: 'uppercase',
                          }}
                        >
                          NUEVO
                        </span>
                      </div>
                    </div>
                    {latestProduct.price && (
                      <p
                        className="mt-1"
                        style={{
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#54433e',
                        }}
                      >
                        {formatPrice(latestProduct.price)}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            )}

            {/* Social links */}
            {(socialLinks.instagram || socialLinks.email || socialLinks.whatsapp || true) && (
              <div className="flex justify-center gap-8 py-6">
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#54433e] hover:text-[#ec6d13] transition-colors"
                  >
                    <span className="material-symbols-outlined">camera</span>
                  </a>
                )}
                {socialLinks.email && (
                  <a
                    href={`mailto:${socialLinks.email}`}
                    className="text-[#54433e] hover:text-[#ec6d13] transition-colors"
                  >
                    <span className="material-symbols-outlined">mail</span>
                  </a>
                )}
                <button
                  onClick={handleShare}
                  className="text-[#54433e] hover:text-[#ec6d13] transition-colors relative"
                  title="Compartir"
                >
                  <span className="material-symbols-outlined">share</span>
                  {copied && (
                    <span
                      className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#151b2d] text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                      style={{ fontFamily: 'Manrope, sans-serif' }}
                    >
                      ¡Link copiado!
                    </span>
                  )}
                </button>
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="mt-auto w-full px-6 py-6 border-t border-white/40 flex flex-col items-center gap-2">
            <div className="flex gap-4 mb-1">
              <Link
                to="/terminos"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  color: '#54433e',
                  textTransform: 'uppercase',
                }}
              >
                Términos de Oficio
              </Link>
              <Link
                to="/privacidad"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  color: '#54433e',
                  textTransform: 'uppercase',
                }}
              >
                Privacidad
              </Link>
            </div>
            <p
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.2em',
                color: '#54433e',
                opacity: 0.6,
                textTransform: 'uppercase',
              }}
            >
              TELAR — Infraestructura para la cultura
            </p>
          </footer>
        </main>
      </div>
    </>
  );
};

export default BioLinkPage;
