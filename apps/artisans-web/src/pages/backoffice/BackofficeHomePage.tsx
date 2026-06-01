import React, { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useBackofficeAccess } from '@/hooks/useBackofficeAccess';
import { useModerationStats } from '@/hooks/useModerationStats';
import { SANS, SERIF, lc, PURPLE, PURPLE_DARK, PURPLE_MID, GREEN_MOD } from '@/components/dashboard/dashboardStyles';

// ─── Design tokens ──────────────────────────────────────────────────────────
const NAVY   = '#142239';
const ORANGE = '#ec6d13';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'Buenos días';
  if (h >= 12 && h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function getFirstName(email: string): string {
  const raw = email.split('@')[0] ?? email;
  return raw.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Sub-card dentro de una sección ─────────────────────────────────────────
interface SubCard {
  icon: string;
  label: string;
  href: string;
  section: string;
  badge?: number;
}

// ─── Main ────────────────────────────────────────────────────────────────────
const BackofficeHomePage: React.FC = () => {
  const { user } = useAuthStore();
  const { isModerator, isAdmin, isSuperAdmin, canAccess } = useBackofficeAccess();
  const { stats, loading, fetchStats } = useModerationStats();
  const navigate = useNavigate();

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (isModerator && !isAdmin) {
    return <Navigate to="/backoffice/moderacion" replace />;
  }

  const name     = getFirstName(user?.email ?? '');
  const greeting = getGreeting();
  const pending  = stats.products.pending_moderation;
  const noBankData = stats.shopsWithoutBankData;

  // ── Negocio sub-cards — visibles para admin y super_admin ─────────────────
  // El card principal "Ver el negocio" siempre se muestra a admins.
  // Los sub-cards respetan los permisos granulares.
  const showNegocio = isAdmin;
  const negocioCards: SubCard[] = [
    { icon: 'package_2',    label: 'Órdenes y pagos',   href: '/backoffice/ordenes',    section: 'ordenes'   },
    { icon: 'people',       label: 'Artesanos y roles',  href: '/backoffice/usuarios',   section: 'usuarios'  },
    { icon: 'handshake',    label: 'Convenios',           href: '/backoffice/convenios',  section: 'convenios' },
    { icon: 'receipt_long', label: 'Auditoría',           href: '/backoffice/auditoria',  section: 'auditoria' },
  ].filter(c => canAccess(c.section as any));

  // ── Moderación sub-cards (admin + super_admin) ───────────────────────────
  const moderacionCards: SubCard[] = [
    { icon: 'shield_person',  label: 'Cola de moderación',    href: '/backoffice/moderacion',        section: 'moderation',         badge: pending || undefined },
    { icon: 'health_metrics', label: 'Salud del marketplace', href: '/backoffice/marketplace-health', section: 'marketplace-health' },
    { icon: 'store',          label: 'Gestionar talleres',    href: '/backoffice/tiendas',            section: 'tiendas',            badge: noBankData || undefined },
    { icon: 'category',       label: 'Taxonomías',             href: '/backoffice/taxonomia',          section: 'taxonomia'  },
    { icon: 'auto_stories',   label: 'Historias',              href: '/backoffice/historias',          section: 'historias'  },
    { icon: 'collections',    label: 'Colecciones',            href: '/backoffice/colecciones',        section: 'colecciones'},
    { icon: 'bar_chart',      label: 'Analytics',              href: '/backoffice/analytics',          section: 'analytics'  },
  ].filter(c => canAccess(c.section as any));

  const v = (n: number) => loading ? '—' : String(n);

  return (
    <div style={{
      backgroundColor: '#f9f7f2',
      backgroundImage: `
        radial-gradient(circle at top left, rgba(167,139,250,0.2) 0%, transparent 40%),
        radial-gradient(circle at bottom right, rgba(187,247,208,0.2) 0%, transparent 44%),
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
          {/* Left: brand */}
          <div className="flex items-center gap-3">
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: `linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(21,128,61,0.12) 100%)`,
              border: '1px solid rgba(84,67,62,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: PURPLE }}>admin_panel_settings</span>
            </div>
            <div>
              <p style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: '#151b2d', lineHeight: 1.2 }}>Backoffice</p>
              <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 500, color: 'rgba(84,67,62,0.6)', marginTop: 1 }}>
                {greeting}, {name}
              </p>
            </div>
          </div>
          {/* Right: domain chips */}
          <div className="flex items-center gap-2">
            <span style={{ display:'flex', alignItems:'center', gap:5, fontFamily:SANS, fontSize:10, fontWeight:700, color:PURPLE, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:PURPLE, display:'inline-block' }} /> Negocio
            </span>
            <span style={{ width:1, height:12, background:'rgba(84,67,62,0.15)' }} />
            <span style={{ display:'flex', alignItems:'center', gap:5, fontFamily:SANS, fontSize:10, fontWeight:700, color:GREEN_MOD, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:GREEN_MOD, display:'inline-block' }} /> Moderación
            </span>
          </div>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">

        {/* ── KPIs ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:'Cola de mod.',  sub:'esperando revisión', value: v(pending),               icon:'shield_person', accent: pending > 0 ? PURPLE : undefined },
            { label:'Talleres',      sub:'registrados',         value: v(stats.shops.all),       icon:'storefront',   accent: undefined },
            { label:'En marketplace',sub:'publicados',          value: v(stats.publishedShops),  icon:'store',        accent: undefined },
            { label:'Sin cobro',     sub:'datos bancarios',     value: v(stats.shopsWithoutBankData), icon:'account_balance', accent: stats.shopsWithoutBankData > 0 ? '#ec6d13' : undefined },
          ].map(k => (
            <div key={k.label}
              style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: k.accent ? `1px solid ${k.accent}30` : '1px solid rgba(255,255,255,0.65)',
                borderRadius: 24,
                boxShadow: '0 4px 20px rgba(21,27,45,0.02)',
              }}
              className="p-5 h-32 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span style={{ fontFamily:SANS, fontSize:10, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', color: k.accent ? k.accent : 'rgba(84,67,62,0.5)' }}>{k.label}</span>
                  <p style={{ fontFamily:SANS, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(84,67,62,0.4)', marginTop:2 }}>{k.sub}</p>
                </div>
                <span className="material-symbols-outlined" style={{ color: k.accent ? `${k.accent}50` : 'rgba(21,27,45,0.15)', fontSize:20 }}>{k.icon}</span>
              </div>
              <div style={{ fontFamily:SANS, fontSize:36, fontWeight:700, color: k.accent ?? '#151b2d', lineHeight:1.1 }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* ── SECCIÓN NEGOCIO ──────────────────────────────────────────── */}
        {showNegocio && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:PURPLE, display:'inline-block', flexShrink:0 }} />
                <span style={{ ...lc(0.45), fontSize:10 }}>El negocio</span>
              </span>
              <div style={{ flex:1, height:1, background:'rgba(124,58,237,0.1)' }} />
            </div>

            {/* Glass card contenedor */}
            <div style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(124,58,237,0.12)',
              borderRadius: 32,
              boxShadow: '0 4px 20px rgba(124,58,237,0.04)',
              padding: 32,
            }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Hero — Ver el negocio */}
                <button
                  onClick={() => navigate('/backoffice/dashboard')}
                  className="lg:col-span-2 group text-left rounded-2xl p-7 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${PURPLE_DARK} 0%, ${PURPLE_MID} 60%, ${PURPLE_DARK} 100%)`,
                    boxShadow: '0 6px 24px rgba(124,58,237,0.25)',
                  }}
                >
                  <div style={{ position:'absolute', top:-30, right:-30, width:200, height:200, background:'radial-gradient(circle, rgba(167,139,250,0.22) 0%, transparent 70%)', pointerEvents:'none' }} />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                      style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.15)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize:20, color:'rgba(196,181,253,1)' }}>monitoring</span>
                    </div>
                    <h2 style={{ fontFamily:SERIF, fontSize:20, fontWeight:700, color:'white', lineHeight:1.3, marginBottom:6 }}>
                      Ver el negocio
                    </h2>
                    <p style={{ fontFamily:SANS, fontSize:12, color:'rgba(255,255,255,0.55)', lineHeight:1.6, marginBottom:20 }}>
                      Dashboard estratégico · salud · economía · impacto
                    </p>
                    <div className="flex gap-6">
                      {[
                        { n: v(stats.products.approved), label:'piezas aprobadas' },
                        { n: v(stats.shops.approved),    label:'talleres en mkt'  },
                      ].map(({ n, label }) => (
                        <div key={label}>
                          <p style={{ fontFamily:SANS, fontSize:22, fontWeight:800, color:'white', lineHeight:1 }}>{n}</p>
                          <p style={{ ...lc(1), color:'rgba(255,255,255,0.35)', fontSize:8 }}>{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="absolute right-5 bottom-5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color:'white', width:16, height:16 }} />
                </button>

                {/* Sub-cards columna derecha */}
                <div className="flex flex-col gap-3">
                  {negocioCards.filter(c => c.section !== 'dashboard').map(c => (
                    <button key={c.href} onClick={() => navigate(c.href)}
                      className="group text-left rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background:'rgba(124,58,237,0.04)', border:'1px solid rgba(124,58,237,0.1)', boxShadow:'0 2px 8px rgba(124,58,237,0.04)' }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background:'rgba(124,58,237,0.09)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize:17, color:PURPLE }}>{c.icon}</span>
                      </div>
                      <span style={{ fontFamily:SANS, fontSize:13, fontWeight:700, color:'#151b2d' }}>{c.label}</span>
                      <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:PURPLE, width:14, height:14 }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── SECCIÓN MODERACIÓN ───────────────────────────────────────── */}
        {moderacionCards.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:GREEN_MOD, display:'inline-block', flexShrink:0 }} />
                <span style={{ ...lc(0.45), fontSize:10 }}>Moderación y operación</span>
              </span>
              <div style={{ flex:1, height:1, background:'rgba(21,128,61,0.1)' }} />
              {pending > 0 && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background:'rgba(21,128,61,0.08)', border:'1px solid rgba(21,128,61,0.18)' }}>
                  <Clock style={{ width:10, height:10, color:GREEN_MOD }} />
                  <span style={{ ...lc(1), color:GREEN_MOD, fontSize:9 }}>{pending} pendientes</span>
                </span>
              )}
            </div>

            {/* Glass card contenedor */}
            <div style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(21,128,61,0.1)',
              borderRadius: 32,
              boxShadow: '0 4px 20px rgba(21,128,61,0.04)',
              padding: 32,
            }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {moderacionCards.map(card => (
                  <button key={card.href} onClick={() => navigate(card.href)}
                    className="group text-left rounded-2xl p-5 relative transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: card.badge ? 'rgba(21,128,61,0.05)' : 'rgba(255,255,255,0.7)',
                      border: card.badge ? '1px solid rgba(21,128,61,0.2)' : '1px solid rgba(21,128,61,0.08)',
                      boxShadow: '0 2px 8px rgba(21,128,61,0.04)',
                    }}
                  >
                    {card.badge != null && card.badge > 0 && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full"
                        style={{ background:GREEN_MOD, }}>
                        <span style={{ fontFamily:SANS, fontSize:10, fontWeight:800, color:'white' }}>{card.badge}</span>
                      </div>
                    )}
                    <span className="material-symbols-outlined mb-3 block"
                      style={{ fontSize:22, color: card.badge ? GREEN_MOD : 'rgba(21,128,61,0.4)' }}>
                      {card.icon}
                    </span>
                    <p style={{ fontFamily:SANS, fontSize:12, fontWeight:700, color:'#151b2d', lineHeight:1.3 }}>
                      {card.label}
                    </p>
                    <ArrowRight className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color:GREEN_MOD, width:13, height:13 }} />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-2 pb-6"
          style={{ borderTop:'1px solid rgba(84,67,62,0.08)' }}>
          <p style={{ fontFamily:SERIF, fontSize:13, color:'rgba(84,67,62,0.4)', fontStyle:'italic' }}>
            Infraestructura cultural · Sistema operativo artesanal
          </p>
          <div className="flex gap-8">
            {[
              { n: v(stats.products.approved),  label:'piezas aprobadas',   color: PURPLE   },
              { n: v(stats.shopsWithBankData),   label:'con datos de cobro', color: GREEN_MOD },
            ].map(({ n, label, color }) => (
              <div key={label} className="text-center">
                <p style={{ fontFamily:SANS, fontSize:20, fontWeight:800, color, lineHeight:1 }}>{n}</p>
                <p style={{ ...lc(0.3), fontSize:8, marginTop:3 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackofficeHomePage;
