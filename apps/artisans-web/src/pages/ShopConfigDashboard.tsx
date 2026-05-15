import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { useAuth } from '@/context/AuthContext';
import { useUnifiedUserData } from '@/hooks/user';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useMasterAgent } from '@/context/MasterAgentContext';

// ── TELAR Design System (mismo que CommercialDashboard) ───────────────────────
const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

const glassPrimary: React.CSSProperties = {
  background:           'rgba(255,255,255,0.82)',
  backdropFilter:       'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border:               '1px solid rgba(255,255,255,0.65)',
  boxShadow:            '0 4px 20px rgba(21,27,45,0.02)',
};

// ── Pill badge ─────────────────────────────────────────────────────────────────
type PillVariant = 'success' | 'warning' | 'draft';
const PILL: Record<PillVariant, React.CSSProperties> = {
  success: { background: 'rgba(22,101,52,0.1)',  color: '#166534' },
  warning: { background: 'rgba(236,109,19,0.1)', color: '#ec6d13' },
  draft:   { background: 'rgba(21,27,45,0.06)',  color: 'rgba(84,67,62,0.6)' },
};
const Pill: React.FC<{ children: React.ReactNode; variant?: PillVariant }> = ({ children, variant = 'draft' }) => (
  <span style={{ ...PILL[variant], borderRadius: 9999, padding: '2px 10px', fontFamily: SANS, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'inline-block', whiteSpace: 'nowrap' }}>
    {children}
  </span>
);

// ── MetricCard ─────────────────────────────────────────────────────────────────
const MetricCard: React.FC<{ label: string; value: React.ReactNode; sub: string; icon: string }> = ({ label, value, sub, icon }) => (
  <div style={{ ...glassPrimary, borderRadius: 16 }} className="px-5 h-16 flex items-center gap-4">
    <span className="material-symbols-outlined shrink-0" style={{ color: 'rgba(21,27,45,0.18)', fontSize: 18 }}>{icon}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(84,67,62,0.45)' }}>{label}</span>
      <p style={{ fontFamily: SANS, fontSize: 9, color: 'rgba(84,67,62,0.35)', marginTop: 1 }}>{sub}</p>
    </div>
    <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: '#151b2d', lineHeight: 1, flexShrink: 0 }}>{value}</div>
  </div>
);

// ── OrangeBtn / OutlineBtn ─────────────────────────────────────────────────────
const OrangeBtn: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <button onClick={onClick}
    className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:opacity-90 hover:scale-[1.02]"
    style={{ background: '#ec6d13', color: 'white', fontFamily: SANS, fontSize: 13, fontWeight: 700, boxShadow: '0 4px 12px rgba(236,109,19,0.3)' }}>
    {children}
  </button>
);
const OutlineBtn: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <button onClick={onClick}
    className={cn('flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:bg-white/60')}
    style={{ border: '1px solid rgba(21,27,45,0.1)', color: '#151b2d', fontFamily: SANS, fontSize: 13, fontWeight: 700 }}>
    {children}
  </button>
);

// ── Bento types ───────────────────────────────────────────────────────────────
type SectionStatus = 'complete' | 'partial' | 'empty';

const STATUS_PILL: Record<SectionStatus, { variant: PillVariant; label: string }> = {
  complete: { variant: 'success', label: 'Completo' },
  partial:  { variant: 'warning', label: 'En progreso' },
  empty:    { variant: 'draft',   label: 'Pendiente' },
};

const EditBtn: React.FC<{ label?: string; onClick: () => void }> = ({ label = 'Editar', onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '6px 14px', borderRadius: 9999, border: 'none', cursor: 'pointer',
      background: 'rgba(21,27,45,0.06)', color: '#151b2d',
      fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
    }}
  >
    {label}
    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_forward</span>
  </button>
);

// ── Preview Panel ──────────────────────────────────────────────────────────────
const PreviewPanel: React.FC<{ shop: any }> = ({ shop }) => {
  const [tab, setTab] = useState<'marketplace' | 'ecommerce' | 'mobile'>('marketplace');
  const name   = shop?.shopName   ?? 'Tu tienda';
  const claim  = shop?.brandClaim ?? '';
  const banner = shop?.bannerUrl  ?? '';
  const logo   = shop?.logoUrl    ?? '';
  const color  = shop?.primaryColors?.[0] ?? '#ec6d13';

  return (
    <div style={{ position: 'sticky', top: 24 }}>
      <div style={{ ...glassPrimary, borderRadius: 28, overflow: 'hidden' }}>
        {/* Tab bar */}
        <div style={{ padding: '14px 18px 0', display: 'flex', gap: 4, borderBottom: '1px solid rgba(21,27,45,0.05)' }}>
          {([
            { id: 'marketplace' as const, icon: 'store',        label: 'Marketplace' },
            { id: 'ecommerce'   as const, icon: 'shopping_bag', label: 'E-commerce'  },
            { id: 'mobile'      as const, icon: 'smartphone',   label: 'Móvil'       },
          ]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '6px 11px', borderRadius: '8px 8px 0 0', border: 'none',
                background: tab === t.id ? 'rgba(236,109,19,0.07)' : 'transparent',
                cursor: 'pointer', fontFamily: SANS, fontSize: 10, fontWeight: 700,
                color: tab === t.id ? '#ec6d13' : 'rgba(84,67,62,0.5)',
                display: 'flex', alignItems: 'center', gap: 4,
                borderBottom: tab === t.id ? '2px solid #ec6d13' : '2px solid transparent',
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Mockup */}
        <div style={{ background: '#f5f0e8', minHeight: 300 }}>
          {tab === 'marketplace' && (
            <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 180, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', background: 'white' }}>
                <div style={{ aspectRatio: '4/3', background: banner ? 'transparent' : 'rgba(21,27,45,0.05)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {banner ? <img src={banner} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'rgba(21,27,45,0.1)' }}>store</span>}
                </div>
                <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {logo ? <img src={logo} style={{ width: 20, height: 20, borderRadius: 5, objectFit: 'contain', flexShrink: 0 }} alt="" /> : <div style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(21,27,45,0.06)', flexShrink: 0 }} />}
                  <div>
                    <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, color: '#151b2d', lineHeight: 1.2 }}>{name}</p>
                    {claim && <p style={{ fontFamily: SANS, fontSize: 8, color: 'rgba(84,67,62,0.5)', lineHeight: 1.3, marginTop: 1 }}>{claim.slice(0, 35)}{claim.length > 35 ? '…' : ''}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === 'ecommerce' && (
            <div>
              <div style={{ background: 'white', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(21,27,45,0.05)' }}>
                {logo ? <img src={logo} style={{ width: 26, height: 26, borderRadius: 7, objectFit: 'contain' }} alt="" /> : <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(21,27,45,0.06)' }} />}
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, color: '#151b2d' }}>{name}</p>
                  {claim && <p style={{ fontFamily: SANS, fontSize: 9, color: 'rgba(84,67,62,0.45)' }}>{claim}</p>}
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 6, background: color, color: 'white', fontFamily: SANS, fontSize: 8, fontWeight: 800 }}>Comprar</div>
              </div>
              <div style={{ height: 80, background: banner ? 'transparent' : 'rgba(21,27,45,0.04)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {banner ? <img src={banner} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} alt="" /> : <span style={{ fontFamily: SANS, fontSize: 9, color: 'rgba(21,27,45,0.18)' }}>Hero banner</span>}
              </div>
              <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ borderRadius: 8, overflow: 'hidden', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ aspectRatio: '1', background: 'rgba(21,27,45,0.04)' }} />
                    <div style={{ padding: '5px 7px' }}>
                      <div style={{ height: 5, borderRadius: 3, background: 'rgba(21,27,45,0.07)', marginBottom: 4 }} />
                      <div style={{ height: 16, borderRadius: 5, background: color, opacity: 0.8 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'mobile' && (
            <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 148, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'white' }}>
                <div style={{ padding: '7px 11px', display: 'flex', alignItems: 'center', gap: 5, borderBottom: '1px solid rgba(21,27,45,0.05)' }}>
                  {logo ? <img src={logo} style={{ width: 18, height: 18, borderRadius: 4, objectFit: 'contain' }} alt="" /> : <div style={{ width: 18, height: 18, borderRadius: 4, background: 'rgba(21,27,45,0.06)' }} />}
                  <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, color: '#151b2d' }}>{name}</span>
                </div>
                <div style={{ height: 65, background: banner ? 'transparent' : 'rgba(21,27,45,0.04)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {banner && <img src={banner} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} alt="" />}
                </div>
                <div style={{ padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                  {[1,2,3,4].map(i => <div key={i} style={{ borderRadius: 5, background: 'rgba(21,27,45,0.04)', aspectRatio: '1' }} />)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(21,27,45,0.04)' }}>
          <p style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.4)', lineHeight: 1.5 }}>Vista previa · Template Artesano activo</p>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════
const ShopConfigDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const { shop, loading } = useArtisanShop();
  const { masterState } = useMasterAgent();
  const { profile } = useUnifiedUserData();

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 32, color: '#ec6d13' }}>progress_activity</span>
    </div>
  );
  if (!shop) return (
    <div className="flex-1 flex items-center justify-center">
      <p style={{ fontFamily: SANS, color: 'rgba(84,67,62,0.6)' }}>Tienda no encontrada</p>
    </div>
  );

  const s = shop as any;
  const userName = masterState.perfil?.nombre || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Artesano';
  const shopName = s.shopName || userName;

  // ── Status computation ────────────────────────────────────────────────────
  const brandDone    = !!(s.logoUrl && s.brandClaim);
  const brandPartial = !brandDone && !!(s.logoUrl || s.brandClaim || s.shopName);
  const heroDone     = !!(s.bannerUrl || s.heroConfig?.slides?.length > 0);
  const contactDone  = !!(s.contactConfig?.whatsapp || s.contactConfig?.email);
  const policiesDone = !!(s.idPoliciesConfig);
  const profileDone  = !!s.artisanProfileCompleted;
  const fiscalDone   = !!(profile?.rut && !profile?.rutPendiente);
  const paymentDone  = !!(s.idContraparty);

  const toStatus = (done: boolean, partial = false): SectionStatus =>
    done ? 'complete' : partial ? 'partial' : 'empty';

  const sections: SectionStatus[] = [
    toStatus(brandDone, brandPartial),
    toStatus(heroDone),
    toStatus(contactDone),
    toStatus(policiesDone),
    toStatus(profileDone),
    toStatus(fiscalDone),
    toStatus(paymentDone),
    'partial', // design — always exists
  ];
  const completedCount = sections.filter(s => s === 'complete').length;
  const pct = Math.round(completedCount / sections.length * 100);
  const isShopActive = s.publishStatus === 'published' && !!s.active;

  // ── Next AI insight ───────────────────────────────────────────────────────
  type Insight = { message: string; sub: string; cta: string; route: string };
  const insights: Insight[] = [
    { message: `Empecemos por el logo, ${userName.split(' ')[0]}.`, sub: 'Sin logo tu tienda no aparece en búsquedas. Es lo primero que ven los compradores.', cta: 'Subir logo', route: '/mi-tienda/configurar/brand' },
    { message: 'Ponle cara a tu tienda.', sub: 'Agrega imágenes de tus piezas o tu taller. Un hero con tu trabajo es lo que convierte visitas en ventas.', cta: 'Agregar imágenes', route: '/mi-tienda/configurar/hero' },
    { message: '¿Cómo te contactan los compradores?', sub: 'Agrega WhatsApp o email. Sin datos de contacto, la venta se corta antes de empezar.', cta: 'Agregar contacto', route: '/mi-tienda/configurar/contact' },
    { message: '¿Qué pasa si alguien devuelve?', sub: 'Los compradores leen la política antes de comprar. Unos párrafos claros aumentan la confianza.', cta: 'Escribir política', route: '/mi-tienda/configurar/return-policy' },
    { message: `Cuéntanos quién eres, ${userName.split(' ')[0]}.`, sub: 'Tu historia es lo que te diferencia de una tienda cualquiera. Los compradores conectan con personas, no con productos.', cta: 'Completar perfil', route: '/dashboard/artisan-profile-wizard' },
    { message: '¡Vas muy bien!', sub: 'Tu tienda tiene lo esencial. Revisa el diseño y ajusta los detalles para que se vea exactamente como quieres.', cta: 'Ver diseño', route: '/mi-tienda/configurar/design' },
  ];
  const insightIndex =
    !brandDone ? 0 :
    !heroDone  ? 1 :
    !contactDone ? 2 :
    !policiesDone ? 3 :
    !profileDone ? 4 : 5;
  const insight = insights[insightIndex];

  return (
    <>
      <Helmet><title>{`Configurar · ${shopName}`}</title></Helmet>

      <div className="h-full flex flex-col min-h-0 overflow-hidden">

        {/* ── Header sticky ── */}
        <header
          className="sticky top-0 z-30 px-12 pt-4 pb-3 grid items-center"
          style={{ gridTemplateColumns: '1fr auto 1fr' }}
        >
          <div className="flex items-center gap-3">
            {s.logoUrl && (
              <img src={s.logoUrl} alt={shopName} className="h-10 w-10 rounded-full object-contain"
                style={{ border: '1px solid rgba(21,27,45,0.08)', background: 'white', padding: 2 }} />
            )}
          </div>

          <div className="flex flex-col items-center text-center">
            <h1 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: '#151b2d', lineHeight: 1.2 }}>
              Configuración de tienda
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: 'rgba(84,67,62,0.7)', marginTop: 2 }}>
              {completedCount} de {sections.length} secciones completas · {pct}%
            </p>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <NotificationCenter />
            <OutlineBtn onClick={() => navigate('/dashboard')}>
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Dashboard
            </OutlineBtn>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto px-12 pb-20" style={{ overscrollBehavior: 'contain' }}>
          <div className="max-w-[1300px] mx-auto pt-8">

            {/* ── 4 Metric Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <MetricCard
                label="Completadas"
                value={<span>{completedCount}<span style={{ fontSize: 20, opacity: 0.35 }}>/{sections.length}</span></span>}
                sub="secciones listas"
                icon="task_alt"
              />
              <MetricCard
                label="Progreso"
                value={
                  <span style={{ color: pct === 100 ? '#166534' : pct >= 60 ? '#ec6d13' : '#151b2d' }}>
                    {pct}<span style={{ fontSize: 20, opacity: 0.35 }}>%</span>
                  </span>
                }
                sub="configuración total"
                icon="donut_large"
              />
              <MetricCard
                label="Estado tienda"
                value={
                  <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', color: isShopActive ? '#166534' : '#ec6d13' }}>
                    {isShopActive ? 'Activa' : 'Preparación'}
                  </span>
                }
                sub={isShopActive ? 'visible al público' : 'no activada aún'}
                icon={isShopActive ? 'storefront' : 'pending'}
              />
              <MetricCard
                label="Perfil artesanal"
                value={
                  <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', color: profileDone ? '#166534' : 'rgba(21,27,45,0.4)' }}>
                    {profileDone ? 'Completo' : 'Pendiente'}
                  </span>
                }
                sub="historia y técnicas"
                icon="person_pin"
              />
            </div>

            {/* ── Grid 8 + 4 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left — bento grid 5 cols */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-5 gap-4" style={{ gridTemplateRows: 'auto auto auto auto' }}>

                  {/* ── 1. Identidad artesanal — 3 cols × 2 rows ─────────── */}
                  {(() => {
                    const ap        = s.artisanProfile ?? {};
                    const craftType = ap.craftType || s.craftType || '';
                    const dept      = s.department || ap.department || '';
                    const muni      = s.municipality || ap.municipality || '';
                    const bio       = ap.shortBio || ap.story || ap.description || s.description || '';
                    const photoUrl  = ap.artisanPhoto || ap.workshopPhoto || '';
                    const initial   = (ap.artisanName || userName || '?')[0].toUpperCase();
                    const tags      = [
                      ...(ap.techniques ?? []).slice(0, 2),
                      ...(ap.craftStyle ?? []).slice(0, 2),
                    ].slice(0, 4);
                    const status    = toStatus(profileDone);
                    const { variant, label } = STATUS_PILL[status];
                    return (
                      <div
                        className="col-span-3 row-span-2 flex flex-row overflow-hidden"
                        style={{ ...glassPrimary, borderRadius: 24, minHeight: 280 }}
                      >
                        {/* ── Foto lateral — columna izquierda ── */}
                        <div style={{ width: '40%', flexShrink: 0, position: 'relative', overflow: 'hidden', borderRadius: '24px 0 0 24px' }}>
                          {photoUrl ? (
                            <img src={photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'rgba(236,109,19,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontFamily: SERIF, fontSize: 72, fontWeight: 700, color: 'rgba(236,109,19,0.18)', lineHeight: 1, userSelect: 'none' }}>{initial}</span>
                            </div>
                          )}
                          {/* gradient overlay en la parte inferior de la foto */}
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(21,27,45,0.55) 100%)' }} />
                          {/* craft chip sobre el gradiente */}
                          {craftType && (
                            <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
                              <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: 'white', background: 'rgba(236,109,19,0.8)', borderRadius: 9999, padding: '3px 10px', display: 'inline-block' }}>
                                {craftType}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* ── Info — columna derecha ── */}
                        <div style={{ flex: 1, padding: '22px 22px 18px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          {/* header */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div>
                              <span style={{ fontFamily: SANS, fontSize: 8, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(84,67,62,0.4)' }}>
                                Identidad artesanal
                              </span>
                              <p style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: '#151b2d', marginTop: 3, lineHeight: 1.2 }}>
                                {ap.artisanName || userName}
                              </p>
                              {ap.artisticName && (
                                <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: 'rgba(84,67,62,0.55)', marginTop: 2 }}>
                                  {ap.artisticName}
                                </p>
                              )}
                            </div>
                            <Pill variant={variant}>{label}</Pill>
                          </div>

                          {/* divider */}
                          <div style={{ height: 1, background: 'rgba(21,27,45,0.06)', marginBottom: 14 }} />

                          {/* bio */}
                          {bio ? (
                            <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.65)', lineHeight: 1.7, flex: 1, marginBottom: 14 }}>
                              {bio.length > 160 ? bio.slice(0, 160) + '…' : bio}
                            </p>
                          ) : (
                            <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.32)', lineHeight: 1.7, flex: 1, fontStyle: 'italic', marginBottom: 14 }}>
                              Tu historia y técnicas artesanales aún no están configuradas.
                            </p>
                          )}

                          {/* tags */}
                          {tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                              {tags.map(tag => (
                                <span key={tag} style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, background: 'rgba(21,27,45,0.05)', color: 'rgba(84,67,62,0.65)', borderRadius: 9999, padding: '3px 9px' }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* footer */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {(dept || muni) ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'rgba(84,67,62,0.4)' }}>location_on</span>
                                <span style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.5)' }}>
                                  {[dept, muni].filter(Boolean).join(' · ')}
                                </span>
                              </div>
                            ) : <div />}
                            <EditBtn
                              label={profileDone ? 'Editar perfil' : 'Completar perfil'}
                              onClick={() => navigate('/dashboard/artisan-profile-wizard', { state: { returnTo: '/mi-tienda/configurar' } })}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── 2. Marca — 2 cols ─────────────────────────────────── */}
                  {(() => {
                    const status = toStatus(brandDone, brandPartial);
                    const { variant, label } = STATUS_PILL[status];
                    return (
                      <div
                        className="col-span-2 flex flex-col"
                        style={{ ...glassPrimary, borderRadius: 24, padding: 22 }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(84,67,62,0.45)' }}>
                            Marca
                          </span>
                          <Pill variant={variant}>{label}</Pill>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          {s.logoUrl
                            ? <img src={s.logoUrl} style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'contain', background: 'white', border: '1px solid rgba(21,27,45,0.08)', padding: 3, flexShrink: 0 }} alt="" />
                            : <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(21,27,45,0.05)', border: '1px dashed rgba(21,27,45,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'rgba(21,27,45,0.2)' }}>palette</span>
                              </div>
                          }
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: '#151b2d', margin: 0 }}>{shopName}</p>
                            {s.brandClaim
                              ? <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.55)', fontStyle: 'italic', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  &ldquo;{s.brandClaim}&rdquo;
                                </p>
                              : <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.3)', marginTop: 2, fontStyle: 'italic' }}>Sin tagline</p>
                            }
                          </div>
                        </div>

                        <div className="mt-auto flex justify-end">
                          <EditBtn label={brandDone ? 'Editar' : 'Configurar'} onClick={() => navigate('/mi-tienda/configurar/brand')} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── 3. Imágenes de portada — 2 cols ──────────────────── */}
                  {(() => {
                    const status = toStatus(heroDone);
                    const { variant, label } = STATUS_PILL[status];
                    const slideCount = s.heroConfig?.slides?.length ?? 0;
                    return (
                      <div
                        className="col-span-2 flex flex-col overflow-hidden"
                        style={{ ...glassPrimary, borderRadius: 24 }}
                      >
                        {/* Thumbnail strip */}
                        <div style={{ height: 80, background: s.bannerUrl ? 'transparent' : 'rgba(21,27,45,0.04)', position: 'relative', flexShrink: 0 }}>
                          {s.bannerUrl
                            ? <img src={s.bannerUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            : <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'rgba(21,27,45,0.12)' }}>panorama</span>
                              </div>
                          }
                          <div style={{ position: 'absolute', top: 8, right: 8 }}>
                            <Pill variant={variant}>{label}</Pill>
                          </div>
                        </div>

                        <div style={{ padding: '14px 18px' }} className="flex flex-col flex-1">
                          <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(84,67,62,0.45)' }}>
                            Imágenes de portada
                          </span>
                          <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.6)', marginTop: 4, flex: 1 }}>
                            {heroDone
                              ? slideCount > 0 ? `${slideCount} slide${slideCount > 1 ? 's' : ''} configurado${slideCount > 1 ? 's' : ''}` : 'Banner del marketplace listo'
                              : 'Tarjeta y hero banner de tu tienda'}
                          </p>
                          <div className="flex justify-end mt-3">
                            <EditBtn label={heroDone ? 'Editar' : 'Agregar'} onClick={() => navigate('/mi-tienda/configurar/hero')} />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── 4. Contacto, Fiscal y Cobro — 5 cols (full) ─────── */}
                  {(() => {
                    const cc = s.contactConfig ?? {};
                    const allDone = contactDone && fiscalDone && paymentDone;
                    const anyDone = contactDone || fiscalDone || paymentDone;
                    const overallStatus = toStatus(allDone, anyDone && !allDone);
                    const { variant, label } = STATUS_PILL[overallStatus];
                    return (
                      <div
                        className="col-span-5 flex flex-col"
                        style={{ ...glassPrimary, borderRadius: 24, padding: 22 }}
                      >
                        <div className="flex items-start justify-between mb-5">
                          <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(84,67,62,0.45)' }}>
                            Contacto, fiscal y cobro
                          </span>
                          <Pill variant={variant}>{label}</Pill>
                        </div>

                        <div className="grid grid-cols-3 gap-4 flex-1">
                          {/* Sub-card: Contacto y envíos */}
                          <div style={{ borderRadius: 14, background: 'rgba(21,27,45,0.025)', border: '1px solid rgba(21,27,45,0.05)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#ec6d13' }}>chat</span>
                                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, color: '#151b2d' }}>Contacto y envíos</span>
                              </div>
                              <Pill variant={STATUS_PILL[toStatus(contactDone)].variant}>{STATUS_PILL[toStatus(contactDone)].label}</Pill>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1">
                              {cc.whatsapp
                                ? <div className="flex items-center gap-1.5"><span className="material-symbols-outlined" style={{ fontSize: 13, color: '#25d366' }}>phone_iphone</span><span style={{ fontFamily: SANS, fontSize: 11, color: '#151b2d', fontWeight: 600 }}>{cc.whatsapp}</span></div>
                                : <div className="flex items-center gap-1.5"><span className="material-symbols-outlined" style={{ fontSize: 13, color: 'rgba(21,27,45,0.2)' }}>phone_iphone</span><span style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.35)', fontStyle: 'italic' }}>WhatsApp pendiente</span></div>
                              }
                              {cc.email && <div className="flex items-center gap-1.5"><span className="material-symbols-outlined" style={{ fontSize: 13, color: '#ec6d13' }}>mail</span><span style={{ fontFamily: SANS, fontSize: 11, color: '#151b2d', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cc.email}</span></div>}
                              {(cc.address?.streetAddress || (typeof cc.address === 'string' && cc.address)) && (
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'rgba(84,67,62,0.4)' }}>location_on</span>
                                  <span style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {(() => { const a = typeof cc.address === 'string' ? cc.address : [cc.address?.streetAddress, cc.address?.municipality].filter(Boolean).join(', '); return a.length > 30 ? a.slice(0, 30) + '…' : a; })()}
                                  </span>
                                </div>
                              )}
                              {cc.hours && <div className="flex items-center gap-1.5"><span className="material-symbols-outlined" style={{ fontSize: 13, color: 'rgba(84,67,62,0.4)' }}>schedule</span><span style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.6)' }}>{cc.hours}</span></div>}
                            </div>
                            <div className="flex justify-end mt-1">
                              <EditBtn label={contactDone ? 'Editar' : 'Agregar'} onClick={() => navigate('/mi-tienda/configurar/contact')} />
                            </div>
                          </div>

                          {/* Sub-card: Información fiscal */}
                          <div style={{ borderRadius: 14, background: 'rgba(21,27,45,0.025)', border: '1px solid rgba(21,27,45,0.05)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#ec6d13' }}>receipt_long</span>
                                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, color: '#151b2d' }}>Información fiscal</span>
                              </div>
                              <Pill variant={STATUS_PILL[toStatus(fiscalDone)].variant}>{STATUS_PILL[toStatus(fiscalDone)].label}</Pill>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1">
                              {profile?.rut
                                ? <>
                                    <div className="flex items-center gap-1.5">
                                      <span className="material-symbols-outlined" style={{ fontSize: 13, color: fiscalDone ? '#166534' : '#ec6d13' }}>badge</span>
                                      <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: '#151b2d' }}>{profile.rut}</span>
                                    </div>
                                    {profile.rutPendiente && <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, color: '#ec6d13', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Verificación pendiente</span>}
                                    {fiscalDone && <span style={{ fontFamily: SANS, fontSize: 10, color: '#166534', fontWeight: 600 }}>RUT verificado</span>}
                                  </>
                                : <span style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.35)', fontStyle: 'italic' }}>RUT / NIT no registrado</span>
                              }
                            </div>
                            <div className="flex justify-end mt-1">
                              <EditBtn
                                label={profile?.rut ? 'Editar RUT' : 'Registrar RUT'}
                                onClick={() => navigate('/mi-tienda/configurar/contact?tab=rut', { state: { returnTo: '/mi-tienda/configurar' } })}
                              />
                            </div>
                          </div>

                          {/* Sub-card: Datos de cobro */}
                          <div style={{ borderRadius: 14, background: 'rgba(21,27,45,0.025)', border: '1px solid rgba(21,27,45,0.05)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#ec6d13' }}>account_balance</span>
                                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, color: '#151b2d' }}>Datos de cobro</span>
                              </div>
                              <Pill variant={STATUS_PILL[toStatus(paymentDone)].variant}>{STATUS_PILL[toStatus(paymentDone)].label}</Pill>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1">
                              {paymentDone
                                ? <>
                                    <div className="flex items-center gap-1.5">
                                      <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#166534' }}>check_circle</span>
                                      <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: '#151b2d' }}>Cuenta configurada</span>
                                    </div>
                                    <span style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.5)' }}>Recibirás pagos automáticamente</span>
                                  </>
                                : <>
                                    <div className="flex items-center gap-1.5">
                                      <span className="material-symbols-outlined" style={{ fontSize: 13, color: 'rgba(21,27,45,0.2)' }}>account_balance</span>
                                      <span style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.35)', fontStyle: 'italic' }}>Sin cuenta bancaria</span>
                                    </div>
                                    <span style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.4)' }}>Necesaria para recibir pagos</span>
                                  </>
                              }
                            </div>
                            <div className="flex justify-end mt-1">
                              <EditBtn
                                label={paymentDone ? 'Ver cuenta' : 'Configurar cobros'}
                                onClick={() => navigate('/mi-tienda/configurar/contact?tab=banco', { state: { returnTo: '/mi-tienda/configurar' } })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── 5. Políticas y FAQ — 3 cols ──────────────────────── */}
                  {(() => {
                    const pStatus = toStatus(policiesDone);
                    const { variant: pv, label: pl } = STATUS_PILL[pStatus];
                    return (
                      <div
                        className="col-span-3 flex flex-col"
                        style={{ ...glassPrimary, borderRadius: 24, padding: 22 }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(84,67,62,0.45)' }}>
                            Políticas y FAQ
                          </span>
                          <Pill variant={pv}>{pl}</Pill>
                        </div>

                        <div className="grid grid-cols-2 gap-3 flex-1">
                          {/* Devoluciones */}
                          <div style={{ borderRadius: 14, background: 'rgba(21,27,45,0.025)', border: '1px solid rgba(21,27,45,0.05)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ec6d13' }}>policy</span>
                              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, color: '#151b2d' }}>Devoluciones</span>
                            </div>
                            <p style={{ fontFamily: SANS, fontSize: 11, color: policiesDone ? 'rgba(84,67,62,0.65)' : 'rgba(84,67,62,0.35)', fontStyle: policiesDone ? 'normal' : 'italic', lineHeight: 1.5, flex: 1 }}>
                              {policiesDone ? 'Política configurada' : 'Sin política aún'}
                            </p>
                            <EditBtn label={policiesDone ? 'Editar' : 'Crear'} onClick={() => navigate('/mi-tienda/configurar/return-policy')} />
                          </div>

                          {/* FAQ */}
                          <div style={{ borderRadius: 14, background: 'rgba(21,27,45,0.025)', border: '1px solid rgba(21,27,45,0.05)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ec6d13' }}>quiz</span>
                              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, color: '#151b2d' }}>Preguntas frecuentes</span>
                            </div>
                            <p style={{ fontFamily: SANS, fontSize: 11, color: policiesDone ? 'rgba(84,67,62,0.65)' : 'rgba(84,67,62,0.35)', fontStyle: policiesDone ? 'normal' : 'italic', lineHeight: 1.5, flex: 1 }}>
                              {policiesDone ? 'Responde las dudas de tus compradores' : 'Sin preguntas aún'}
                            </p>
                            <EditBtn label={policiesDone ? 'Editar' : 'Agregar'} onClick={() => navigate('/mi-tienda/configurar/faq')} />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── 6. Diseño de tienda — 5 cols (full) ──────────────── */}
                  {(() => {
                    const colors = (s.primaryColors ?? []).slice(0, 5);
                    return (
                      <div
                        className="col-span-5 flex items-center gap-6"
                        style={{ ...glassPrimary, borderRadius: 24, padding: '18px 24px' }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#3b82f6' }}>style</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(84,67,62,0.45)' }}>Diseño de tienda</span>
                          <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#151b2d', marginTop: 2 }}>
                            Template Artesano · Controla cómo se ve tu tienda en el marketplace y en tu ecommerce
                          </p>
                        </div>
                        {colors.length > 0 && (
                          <div className="flex items-center gap-2 shrink-0">
                            {colors.map((c: string, i: number) => (
                              <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.9)', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }} />
                            ))}
                          </div>
                        )}
                        <Pill variant="warning">En progreso</Pill>
                        <EditBtn label="Ver diseño" onClick={() => navigate('/mi-tienda/configurar/design')} />
                      </div>
                    );
                  })()}


                </div>
              </div>

              {/* Right — AI card + preview sticky */}
              <div className="lg:col-span-4 hidden lg:block">
                <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* AI dark card */}
                  <div
                    className="p-7 rounded-3xl relative overflow-hidden"
                    style={{ background: '#151b2d' }}
                  >
                    {/* Decorative blur */}
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(236,109,19,0.1)', filter: 'blur(50px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: -30, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(236,109,19,0.05)', filter: 'blur(35px)', pointerEvents: 'none' }} />

                    <div className="relative z-10">
                      {/* Badge */}
                      <div className="flex items-center gap-3 mb-5">
                        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(236,109,19,0.15)', border: '1px solid rgba(236,109,19,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 19, color: '#ec6d13' }}>smart_toy</span>
                        </div>
                        <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                          Asistente IA · TELAR
                        </span>
                      </div>

                      <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 10, lineHeight: 1.35 }}>
                        {insight.message}
                      </h3>
                      <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 22 }}>
                        {insight.sub}
                      </p>

                      <button
                        onClick={() => navigate(insight.route)}
                        className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-full transition-all hover:opacity-90"
                        style={{ background: '#ec6d13', color: 'white', fontFamily: SANS, fontSize: 12, fontWeight: 700, boxShadow: '0 4px 12px rgba(236,109,19,0.3)', border: 'none', cursor: 'pointer' }}
                      >
                        {insight.cta}
                        <span className="material-symbols-outlined text-[14px]">east</span>
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  <PreviewPanel shop={s} />
                </div>
              </div>

            </div>
          </div>

          {/* Mini footer */}
          <footer
            className="flex items-center justify-between px-12 py-6 mt-8"
            style={{ borderTop: '1px solid rgba(21,27,45,0.05)' }}
          >
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(84,67,62,0.3)', letterSpacing: '0.04em' }}>
              © {new Date().getFullYear()} TELAR
            </span>
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(84,67,62,0.3)', letterSpacing: '0.04em' }}>
              Hecho con <span style={{ color: '#e05252' }}>♥</span> en Latinoamérica
            </span>
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'rgba(84,67,62,0.3)', letterSpacing: '0.04em' }}>
              Orgullosamente desarrollado en Colombia 🇨🇴
            </span>
          </footer>

        </main>
      </div>
    </>
  );
};

export default ShopConfigDashboard;
