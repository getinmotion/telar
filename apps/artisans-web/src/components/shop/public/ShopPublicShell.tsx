/**
 * Shared design system and shell components for TELAR public shop pages.
 * All public shop screens (Home, PDP, Catálogo, Historia, Pasaporte, Colección)
 * import from here to guarantee visual consistency.
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ─── Design tokens ─────────────────────────────────────────────────────────────
export const T = {
  orange: '#ec6d13',
  dark:   '#151b2d',
  cream:  '#fdfaf6',
  base:   '#f9f7f2',
  muted:  '#54433e',
  green:  '#166534',
  red:    '#ef4444',
  blue:   '#3b82f6',
  sans:   "'Manrope', sans-serif",
  serif:  "'Noto Serif', serif",
} as const;

// ─── CSS helpers ───────────────────────────────────────────────────────────────
export const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.65)',
};

export const glassLoom: React.CSSProperties = {
  background: 'rgba(255,255,255,0.45)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.65)',
};

export const pageBg: React.CSSProperties = {
  background: `radial-gradient(circle at top right, ${T.cream}, ${T.base})`,
  minHeight: '100vh',
  fontFamily: T.sans,
  color: T.dark,
};

// ─── Typography helpers ────────────────────────────────────────────────────────
export const LabelCaps: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color, style }) => (
  <span style={{
    fontFamily: T.sans, fontSize: 10, fontWeight: 800,
    letterSpacing: '0.2em', textTransform: 'uppercase',
    color: color ?? `${T.muted}70`, ...style,
  }}>
    {children}
  </span>
);

export const HeadingSerif: React.FC<{
  as?: 'h1' | 'h2' | 'h3';
  size?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ as: Tag = 'h2', size = 28, children, style }) => {
  const base: React.CSSProperties = {
    fontFamily: T.serif, fontSize: size, fontWeight: 700,
    color: T.dark, lineHeight: 1.15, letterSpacing: '-0.02em',
  };
  return <Tag style={{ ...base, ...style }}>{children}</Tag>;
};

// ─── Data helpers ──────────────────────────────────────────────────────────────
export function normShop(s: any) {
  return {
    id:         s.id ?? '',
    shopName:   s.shopName ?? s.shop_name ?? '',
    shopSlug:   s.shopSlug ?? s.shop_slug ?? '',
    logoUrl:    s.logoUrl ?? s.logo_url ?? null,
    bannerUrl:  s.bannerUrl ?? s.banner_url ?? null,
    description: s.description ?? null,
    brandClaim: s.brandClaim ?? s.brand_claim ?? null,
    craftType:  s.craftType ?? s.craft_type ?? null,
    region:     s.region ?? null,
    municipality: s.municipality ?? null,
    department: s.department ?? null,
    heroConfig: s.heroConfig ?? s.hero_config ?? null,
    contactConfig: s.contactConfig ?? s.contact_config ?? null,
    contactInfo:   s.contactInfo ?? s.contact_info ?? null,
    socialLinks:   s.socialLinks ?? s.social_links ?? null,
    artisanProfile: s.artisanProfile ?? null,
    artisanProfileCompleted: s.artisanProfileCompleted ?? false,
    marketplaceApproved: s.marketplaceApproved ?? false,
    publishStatus: s.publishStatus ?? null,
  };
}

export function getHeroImage(shop: ReturnType<typeof normShop>): string | null {
  return shop.heroConfig?.slides?.[0]?.imageUrl
    ?? shop.heroConfig?.slides?.[0]?.image
    ?? shop.bannerUrl ?? shop.logoUrl ?? null;
}

export function getShopLocation(shop: ReturnType<typeof normShop>): string {
  return [shop.municipality, shop.department].filter(Boolean).join(', ');
}

export function getProductImage(p: any): string | null {
  return p.images?.find((i: any) => i.is_primary)?.url
    ?? p.images?.[0]?.url
    ?? p.images?.[0]
    ?? p.media?.find((m: any) => m.isPrimary)?.mediaUrl
    ?? p.media?.[0]?.mediaUrl
    ?? null;
}

export type AvailabilityInfo = {
  label: string;
  color: string;
  bg: string;
  dark: boolean;
  ctaLabel: string;
};

export function getAvailabilityInfo(p: any): AvailabilityInfo {
  const type = p.production?.availabilityType ?? p.availabilityType ?? '';
  const inv   = p.inventory ?? p.stock_quantity ?? null;
  const isOut = inv !== null && inv === 0;

  if (isOut) return {
    label: 'AGOTADO', color: T.muted, bg: `${T.muted}12`,
    dark: true, ctaLabel: 'Avisarme si vuelve',
  };
  if (type === 'bajo_pedido') return {
    label: 'BAJO PEDIDO', color: T.dark, bg: `${T.dark}cc`,
    dark: true, ctaLabel: 'Solicitar por encargo',
  };
  if (type === 'edicion_limitada') return {
    label: 'EDICIÓN LIMITADA', color: T.orange, bg: T.orange,
    dark: false, ctaLabel: 'Comprar ahora',
  };
  return {
    label: 'DISPONIBLE', color: T.orange, bg: T.orange,
    dark: false, ctaLabel: 'Comprar ahora',
  };
}

export function formatPriceCOP(p: any): string {
  // Try legacy price field (already in pesos)
  if (typeof p.price === 'number' && p.price > 0) {
    return `$${p.price.toLocaleString('es-CO')} COP`;
  }
  // Try basePriceMinor (centavos as string)
  const v = p.variants?.find((x: any) => x.isActive !== false) ?? p.variants?.[0];
  if (v?.basePriceMinor) {
    const pesos = parseInt(String(v.basePriceMinor), 10) / 100;
    return `$${pesos.toLocaleString('es-CO')} COP`;
  }
  return '';
}

export function getMaterialsLabel(p: any): string {
  const mats = p.materials;
  if (!Array.isArray(mats) || mats.length === 0) return p.craftType ?? '';
  const names = mats
    .map((m: any) => typeof m === 'string' ? m : (m?.material?.name ?? m?.name ?? ''))
    .filter(Boolean);
  return names.slice(0, 2).join(' · ');
}

export function getTechniqueLabel(p: any): string {
  const techs = p.techniques;
  if (!Array.isArray(techs) || techs.length === 0) return '';
  return techs
    .map((t: any) => typeof t === 'string' ? t : (t?.name ?? ''))
    .filter(Boolean)[0] ?? '';
}

// ─── Product Cards ─────────────────────────────────────────────────────────────
export const ProductCardLarge: React.FC<{ product: any; onClick: () => void }> = ({ product, onClick }) => {
  const img   = getProductImage(product);
  const price = formatPriceCOP(product);
  const av    = getAvailabilityInfo(product);
  const mats  = getMaterialsLabel(product);
  const tech  = getTechniqueLabel(product);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden"
      style={{ ...glassCard, borderRadius: 16, boxShadow: '0 2px 16px -4px rgba(0,0,0,0.06)', transition: 'box-shadow 0.3s' }}
    >
      <div className="relative overflow-hidden aspect-[4/5]">
        {img
          ? <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="w-full h-full flex items-center justify-center" style={{ background: `${T.dark}06` }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: `${T.muted}25` }}>image</span>
            </div>
        }
        <div className="absolute top-3 left-3">
          <span className="font-[800] text-[9px] px-3 py-1.5 rounded-full text-white uppercase tracking-wider"
            style={{ background: av.dark ? `${T.dark}dd` : T.orange, fontFamily: T.sans, letterSpacing: '0.1em' }}>
            {av.label}
          </span>
        </div>
        <button
          onClick={e => e.stopPropagation()}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'white', border: `1px solid ${T.dark}12` }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: T.dark }}>favorite</span>
        </button>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h3 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 700, color: T.dark, lineHeight: 1.2 }} className="truncate">{product.name}</h3>
            {(mats || tech) && (
              <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}70`, marginTop: 3 }}>
                {[tech, mats].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          {price && <span style={{ fontFamily: T.serif, fontSize: 16, fontWeight: 700, color: T.orange, whiteSpace: 'nowrap' }}>{price}</span>}
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 py-2.5 rounded-full text-white transition-colors"
            style={{ background: T.dark, fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            VER PIEZA
          </button>
          <button
            onClick={e => e.stopPropagation()}
            className="w-10 h-10 rounded-full flex items-center justify-center border transition-colors hover:border-orange-400"
            style={{ border: `1px solid ${T.dark}15` }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: T.muted }}>qr_code_2</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductCardCompact: React.FC<{ product: any; onClick: () => void }> = ({ product, onClick }) => {
  const img   = getProductImage(product);
  const price = formatPriceCOP(product);
  const av    = getAvailabilityInfo(product);

  return (
    <div onClick={onClick} className="group cursor-pointer space-y-2.5">
      <div className="aspect-square rounded-xl overflow-hidden relative" style={{ background: `${T.dark}06`, border: `1px solid ${T.dark}10` }}>
        {img
          ? <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: `${T.muted}25` }}>image</span>
            </div>
        }
        <div className="absolute bottom-2 left-2">
          <span className="text-white text-[8px] font-[800] px-2 py-1 rounded-full uppercase tracking-wider"
            style={{ background: av.dark ? `${T.dark}cc` : T.orange, fontFamily: T.sans }}>
            {av.label}
          </span>
        </div>
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: T.dark }}>favorite</span>
        </div>
      </div>
      <div>
        <h4 style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.dark, lineHeight: 1.3 }} className="truncate">{product.name}</h4>
        {price && <p style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 800, color: T.orange, marginTop: 1 }}>{price}</p>}
      </div>
    </div>
  );
};

// ─── Trust Strip ───────────────────────────────────────────────────────────────
export const TrustStrip: React.FC = () => (
  <div
    className="border-y flex items-center justify-center gap-8 py-3 flex-wrap"
    style={{ borderColor: `${T.dark}10`, background: 'rgba(255,255,255,0.6)' }}
  >
    {[
      { icon: 'lock', label: 'Pagos seguros' },
      { icon: 'local_shipping', label: 'Envíos nacionales' },
      { icon: 'storefront', label: 'Compra directa al taller' },
      { icon: 'verified', label: 'Autenticidad verificada TELAR' },
    ].map(({ icon, label }) => (
      <div key={label} className="flex items-center gap-1.5">
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: T.orange }}>{icon}</span>
        <LabelCaps color={`${T.muted}80`}>{label}</LabelCaps>
      </div>
    ))}
  </div>
);

// ─── Top Bar ───────────────────────────────────────────────────────────────────
interface ShopTopBarProps {
  shop: ReturnType<typeof normShop>;
  shopSlug: string;
  activePage?: 'home' | 'catalog' | 'profile' | 'product' | 'passport' | 'collection';
  isPreviewMode?: boolean;
  isOwner?: boolean;
}

export const ShopTopBar: React.FC<ShopTopBarProps> = ({
  shop, shopSlug, activePage = 'home', isPreviewMode, isOwner,
}) => {
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Tienda', href: `/tienda/${shopSlug}`, key: 'home' },
    { label: 'Catálogo', href: `/tienda/${shopSlug}/catalogo`, key: 'catalog' },
    ...(shop.artisanProfileCompleted
      ? [{ label: 'Historia', href: `/tienda/${shopSlug}/perfil-artesanal`, key: 'profile' }]
      : []),
  ];

  return (
    <>
      {isPreviewMode && isOwner && (
        <div className="py-2 px-6 flex items-center justify-between text-white text-sm" style={{ background: T.dark }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span>
            <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700 }}>Vista previa — tienda no publicada</span>
          </div>
          <button onClick={() => navigate('/dashboard')}
            style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7 }}>
            ← Volver al dashboard
          </button>
        </div>
      )}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: 'rgba(253,250,246,0.93)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.7)' }}
      >
        <div className="max-w-[1400px] mx-auto px-10 h-14 flex items-center justify-between gap-8">
          {/* Left: TELAR + shop */}
          <div className="flex items-center gap-4 shrink-0">
            <Link to="/tiendas">
              <span style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 700, color: T.dark, letterSpacing: '-0.03em' }}>TELAR</span>
            </Link>
            <div className="h-4 w-px" style={{ background: `${T.dark}18` }} />
            {shop.logoUrl
              ? <img src={shop.logoUrl} alt={shop.shopName} className="h-7 w-auto object-contain" />
              : <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: `${T.muted}80` }}>{shop.shopName}</span>
            }
          </div>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {navLinks.map(({ label, href, key }) => {
              const isActive = activePage === key;
              return (
                <Link key={key} to={href}
                  style={{
                    fontFamily: T.sans, fontSize: 10, fontWeight: 800,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: isActive ? T.orange : `${T.muted}70`,
                    borderBottom: isActive ? `2px solid ${T.orange}` : '2px solid transparent',
                    paddingBottom: 2,
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: icons */}
          <div className="flex items-center gap-1 shrink-0">
            <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: T.dark }}>shopping_bag</span>
            </button>
            <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: T.dark }}>person</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

// ─── Footer ────────────────────────────────────────────────────────────────────
export const ShopPublicFooter: React.FC<{ shop: ReturnType<typeof normShop>; shopSlug: string }> = ({ shop, shopSlug }) => {
  const contact = shop.contactConfig ?? shop.contactInfo ?? {};
  const social  = shop.socialLinks ?? {};

  return (
    <footer style={{ background: T.dark, color: 'white', fontFamily: T.sans }}>
      <div className="max-w-[1400px] mx-auto px-10 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-3">
          <span style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 700, color: T.orange }}>TELAR</span>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
            Esta tienda hace parte de TELAR, red de comercio justo para talleres artesanales verificados en Colombia.
          </p>
        </div>
        <div className="space-y-4">
          <LabelCaps color="rgba(255,255,255,0.35)">ESTA TIENDA</LabelCaps>
          <ul className="space-y-2">
            {[
              { label: 'Inicio', to: `/tienda/${shopSlug}` },
              { label: 'Catálogo completo', to: `/tienda/${shopSlug}/catalogo` },
              ...(shop.artisanProfileCompleted
                ? [{ label: 'Historia del taller', to: `/tienda/${shopSlug}/perfil-artesanal` }]
                : []),
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}
                  className="hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <LabelCaps color="rgba(255,255,255,0.35)">CONTACTO</LabelCaps>
          <ul className="space-y-2">
            {contact?.email && (
              <li><a href={`mailto:${contact.email}`} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}
                className="hover:text-white transition-colors">{contact.email}</a></li>
            )}
            {contact?.phone && (
              <li><a href={`https://wa.me/${String(contact.phone).replace(/\D/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}
                className="hover:text-white transition-colors">WhatsApp · {contact.phone}</a></li>
            )}
            {social?.instagram && (
              <li><a href={social.instagram} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}
                className="hover:text-white transition-colors">Instagram</a></li>
            )}
          </ul>
        </div>
        <div className="space-y-4">
          <LabelCaps color={T.orange}>NOVEDADES</LabelCaps>
          <div className="relative">
            <input type="email" placeholder="Tu correo"
              className="w-full bg-transparent border-b py-3 focus:outline-none text-sm"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 13 }}
            />
            <button className="absolute right-0 top-1/2 -translate-y-1/2 hover:translate-x-0.5 transition-transform">
              <span className="material-symbols-outlined" style={{ color: T.orange, fontSize: 18 }}>arrow_forward</span>
            </button>
          </div>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            PIEZAS NUEVAS Y NOVEDADES DEL TALLER
          </p>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-10 py-3 border-t flex justify-between items-center"
        style={{ borderColor: 'rgba(255,255,255,0.08)', opacity: 0.4 }}>
        <LabelCaps color="white">© {new Date().getFullYear()} TELAR · {shop.shopName}</LabelCaps>
        <LabelCaps color="white">Comercio justo · Artesanías verificadas</LabelCaps>
      </div>
    </footer>
  );
};

// ─── Loading / Error states ────────────────────────────────────────────────────
export const ShopLoadingState: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center" style={pageBg}>
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: `${T.orange}25`, borderTopColor: T.orange }} />
      <LabelCaps>Cargando…</LabelCaps>
    </div>
  </div>
);

export const ShopNotFoundState: React.FC<{ message?: string }> = ({ message = 'Página no encontrada' }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center" style={pageBg}>
      <div className="text-center space-y-3">
        <HeadingSerif size={28}>{message}</HeadingSerif>
        <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70` }}>
          El contenido que buscas no existe o no está disponible.
        </p>
        <button onClick={() => navigate('/tiendas')} className="mt-4 underline"
          style={{ fontFamily: T.sans, fontSize: 13, color: T.orange }}>
          Ver todas las tiendas
        </button>
      </div>
    </div>
  );
};

// ─── Glass section container ───────────────────────────────────────────────────
export const GlassContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`max-w-[1400px] mx-auto px-10 pt-6 pb-12 ${className}`}>
    <div style={{ ...glassLoom, borderRadius: 24, boxShadow: '0 40px 80px -20px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
      {children}
    </div>
  </div>
);
