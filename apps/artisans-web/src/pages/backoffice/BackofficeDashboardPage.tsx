import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, AlertTriangle, Clock, TrendingUp, Shield } from 'lucide-react';
import { useModerationStats } from '@/hooks/useModerationStats';
import { useAuthStore } from '@/stores/authStore';
import { SANS, SERIF, lc, formatCurrency, PURPLE, PURPLE_DARK, PURPLE_MID, GREEN_MOD } from '@/components/dashboard/dashboardStyles';

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY  = '#142239';
const GREEN = '#166534';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pct(num: number, den: number) {
  if (!den) return 0;
  return Math.round((num / den) * 100);
}

function getFirstName(email: string): string {
  const raw = email.split('@')[0] ?? email;
  return raw.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  value: string;
  label: string;
  sub?: string;
  urgent?: boolean;
  icon?: React.ReactNode;
  trend?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ value, label, sub, urgent, icon, trend }) => (
  <div
    style={{
      background: urgent ? 'rgba(124,58,237,0.07)' : 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: urgent ? '1px solid rgba(124,58,237,0.2)' : '1px solid rgba(255,255,255,0.65)',
      borderRadius: 20,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      boxShadow: '0 2px 12px rgba(20,34,57,0.06)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ ...lc(0.35), fontSize: 9 }}>{label}</span>
      {icon && <span style={{ color: urgent ? PURPLE : 'rgba(20,34,57,0.25)' }}>{icon}</span>}
    </div>
    <span style={{ fontFamily: SANS, fontSize: 40, fontWeight: 800, color: urgent ? PURPLE : NAVY, lineHeight: 1 }}>
      {value}
    </span>
    {sub && <span style={{ fontFamily: SERIF, fontSize: 12, color: 'rgba(20,34,57,0.4)', fontStyle: 'italic', marginTop: 2 }}>{sub}</span>}
    {trend && <span style={{ ...lc(0.5), fontSize: 9, color: GREEN, marginTop: 4 }}>{trend}</span>}
  </div>
);

interface FunnelStepProps {
  n: number | string;
  label: string;
  pctVal?: number;
  isLast?: boolean;
  highlight?: boolean;
}

const FunnelStep: React.FC<FunnelStepProps> = ({ n, label, pctVal, isLast, highlight }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
    <div style={{
      width: '100%',
      padding: '16px 12px',
      borderRadius: 14,
      background: highlight ? `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE_MID} 100%)` : 'rgba(20,34,57,0.04)',
      border: highlight ? 'none' : '1px solid rgba(20,34,57,0.07)',
      textAlign: 'center',
    }}>
      <p style={{ fontFamily: SANS, fontSize: 28, fontWeight: 800, color: highlight ? 'white' : NAVY, lineHeight: 1, marginBottom: 4 }}>{n}</p>
      <p style={{ ...lc(highlight ? 0.6 : 0.4), fontSize: 8, color: highlight ? 'rgba(255,255,255,0.55)' : undefined }}>{label}</p>
      {pctVal != null && (
        <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: highlight ? 'rgba(255,255,255,0.4)' : 'rgba(20,34,57,0.3)', marginTop: 6 }}>
          {pctVal}%
        </p>
      )}
    </div>
    {!isLast && (
      <div style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
        <ArrowRight style={{ width: 14, height: 14, color: 'rgba(20,34,57,0.2)' }} />
      </div>
    )}
  </div>
);

interface StatusBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ label, value, total, color }) => {
  const p = pct(value, total);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ ...lc(0.4), fontSize: 9 }}>{label}</span>
        <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: NAVY }}>{value}</span>
      </div>
      <div style={{ height: 5, background: 'rgba(20,34,57,0.07)', borderRadius: 999 }}>
        <div style={{ height: '100%', width: `${p}%`, background: color, borderRadius: 999, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const BackofficeDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { stats, loading, fetchStats } = useModerationStats();
  const navigate = useNavigate();

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const name = getFirstName(user?.email ?? '');

  // Derived values
  const totalShops        = stats.shops.all;
  const publishedShops    = stats.publishedShops;
  const approvedShops     = stats.shops.approved;
  const shopsWithCobro    = stats.shopsWithBankData;

  const totalProducts     = Object.values(stats.products).reduce((a, b) => a + b, 0);
  const approvedProducts  = stats.products.approved + stats.products.approved_with_edits;
  const pendingProducts   = stats.products.pending_moderation;
  const draftProducts     = stats.products.draft;
  const changesProducts   = stats.products.changes_requested;
  const rejectedProducts  = stats.products.rejected;

  // Ecosystem health score (0-100)
  const healthFactors = [
    pct(shopsWithCobro, totalShops || 1),         // cobros listos
    pct(publishedShops, totalShops || 1),           // publicadas
    pct(approvedShops, totalShops || 1),            // aprobadas
    pendingProducts === 0 ? 100 : Math.max(0, 100 - pendingProducts * 2), // cola limpia
    approvedProducts > 0 ? 100 : 0,                // catálogo vivo
  ];
  const healthScore = Math.round(healthFactors.reduce((a, b) => a + b, 0) / healthFactors.length);

  // Regional distribution
  const regionMap: Record<string, number> = {};
  stats.shopDetails.all.forEach(s => {
    const r = s.region ?? 'Sin región';
    regionMap[r] = (regionMap[r] ?? 0) + 1;
  });
  const regions = Object.entries(regionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Craft type distribution
  const craftMap: Record<string, number> = {};
  stats.shopDetails.all.forEach(s => {
    const c = s.craftType ?? 'Sin especificar';
    craftMap[c] = (craftMap[c] ?? 0) + 1;
  });
  const crafts = Object.entries(craftMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const activeRegions = Object.keys(regionMap).filter(r => r !== 'Sin región').length;
  const activeCrafts  = Object.keys(craftMap).filter(c => c !== 'Sin especificar').length;

  const v = (n: number) => loading ? '—' : String(n);

  const glassCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.65)',
    borderRadius: 28,
    boxShadow: '0 4px 20px rgba(21,27,45,0.03)',
  };

  const SL = ({ dot, text, right }: { dot: string; text: string; right?: React.ReactNode }) => (
    <div className="flex items-center gap-3 mb-5">
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ ...lc(0.45), fontSize: 10 }}>{text}</span>
      </span>
      <div style={{ flex: 1, height: 1, background: `${dot}22` }} />
      {right}
    </div>
  );

  return (
    <div style={{
      backgroundColor: '#f9f7f2',
      backgroundImage: `
        radial-gradient(circle at top left, rgba(167,139,250,0.2) 0%, transparent 40%),
        radial-gradient(circle at bottom right, rgba(187,247,208,0.18) 0%, transparent 44%),
        radial-gradient(circle at top right, rgba(255,244,223,0.7) 0%, transparent 36%)
      `,
      backgroundAttachment: 'fixed',
      fontFamily: SANS,
      minHeight: '100vh',
    }}>

      {/* ── Sticky header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 px-8 py-4"
        style={{
          background: 'rgba(249,247,242,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(84,67,62,0.08)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/backoffice/home')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(84,67,62,0.4)' }}>arrow_back</span>
            </button>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(76,29,149,0.1) 100%)`,
              border: '1px solid rgba(124,58,237,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 17, color: PURPLE }}>monitoring</span>
            </div>
            <div>
              <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: '#151b2d', lineHeight: 1.2 }}>El Negocio</p>
              <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, color: 'rgba(84,67,62,0.55)', marginTop: 1 }}>Vista estratégica · {name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: healthScore >= 70 ? 'rgba(22,101,52,0.07)' : healthScore >= 40 ? 'rgba(124,58,237,0.07)' : 'rgba(236,109,19,0.07)',
              border: `1px solid ${healthScore >= 70 ? 'rgba(22,101,52,0.2)' : healthScore >= 40 ? 'rgba(124,58,237,0.2)' : 'rgba(236,109,19,0.2)'}`,
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: healthScore >= 70 ? GREEN : healthScore >= 40 ? PURPLE : '#ec6d13' }}>favorite</span>
            <span style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: healthScore >= 70 ? GREEN : healthScore >= 40 ? PURPLE : '#ec6d13', lineHeight: 1 }}>
              {loading ? '—' : healthScore}
            </span>
            <span style={{ ...lc(0.5), fontSize: 8 }}>salud</span>
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">

        {/* ── KPIs ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Talleres',   sub: 'registrados',       value: v(totalShops),       icon: 'storefront',      accent: undefined },
            { label: 'Piezas',     sub: 'aprobadas en mkt',  value: v(approvedProducts), icon: 'package_2',       accent: undefined },
            { label: 'Con cobro',  sub: 'datos bancarios',   value: `${pct(shopsWithCobro, totalShops)}%`, icon: 'account_balance', accent: pct(shopsWithCobro, totalShops) < 50 ? PURPLE : undefined },
            { label: 'Cola mod.',  sub: 'esperando revisión',value: v(pendingProducts),  icon: 'shield_person',   accent: pendingProducts > 0 ? PURPLE : undefined },
          ].map(k => (
            <div key={k.label} style={{ ...glassCard, borderRadius: 24, border: k.accent ? `1px solid ${k.accent}25` : '1px solid rgba(255,255,255,0.65)' }}
              className="p-5 h-32 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: k.accent ?? 'rgba(84,67,62,0.5)' }}>{k.label}</span>
                  <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(84,67,62,0.4)', marginTop: 2 }}>{k.sub}</p>
                </div>
                <span className="material-symbols-outlined" style={{ color: k.accent ? `${k.accent}50` : 'rgba(21,27,45,0.15)', fontSize: 20 }}>{k.icon}</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 36, fontWeight: 700, color: k.accent ?? '#151b2d', lineHeight: 1.1 }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* ── Funnel ────────────────────────────────────────────────────── */}
        <section>
          <SL dot={PURPLE} text="Funnel de talleres" />
          <div style={{ ...glassCard, padding: '28px 32px' }}>
            <div className="flex gap-3 items-stretch">
              <FunnelStep n={v(totalShops)}     label="Registrados"        highlight />
              <FunnelStep n={v(publishedShops)} label="Publicados"         pctVal={pct(publishedShops, totalShops)} />
              <FunnelStep n={v(approvedShops)}  label="Aprobados MKT"      pctVal={pct(approvedShops, totalShops)} />
              <FunnelStep n={v(shopsWithCobro)} label="Con datos de cobro" pctVal={pct(shopsWithCobro, totalShops)} isLast />
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 12, color: 'rgba(84,67,62,0.45)', fontStyle: 'italic', marginTop: 18, textAlign: 'center' }}>
              {loading ? '—' : `${pct(shopsWithCobro, totalShops)}% de los talleres registrados están listos para cobrar`}
            </p>
          </div>
        </section>

        {/* ── Catálogo + Regiones ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <SL dot={PURPLE} text="Pipeline del catálogo" />
            <div style={{ ...glassCard, padding: '24px 28px' }}>
              <StatusBar label="Aprobadas"          value={approvedProducts} total={totalProducts} color={GREEN} />
              <StatusBar label="En cola"             value={pendingProducts}  total={totalProducts} color={PURPLE} />
              <StatusBar label="Cambios solicitados" value={changesProducts}  total={totalProducts} color="#a78bfa" />
              <StatusBar label="Borrador"            value={draftProducts}    total={totalProducts} color="rgba(84,67,62,0.2)" />
              <StatusBar label="Rechazadas"          value={rejectedProducts} total={totalProducts} color="#ef4444" />
              <div style={{ borderTop: '1px solid rgba(84,67,62,0.08)', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: SERIF, fontSize: 12, color: 'rgba(84,67,62,0.45)', fontStyle: 'italic' }}>Total en sistema</span>
                <span style={{ fontFamily: SANS, fontSize: 24, fontWeight: 800, color: PURPLE }}>{v(totalProducts)}</span>
              </div>
            </div>
          </section>

          <section>
            <SL dot={PURPLE} text="Distribución territorial" />
            <div style={{ ...glassCard, padding: '24px 28px', minHeight: 220 }}>
              {regions.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: 40 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'rgba(84,67,62,0.15)', display: 'block', marginBottom: 8 }}>map</span>
                  <p style={{ fontFamily: SERIF, fontSize: 13, color: 'rgba(84,67,62,0.35)', fontStyle: 'italic' }}>Sin datos de región aún</p>
                </div>
              ) : (
                <>
                  {regions.map(([region, count]) => (
                    <StatusBar key={region} label={region} value={count} total={totalShops} color={PURPLE} />
                  ))}
                  <p style={{ fontFamily: SERIF, fontSize: 12, color: 'rgba(84,67,62,0.4)', fontStyle: 'italic', marginTop: 12 }}>
                    {regions.length} regiones · {v(totalShops)} talleres
                  </p>
                </>
              )}
            </div>
          </section>
        </div>

        {/* ── Impacto cultural ─────────────────────────────────────────── */}
        <section>
          <SL dot={PURPLE} text="Impacto cultural" />
          <div style={{
            background: `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE_MID} 100%)`,
            borderRadius: 28,
            padding: '32px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, background: 'radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {[
                { n: v(publishedShops),   label: 'artesanos activos',       icon: 'person_apron' },
                { n: v(activeCrafts),     label: 'técnicas presentes',       icon: 'palette' },
                { n: v(activeRegions),    label: 'regiones representadas',   icon: 'map' },
                { n: v(approvedProducts), label: 'piezas en el marketplace', icon: 'inventory_2' },
              ].map(({ n, label, icon }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(196,181,253,0.45)', display: 'block', marginBottom: 8 }}>{icon}</span>
                  <p style={{ fontFamily: SANS, fontSize: 30, fontWeight: 800, color: 'white', lineHeight: 1, marginBottom: 4 }}>{n}</p>
                  <p style={{ ...lc(1), color: 'rgba(196,181,253,0.45)', fontSize: 8 }}>{label}</p>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 12, color: 'rgba(196,181,253,0.35)', fontStyle: 'italic', textAlign: 'center', marginTop: 24 }}>
              Preservando el patrimonio artesanal colombiano
            </p>
          </div>
        </section>

        {/* ── Técnicas ─────────────────────────────────────────────────── */}
        {crafts.length > 0 && (
          <section>
            <SL dot={PURPLE} text="Técnicas en el ecosistema" right={<span style={{ ...lc(0.3), fontSize: 9 }}>{activeCrafts} técnicas</span>} />
            <div style={{ ...glassCard, padding: '24px 28px' }}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {crafts.slice(0, 4).map(([craft, count]) => (
                  <div key={craft} style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.08)', borderRadius: 16, padding: '14px 16px', textAlign: 'center' }}>
                    <p style={{ fontFamily: SANS, fontSize: 24, fontWeight: 800, color: PURPLE, lineHeight: 1, marginBottom: 4 }}>{count}</p>
                    <p style={{ ...lc(0.4), fontSize: 8, textAlign: 'center' }}>{craft}</p>
                  </div>
                ))}
              </div>
              {crafts.slice(4).map(([craft, count]) => (
                <StatusBar key={craft} label={craft} value={count} total={totalShops} color={PURPLE} />
              ))}
            </div>
          </section>
        )}

        {/* ── Radar de salud ──────────────────────────────────────────── */}
        <section>
          <SL dot={PURPLE} text="Radar de salud del ecosistema" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Con cobro',     value: pct(shopsWithCobro, totalShops),   icon: 'payments',     warn: pct(shopsWithCobro, totalShops) < 50 },
              { label: 'Publicados',    value: pct(publishedShops, totalShops),   icon: 'storefront',   warn: pct(publishedShops, totalShops) < 50 },
              { label: 'Aprobados',     value: pct(approvedShops, totalShops),    icon: 'verified',     warn: pct(approvedShops, totalShops) < 60 },
              { label: 'Cola limpia',   value: pendingProducts === 0 ? 100 : Math.max(0, 100 - pendingProducts * 2), icon: 'shield_check', warn: pendingProducts > 5 },
              { label: 'Catálogo vivo', value: approvedProducts > 0 ? pct(approvedProducts, totalProducts) : 0, icon: 'package_2', warn: approvedProducts === 0 },
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: item.warn ? `1px solid ${PURPLE}25` : '1px solid rgba(255,255,255,0.65)',
                borderRadius: 20,
                padding: '16px 18px',
                boxShadow: '0 2px 8px rgba(21,27,45,0.03)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: item.warn ? PURPLE : 'rgba(84,67,62,0.25)', display: 'block', marginBottom: 8 }}>{item.icon}</span>
                <p style={{ fontFamily: SANS, fontSize: 26, fontWeight: 800, color: item.warn ? PURPLE : '#151b2d', lineHeight: 1, marginBottom: 4 }}>
                  {loading ? '—' : `${item.value}%`}
                </p>
                <p style={{ ...lc(0.4), fontSize: 8 }}>{item.label}</p>
                <div style={{ height: 3, background: 'rgba(84,67,62,0.08)', borderRadius: 999, marginTop: 10 }}>
                  <div style={{ height: '100%', width: `${loading ? 0 : item.value}%`, background: item.warn ? PURPLE : '#151b2d', borderRadius: 999, transition: 'width 0.8s ease', opacity: 0.5 }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Acciones rápidas ─────────────────────────────────────────── */}
        <section>
          <SL dot={PURPLE} text="Acciones rápidas" />
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Revisar cola',       href: '/backoffice/moderacion', badge: pendingProducts,            icon: 'shield_person' },
              { label: 'Gestionar talleres', href: '/backoffice/tiendas',    badge: stats.shopsWithoutBankData, icon: 'store' },
              { label: 'Artesanos y roles',  href: '/backoffice/usuarios',   icon: 'people' },
              { label: 'Órdenes y pagos',    href: '/backoffice/ordenes',    icon: 'package_2' },
              { label: 'Auditoría',          href: '/backoffice/auditoria',  icon: 'receipt_long' },
            ].map(item => (
              <button key={item.href} onClick={() => navigate(item.href)}
                className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all hover:scale-[1.02]"
                style={{
                  background: 'rgba(255,255,255,0.82)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: `1px solid ${PURPLE}18`,
                  boxShadow: '0 2px 8px rgba(21,27,45,0.04)',
                }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: PURPLE }}>{item.icon}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#151b2d' }}>{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span style={{ background: PURPLE, color: 'white', borderRadius: 999, padding: '1px 7px', fontFamily: SANS, fontSize: 10, fontWeight: 800 }}>{item.badge}</span>
                )}
                <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ width: 12, height: 12, color: PURPLE }} />
              </button>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 pb-6" style={{ borderTop: '1px solid rgba(84,67,62,0.08)' }}>
          <p style={{ fontFamily: SERIF, fontSize: 13, color: 'rgba(84,67,62,0.4)', fontStyle: 'italic' }}>
            Infraestructura cultural · Sistema operativo artesanal
          </p>
          <p style={{ ...lc(0.25), fontSize: 8 }}>Telar Admin · {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default BackofficeDashboardPage;
