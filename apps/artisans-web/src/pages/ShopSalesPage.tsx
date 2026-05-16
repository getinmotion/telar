import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useShopOrders, orderRequiresShipping, orderNeedsTracking, ShopOrder } from '@/hooks/useShopOrders';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ── TELAR Design System ───────────────────────────────────────────────────────
const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

const glassPrimary: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 20px rgba(21,27,45,0.04)',
};

const glassSecondary: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.55)',
};

type PillVariant = 'success' | 'warning' | 'error' | 'draft' | 'orange' | 'info' | 'purple';

const PILL_STYLES: Record<PillVariant, React.CSSProperties> = {
  success: { background: 'rgba(22,101,52,0.1)',  color: '#166534' },
  warning: { background: 'rgba(236,109,19,0.1)', color: '#ec6d13' },
  error:   { background: 'rgba(239,68,68,0.1)',  color: '#ef4444' },
  draft:   { background: 'rgba(21,27,45,0.06)',  color: '#54433e' },
  orange:  { background: '#ec6d13',              color: 'white'   },
  info:    { background: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  purple:  { background: 'rgba(168,85,247,0.1)', color: '#a855f7' },
};

function Pill({ children, variant = 'draft' }: { children: React.ReactNode; variant?: PillVariant }) {
  return (
    <span style={{
      ...PILL_STYLES[variant],
      borderRadius: '9999px',
      padding: '3px 10px',
      fontFamily: SANS,
      fontSize: 10,
      fontWeight: 800,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      whiteSpace: 'nowrap' as const,
    }}>
      {children}
    </span>
  );
}

function MetricCard({ label, value, sub, icon, accent }: {
  label: string;
  value: React.ReactNode;
  sub: string;
  icon: string;
  accent?: string;
}) {
  return (
    <div style={{ ...glassPrimary, borderRadius: 20, minHeight: 112 }} className="p-5 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-3">
        <span style={{
          fontFamily: SANS,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase' as const,
          color: 'rgba(84,67,62,0.5)',
        }}>
          {label}
        </span>
        <span className="material-symbols-outlined" style={{ color: accent ?? 'rgba(21,27,45,0.2)', fontSize: 20 }}>
          {icon}
        </span>
      </div>
      <div>
        <div style={{ fontFamily: SANS, fontSize: 30, fontWeight: 700, color: '#151b2d', lineHeight: 1 }}>
          {value}
        </div>
        <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(84,67,62,0.45)', marginTop: 4 }}>
          {sub}
        </p>
      </div>
    </div>
  );
}

// ── Sales Insight Card (AI) ───────────────────────────────────────────────────
interface SalesInsight {
  message: string;
  cta: string;
  route: string;
  icon: string;
  onCtaClick?: () => void;
}

function buildSalesInsight(
  stats: { total: number; totalRevenue: number; pendingTracking: number; pickupOrders: number },
  onGoPending: () => void,
  navigate: (path: string) => void,
): SalesInsight {
  if (stats.total === 0) {
    return {
      message: 'Todavía no tienes ventas registradas. Asegúrate de que tu tienda esté publicada y de que tus productos tengan fotos claras — las tiendas con 3+ fotos por producto tienen el doble de conversión.',
      cta: 'Configurar tienda',
      route: '/mi-tienda/configurar',
      icon: 'store',
    };
  }

  if (stats.pendingTracking > 0) {
    return {
      message: `Tienes ${stats.pendingTracking} orden${stats.pendingTracking > 1 ? 'es' : ''} sin número de guía. Los clientes sin actualización de envío tienen 3× más probabilidad de pedir reembolso — agrégalas ahora.`,
      cta: `Ver ${stats.pendingTracking > 1 ? 'órdenes' : 'orden'} pendiente${stats.pendingTracking > 1 ? 's' : ''}`,
      route: '',
      icon: 'local_shipping',
      onCtaClick: onGoPending,
    };
  }

  const pickupPct = stats.total > 0 ? Math.round((stats.pickupOrders / stats.total) * 100) : 0;
  if (pickupPct >= 50 && stats.total >= 3) {
    return {
      message: `El ${pickupPct}% de tus ventas son retiros locales. Activar envío por Servientrega te abre el mercado nacional — puedes llegar a compradores en cualquier ciudad del país.`,
      cta: 'Configurar envíos',
      route: '/mi-tienda/configurar',
      icon: 'package_2',
    };
  }

  return {
    message: 'Vas bien con tus ventas. Para aumentar el ticket promedio, agrupa productos en colecciones o crea paquetes — los artesanos que ofrecen combos venden 40% más por orden.',
    cta: 'Gestionar catálogo',
    route: '/inventario',
    icon: 'inventory_2',
  };
}

function SalesInsightCard({
  stats,
  loading,
  onGoPending,
}: {
  stats: { total: number; totalRevenue: number; pendingTracking: number; pickupOrders: number };
  loading: boolean;
  onGoPending: () => void;
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ background: '#151b2d', borderRadius: 16, padding: '20px 24px' }}>
        <div className="flex flex-col gap-3">
          {[80, 60, 40].map(w => (
            <div key={w} style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.06)', width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  const insight = buildSalesInsight(stats, onGoPending, navigate);

  return (
    <div style={{ background: '#151b2d', borderRadius: 16, padding: '20px 24px', position: 'relative', overflow: 'hidden', height: '100%' }}>
      {/* Accent blob */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 160, height: 160,
        borderRadius: '50%', background: 'rgba(236,109,19,0.06)', pointerEvents: 'none',
      }} />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4" style={{ position: 'relative' }}>
        <span className="material-symbols-outlined" style={{ color: '#ec6d13', fontSize: 18 }}>psychology</span>
        <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
          Asistente de ventas
        </span>
      </div>

      {/* Message */}
      <div className="flex gap-3 mb-4 items-start" style={{ position: 'relative' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: 'rgba(236,109,19,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#ec6d13' }}>{insight.icon}</span>
        </div>
        <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.72)', margin: 0 }}>
          {insight.message}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={() => {
          if (insight.onCtaClick) {
            insight.onCtaClick();
          } else {
            navigate(insight.route);
          }
        }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#ec6d13', color: 'white', border: 'none',
          borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
          fontFamily: SANS, fontSize: 12, fontWeight: 700,
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {insight.cta}
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
type FilterTab = 'all' | 'pending' | 'shipped' | 'delivered' | 'pickup';

export default function ShopSalesPage() {
  const navigate = useNavigate();
  const { shop } = useArtisanShop();
  const { orders, loading, stats, fetchOrders, updateTrackingNumber, markAsPickedUp } = useShopOrders(shop?.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(o =>
          (o.status === 'pending' || o.status === 'confirmed') &&
          orderRequiresShipping(o)
        );
        break;
      case 'shipped':
        filtered = filtered.filter(o => o.status === 'shipped' || o.fulfillment_status === 'shipped');
        break;
      case 'delivered':
        filtered = filtered.filter(o => o.status === 'delivered' || o.fulfillment_status === 'fulfilled');
        break;
      case 'pickup':
        filtered = filtered.filter(o => !orderRequiresShipping(o));
        break;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.order_number.toLowerCase().includes(term) ||
        o.customer_name.toLowerCase().includes(term) ||
        o.customer_email.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [orders, activeTab, searchTerm]);

  const chartData = useMemo(() => {
    const dateMap = new Map<string, number>();
    orders.forEach(order => {
      if (order.payment_status === 'paid') {
        const date = format(new Date(order.created_at), 'dd MMM', { locale: es });
        dateMap.set(date, (dateMap.get(date) || 0) + order.total);
      }
    });
    return Array.from(dateMap.entries())
      .map(([date, total]) => ({ date, total }))
      .slice(-7);
  }, [orders]);

  const handleSaveTracking = async () => {
    if (!selectedOrder || !trackingInput.trim()) return;
    setIsSubmitting(true);
    const success = await updateTrackingNumber(selectedOrder.id, trackingInput.trim());
    setIsSubmitting(false);
    if (success) {
      setTrackingDialogOpen(false);
      setTrackingInput('');
      setSelectedOrder(null);
    }
  };

  const handleMarkAsPickedUp = async (order: ShopOrder) => {
    await markAsPickedUp(order.id);
  };

  const openTrackingDialog = (order: ShopOrder) => {
    setSelectedOrder(order);
    setTrackingInput(order.tracking_number || '');
    setTrackingDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${Math.round(amount / 1_000)}k`;
    return `$${amount.toLocaleString('es-CO')}`;
  };

  const formatCurrencyFull = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = ['Orden', 'Fecha', 'Cliente', 'Email', 'Total', 'Estado', 'Método Envío'];
    const rows = orders.map(o => [
      o.order_number,
      format(new Date(o.created_at), 'dd/MM/yyyy HH:mm'),
      o.customer_name,
      o.customer_email,
      o.total,
      o.status,
      orderRequiresShipping(o) ? 'Servientrega' : 'Retiro local',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getStatusPill = (order: ShopOrder) => {
    const isPickup = !orderRequiresShipping(order);
    if (order.status === 'delivered' || order.fulfillment_status === 'fulfilled' || order.fulfillment_status === 'picked_up') {
      return (
        <Pill variant="success">
          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>check_circle</span>
          {isPickup ? 'Recogido' : 'Entregado'}
        </Pill>
      );
    }
    if (order.status === 'shipped' || order.fulfillment_status === 'shipped') {
      return (
        <Pill variant="info">
          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>local_shipping</span>
          Enviado
        </Pill>
      );
    }
    if (isPickup) {
      return (
        <Pill variant="purple">
          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>location_on</span>
          Retiro local
        </Pill>
      );
    }
    if (orderNeedsTracking(order)) {
      return (
        <Pill variant="warning">
          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>warning</span>
          Sin guía
        </Pill>
      );
    }
    return (
      <Pill variant="draft">
        <span className="material-symbols-outlined" style={{ fontSize: 11 }}>schedule</span>
        Pendiente
      </Pill>
    );
  };

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: SANS, color: 'rgba(84,67,62,0.5)' }}>No tienes una tienda configurada</p>
      </div>
    );
  }

  const TABS: { value: FilterTab; label: string; count?: number }[] = [
    { value: 'all',       label: 'Todas',     count: stats.total },
    { value: 'pending',   label: 'Pendientes' },
    { value: 'shipped',   label: 'Enviadas'   },
    { value: 'delivered', label: 'Entregadas' },
    { value: 'pickup',    label: 'Retiros',   count: stats.pickupOrders },
  ];

  return (
    <>
      <Helmet>
        <title>{`Mis Ventas - ${shop.shopName} | Telar`}</title>
      </Helmet>

      <div className="h-full flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <header
          className="sticky top-0 z-30 px-12 pt-4 pb-3 grid items-center"
          style={{ gridTemplateColumns: '1fr auto 1fr' }}
        >
          <div className="flex items-center gap-3">
            {shop?.logoUrl && (
              <img src={shop.logoUrl} alt={shop.shopName} className="h-10 w-10 rounded-full object-contain"
                style={{ border: '1px solid rgba(21,27,45,0.08)', background: 'white', padding: 2 }} />
            )}
          </div>
          <div className="flex flex-col items-center text-center">
            <h1 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: '#151b2d', lineHeight: 1.2 }}>
              Mis Ventas
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: 'rgba(84,67,62,0.7)', marginTop: 2 }}>
              {shop.shopName}
            </p>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <NotificationCenter />
            <button
              onClick={() => fetchOrders()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(21,27,45,0.06)', color: '#54433e',
                border: '1px solid rgba(21,27,45,0.1)', borderRadius: 8,
                padding: '7px 14px', cursor: 'pointer',
                fontFamily: SANS, fontSize: 12, fontWeight: 600,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(21,27,45,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(21,27,45,0.06)')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>refresh</span>
              Actualizar
            </button>
            <button
              onClick={exportToCSV}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(21,27,45,0.06)', color: '#54433e',
                border: '1px solid rgba(21,27,45,0.1)', borderRadius: 8,
                padding: '7px 14px', cursor: 'pointer',
                fontFamily: SANS, fontSize: 12, fontWeight: 600,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(21,27,45,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(21,27,45,0.06)')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>download</span>
              Exportar
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20" style={{ overscrollBehavior: 'contain' }}>
        <div className="container max-w-7xl mx-auto px-6 py-6 space-y-5">
          {/* Stats + AI side by side */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Stats Grid — left */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ ...glassPrimary, borderRadius: 20, height: 112 }}
                    className="animate-pulse" />
                ))
              ) : (
                <>
                  <MetricCard
                    label="Ingresos totales"
                    value={formatCurrency(stats.totalRevenue)}
                    sub="Ventas pagadas"
                    icon="payments"
                    accent="#166534"
                  />
                  <MetricCard
                    label="Total órdenes"
                    value={stats.total}
                    sub="Todas las órdenes"
                    icon="inventory_2"
                    accent="#3b82f6"
                  />
                  <MetricCard
                    label="Sin guía"
                    value={stats.pendingTracking}
                    sub="Requieren tracking"
                    icon="local_shipping"
                    accent={stats.pendingTracking > 0 ? '#ec6d13' : 'rgba(21,27,45,0.2)'}
                  />
                  <MetricCard
                    label="Retiros locales"
                    value={stats.pickupOrders}
                    sub="Recogida en taller"
                    icon="location_on"
                    accent="#a855f7"
                  />
                </>
              )}
            </div>

            {/* AI Sales Insight — right */}
            <div className="lg:w-80 xl:w-96 shrink-0">
              <SalesInsightCard
                stats={stats}
                loading={loading}
                onGoPending={() => setActiveTab('pending')}
              />
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div style={{ ...glassPrimary, borderRadius: 20 }} className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined" style={{ color: '#ec6d13', fontSize: 18 }}>trending_up</span>
                <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: '#151b2d' }}>
                  Ventas recientes
                </span>
              </div>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ec6d13" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#ec6d13" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(21,27,45,0.06)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(84,67,62,0.35)"
                      fontSize={11}
                      fontFamily={SANS}
                    />
                    <YAxis
                      stroke="rgba(84,67,62,0.35)"
                      fontSize={11}
                      fontFamily={SANS}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrencyFull(value), 'Ventas']}
                      contentStyle={{
                        ...glassPrimary,
                        borderRadius: 10,
                        fontFamily: SANS,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#ec6d13"
                      fill="url(#salesGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Orders */}
          <div style={{ ...glassPrimary, borderRadius: 20 }} className="overflow-hidden">
            {/* Orders header */}
            <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(21,27,45,0.06)' }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: '#151b2d', margin: 0 }}>
                    Órdenes
                  </h2>
                  <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.45)', marginTop: 2 }}>
                    Gestiona tus ventas y envíos
                  </p>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(21,27,45,0.04)', border: '1px solid rgba(21,27,45,0.08)',
                  borderRadius: 10, padding: '6px 12px',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'rgba(84,67,62,0.4)' }}>search</span>
                  <input
                    placeholder="Buscar orden..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      border: 'none', background: 'transparent', outline: 'none',
                      fontFamily: SANS, fontSize: 13, color: '#151b2d', width: 180,
                    }}
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4 overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: SANS,
                      fontSize: 12,
                      fontWeight: activeTab === tab.value ? 700 : 500,
                      background: activeTab === tab.value ? '#ec6d13' : 'transparent',
                      color: activeTab === tab.value ? 'white' : 'rgba(84,67,62,0.6)',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    {tab.label}
                    {tab.count !== undefined && (
                      <span style={{
                        fontSize: 10, fontWeight: 800,
                        background: activeTab === tab.value ? 'rgba(255,255,255,0.25)' : 'rgba(21,27,45,0.08)',
                        color: activeTab === tab.value ? 'white' : 'rgba(84,67,62,0.5)',
                        borderRadius: 20, padding: '1px 6px',
                      }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders list */}
            <div className="px-6 py-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: 100, borderRadius: 12, background: 'rgba(21,27,45,0.04)' }}
                      className="animate-pulse" />
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-16 text-center">
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'rgba(21,27,45,0.12)', display: 'block', marginBottom: 12 }}>
                    inventory_2
                  </span>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(84,67,62,0.4)' }}>
                    No hay órdenes en esta categoría
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map(order => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onAddTracking={() => openTrackingDialog(order)}
                      onMarkAsPickedUp={() => handleMarkAsPickedUp(order)}
                      formatCurrency={formatCurrencyFull}
                      getStatusPill={getStatusPill}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tracking Dialog */}
        <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle style={{ fontFamily: SERIF }}>Agregar número de guía</DialogTitle>
              <DialogDescription style={{ fontFamily: SANS }}>
                Ingresa el número de guía de Servientrega para la orden {selectedOrder?.order_number}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label
                  htmlFor="tracking"
                  style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'rgba(84,67,62,0.6)', display: 'block' }}
                >
                  Número de guía Servientrega
                </label>
                <input
                  id="tracking"
                  placeholder="Ej: 1234567890"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px',
                    border: '1px solid rgba(21,27,45,0.15)', borderRadius: 8,
                    fontFamily: SANS, fontSize: 13, color: '#151b2d', outline: 'none',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#ec6d13')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(21,27,45,0.15)')}
                />
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setTrackingDialogOpen(false)}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  border: '1px solid rgba(21,27,45,0.15)', background: 'transparent',
                  fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#54433e',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTracking}
                disabled={!trackingInput.trim() || isSubmitting}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  background: !trackingInput.trim() || isSubmitting ? 'rgba(236,109,19,0.4)' : '#ec6d13',
                  border: 'none', color: 'white',
                  fontFamily: SANS, fontSize: 12, fontWeight: 700,
                  cursor: !trackingInput.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar guía'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </main>
      </div>
    </>
  );
}

// ── Order Row ─────────────────────────────────────────────────────────────────
function OrderRow({
  order,
  onAddTracking,
  onMarkAsPickedUp,
  formatCurrency,
  getStatusPill,
}: {
  order: ShopOrder;
  onAddTracking: () => void;
  onMarkAsPickedUp: () => void;
  formatCurrency: (amount: number) => string;
  getStatusPill: (order: ShopOrder) => React.ReactNode;
}) {
  const isPickup    = !orderRequiresShipping(order);
  const needsTracking = orderNeedsTracking(order);
  const isDelivered = order.status === 'delivered' || order.fulfillment_status === 'fulfilled' || order.fulfillment_status === 'picked_up';
  const items       = Array.isArray(order.items) ? order.items : [];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.6)',
      border: '1px solid rgba(21,27,45,0.07)',
      borderRadius: 14,
      padding: '14px 18px',
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.85)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.6)')}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Order ID + status */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#151b2d' }}>
              {order.order_number}
            </span>
            {getStatusPill(order)}
          </div>
          <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.45)', margin: 0 }}>
            {format(new Date(order.created_at), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
          </p>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          {/* Customer */}
          <div>
            <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#151b2d', margin: 0 }}>
              {order.customer_name}
            </p>
            <div className="flex items-center gap-1" style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.45)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>mail</span>
              {order.customer_email}
            </div>
            {order.customer_phone && (
              <div className="flex items-center gap-1" style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.45)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>phone</span>
                {order.customer_phone}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="text-right">
            <p style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: '#151b2d', margin: 0 }}>
              {formatCurrency(order.total)}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.4)', margin: '2px 0 0' }}>
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isDelivered && (
              <>
                {isPickup ? (
                  <button
                    onClick={onMarkAsPickedUp}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 8,
                      border: '1px solid rgba(168,85,247,0.3)',
                      background: 'rgba(168,85,247,0.08)', color: '#a855f7',
                      fontFamily: SANS, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check_circle</span>
                    Marcar recogido
                  </button>
                ) : needsTracking ? (
                  <button
                    onClick={onAddTracking}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 8,
                      border: '1px solid rgba(236,109,19,0.3)',
                      background: 'rgba(236,109,19,0.08)', color: '#ec6d13',
                      fontFamily: SANS, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>local_shipping</span>
                    Agregar guía
                  </button>
                ) : order.tracking_number ? (
                  <span style={{
                    fontFamily: 'monospace', fontSize: 11, color: 'rgba(84,67,62,0.5)',
                    background: 'rgba(21,27,45,0.05)', borderRadius: 6,
                    padding: '4px 8px', border: '1px solid rgba(21,27,45,0.08)',
                  }}>
                    Guía: {order.tracking_number}
                  </span>
                ) : null}
              </>
            )}

            {order.customer_phone && (
              <a
                href={`https://wa.me/57${order.customer_phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(21,27,45,0.05)', border: '1px solid rgba(21,27,45,0.08)',
                  color: 'rgba(84,67,62,0.5)',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(21,27,45,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(21,27,45,0.05)')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>phone</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(21,27,45,0.05)' }}>
          {items.map((item: any, i: number) => (
            <span key={i} style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 600,
              background: 'rgba(21,27,45,0.05)', color: 'rgba(84,67,62,0.6)',
              borderRadius: 6, padding: '2px 8px',
              border: '1px solid rgba(21,27,45,0.06)',
            }}>
              {item.quantity}× {item.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
