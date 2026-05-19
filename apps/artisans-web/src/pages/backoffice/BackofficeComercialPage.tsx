import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { useComercialStats } from '@/hooks/useComercialStats';
import {
  SANS, SERIF, lc, formatCurrency,
  PURPLE, glassPrimary, glassPurple,
} from '@/components/dashboard/dashboardStyles';

// ── Tokens ──────────────────────────────────────────────────────────────────
const NAVY   = '#142239';
const TEAL   = '#0d9488';

// ── Helpers ─────────────────────────────────────────────────────────────────
function minor(v: number) { return formatCurrency(Math.round(v / 100)); }

function formatWeek(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

// ── Sub-components ──────────────────────────────────────────────────────────

interface KpiProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

const Kpi: React.FC<KpiProps> = ({ label, value, sub, accent }) => (
  <div
    style={{
      ...(accent ? glassPurple : glassPrimary),
      borderRadius: 20,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}
  >
    <span style={{ ...lc(0.35), fontSize: 9 }}>{label}</span>
    <span style={{ fontFamily: SANS, fontSize: 40, fontWeight: 800, color: accent ? PURPLE : NAVY, lineHeight: 1 }}>
      {value}
    </span>
    {sub && (
      <span style={{ fontFamily: SERIF, fontSize: 12, color: 'rgba(20,34,57,0.4)', fontStyle: 'italic' }}>
        {sub}
      </span>
    )}
  </div>
);

interface SectionProps { title: string; children: React.ReactNode }
const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div style={{ ...glassPrimary, borderRadius: 28, padding: '24px 28px' }}>
    <p style={{ ...lc(0.5), marginBottom: 16 }}>{title}</p>
    {children}
  </div>
);

// ── Custom tooltip shared ────────────────────────────────────────────────────
const GmvTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...glassPrimary, borderRadius: 12, padding: '10px 14px', fontFamily: SANS, fontSize: 12 }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: NAVY }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {minor(p.value)}
        </p>
      ))}
    </div>
  );
};

// ── Channel switcher ─────────────────────────────────────────────────────────
type Channel = 'all' | 'marketplace' | 'tenant';
const CHANNEL_LABELS: Record<Channel, string> = {
  all: 'Todos',
  marketplace: 'Marketplace',
  tenant: 'Tiendas',
};

// ── Page ─────────────────────────────────────────────────────────────────────
const BackofficeComercialPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, isLoading, isError, refetch } = useComercialStats();
  const [channel, setChannel] = useState<Channel>('all');

  if (isLoading) {
    return (
      <div style={{ padding: 40, fontFamily: SANS, color: NAVY }}>
        Cargando stats comerciales…
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div style={{ padding: 40, fontFamily: SANS, color: '#ef4444' }}>
        Error al cargar datos.{' '}
        <button onClick={() => refetch()} style={{ textDecoration: 'underline' }}>
          Reintentar
        </button>
      </div>
    );
  }

  // ── Filtered channel data
  const channelData = channel === 'all'
    ? null
    : stats.gmvByChannel.find((r) => r.channel === channel);

  const displayGmv = channel === 'all'
    ? stats.gmvTotal
    : (channelData?.gmvMinor ?? 0);
  const displayOrders = channel === 'all'
    ? stats.orderCountTotal
    : (channelData?.orderCount ?? 0);
  const displayTicket = channel === 'all'
    ? stats.avgTicketMinor
    : (channelData?.avgTicketMinor ?? 0);

  // ── Filter top shops by channel
  const filteredShops = channel === 'all'
    ? stats.topShops
    : stats.topShops.filter((s) => s.saleContext === channel);

  // ── Bar data for channel comparison
  const channelBarData = stats.gmvByChannel.map((r) => ({
    name: r.channel === 'marketplace' ? 'Marketplace' : 'Tiendas',
    GMV: r.gmvMinor,
    Órdenes: r.orderCount,
    color: r.channel === 'marketplace' ? PURPLE : TEAL,
  }));

  // ── Region bar data
  const regionData = stats.gmvByRegion.slice(0, 10).map((r) => ({
    name: r.region.length > 18 ? r.region.slice(0, 16) + '…' : r.region,
    fullName: r.region,
    GMV: r.gmvMinor,
    Órdenes: r.orderCount,
  }));

  // ── Weekly timeline data
  const weekData = stats.gmvByWeek.map((r) => ({
    semana: formatWeek(r.week),
    GMV: r.gmvMinor,
    Órdenes: r.orderCount,
  }));

  const pctMarket = stats.gmvTotal > 0
    ? Math.round((stats.gmvMarketplace / stats.gmvTotal) * 100)
    : 0;
  const pctTenant = 100 - pctMarket;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f9f7f2',
        backgroundImage: `
          radial-gradient(circle at top left, rgba(167,139,250,0.2) 0%, transparent 40%),
          radial-gradient(circle at bottom right, rgba(187,247,208,0.18) 0%, transparent 44%),
          radial-gradient(circle at top right, rgba(255,244,223,0.7) 0%, transparent 36%)
        `,
        backgroundAttachment: 'fixed',
        fontFamily: SANS,
      }}
    >
      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 px-8 py-4"
        style={{
          background: 'rgba(249,247,242,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(84,67,62,0.08)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/backoffice/home')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(84,67,62,0.4)' }}>arrow_back</span>
            </button>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(76,29,149,0.1) 100%)',
              border: '1px solid rgba(124,58,237,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 17, color: PURPLE }}>trending_up</span>
            </div>
            <div>
              <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: '#151b2d', lineHeight: 1.2 }}>El Comercial</p>
              <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, color: 'rgba(84,67,62,0.55)', marginTop: 1 }}>
                GMV · Ventas · Trazabilidad por canal
              </p>
            </div>
          </div>

          {/* Channel switcher */}
          <div className="flex items-center gap-2">
            {(['all', 'marketplace', 'tenant'] as Channel[]).map((c) => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                style={{
                  fontFamily: SANS,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 9999,
                  border: channel === c ? 'none' : '1px solid rgba(20,34,57,0.12)',
                  background: channel === c
                    ? (c === 'marketplace' ? PURPLE : c === 'tenant' ? TEAL : NAVY)
                    : 'rgba(255,255,255,0.7)',
                  color: channel === c ? 'white' : 'rgba(20,34,57,0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {CHANNEL_LABELS[c]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">

        {/* Hero KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi
            label="GMV Total"
            value={minor(displayGmv)}
            sub={channel === 'all' ? `${pctMarket}% marketplace · ${pctTenant}% tiendas` : CHANNEL_LABELS[channel]}
            accent
          />
          <Kpi label="Órdenes" value={displayOrders.toLocaleString('es-CO')} sub="Sin canceladas" />
          <Kpi label="Ticket Promedio" value={minor(displayTicket)} sub="por orden" />
          <Kpi
            label="Tiendas activas (30d)"
            value={stats.activeShopLast30d.toString()}
            sub="Con al menos 1 venta"
          />
        </div>

        {/* Recompra KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Kpi label="Compradores totales" value={stats.totalBuyers.toLocaleString('es-CO')} />
          <Kpi
            label="Compradores recurrentes"
            value={stats.repeatBuyers.toLocaleString('es-CO')}
            sub=">1 orden"
          />
          <Kpi
            label="Tasa recompra"
            value={`${stats.repeatBuyerRate}%`}
            sub="de compradores totales"
            accent={stats.repeatBuyerRate > 20}
          />
        </div>

        {/* Charts row 1: Canal + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Section title="GMV por Canal">
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {stats.gmvByChannel.map((r) => (
                <div key={r.channel} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 9999, background: r.channel === 'marketplace' ? PURPLE : TEAL }} />
                    <span style={{ ...lc(0.4), fontSize: 8 }}>
                      {r.channel === 'marketplace' ? 'Marketplace' : 'Tiendas'}
                    </span>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 22, fontWeight: 800, color: NAVY, lineHeight: 1 }}>
                    {minor(r.gmvMinor)}
                  </p>
                  <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(20,34,57,0.4)', marginTop: 2 }}>
                    {r.orderCount} órdenes · ticket {minor(r.avgTicketMinor)}
                  </p>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={channelBarData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontFamily: SANS, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<GmvTooltip />} />
                <Bar dataKey="GMV" fill={PURPLE} radius={[6, 6, 0, 0]}>
                  {channelBarData.map((entry, i) => (
                    <rect key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Section>

          <div className="lg:col-span-2">
            <Section title="GMV Semanal (últimas 8 semanas)">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={weekData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,34,57,0.06)" />
                  <XAxis dataKey="semana" tick={{ fontFamily: SANS, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v: number) => [minor(v), 'GMV']}
                    contentStyle={{ fontFamily: SANS, fontSize: 12, borderRadius: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="GMV"
                    stroke={PURPLE}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: PURPLE }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Section>
          </div>
        </div>

        {/* Charts row 2: Región + Top tiendas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="GMV por Región (top 10)">
            {regionData.length === 0 ? (
              <p style={{ fontFamily: SERIF, fontSize: 13, color: 'rgba(20,34,57,0.4)', fontStyle: 'italic' }}>
                Sin datos de región disponibles
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={regionData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fontFamily: SANS, fontSize: 10, fill: 'rgba(20,34,57,0.6)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v: number) => [minor(v), 'GMV']}
                    contentStyle={{ fontFamily: SANS, fontSize: 12, borderRadius: 10 }}
                  />
                  <Bar dataKey="GMV" fill={TEAL} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Section>

          <Section title={`Top tiendas por GMV${channel !== 'all' ? ` · ${CHANNEL_LABELS[channel]}` : ''}`}>
            {filteredShops.length === 0 ? (
              <p style={{ fontFamily: SERIF, fontSize: 13, color: 'rgba(20,34,57,0.4)', fontStyle: 'italic' }}>
                Sin datos
              </p>
            ) : (
              <div style={{ overflowY: 'auto', maxHeight: 280 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: SANS, fontSize: 12 }}>
                  <thead>
                    <tr>
                      {['Tienda', 'Canal', 'Órdenes', 'GMV'].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: 'left',
                            padding: '0 8px 10px',
                            ...lc(0.35),
                            fontSize: 8,
                            borderBottom: '1px solid rgba(20,34,57,0.07)',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShops.slice(0, 15).map((shop) => (
                      <tr
                        key={`${shop.shopId}-${shop.saleContext}`}
                        style={{ borderBottom: '1px solid rgba(20,34,57,0.04)' }}
                      >
                        <td style={{ padding: '8px 8px', color: NAVY, fontWeight: 600 }}>
                          {shop.shopName}
                        </td>
                        <td style={{ padding: '8px 8px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 9999,
                              fontSize: 9,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              background: shop.saleContext === 'marketplace'
                                ? 'rgba(124,58,237,0.1)'
                                : 'rgba(13,148,136,0.1)',
                              color: shop.saleContext === 'marketplace' ? PURPLE : TEAL,
                            }}
                          >
                            {shop.saleContext === 'marketplace' ? 'MKT' : 'Tienda'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 8px', color: 'rgba(20,34,57,0.6)' }}>
                          {shop.orderCount}
                        </td>
                        <td style={{ padding: '8px 8px', fontWeight: 700, color: NAVY }}>
                          {minor(shop.gmvMinor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(84,67,62,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: SERIF, fontSize: 12, color: 'rgba(84,67,62,0.4)', fontStyle: 'italic' }}>
            Infraestructura comercial · Sistema operativo artesanal
          </p>
          <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.35)' }}>
            Telar Admin · {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </div>
  );
};

export default BackofficeComercialPage;
