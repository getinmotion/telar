import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid, Package, BarChart3, CreditCard, User, Settings, Compass,
  CheckCircle2, Circle, AlertTriangle, Store, ArrowRight, ChevronRight,
  Plus, Tag, Building2, Rocket, TrendingUp, ShoppingCart, Bell,
  Palette, Star, Share2, Mail, ExternalLink, Clock, FileEdit,
  Copy, Check, X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${value.toLocaleString('es-CO')}`;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const MetricCard: React.FC<{
  label: string;
  value: React.ReactNode;
  sub: string;
  icon: React.ReactNode;
}> = ({ label, value, sub, icon }) => (
  <Card className="bg-card/80 backdrop-blur-sm border-border/60">
    <CardContent className="p-5 flex flex-col justify-between h-32">
      <div>
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/70">
            {label}
          </span>
          <span className="text-muted-foreground/40">{icon}</span>
        </div>
        <p className="text-[9px] text-muted-foreground/50 font-bold uppercase mt-0.5">{sub}</p>
      </div>
      <div className="text-4xl font-bold text-foreground">{value}</div>
    </CardContent>
  </Card>
);

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    title={label}
    className={cn(
      'w-10 h-10 flex items-center justify-center rounded-full transition-all',
      active
        ? 'bg-foreground text-background shadow-sm'
        : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
    )}
  >
    {icon}
  </button>
);

// ─── Componente principal ─────────────────────────────────────────────────────

export const CommercialDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { shop, loading: shopLoading } = useArtisanShop();
  const { stats: salesStats } = useShopOrders(shop?.id);
  const { fetchProducts } = useInventory();
  const { bankData } = useBankData();
  const { unifiedProgress } = useUnifiedProgress();
  const { tasks: fixedTasks, completedTaskIds } = useFixedTasksManager();
  const { masterState } = useMasterAgent();
  const {
    isComplete: isProfileComplete,
    isLoading: isProfileLoading,
    missingFields,
    currentData,
    refresh: refreshProfileCompleteness,
  } = useProfileCompleteness();

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [bioCopied, setBioCopied] = useState(false);

  const isPublished = shop?.publishStatus === 'published' && shop?.active;
  const userName =
    masterState.perfil?.nombre ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Artesano';
  const shopName = shop?.shopName || userName;
  const shopSlug = (shop as any)?.shopSlug || (shop as any)?.shop_slug;
  const bioUrl = shopSlug ? `${window.location.origin}/bio/${shopSlug}` : null;

  const handleCopyBioLink = async () => {
    if (!bioUrl) return;
    await navigator.clipboard.writeText(bioUrl);
    setBioCopied(true);
    setTimeout(() => setBioCopied(false), 2500);
  };

  // Cargar productos
  useEffect(() => {
    if (!shop?.id) return;
    setLoadingProducts(true);
    fetchProducts(shop.id)
      .then((data) => setProducts(data as any[]))
      .finally(() => setLoadingProducts(false));
  }, [shop?.id]);

  // Modal perfil incompleto
  useEffect(() => {
    if (!isProfileLoading && !isProfileComplete && user?.id) {
      const t = setTimeout(() => setShowProfileModal(true), 1500);
      return () => clearTimeout(t);
    }
  }, [isProfileLoading, isProfileComplete, user?.id]);

  // ── Métricas ────────────────────────────────────────────────────────────────
  const publishedProducts = products.filter((p) => p.status === 'published');
  const draftProducts = products.filter((p) => p.status === 'draft');
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);

  // ── Checklist ────────────────────────────────────────────────────────────────
  const hasProfile = !!masterState.perfil?.nombre;
  const hasBrand =
    !!masterState.marca?.logo_url || !!(masterState as any)?.marca?.logoUrl;
  const hasProduct = products.length > 0;
  const hasBankData = !!bankData;
  const hasContact =
    !!(shop as any)?.contactConfig?.email ||
    !!(shop as any)?.contact_config?.email;
  const hasInventory = totalStock > 0;
  const hasStory =
    !!(shop as any)?.aboutContent?.story ||
    !!(shop as any)?.about_content?.story;

  const checklistItems = [
    { label: 'Perfil artesanal', done: hasProfile, required: true, route: '/profile' },
    { label: 'Primer producto', done: hasProduct, required: true, route: '/productos/subir' },
    { label: 'Marca y logo', done: hasBrand, required: false, route: '/dashboard/brand-wizard' },
    { label: 'Datos bancarios', done: hasBankData, required: true, route: '/mi-cuenta/datos-bancarios' },
    { label: 'Contacto', done: hasContact, required: false, route: '/dashboard/shop-contact-wizard' },
    { label: 'Inventario', done: hasInventory, required: true, route: '/inventario' },
    { label: 'Historia profunda', done: hasStory, required: false, route: '/dashboard/shop-about-wizard' },
  ];

  const completedSteps = checklistItems.filter((i) => i.done).length;
  const totalSteps = checklistItems.length;
  const requiredPending = checklistItems.filter((i) => i.required && !i.done);
  const progressPct = Math.round((completedSteps / totalSteps) * 100);

  // ── Misiones ─────────────────────────────────────────────────────────────────
  const activeMissions = fixedTasks.filter((t) => !completedTaskIds.includes(t.id)).length;
  const maturityScore = unifiedProgress?.maturityScores
    ? Object.values(unifiedProgress.maturityScores).reduce((a, b) => a + b, 0) / 4
    : 0;
  const maturityLabel =
    maturityScore >= 4
      ? 'Vendedor experto'
      : maturityScore >= 3
        ? 'Vendedor activo'
        : maturityScore >= 2
          ? 'En crecimiento'
          : 'Aprendiz Artesano';

  // ── Card contextual ───────────────────────────────────────────────────────────
  type CardConfig = {
    colorClass: string;
    borderClass: string;
    accentClass: string;
    btnClass: string;
    title: string;
    subtitle: string;
    body: string;
    cta: string;
    ctaRoute: string;
    ctaAction?: () => void;
    icon: React.ReactNode;
    secondaryCta?: string;
    secondaryRoute?: string;
  };

  const nextStepCard: CardConfig = (() => {
    if (!isPublished) {
      if (!hasProduct) {
        return {
          colorClass: 'bg-primary/5',
          borderClass: 'border-primary/10',
          accentClass: 'text-primary',
          btnClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
          title: 'Tu siguiente paso',
          subtitle: 'Crea tu primer producto estructurado',
          body: 'Para publicar tu tienda necesitas al menos un producto con nombre, descripción, fotos, precio e inventario.',
          cta: 'Crear producto',
          ctaRoute: '/productos/subir',
          icon: <Package className="w-12 h-12 text-primary/20" />,
        };
      }
      if (!hasBankData) {
        return {
          colorClass: 'bg-accent/5',
          borderClass: 'border-accent/10',
          accentClass: 'text-accent',
          btnClass: 'bg-accent text-accent-foreground hover:bg-accent/90',
          title: 'Tu siguiente paso',
          subtitle: 'Configura tus datos bancarios',
          body: 'Para recibir pagos necesitas vincular tu cuenta bancaria. Es rápido y seguro.',
          cta: 'Completar datos bancarios',
          ctaRoute: '/mi-cuenta/datos-bancarios',
          icon: <Building2 className="w-12 h-12 text-accent/20" />,
        };
      }
      return {
        colorClass: 'bg-success/5',
        borderClass: 'border-success/10',
        accentClass: 'text-success',
        btnClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
        title: 'Casi listo para publicar',
        subtitle: 'Completa los pasos restantes',
        body: `Faltan ${requiredPending.length} requisito${requiredPending.length !== 1 ? 's' : ''} obligatorio${requiredPending.length !== 1 ? 's' : ''} para publicar tu tienda.`,
        cta: 'Continuar configuración',
        ctaRoute: requiredPending[0]?.route || '/dashboard',
        icon: <Rocket className="w-12 h-12 text-success/20" />,
      };
    }

    // Estado publicado — siempre azul/accent, acción más relevante
    if (lowStockProducts.length > 0) {
      return {
        colorClass: 'bg-primary/5',
        borderClass: 'border-primary/10',
        accentClass: 'text-primary',
        btnClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
        title: 'Tu siguiente oportunidad',
        subtitle: 'Optimiza tus productos con bajo stock',
        body: `Hay ${lowStockProducts.length} producto${lowStockProducts.length !== 1 ? 's' : ''} que necesitan revisión de inventario para evitar perder ventas.`,
        cta: 'Revisar inventario',
        ctaRoute: '/inventario',
        icon: <Package className="w-12 h-12 text-primary/20" />,
        secondaryCta: 'Crear nuevo producto',
        secondaryRoute: '/productos/subir',
      };
    }
    if (draftProducts.length > 0) {
      return {
        colorClass: 'bg-primary/5',
        borderClass: 'border-primary/10',
        accentClass: 'text-primary',
        btnClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
        title: 'Tu siguiente oportunidad',
        subtitle: `${draftProducts.length} producto${draftProducts.length !== 1 ? 's' : ''} en borrador`,
        body: 'Completa y publica estos productos para ampliar tu catálogo.',
        cta: 'Completar borradores',
        ctaRoute: '/inventario',
        icon: <FileEdit className="w-12 h-12 text-primary/20" />,
        secondaryCta: 'Crear nuevo producto',
        secondaryRoute: '/productos/subir',
      };
    }
    if (salesStats.total === 0) {
      return {
        colorClass: 'bg-primary/5',
        borderClass: 'border-primary/10',
        accentClass: 'text-primary',
        btnClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
        title: 'Tu siguiente oportunidad',
        subtitle: 'Impulsa tu primera venta',
        body: 'Tu tienda está activa. Comparte tu link de BIO en redes para atraer tus primeros compradores.',
        cta: 'Copiar link de BIO',
        ctaRoute: '#bio',
        ctaAction: () => setShowBioModal(true),
        icon: <Share2 className="w-12 h-12 text-primary/20" />,
        secondaryCta: 'Agregar más productos',
        secondaryRoute: '/productos/subir',
      };
    }
    return {
      colorClass: 'bg-primary/5',
      borderClass: 'border-primary/10',
      accentClass: 'text-primary',
      btnClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
      title: 'Tu siguiente oportunidad',
      subtitle: 'Amplía tu catálogo',
      body: `Tienes ${publishedProducts.length} producto${publishedProducts.length !== 1 ? 's' : ''} publicado${publishedProducts.length !== 1 ? 's' : ''}. Más productos = más posibilidades de venta.`,
      cta: 'Crear producto',
      ctaRoute: '/productos/subir',
      icon: <ShoppingCart className="w-12 h-12 text-primary/20" />,
      secondaryCta: 'Ver inventario',
      secondaryRoute: '/inventario',
    };
  })();

  return (
    <>
      {/* ── Layout base ─────────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-background flex">

        {/* Sidebar */}
        <aside className="w-20 border-r border-border/40 flex flex-col items-center py-8 gap-10 sticky top-0 h-screen z-50 bg-background/80 backdrop-blur-sm shrink-0">
          <span className="font-heading text-[10px] font-black tracking-widest text-foreground/80 uppercase">
            Telar
          </span>
          <nav className="flex flex-col gap-4 items-center flex-1">
            <NavItem icon={<LayoutGrid className="w-5 h-5" />} label="Inicio" active={location.pathname === '/dashboard'} onClick={() => navigate('/dashboard')} />
            <NavItem icon={<Package className="w-5 h-5" />} label="Productos" onClick={() => navigate('/productos/subir')} />
            <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Inventario" onClick={() => navigate('/inventario')} />
            <NavItem icon={<CreditCard className="w-5 h-5" />} label="Ventas" onClick={() => navigate('/mi-tienda/ventas')} />
            <NavItem icon={<User className="w-5 h-5" />} label="Perfil" onClick={() => navigate('/profile')} />
            <NavItem icon={<Settings className="w-5 h-5" />} label="Configuración" onClick={() => navigate('/mi-tienda/configurar')} />
            <NavItem icon={<Compass className="w-5 h-5" />} label="Misiones" onClick={() => navigate('/dashboard/tasks')} />
          </nav>
          <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground font-bold text-xs shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
        </aside>

        {/* Área de contenido */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <header className="w-full px-12 pt-10 pb-6 flex justify-between items-start sticky top-0 bg-background/80 backdrop-blur-xl z-30 border-b border-border/40">
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Hola, {shopName}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                {isPublished
                  ? 'Tu tienda está publicada y lista para recibir pedidos.'
                  : 'Tu tienda ya está creada. Completa lo necesario para publicarla.'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isPublished ? (
                <Button
                  onClick={() => shopSlug && window.open(`/tienda/${shopSlug}`, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver tienda publicada
                </Button>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <Button disabled variant="outline" className="opacity-40 cursor-not-allowed">
                    Publicar tienda
                  </Button>
                  {requiredPending.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      Completa {requiredPending.length} requisito{requiredPending.length !== 1 ? 's' : ''} para publicar
                    </span>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Main */}
          <main className="flex-1 overflow-y-auto px-12 pb-20">
            <div className="w-full max-w-[1300px] pt-8">

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <MetricCard
                  label="Productos"
                  value={products.length}
                  sub={
                    isPublished
                      ? `${publishedProducts.length} pub · ${draftProducts.length} borrador`
                      : '1 requerido para publicar'
                  }
                  icon={<Package className="w-5 h-5" />}
                />
                <MetricCard
                  label="Estado Tienda"
                  value={
                    <span className={cn('text-lg font-black uppercase tracking-tight', isPublished ? 'text-success' : 'text-primary')}>
                      {isPublished ? 'Publicada' : 'En preparación'}
                    </span>
                  }
                  sub={isPublished ? 'Activa' : 'No publicada'}
                  icon={isPublished ? <CheckCircle2 className="w-5 h-5 text-success/40" /> : <Clock className="w-5 h-5 text-primary/40" />}
                />
                <MetricCard
                  label="Inventario"
                  value={totalStock}
                  sub={
                    isPublished && lowStockProducts.length > 0
                      ? `${lowStockProducts.length} con bajo stock`
                      : isPublished
                        ? 'Stock al día'
                        : 'Sin stock cargado'
                  }
                  icon={<BarChart3 className="w-5 h-5" />}
                />
                <MetricCard
                  label="Ventas"
                  value={salesStats.totalRevenue > 0 ? formatCurrency(salesStats.totalRevenue) : '$0'}
                  sub={isPublished ? 'Ingresos totales' : 'Aparecen al publicar'}
                  icon={<CreditCard className="w-5 h-5" />}
                />
              </div>

              {/* Grid principal */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Columna izquierda (8) */}
                <div className="lg:col-span-8 space-y-8">

                  {/* Card contextual */}
                  <section
                    className={cn(
                      'p-10 rounded-3xl border flex flex-col md:flex-row gap-10 items-center relative overflow-hidden',
                      nextStepCard.colorClass,
                      nextStepCard.borderClass,
                    )}
                  >
                    <div className="flex-1 relative z-10">
                      <h3 className="font-heading text-2xl font-bold mb-3 tracking-tight text-foreground">
                        {nextStepCard.title}
                      </h3>
                      <p className={cn('text-lg font-bold mb-4', nextStepCard.accentClass)}>
                        {nextStepCard.subtitle}
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
                        {nextStepCard.body}
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        <Button
                          onClick={() =>
                            nextStepCard.ctaAction
                              ? nextStepCard.ctaAction()
                              : navigate(nextStepCard.ctaRoute)
                          }
                          className={nextStepCard.btnClass}
                        >
                          {nextStepCard.cta}
                        </Button>
                        {nextStepCard.secondaryCta && (
                          <Button
                            variant="outline"
                            onClick={() => navigate(nextStepCard.secondaryRoute!)}
                          >
                            {nextStepCard.secondaryCta}
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Ilustración */}
                    <div className="w-48 h-48 bg-card/40 backdrop-blur rounded-3xl flex items-center justify-center shadow-sm border border-white/40 shrink-0 relative">
                      <div className="opacity-60">{nextStepCard.icon}</div>
                      <div className={cn('absolute -top-4 -right-4 w-14 h-14 rounded-full bg-card flex items-center justify-center shadow-md border border-border/40')}>
                        <span className={cn('w-5 h-5', nextStepCard.accentClass)}>
                          {isPublished ? <TrendingUp className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Card estado de tienda (checklist) */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border/60">
                    <CardContent className="p-10">
                      {/* Header del card */}
                      <div className="flex items-start gap-4 mb-8 flex-wrap">
                        <h2 className="font-heading text-3xl font-bold text-foreground tracking-tight flex-1">
                          {isPublished ? 'Tu tienda está publicada' : 'Tu tienda está en preparación'}
                        </h2>
                        <div className="flex gap-2 flex-wrap items-center">
                          {isPublished ? (
                            <>
                              <Badge variant="outline" className="bg-success/10 text-success border-success/30 font-bold uppercase tracking-widest text-[10px]">
                                Publicada
                              </Badge>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-bold uppercase tracking-widest text-[10px]">
                                Activa
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() => setShowBioModal(true)}
                                className="text-xs gap-1.5"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                Crear link de BIO
                              </Button>
                            </>
                          ) : (
                            <>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-bold uppercase tracking-widest text-[10px]">
                                En preparación
                              </Badge>
                              <Badge variant="outline" className="bg-muted text-muted-foreground border-border font-bold uppercase tracking-widest text-[10px]">
                                No publicada
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Barra de progreso */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">
                              {completedSteps} de {totalSteps} pasos completados
                            </span>
                            <span className={cn(
                              'text-[10px] font-bold uppercase tracking-wider',
                              isPublished ? 'text-success' : requiredPending.length > 0 ? 'text-destructive' : 'text-primary',
                            )}>
                              {isPublished
                                ? '¡Configuración inicial completa!'
                                : `Faltan ${requiredPending.length} requisito${requiredPending.length !== 1 ? 's' : ''} obligatorio${requiredPending.length !== 1 ? 's' : ''}`}
                            </span>
                          </div>
                          <Progress value={progressPct} className="h-1.5" />
                        </div>

                        {/* Checklist */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 py-4">
                          {checklistItems.map((item) => (
                            <button
                              key={item.label}
                              onClick={() => !item.done && navigate(item.route)}
                              className={cn(
                                'flex items-center gap-3 text-sm font-bold text-left transition-opacity',
                                item.done ? '' : 'hover:opacity-70',
                              )}
                            >
                              {item.done ? (
                                <CheckCircle2
                                  className={cn('w-5 h-5 shrink-0', isPublished ? 'text-success' : 'text-primary')}
                                  style={{ fill: 'currentColor', color: 'white' }}
                                />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground/20 shrink-0" />
                              )}
                              <span className={item.done ? 'text-foreground' : 'text-muted-foreground/40'}>
                                {item.label}
                                {!item.done && item.required && (
                                  <span className="ml-1 text-[9px] text-destructive/70 uppercase tracking-widest">
                                    (Obligatorio)
                                  </span>
                                )}
                                {!item.done && !item.required && (
                                  <span className="ml-1 text-[9px] text-muted-foreground/40 uppercase tracking-widest">
                                    (Recomendado)
                                  </span>
                                )}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-3 pt-4 flex-wrap">
                          {isPublished ? (
                            <>
                              <Button onClick={() => shopSlug && window.open(`/tienda/${shopSlug}`, '_blank')} className="gap-2">
                                <Store className="w-4 h-4" />
                                Ver tienda
                              </Button>
                              <Button variant="outline" onClick={() => navigate('/mi-tienda/configurar')}>
                                Editar configuración
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => requiredPending[0] && navigate(requiredPending[0].route)}
                                className="gap-2"
                              >
                                <ArrowRight className="w-4 h-4" />
                                Continuar configuración
                              </Button>
                              <Button variant="outline" onClick={() => shopSlug && window.open(`/tienda/${shopSlug}`, '_blank')}>
                                Ver preview
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tabla de productos */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border/60">
                    <CardContent className="p-10">
                      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                        <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                          Mis Productos
                        </h3>
                        <div className="flex gap-3 items-center">
                          {isPublished && (
                            <Button variant="ghost" size="sm" onClick={() => navigate('/inventario')} className="text-primary">
                              Gestionar catálogo
                            </Button>
                          )}
                          <Button onClick={() => navigate('/productos/subir')} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Crear producto
                          </Button>
                        </div>
                      </div>

                      {loadingProducts ? (
                        <div className="py-12 text-center text-muted-foreground text-sm font-medium">
                          Cargando productos...
                        </div>
                      ) : products.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center">
                          <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-6">
                            <Package className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                          <h4 className="font-heading text-xl font-bold mb-2 text-foreground">
                            Aún no tienes productos
                          </h4>
                          <p className="text-muted-foreground text-sm max-w-xs mb-6">
                            Crea tu primer producto para activar tu catálogo de tienda.
                          </p>
                          <Button onClick={() => navigate('/productos/subir')} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Crear producto
                          </Button>
                        </div>
                      ) : (
                        <>
                          <table className="w-full text-left">
                            <thead className="border-b border-border/50">
                              <tr>
                                {['Imagen', 'Nombre', 'Estado', 'Precio', 'Stock', 'Acción'].map((h, i) => (
                                  <th
                                    key={h}
                                    className={cn(
                                      'pb-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest',
                                      i > 2 ? 'text-right' : '',
                                      i === 0 ? 'w-16' : '',
                                    )}
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="text-sm font-bold">
                              {products.slice(0, 8).map((product) => {
                                const isLow = product.stock > 0 && product.stock <= 5;
                                const isOut = product.stock === 0;
                                return (
                                  <tr
                                    key={product.id}
                                    className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                                  >
                                    <td className="py-4">
                                      <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden">
                                        {product.images?.[0]?.url && (
                                          <img
                                            src={product.images[0].url}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                          />
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-4 max-w-[160px] truncate text-foreground">
                                      {product.name}
                                    </td>
                                    <td className="py-4">
                                      {product.status === 'published' && !isLow && (
                                        <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px] uppercase tracking-wider">
                                          Publicado
                                        </Badge>
                                      )}
                                      {product.status === 'published' && isLow && (
                                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-[10px] uppercase tracking-wider">
                                          Bajo stock
                                        </Badge>
                                      )}
                                      {product.status === 'draft' && (
                                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] uppercase tracking-wider">
                                          Borrador
                                        </Badge>
                                      )}
                                      {product.status === 'inactive' && (
                                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px] uppercase tracking-wider">
                                          Inactivo
                                        </Badge>
                                      )}
                                    </td>
                                    <td className="py-4 text-right text-foreground">
                                      {product.price ? `$${product.price.toLocaleString('es-CO')}` : '—'}
                                    </td>
                                    <td className="py-4 text-right text-foreground">{product.stock}</td>
                                    <td className="py-4 text-right">
                                      <button
                                        onClick={() => navigate(`/productos/editar/${product.id}`)}
                                        className="text-primary text-xs font-bold hover:underline"
                                      >
                                        {isOut || isLow ? 'Reponer' : product.status === 'draft' ? 'Completar' : 'Editar'}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          {products.length > 8 && (
                            <div className="pt-6 text-center">
                              <Button variant="ghost" onClick={() => navigate('/inventario')} className="text-primary gap-1">
                                Ver todos los {products.length} productos
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar derecha (4) */}
                <aside className="lg:col-span-4 space-y-6">

                  {/* Faltantes / Alertas */}
                  {!isPublished ? (
                    <Card className="bg-card/80 backdrop-blur-sm border-border/60 overflow-hidden">
                      {/* Cabecera decorativa */}
                      <div className="h-36 bg-primary/5 border-b border-primary/10 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute w-24 h-24 bg-primary/10 rounded-full -rotate-12 translate-x-8" />
                        <div className="absolute w-20 h-20 bg-card/40 border border-primary/10 rounded-2xl rotate-12 -translate-x-6 flex items-center justify-center">
                          <Package className="w-8 h-8 text-primary/30" />
                        </div>
                        <div className="absolute w-14 h-14 bg-card/60 border border-primary/10 rounded-full -translate-y-8 translate-x-4 flex items-center justify-center shadow-sm">
                          <Palette className="w-5 h-5 text-primary/50" />
                        </div>
                      </div>
                      <CardContent className="p-8">
                        <h3 className="font-heading text-xl font-bold mb-6 tracking-tight text-foreground">
                          Faltantes para publicar
                        </h3>
                        <div className="space-y-4">
                          {checklistItems.filter((i) => !i.done && i.required).map((item) => (
                            <div key={item.label} className="flex flex-col gap-1 pb-4 border-b border-border/30 last:border-0 last:pb-0">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-foreground">{item.label}</span>
                                  <Badge variant="destructive" className="text-[7px] px-1.5 py-0.5 font-black uppercase tracking-widest">
                                    Requerido
                                  </Badge>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => navigate(item.route)} className="text-primary text-[10px] font-black uppercase tracking-widest h-auto py-0.5">
                                  Ir
                                </Button>
                              </div>
                            </div>
                          ))}
                          {checklistItems.filter((i) => !i.done && !i.required).map((item) => (
                            <div key={item.label} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground">{item.label}</span>
                                <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[7px] px-1.5 py-0.5 font-black uppercase tracking-widest">
                                  Recomendado
                                </Badge>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => navigate(item.route)} className="text-primary text-[10px] font-black uppercase tracking-widest h-auto py-0.5">
                                Agregar
                              </Button>
                            </div>
                          ))}
                          {checklistItems.filter((i) => !i.done).length === 0 && (
                            <p className="text-sm text-success font-bold text-center py-4">
                              ¡Todo completo! Puedes publicar tu tienda.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-card/80 backdrop-blur-sm border-border/60 overflow-hidden">
                      <div className="h-32 bg-primary/5 border-b border-primary/10 flex items-center justify-center relative">
                        <div className="absolute w-20 h-20 bg-primary/10 rounded-full -top-8 -right-8 blur-xl" />
                        <div className="relative">
                          <div className="w-14 h-14 bg-card/40 border border-card/60 rounded-2xl flex items-center justify-center rotate-6 shadow-sm">
                            <Bell className="w-7 h-7 text-primary/40" />
                          </div>
                          {(lowStockProducts.length > 0 || draftProducts.length > 0) && (
                            <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md">
                              <AlertTriangle className="w-3.5 h-3.5 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-8">
                        <h3 className="font-heading text-xl font-bold mb-6 tracking-tight text-foreground">
                          Alertas de tienda
                        </h3>
                        <div className="space-y-4">
                          {lowStockProducts.length > 0 && (
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-sm font-bold text-foreground">Bajo stock</span>
                                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-[9px] font-black uppercase tracking-widest">
                                    {lowStockProducts.length} items
                                  </Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium">
                                  Reponer para no pausar ventas.
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => navigate('/inventario')} className="text-primary text-[10px] font-black uppercase tracking-widest h-auto ml-3">
                                Revisar
                              </Button>
                            </div>
                          )}
                          {draftProducts.length > 0 && (
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-sm font-bold text-foreground">Borradores</span>
                                  <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[9px] font-black uppercase tracking-widest">
                                    {draftProducts.length} items
                                  </Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium">
                                  Completa estos productos para publicar.
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => navigate('/inventario')} className="text-primary text-[10px] font-black uppercase tracking-widest h-auto ml-3">
                                Completar
                              </Button>
                            </div>
                          )}
                          {lowStockProducts.length === 0 && draftProducts.length === 0 && (
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                              <div>
                                <span className="text-sm font-bold text-foreground">Todo en orden</span>
                                <p className="text-[10px] text-muted-foreground">¡Tu catálogo está al día!</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Mis ventas */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border/60">
                    <CardContent className="p-8">
                      <h3 className="font-heading text-lg font-bold mb-4 text-foreground tracking-tight">
                        Mis ventas
                      </h3>
                      <div className="space-y-6">
                        {!isPublished && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Las ventas aparecerán cuando publiques productos y recibas pedidos.
                          </p>
                        )}
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/50 block mb-1">
                            Ingresos totales
                          </span>
                          <span className="text-5xl font-bold tracking-tighter text-foreground">
                            {salesStats.totalRevenue > 0 ? formatCurrency(salesStats.totalRevenue) : '$0'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 pt-6 border-t border-border/40">
                          <div>
                            <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
                              Órdenes
                            </span>
                            <span className="text-xl font-bold text-foreground">{salesStats.total}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
                              Pendientes
                            </span>
                            <span className="text-xl font-bold text-foreground">{salesStats.pending}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
                              Despachados
                            </span>
                            <span className="text-xl font-bold text-foreground">{salesStats.shipped ?? 0}</span>
                          </div>
                          <div className="flex items-end justify-end">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/mi-tienda/ventas')} className="text-primary font-black uppercase tracking-wider text-[10px] h-auto p-0">
                              Ver ventas →
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Perfil */}
                  <Card className="bg-card/60 backdrop-blur-sm border-border/60">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-inner">
                          <span className="font-heading text-2xl font-bold text-primary">
                            {userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading text-xl font-bold truncate text-foreground">{shopName}</h4>
                          <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
                            {hasBrand ? 'Marca completa' : 'Marca incompleta'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3 mb-6 text-[10px] font-bold">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground/50 uppercase tracking-widest">Tipo</span>
                          <span className="text-foreground">{(shop as any)?.craftType || (shop as any)?.craft_type || 'Artesanía'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground/50 uppercase tracking-widest">Región</span>
                          <span className="text-foreground">{(shop as any)?.region || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground/50 uppercase tracking-widest">Estado</span>
                          <Badge variant="outline" className={cn(
                            'text-[8px] font-black uppercase tracking-widest',
                            isPublished ? 'bg-success/10 text-success border-success/30' : 'bg-primary/10 text-primary border-primary/30',
                          )}>
                            {isPublished ? 'Publicada' : 'En preparación'}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest" onClick={() => navigate('/profile')}>
                        Editar perfil
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Camino de crecimiento */}
                  <Card className="bg-success/5 border-success/10">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                          <span className="text-[8px] text-success/50 font-black uppercase tracking-[0.2em] block">
                            Camino de crecimiento
                          </span>
                          <h3 className="font-heading text-lg font-bold tracking-tight text-foreground">
                            {maturityLabel}
                          </h3>
                        </div>
                        <Badge variant="outline" className="bg-card/80 text-primary border-primary/20 text-[9px] font-black">
                          {maturityScore.toFixed(1)}/5
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground mb-6">
                        <span className="opacity-60">Misiones activas</span>
                        <Badge variant="outline" className="bg-card/80 text-success/80 border-success/20 text-[8px] font-black uppercase tracking-widest">
                          {activeMissions} pendientes
                        </Badge>
                      </div>
                      <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest bg-card/80" onClick={() => navigate('/dashboard/tasks')}>
                        Ver misiones
                      </Button>
                    </CardContent>
                  </Card>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal perfil incompleto */}
      <ForceCompleteProfileModal
        isOpen={showProfileModal}
        missingFields={missingFields}
        currentData={currentData}
        onComplete={() => {
          setShowProfileModal(false);
          refreshProfileCompleteness();
        }}
      />

      {/* Modal BIO Link */}
      {showBioModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={() => setShowBioModal(false)}
        >
          <Card
            className="w-full max-w-md shadow-2xl border-border/60"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview mini */}
            <div className="bg-background/80 px-8 pt-8 pb-6 flex flex-col items-center gap-3 border-b border-border/40 rounded-t-xl">
              <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest font-heading">
                TELAR
              </span>
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                <span className="font-heading text-2xl font-bold text-primary">
                  {shopName?.charAt(0)?.toUpperCase() || 'T'}
                </span>
              </div>
              <div className="text-center">
                <p className="font-heading text-lg font-bold text-foreground">{shopName}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Tu landing de BIO lista para compartir
                </p>
              </div>
              {/* Preview links */}
              <div className="w-full space-y-2 mt-2">
                <div className="bg-card border border-border/50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Store className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Mi tienda</span>
                </div>
                <div className="bg-card/60 border border-border/40 rounded-xl px-4 py-3 flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-bold text-muted-foreground">Mi perfil artesanal</span>
                </div>
              </div>
            </div>

            <CardContent className="p-8 space-y-4">
              {/* Cerrar */}
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-foreground">Tu link de BIO</p>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowBioModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 bg-muted/40 border border-border/50 rounded-xl px-4 py-3">
                <span className="flex-1 text-xs text-muted-foreground font-medium truncate">{bioUrl}</span>
                <Button
                  size="sm"
                  variant={bioCopied ? 'outline' : 'default'}
                  onClick={handleCopyBioLink}
                  className={cn('shrink-0 gap-1.5 text-xs', bioCopied ? 'text-success border-success/40' : '')}
                >
                  {bioCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {bioCopied ? '¡Copiado!' : 'Copiar'}
                </Button>
              </div>
              <div className="flex gap-3">
                <Button asChild className="flex-1 gap-2">
                  <a href={bioUrl || '#'} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Ver mi BIO
                  </a>
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowBioModal(false)}>
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
