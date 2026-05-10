import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { useShopOrders } from '@/hooks/useShopOrders';
import { useInventory } from '@/hooks/useInventory';
import { useBankData } from '@/hooks/useBankData';
import { useUnifiedProgress } from '@/hooks/useUnifiedProgress';
import { useFixedTasksManager } from '@/hooks/useFixedTasksManager';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { ForceCompleteProfileModal } from '@/components/profile/ForceCompleteProfileModal';
import { useProfileCompleteness } from '@/hooks/useProfileCompleteness';

// ── TELAR Design System ───────────────────────────────────────────────────────
const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

const glassPrimary: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 20px rgba(21,27,45,0.02)',
};

const glassSecondary: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.65)',
};

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}k`;
  return `$${v.toLocaleString('es-CO')}`;
}

// ── Pill badge ────────────────────────────────────────────────────────────────
type PillVariant = 'success' | 'warning' | 'error' | 'draft' | 'orange' | 'info';

const PILL_STYLES: Record<PillVariant, React.CSSProperties> = {
  success: { background: 'rgba(22,101,52,0.1)',  color: '#166534' },
  warning: { background: 'rgba(236,109,19,0.1)', color: '#ec6d13' },
  error:   { background: 'rgba(239,68,68,0.1)',  color: '#ef4444' },
  draft:   { background: 'rgba(21,27,45,0.06)',  color: '#54433e' },
  orange:  { background: '#ec6d13',              color: 'white'   },
  info:    { background: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
};

const Pill: React.FC<{ children: React.ReactNode; variant?: PillVariant }> = ({
  children,
  variant = 'draft',
}) => (
  <span
    style={{
      ...PILL_STYLES[variant],
      borderRadius: '9999px',
      padding: '2px 10px',
      fontFamily: SANS,
      fontSize: 9,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      display: 'inline-block',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

// ── MetricCard ────────────────────────────────────────────────────────────────
const MetricCard: React.FC<{
  label: string;
  value: React.ReactNode;
  sub: string;
  icon: string;
}> = ({ label, value, sub, icon }) => (
  <div style={{ ...glassPrimary, borderRadius: 24 }} className="p-5 h-32 flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div>
        <span
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(84,67,62,0.5)',
          }}
        >
          {label}
        </span>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(84,67,62,0.4)',
            marginTop: 2,
          }}
        >
          {sub}
        </p>
      </div>
      <span className="material-symbols-outlined" style={{ color: 'rgba(21,27,45,0.15)', fontSize: 20 }}>
        {icon}
      </span>
    </div>
    <div style={{ fontFamily: SANS, fontSize: 36, fontWeight: 700, color: '#151b2d', lineHeight: 1.1 }}>
      {value}
    </div>
  </div>
);

// ── NavItem ───────────────────────────────────────────────────────────────────
const NavItem: React.FC<{
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all',
      active
        ? 'bg-[#151b2d] text-white'
        : 'text-[#54433e]/50 hover:bg-white/60 hover:text-[#151b2d]',
    )}
  >
    <span
      className="material-symbols-outlined"
      style={{ fontSize: 20, fontVariationSettings: "'FILL' 0, 'wght' 300" }}
    >
      {icon}
    </span>
    <span
      style={{
        fontFamily: SANS,
        fontSize: 8,
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        lineHeight: 1,
      }}
    >
      {label}
    </span>
  </button>
);

// ── CTA Button (orange) ───────────────────────────────────────────────────────
const OrangeBtn: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={cn('flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:opacity-90 hover:scale-[1.02]', className)}
    style={{
      background: '#ec6d13',
      color: 'white',
      fontFamily: SANS,
      fontSize: 13,
      fontWeight: 700,
      boxShadow: '0 4px 12px rgba(236,109,19,0.3)',
    }}
  >
    {children}
  </button>
);

// ── Outline Button ────────────────────────────────────────────────────────────
const OutlineBtn: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={cn('flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:bg-white/60', className)}
    style={{
      border: '1px solid rgba(21,27,45,0.1)',
      color: '#151b2d',
      fontFamily: SANS,
      fontSize: 13,
      fontWeight: 700,
    }}
  >
    {children}
  </button>
);

// ── Label-Caps style helper ───────────────────────────────────────────────────
const lc = (opacity = 0.4): React.CSSProperties => ({
  fontFamily: SANS,
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: `rgba(84,67,62,${opacity})`,
  display: 'block',
});

// ── Main Component ────────────────────────────────────────────────────────────
export const CommercialDashboard: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();

  const { shop, loading: shopLoading } = useArtisanShop();
  const { stats: salesStats }          = useShopOrders(shop?.id);
  const { fetchProducts }              = useInventory();
  const { bankData }                   = useBankData();
  const { unifiedProgress }            = useUnifiedProgress();
  const { tasks: fixedTasks, completedTaskIds } = useFixedTasksManager();
  const { masterState }                = useMasterAgent();
  const {
    isComplete: isProfileComplete,
    isLoading:  isProfileLoading,
    missingFields,
    currentData,
    refresh: refreshProfileCompleteness,
  } = useProfileCompleteness();

  const [products,        setProducts]        = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProfileModal,setShowProfileModal]= useState(false);
  const [showBioModal,    setShowBioModal]    = useState(false);
  const [bioCopied,       setBioCopied]       = useState(false);

  const isPublished = shop?.publishStatus === 'published' && shop?.active;
  const userName    =
    masterState.perfil?.nombre ||
    user?.user_metadata?.name  ||
    user?.email?.split('@')[0] ||
    'Artesano';
  const shopName = shop?.shopName || userName;
  const shopSlug = (shop as any)?.shopSlug || (shop as any)?.shop_slug;
  const bioUrl   = shopSlug ? `${window.location.origin}/bio/${shopSlug}` : null;

  const handleCopyBioLink = async () => {
    if (!bioUrl) return;
    await navigator.clipboard.writeText(bioUrl);
    setBioCopied(true);
    setTimeout(() => setBioCopied(false), 2500);
  };

  useEffect(() => {
    if (!shop?.id) return;
    setLoadingProducts(true);
    fetchProducts(shop.id)
      .then((data) => setProducts(data as any[]))
      .finally(() => setLoadingProducts(false));
  }, [shop?.id]);

  useEffect(() => {
    if (!isProfileLoading && !isProfileComplete && user?.id) {
      const t = setTimeout(() => setShowProfileModal(true), 1500);
      return () => clearTimeout(t);
    }
  }, [isProfileLoading, isProfileComplete, user?.id]);

  // ── Metrics ───────────────────────────────────────────────────────────────
  // mapProductResponseToLegacy usa: active (bool), moderation_status (string), inventory (number), images (string[])
  const getStock = (p: any) => p.inventory ?? p.stock ?? 0;
  const isProductActive = (p: any) => !!(p.active || p.moderation_status === 'approved' || p.moderation_status === 'approved_with_edits');
  const isProductDraft  = (p: any) => p.moderation_status === 'draft' || (!p.active && !p.moderation_status);
  const getImage        = (p: any) => typeof p.images?.[0] === 'string' ? p.images[0] : p.images?.[0]?.url;

  const publishedProducts = products.filter(isProductActive);
  const draftProducts     = products.filter(isProductDraft);
  const totalStock        = products.reduce((acc, p) => acc + getStock(p), 0);
  const lowStockProducts  = products.filter((p) => getStock(p) > 0 && getStock(p) <= 5);

  // ── Checklist ─────────────────────────────────────────────────────────────
  const hasProfile   = !!masterState.perfil?.nombre;
  const hasBrand     = !!masterState.marca?.logo_url || !!(masterState as any)?.marca?.logoUrl;
  const hasProduct   = products.length > 0;
  const hasBankData  = !!bankData;
  const hasContact   = !!(shop as any)?.contactConfig?.email || !!(shop as any)?.contact_config?.email;
  const hasInventory = totalStock > 0;
  const hasStory     = !!(shop as any)?.aboutContent?.story || !!(shop as any)?.about_content?.story;

  const checklistItems = [
    { label: 'Perfil artesanal', done: hasProfile,   required: true,  route: '/profile' },
    { label: 'Primer producto',  done: hasProduct,   required: true,  route: '/productos/subir' },
    { label: 'Marca y logo',     done: hasBrand,     required: false, route: '/dashboard/brand-wizard' },
    { label: 'Datos bancarios',  done: hasBankData,  required: true,  route: '/mi-cuenta/datos-bancarios' },
    { label: 'Contacto',         done: hasContact,   required: false, route: '/dashboard/shop-contact-wizard' },
    { label: 'Inventario',       done: hasInventory, required: true,  route: '/inventario' },
    { label: 'Historia profunda',done: hasStory,     required: false, route: '/dashboard/shop-about-wizard' },
  ];

  const completedSteps  = checklistItems.filter((i) => i.done).length;
  const totalSteps      = checklistItems.length;
  const requiredPending = checklistItems.filter((i) => i.required && !i.done);
  const progressPct     = Math.round((completedSteps / totalSteps) * 100);

  // ── Missions ──────────────────────────────────────────────────────────────
  const activeMissions = fixedTasks.filter((t) => !completedTaskIds.includes(t.id)).length;
  const maturityScore  = unifiedProgress?.maturityScores
    ? Object.values(unifiedProgress.maturityScores).reduce((a, b) => a + b, 0) / 4
    : 0;
  const maturityLabel =
    maturityScore >= 4 ? 'Vendedor experto' :
    maturityScore >= 3 ? 'Vendedor activo'  :
    maturityScore >= 2 ? 'En crecimiento'   :
    'Aprendiz Artesano';

  // ── Contextual card config ────────────────────────────────────────────────
  type CardConfig = {
    bg: string;
    accentColor: string;
    title: string;
    subtitle: string;
    body: string;
    cta: string;
    ctaRoute: string;
    ctaAction?: () => void;
    icon: string;
    secondaryCta?: string;
    secondaryRoute?: string;
  };

  const nextCard: CardConfig = (() => {
    if (!isPublished) {
      if (!hasProduct) return {
        bg: 'rgba(236,109,19,0.05)',
        accentColor: '#ec6d13',
        title: 'Tu siguiente paso',
        subtitle: 'Crea tu primer producto estructurado',
        body: 'Para publicar tu tienda necesitas al menos un producto con nombre, descripción, fotos, precio e inventario.',
        cta: 'Crear producto',
        ctaRoute: '/productos/subir',
        icon: 'inventory_2',
      };
      if (!hasBankData) return {
        bg: 'rgba(236,109,19,0.05)',
        accentColor: '#ec6d13',
        title: 'Tu siguiente paso',
        subtitle: 'Configura tus datos bancarios',
        body: 'Para recibir pagos necesitas vincular tu cuenta bancaria. Es rápido y seguro.',
        cta: 'Completar datos bancarios',
        ctaRoute: '/mi-cuenta/datos-bancarios',
        icon: 'account_balance',
      };
      return {
        bg: 'rgba(22,101,52,0.04)',
        accentColor: '#166534',
        title: 'Casi listo para publicar',
        subtitle: `Faltan ${requiredPending.length} requisito${requiredPending.length !== 1 ? 's' : ''} obligatorio${requiredPending.length !== 1 ? 's' : ''}`,
        body: 'Completa los elementos requeridos para activar tu tienda en el marketplace.',
        cta: 'Continuar configuración',
        ctaRoute: requiredPending[0]?.route || '/dashboard',
        icon: 'rocket_launch',
      };
    }
    if (lowStockProducts.length > 0) return {
      bg: 'rgba(59,130,246,0.05)',
      accentColor: '#3b82f6',
      title: 'Tu siguiente oportunidad',
      subtitle: 'Optimiza tus productos con bajo stock',
      body: `Hay ${lowStockProducts.length} producto${lowStockProducts.length !== 1 ? 's' : ''} que necesitan revisión de inventario para evitar perder ventas.`,
      cta: 'Revisar inventario',
      ctaRoute: '/inventario',
      icon: 'inventory',
      secondaryCta: 'Crear producto',
      secondaryRoute: '/productos/subir',
    };
    if (draftProducts.length > 0) return {
      bg: 'rgba(59,130,246,0.05)',
      accentColor: '#3b82f6',
      title: 'Tu siguiente oportunidad',
      subtitle: `${draftProducts.length} producto${draftProducts.length !== 1 ? 's' : ''} en borrador`,
      body: 'Completa y publica estos productos para ampliar tu catálogo.',
      cta: 'Completar borradores',
      ctaRoute: '/inventario',
      icon: 'edit_note',
      secondaryCta: 'Crear producto',
      secondaryRoute: '/productos/subir',
    };
    if (salesStats.total === 0) return {
      bg: 'rgba(59,130,246,0.05)',
      accentColor: '#3b82f6',
      title: 'Tu siguiente oportunidad',
      subtitle: 'Impulsa tu primera venta',
      body: 'Tu tienda está activa. Comparte tu link de BIO en redes para atraer tus primeros compradores.',
      cta: 'Copiar link de BIO',
      ctaRoute: '#bio',
      ctaAction: () => setShowBioModal(true),
      icon: 'share',
      secondaryCta: 'Agregar más productos',
      secondaryRoute: '/productos/subir',
    };
    return {
      bg: 'rgba(59,130,246,0.05)',
      accentColor: '#3b82f6',
      title: 'Tu siguiente oportunidad',
      subtitle: 'Amplía tu catálogo',
      body: `Tienes ${publishedProducts.length} producto${publishedProducts.length !== 1 ? 's' : ''} publicado${publishedProducts.length !== 1 ? 's' : ''}. Más productos = más posibilidades de venta.`,
      cta: 'Crear producto',
      ctaRoute: '/productos/subir',
      icon: 'shopping_bag',
      secondaryCta: 'Ver inventario',
      secondaryRoute: '/inventario',
    };
  })();

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page background — radial gradient tricolor fijo */}
      <div
        className="h-screen overflow-hidden"
        style={{
          backgroundColor: '#f9f7f2',
          backgroundImage: [
            'radial-gradient(circle at top left, rgba(223,244,232,0.95), transparent 38%)',
            'radial-gradient(circle at bottom right, rgba(238,241,245,0.95), transparent 42%)',
            'radial-gradient(circle at top right, rgba(255,244,223,0.75), transparent 34%)',
          ].join(', '),
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Canvas wrapper */}
        <div
          className="max-w-[1400px] mx-auto flex h-full"
          style={{
            background: 'rgba(247,246,242,0.45)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.65)',
            boxShadow: '0 24px 80px rgba(21,27,45,0.08)',
          }}
        >

          {/* ── Sidebar ───────────────────────────────────────────────────── */}
          <aside
            className="w-20 shrink-0 flex flex-col items-center py-8 gap-8 sticky top-0 h-screen z-50"
            style={{ borderRight: '1px solid rgba(255,255,255,0.4)' }}
          >
            <a
              href="/dashboard"
              style={{
                fontFamily: SERIF,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: '0.2em',
                color: '#151b2d',
                textDecoration: 'none',
                textTransform: 'uppercase',
              }}
            >
              Telar
            </a>

            <nav className="flex flex-col gap-4 items-center flex-1">
              <NavItem icon="grid_view"     label="Inicio"        active={location.pathname === '/dashboard'} onClick={() => navigate('/dashboard')} />
              <NavItem icon="inventory_2"   label="Productos"     onClick={() => navigate('/productos/subir')} />
              <NavItem icon="bar_chart"     label="Inventario"    onClick={() => navigate('/inventario')} />
              <NavItem icon="receipt_long"  label="Ventas"        onClick={() => navigate('/mi-tienda/ventas')} />
              <NavItem icon="person"        label="Perfil"        onClick={() => navigate('/profile')} />
              <NavItem icon="settings"      label="Configuración" onClick={() => navigate('/mi-tienda/configurar')} />
              <NavItem icon="explore"       label="Misiones"      onClick={() => navigate('/dashboard/tasks')} />
            </nav>

            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'white',
                border: '1px solid rgba(21,27,45,0.06)',
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 700,
                color: '#54433e',
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          </aside>

          {/* ── Content area ─────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

            {/* Header sticky */}
            <header
              className="sticky top-0 z-30 px-12 pt-10 pb-6 flex justify-between items-start"
              style={{
                background: 'rgba(247,246,242,0.68)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.4)',
              }}
            >
              <div>
                <h1 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: '#151b2d', lineHeight: 1.2 }}>
                  Hola, {shopName}
                </h1>
                <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: 'rgba(84,67,62,0.7)', marginTop: 6 }}>
                  {isPublished
                    ? 'Tu tienda está publicada y lista para recibir pedidos.'
                    : 'Tu tienda ya está creada. Completa lo necesario para publicarla.'}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                {isPublished ? (
                  <OrangeBtn onClick={() => shopSlug && window.open(`/tienda/${shopSlug}`, '_blank')}>
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Ver tienda publicada
                  </OrangeBtn>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <button
                      disabled
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full opacity-30 cursor-not-allowed"
                      style={{ background: '#151b2d', color: 'white', fontFamily: SANS, fontSize: 13, fontWeight: 700 }}
                    >
                      Publicar tienda
                    </button>
                    {requiredPending.length > 0 && (
                      <span style={{ ...lc(0.5), letterSpacing: '0.08em' }}>
                        Completa {requiredPending.length} requisito{requiredPending.length !== 1 ? 's' : ''} para publicar
                      </span>
                    )}
                  </div>
                )}
              </div>
            </header>

            {/* Main */}
            <main
              className="flex-1 overflow-y-auto px-12 pb-20"
              style={{ overscrollBehavior: 'contain' }}
            >
              <div className="max-w-[1300px] pt-8">

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <MetricCard
                    label="Productos"
                    value={products.length}
                    sub={isPublished
                      ? `${publishedProducts.length} pub · ${draftProducts.length} borrador`
                      : '1 requerido para publicar'}
                    icon="inventory_2"
                  />
                  <MetricCard
                    label="Estado Tienda"
                    value={
                      <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', color: isPublished ? '#166534' : '#ec6d13' }}>
                        {isPublished ? 'Publicada' : 'En preparación'}
                      </span>
                    }
                    sub={isPublished ? 'Activa' : 'No publicada'}
                    icon={isPublished ? 'check_circle' : 'pending'}
                  />
                  <MetricCard
                    label="Inventario"
                    value={totalStock}
                    sub={
                      isPublished && lowStockProducts.length > 0
                        ? `${lowStockProducts.length} con bajo stock`
                        : isPublished ? 'Stock al día' : 'Sin stock cargado'
                    }
                    icon="warehouse"
                  />
                  <MetricCard
                    label="Ventas"
                    value={salesStats.totalRevenue > 0 ? formatCurrency(salesStats.totalRevenue) : '$0'}
                    sub={isPublished ? 'Ingresos totales' : 'Aparecen al publicar'}
                    icon="payments"
                  />
                </div>

                {/* Grid 8 + 4 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                  {/* ── Left col (8) ─────────────────────────────────────── */}
                  <div className="lg:col-span-8 space-y-8">

                    {/* Card contextual */}
                    <section
                      className="p-10 rounded-3xl flex flex-col md:flex-row gap-10 items-center relative overflow-hidden"
                      style={{ background: nextCard.bg, border: `1px solid ${nextCard.accentColor}20` }}
                    >
                      <div className="flex-1 relative z-10">
                        <h3 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: '#151b2d', marginBottom: 12, lineHeight: 1.3 }}>
                          {nextCard.title}
                        </h3>
                        <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: nextCard.accentColor, marginBottom: 16 }}>
                          {nextCard.subtitle}
                        </p>
                        <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: 'rgba(84,67,62,0.7)', lineHeight: 1.7, marginBottom: 32, maxWidth: 380 }}>
                          {nextCard.body}
                        </p>
                        <div className="flex gap-3 flex-wrap">
                          <OrangeBtn onClick={() => nextCard.ctaAction ? nextCard.ctaAction() : navigate(nextCard.ctaRoute)}>
                            {nextCard.cta}
                            <span className="material-symbols-outlined text-[16px]">east</span>
                          </OrangeBtn>
                          {nextCard.secondaryCta && (
                            <OutlineBtn onClick={() => navigate(nextCard.secondaryRoute!)}>
                              {nextCard.secondaryCta}
                            </OutlineBtn>
                          )}
                        </div>
                      </div>

                      {/* Illustration */}
                      <div className="shrink-0 relative w-44 h-44">
                        <div className="absolute inset-0 rounded-3xl rotate-6 opacity-40" style={{ background: `${nextCard.accentColor}18` }} />
                        <div
                          className="absolute inset-4 rounded-2xl -rotate-3 flex items-center justify-center"
                          style={{ ...glassPrimary, borderRadius: 20 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 64, color: `${nextCard.accentColor}30` }}>
                            {nextCard.icon}
                          </span>
                        </div>
                        <div
                          className="absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ background: 'white', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 12px rgba(21,27,45,0.08)' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 20, color: nextCard.accentColor }}>
                            {isPublished ? 'trending_up' : 'add'}
                          </span>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-xl" style={{ background: nextCard.accentColor }} />
                      </div>
                    </section>

                    {/* Checklist card */}
                    <div style={{ ...glassPrimary, borderRadius: 32 }} className="p-10">
                      <div className="flex items-start gap-4 mb-8 flex-wrap">
                        <h2 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: '#151b2d', lineHeight: 1.2, flex: 1 }}>
                          {isPublished ? 'Tu tienda está publicada' : 'Tu tienda está en preparación'}
                        </h2>
                        <div className="flex gap-2 flex-wrap items-center">
                          {isPublished ? (
                            <>
                              <Pill variant="success">Publicada</Pill>
                              <Pill variant="success">Activa</Pill>
                              <button
                                onClick={() => setShowBioModal(true)}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all hover:opacity-90"
                                style={{ background: '#ec6d13', color: 'white', fontFamily: SANS, fontSize: 11, fontWeight: 700, boxShadow: '0 2px 8px rgba(236,109,19,0.25)' }}
                              >
                                <span className="material-symbols-outlined text-[14px]">share</span>
                                Crear link de BIO
                              </button>
                            </>
                          ) : (
                            <>
                              <Pill variant="warning">En preparación</Pill>
                              <Pill variant="draft">No publicada</Pill>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#151b2d' }}>
                            {completedSteps} de {totalSteps} pasos completados
                          </span>
                          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: completedSteps === totalSteps ? '#166534' : requiredPending.length > 0 ? '#ef4444' : '#ec6d13' }}>
                            {completedSteps === totalSteps
                              ? '¡Todo completo!'
                              : requiredPending.length > 0
                              ? `Faltan ${requiredPending.length} obligatorio${requiredPending.length !== 1 ? 's' : ''}`
                              : 'Pasos opcionales pendientes'}
                          </span>
                        </div>
                        <div className="relative h-[3px] rounded-full" style={{ background: 'rgba(21,27,45,0.06)' }}>
                          <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                            style={{ width: `${progressPct}%`, background: isPublished ? '#166534' : '#ec6d13' }}
                          />
                        </div>
                      </div>

                      {/* Checklist items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 py-2">
                        {checklistItems.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => !item.done && navigate(item.route)}
                            className={cn('flex items-center gap-3 text-left transition-opacity', !item.done && 'hover:opacity-70')}
                          >
                            <span
                              className="material-symbols-outlined shrink-0"
                              style={{
                                fontSize: 20,
                                color: item.done ? (isPublished ? '#166534' : '#ec6d13') : 'rgba(21,27,45,0.15)',
                                fontVariationSettings: item.done ? "'FILL' 1" : "'FILL' 0",
                              }}
                            >
                              {item.done ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: item.done ? '#151b2d' : 'rgba(21,27,45,0.35)' }}>
                              {item.label}
                              {!item.done && item.required && (
                                <span style={{ fontFamily: SANS, fontSize: 8, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ef4444', marginLeft: 6 }}>
                                  Obligatorio
                                </span>
                              )}
                              {!item.done && !item.required && (
                                <span style={{ fontFamily: SANS, fontSize: 8, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(21,27,45,0.25)', marginLeft: 6 }}>
                                  Recomendado
                                </span>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Footer actions */}
                      <div className="flex gap-3 pt-6 flex-wrap" style={{ borderTop: '1px solid rgba(21,27,45,0.04)', marginTop: 24 }}>
                        {isPublished ? (
                          <>
                            <OrangeBtn onClick={() => shopSlug && window.open(`/tienda/${shopSlug}`, '_blank')}>
                              <span className="material-symbols-outlined text-[16px]">storefront</span>
                              Ver tienda
                            </OrangeBtn>
                            <OutlineBtn onClick={() => navigate('/mi-tienda/configurar')}>
                              Editar configuración
                            </OutlineBtn>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => requiredPending[0] && navigate(requiredPending[0].route)}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors"
                              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#ec6d13')}
                              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#151b2d')}
                              style={{ background: '#151b2d', color: 'white', fontFamily: SANS, fontSize: 13, fontWeight: 700 }}
                            >
                              <span className="material-symbols-outlined text-[16px]">east</span>
                              Continuar configuración
                            </button>
                            <OutlineBtn onClick={() => shopSlug && window.open(`/tienda/${shopSlug}`, '_blank')}>
                              Ver preview
                            </OutlineBtn>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Products table */}
                    <div style={{ ...glassPrimary, borderRadius: 32 }} className="p-10">
                      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                        <h3 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: '#151b2d' }}>
                          Mis Productos
                        </h3>
                        <div className="flex gap-3 items-center">
                          {isPublished && (
                            <button
                              onClick={() => navigate('/inventario')}
                              className="hover:underline"
                              style={{ fontFamily: SANS, fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ec6d13' }}
                            >
                              Gestionar catálogo
                            </button>
                          )}
                          <OrangeBtn onClick={() => navigate('/productos/subir')}>
                            <span className="material-symbols-outlined text-[16px]">add</span>
                            Crear producto
                          </OrangeBtn>
                        </div>
                      </div>

                      {loadingProducts ? (
                        <div className="py-12 text-center" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: 'rgba(84,67,62,0.5)' }}>
                          Cargando productos...
                        </div>
                      ) : products.length === 0 ? (
                        <div className="py-20 flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(21,27,45,0.03)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'rgba(21,27,45,0.15)' }}>inventory_2</span>
                          </div>
                          <h4 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: '#151b2d', marginBottom: 8 }}>
                            Aún no tienes productos
                          </h4>
                          <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: 'rgba(84,67,62,0.6)', maxWidth: 280, marginBottom: 24, lineHeight: 1.6 }}>
                            Crea tu primer producto para activar tu catálogo de tienda.
                          </p>
                          <OrangeBtn onClick={() => navigate('/productos/subir')}>
                            <span className="material-symbols-outlined text-[16px]">add</span>
                            Crear producto
                          </OrangeBtn>
                        </div>
                      ) : (
                        <>
                          <table className="w-full text-left">
                            <thead style={{ borderBottom: '1px solid rgba(21,27,45,0.04)' }}>
                              <tr>
                                {['', 'Nombre', 'Estado', 'Precio', 'Stock', 'Acción'].map((h, i) => (
                                  <th
                                    key={h || i}
                                    className={cn('pb-4', i > 2 ? 'text-right' : '', i === 0 ? 'w-16' : '')}
                                    style={{ fontFamily: SANS, fontSize: 9, fontWeight: 900, color: 'rgba(84,67,62,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {products.slice(0, 8).map((product) => {
                                const stock  = getStock(product);
                                const active = isProductActive(product);
                                const draft  = isProductDraft(product);
                                const isLow  = active && stock > 0 && stock <= 5;
                                const isOut  = active && stock === 0;
                                const imgSrc = getImage(product);
                                return (
                                  <tr
                                    key={product.id}
                                    style={{ borderBottom: '1px solid rgba(21,27,45,0.03)' }}
                                    className="hover:bg-black/[0.015] transition-colors"
                                  >
                                    <td className="py-4">
                                      <div className="w-10 h-10 rounded-lg overflow-hidden" style={{ background: 'rgba(21,27,45,0.04)' }}>
                                        {imgSrc && (
                                          <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-4 max-w-[160px] truncate" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>
                                      {product.name}
                                    </td>
                                    <td className="py-4">
                                      {active && !isLow && <Pill variant="success">Publicado</Pill>}
                                      {active && isLow  && <Pill variant="warning">Bajo stock</Pill>}
                                      {draft            && <Pill variant="draft">Borrador</Pill>}
                                      {!active && !draft && <Pill variant="info">En revisión</Pill>}
                                    </td>
                                    <td className="py-4 text-right" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>
                                      {product.price ? `$${product.price.toLocaleString('es-CO')}` : '—'}
                                    </td>
                                    <td className="py-4 text-right" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>
                                      {stock ?? '—'}
                                    </td>
                                    <td className="py-4 text-right">
                                      <button
                                        onClick={() => navigate(`/productos/editar/${product.id}`)}
                                        className="hover:underline"
                                        style={{ fontFamily: SANS, fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ec6d13' }}
                                      >
                                        {isOut || isLow ? 'Reponer' : draft ? 'Completar' : 'Editar'}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          {products.length > 8 && (
                            <div className="pt-6 text-center">
                              <button
                                onClick={() => navigate('/inventario')}
                                className="inline-flex items-center gap-1 hover:underline"
                                style={{ fontFamily: SANS, fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ec6d13' }}
                              >
                                Ver todos los {products.length} productos
                                <span className="material-symbols-outlined text-[16px]">east</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                  </div>

                  {/* ── Right sidebar (4) ────────────────────────────────── */}
                  <aside className="lg:col-span-4 space-y-6">

                    {/* Faltantes / Alertas */}
                    {!isPublished ? (
                      <div style={{ ...glassPrimary, borderRadius: 32 }} className="overflow-hidden">
                        {/* Illustration header */}
                        <div
                          className="h-36 flex items-center justify-center relative overflow-hidden"
                          style={{ borderBottom: '1px solid rgba(236,109,19,0.08)', background: 'rgba(236,109,19,0.04)' }}
                        >
                          <div className="absolute w-24 h-24 rounded-full -rotate-12 translate-x-8 opacity-40" style={{ background: 'rgba(236,109,19,0.15)' }} />
                          <div
                            className="absolute w-20 h-20 rounded-2xl rotate-12 -translate-x-6 flex items-center justify-center"
                            style={{ ...glassSecondary, borderRadius: 16 }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'rgba(236,109,19,0.3)' }}>inventory_2</span>
                          </div>
                          <div
                            className="absolute w-14 h-14 rounded-full -translate-y-8 translate-x-4 flex items-center justify-center"
                            style={{ ...glassPrimary, borderRadius: '50%', boxShadow: '0 4px 12px rgba(21,27,45,0.06)' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'rgba(236,109,19,0.5)' }}>palette</span>
                          </div>
                        </div>

                        <div className="p-8">
                          <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: '#151b2d', marginBottom: 24 }}>
                            Faltantes para publicar
                          </h3>
                          <div className="space-y-4">
                            {checklistItems.filter((i) => !i.done && i.required).map((item) => (
                              <div key={item.label} className="flex flex-col gap-1 pb-4" style={{ borderBottom: '1px solid rgba(21,27,45,0.03)' }}>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>{item.label}</span>
                                    <Pill variant="error">Requerido</Pill>
                                  </div>
                                  <button
                                    onClick={() => navigate(item.route)}
                                    className="hover:underline shrink-0 ml-2"
                                    style={{ fontFamily: SANS, fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ec6d13' }}
                                  >
                                    Ir
                                  </button>
                                </div>
                              </div>
                            ))}
                            {checklistItems.filter((i) => !i.done && !i.required).map((item) => (
                              <div key={item.label} className="flex justify-between items-center">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: 'rgba(84,67,62,0.7)' }}>{item.label}</span>
                                  <Pill variant="success">Recomendado</Pill>
                                </div>
                                <button
                                  onClick={() => navigate(item.route)}
                                  className="hover:underline shrink-0 ml-2"
                                  style={{ fontFamily: SANS, fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ec6d13' }}
                                >
                                  Agregar
                                </button>
                              </div>
                            ))}
                            {checklistItems.filter((i) => !i.done).length === 0 && (
                              <p className="py-4 text-center" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#166534' }}>
                                ¡Todo completo! Puedes publicar tu tienda.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Alertas (published) */
                      <div style={{ ...glassPrimary, borderRadius: 32 }} className="overflow-hidden">
                        <div
                          className="h-32 flex items-center justify-center relative overflow-hidden"
                          style={{ borderBottom: '1px solid rgba(21,27,45,0.04)', background: 'rgba(59,130,246,0.04)' }}
                        >
                          <div className="absolute w-20 h-20 rounded-full -top-8 -right-8 blur-xl opacity-40" style={{ background: 'rgba(59,130,246,0.3)' }} />
                          <div className="relative">
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center rotate-6"
                              style={{ ...glassSecondary, borderRadius: 16, boxShadow: '0 4px 12px rgba(21,27,45,0.06)' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'rgba(59,130,246,0.4)' }}>notifications</span>
                            </div>
                            {(lowStockProducts.length > 0 || draftProducts.length > 0) && (
                              <div
                                className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
                                style={{ background: '#ec6d13', boxShadow: '0 2px 8px rgba(236,109,19,0.4)' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'white' }}>priority_high</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-8">
                          <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: '#151b2d', marginBottom: 24 }}>
                            Alertas de tienda
                          </h3>
                          <div className="space-y-5">
                            {lowStockProducts.length > 0 && (
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>Bajo stock</span>
                                    <Pill variant="warning">{lowStockProducts.length} items</Pill>
                                  </div>
                                  <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 500, color: 'rgba(84,67,62,0.5)' }}>
                                    Reponer para no pausar ventas.
                                  </p>
                                </div>
                                <button
                                  onClick={() => navigate('/inventario')}
                                  className="hover:underline shrink-0 ml-3"
                                  style={{ fontFamily: SANS, fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ec6d13' }}
                                >
                                  Revisar
                                </button>
                              </div>
                            )}
                            {draftProducts.length > 0 && (
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>Borradores</span>
                                    <Pill variant="draft">{draftProducts.length} items</Pill>
                                  </div>
                                  <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 500, color: 'rgba(84,67,62,0.5)' }}>
                                    Completa para publicar.
                                  </p>
                                </div>
                                <button
                                  onClick={() => navigate('/inventario')}
                                  className="hover:underline shrink-0 ml-3"
                                  style={{ fontFamily: SANS, fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ec6d13' }}
                                >
                                  Completar
                                </button>
                              </div>
                            )}
                            {lowStockProducts.length === 0 && draftProducts.length === 0 && (
                              <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#166534', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                <div>
                                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>Todo en orden</span>
                                  <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 500, color: 'rgba(84,67,62,0.5)' }}>¡Tu catálogo está al día!</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ventas */}
                    <div style={{ ...glassPrimary, borderRadius: 32 }} className="p-8">
                      <h3 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: '#151b2d', marginBottom: 16 }}>
                        Mis ventas
                      </h3>
                      {!isPublished && (
                        <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: 'rgba(84,67,62,0.6)', lineHeight: 1.7, marginBottom: 16 }}>
                          Las ventas aparecerán cuando publiques y recibas pedidos.
                        </p>
                      )}
                      <div className="mb-6">
                        <span style={lc(0.4)}>Ingresos totales</span>
                        <span style={{ fontFamily: SANS, fontSize: 44, fontWeight: 700, color: '#151b2d', lineHeight: 1, letterSpacing: '-0.04em', display: 'block', marginTop: 4 }}>
                          {salesStats.totalRevenue > 0 ? formatCurrency(salesStats.totalRevenue) : '$0'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-5" style={{ borderTop: '1px solid rgba(21,27,45,0.04)' }}>
                        {[
                          { label: 'Órdenes',     val: salesStats.total },
                          { label: 'Pendientes',   val: salesStats.pending, right: true },
                          { label: 'Despachados',  val: salesStats.shipped ?? 0 },
                        ].map((row) => (
                          <div key={row.label} className={row.right ? 'text-right' : ''}>
                            <span style={lc(0.4)}>{row.label}</span>
                            <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: '#151b2d', display: 'block', marginTop: 2 }}>{row.val}</span>
                          </div>
                        ))}
                        <div className="flex items-end justify-end">
                          <button
                            onClick={() => navigate('/mi-tienda/ventas')}
                            className="hover:underline"
                            style={{ fontFamily: SANS, fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ec6d13' }}
                          >
                            Ver ventas →
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Perfil */}
                    <div style={{ ...glassSecondary, borderRadius: 32 }} className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ background: 'rgba(236,109,19,0.06)', border: '1px solid rgba(236,109,19,0.1)' }}
                        >
                          <span style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: '#ec6d13' }}>
                            {userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: '#151b2d' }} className="truncate">
                            {shopName}
                          </h4>
                          <span style={{ fontFamily: SANS, fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ec6d13' }}>
                            {hasBrand ? 'Marca completa' : 'Marca incompleta'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3 mb-6">
                        {[
                          { label: 'Tipo',   val: (shop as any)?.craftType || (shop as any)?.craft_type || 'Artesanía' },
                          { label: 'Región', val: (shop as any)?.region || '—' },
                        ].map((row) => (
                          <div key={row.label} className="flex justify-between">
                            <span style={lc(0.4)}>{row.label}</span>
                            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: '#151b2d' }}>{row.val}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center">
                          <span style={lc(0.4)}>Estado</span>
                          <Pill variant={isPublished ? 'success' : 'warning'}>
                            {isPublished ? 'Publicada' : 'En preparación'}
                          </Pill>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/profile')}
                        className="w-full py-2.5 rounded-xl hover:bg-white/60 transition-all"
                        style={{ border: '1px solid rgba(21,27,45,0.1)', color: '#151b2d', fontFamily: SANS, fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                      >
                        Editar perfil
                      </button>
                    </div>

                    {/* Crecimiento */}
                    <div
                      className="p-6 rounded-3xl relative overflow-hidden"
                      style={{ background: 'rgba(252,253,242,0.6)', border: '1px solid rgba(236,109,19,0.06)' }}
                    >
                      <div className="absolute w-20 h-20 rounded-full -bottom-6 -left-6 blur-xl opacity-25" style={{ background: 'rgba(22,101,52,0.5)' }} />
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-5">
                          <div>
                            <span style={{ fontFamily: SANS, fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(22,101,52,0.5)', display: 'block', marginBottom: 4 }}>
                              Camino de crecimiento
                            </span>
                            <h3 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: '#151b2d' }}>
                              {maturityLabel}
                            </h3>
                          </div>
                          <Pill variant="draft">{maturityScore.toFixed(1)}/5</Pill>
                        </div>
                        <div className="flex justify-between items-center mb-5">
                          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(84,67,62,0.6)' }}>Misiones activas</span>
                          <Pill variant="success">{activeMissions} pendientes</Pill>
                        </div>
                        <button
                          onClick={() => navigate('/dashboard/tasks')}
                          className="w-full py-2.5 rounded-xl hover:bg-white/70 transition-all"
                          style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(21,27,45,0.06)', color: '#151b2d', fontFamily: SANS, fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                        >
                          Ver misiones
                        </button>
                      </div>
                    </div>

                  </aside>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* ForceCompleteProfileModal */}
      <ForceCompleteProfileModal
        isOpen={showProfileModal}
        missingFields={missingFields}
        currentData={currentData}
        onComplete={() => {
          setShowProfileModal(false);
          refreshProfileCompleteness();
        }}
      />

      {/* BIO Link Modal */}
      {showBioModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(21,27,45,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={() => setShowBioModal(false)}
        >
          <div
            className="w-full rounded-3xl overflow-hidden"
            style={{ ...glassPrimary, maxWidth: 420, boxShadow: '0 32px 64px rgba(21,27,45,0.2)', borderRadius: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview mini */}
            <div
              className="px-8 pt-8 pb-6 flex flex-col items-center gap-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.4)', background: 'rgba(253,250,246,0.6)' }}
            >
              <span style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(84,67,62,0.5)', textTransform: 'uppercase' }}>
                TELAR
              </span>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(236,109,19,0.1)', border: '2px solid #ec6d13' }}
              >
                <span style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: '#ec6d13' }}>
                  {shopName?.charAt(0)?.toUpperCase() || 'T'}
                </span>
              </div>
              <div className="text-center">
                <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: '#151b2d' }}>{shopName}</p>
                <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: 'rgba(84,67,62,0.6)', marginTop: 4 }}>
                  Tu landing de BIO lista para compartir
                </p>
              </div>
              <div className="w-full space-y-2 mt-2">
                <div
                  className="px-4 py-3 rounded-xl flex items-center gap-3"
                  style={{ ...glassPrimary }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ec6d13' }}>storefront</span>
                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>Mi tienda</span>
                </div>
                <div
                  className="px-4 py-3 rounded-xl flex items-center gap-3"
                  style={{ ...glassSecondary }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(84,67,62,0.5)' }}>person</span>
                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: 'rgba(84,67,62,0.6)' }}>Mi perfil artesanal</span>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-4">
              <div className="flex justify-between items-center">
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#151b2d' }}>Tu link de BIO</span>
                <button
                  onClick={() => setShowBioModal(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(84,67,62,0.4)' }}>close</span>
                </button>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(21,27,45,0.03)', border: '1px solid rgba(21,27,45,0.06)' }}
              >
                <span className="flex-1 truncate" style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: 'rgba(84,67,62,0.6)' }}>
                  {bioUrl}
                </span>
                <button
                  onClick={handleCopyBioLink}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all hover:opacity-90"
                  style={{
                    background: bioCopied ? 'rgba(22,101,52,0.1)' : '#ec6d13',
                    color: bioCopied ? '#166534' : 'white',
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                  }}
                >
                  <span className="material-symbols-outlined text-[14px]">{bioCopied ? 'check' : 'content_copy'}</span>
                  {bioCopied ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
              <div className="flex gap-3">
                <a
                  href={bioUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full hover:opacity-90 transition-all"
                  style={{
                    background: '#ec6d13',
                    color: 'white',
                    fontFamily: SANS,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(236,109,19,0.3)',
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Ver mi BIO
                </a>
                <button
                  onClick={() => setShowBioModal(false)}
                  className="flex-1 py-2.5 rounded-full hover:bg-white/60 transition-all"
                  style={{ border: '1px solid rgba(21,27,45,0.1)', color: '#151b2d', fontFamily: SANS, fontSize: 13, fontWeight: 700 }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
