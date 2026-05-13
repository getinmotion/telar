import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useArtisanShop } from '@/hooks/useArtisanShop';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  dark:   '#151b2d',
  orange: '#ec6d13',
  muted:  '#54433e',
  sans:   "'Manrope', sans-serif",
  serif:  "'Noto Serif', serif",
};
const glass: React.CSSProperties = {
  background:           'rgba(255,255,255,0.82)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               '1px solid rgba(255,255,255,0.65)',
};

// ─── Status badge ─────────────────────────────────────────────────────────────
type Status = 'complete' | 'partial' | 'empty';
const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  complete: { label: 'Completo',    color: '#166534', bg: 'rgba(22,101,52,0.08)'   },
  partial:  { label: 'En progreso', color: T.orange,  bg: 'rgba(236,109,19,0.08)'  },
  empty:    { label: 'Pendiente',   color: `${T.muted}80`, bg: `${T.dark}06`       },
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const cfg = statusConfig[status];
  return (
    <span style={{
      fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
      textTransform: 'uppercase' as const, padding: '3px 8px', borderRadius: 100,
      color: cfg.color, background: cfg.bg, flexShrink: 0,
    }}>
      {cfg.label}
    </span>
  );
};

// ─── Score ring (for artisan profile card) ────────────────────────────────────
const ScoreRing: React.FC<{ value: number }> = ({ value }) => {
  const r = 16; const circ = 2 * Math.PI * r; const dash = (value / 100) * circ;
  return (
    <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
      <svg width={44} height={44} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={22} cy={22} r={r} fill="none" stroke={`${T.orange}18`} strokeWidth={4} />
        <circle cx={22} cy={22} r={r} fill="none" stroke={T.orange} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, color: T.dark }}>{value}<span style={{ fontSize: 7 }}>%</span></span>
      </div>
    </div>
  );
};

// ─── Section card config ──────────────────────────────────────────────────────
interface SectionConfig {
  key:         string;
  icon:        string;
  label:       string;
  description: string;
  route:       string;
}

const SECTION_CARDS: SectionConfig[] = [
  { key: 's1',  icon: 'palette',      label: 'Identidad de marca',        description: 'Logo, tagline y nombre de tu tienda',         route: '/mi-tienda/configurar/brand'         },
  { key: 's2',  icon: 'panorama',     label: 'Imágenes de portada',       description: 'Banner y slides del hero de tu tienda',       route: '/mi-tienda/configurar/hero'          },
  { key: 's3',  icon: 'person_pin',   label: 'Perfil artesanal',          description: 'Historia, técnicas, territorio y galería',    route: '/dashboard/artisan-profile-wizard'   },
  { key: 's4',  icon: 'contacts',     label: 'Contacto y ubicación',      description: 'WhatsApp, email y redes sociales',            route: '/mi-tienda/configurar/contact'       },
  { key: 's5a', icon: 'policy',       label: 'Política de devoluciones',  description: 'Plazos y condiciones para devoluciones',      route: '/mi-tienda/configurar/return-policy' },
  { key: 's5b', icon: 'quiz',         label: 'Preguntas frecuentes',      description: 'Responde las dudas de tus compradores',       route: '/mi-tienda/configurar/faq'           },
  { key: 's6',  icon: 'preview',      label: 'Diseño y plantilla',        description: 'Estilo visual de tu tienda personal',         route: '/mi-tienda/configurar/design'        },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const ShopConfigDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { shop, loading } = useArtisanShop();

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 32, color: T.orange }}>progress_activity</span>
    </div>
  );
  if (!shop) return (
    <div className="flex-1 flex items-center justify-center">
      <p style={{ fontFamily: T.sans, color: T.muted }}>Tienda no encontrada</p>
    </div>
  );

  const s = shop as any;
  const artisanProfile = s.artisanProfile ?? {};
  const heroSlides     = s.heroConfig?.slides ?? [];
  const returnPolicy   = s.policiesConfig?.returnPolicy ?? '';
  const faqItems       = s.policiesConfig?.faq ?? [];
  const whatsapp       = s.contactConfig?.whatsapp ?? '';
  const email          = s.contactConfig?.email ?? '';
  const socialInsta    = s.socialLinks?.instagram ?? '';

  // ── Completion statuses ──────────────────────────────────────────────────────
  const s1Status: Status = s.logoUrl && s.brandClaim ? 'complete' : s.logoUrl || s.brandClaim ? 'partial' : 'empty';
  const s2Status: Status = s.bannerUrl || heroSlides.length > 0 ? 'complete' : 'empty';
  const profilePct = (() => {
    const fields = [artisanProfile.artisanName, artisanProfile.learnedFromDetail, artisanProfile.techniques?.length > 0, artisanProfile.workingPhotos?.length > 0, artisanProfile.artisanPhoto, artisanProfile.territory];
    return Math.round(fields.filter(Boolean).length / fields.length * 100);
  })();
  const s3Status: Status = s.artisanProfileCompleted ? 'complete' : profilePct > 30 ? 'partial' : 'empty';
  const s4Status: Status = whatsapp && (email || socialInsta) ? 'complete' : whatsapp || email ? 'partial' : 'empty';
  const s5aStatus: Status = returnPolicy.length > 30 ? 'complete' : 'empty';
  const s5bStatus: Status = faqItems.length > 0 ? 'complete' : 'empty';
  const s6Status: Status  = 'complete';

  const statusMap: Record<string, Status> = {
    s1: s1Status, s2: s2Status, s3: s3Status,
    s4: s4Status, s5a: s5aStatus, s5b: s5bStatus, s6: s6Status,
  };

  const completedCount = Object.values(statusMap).filter(v => v === 'complete').length;
  const totalCount     = SECTION_CARDS.length;

  return (
    <>
      <Helmet><title>{`Configurar · ${s.shopName ?? 'Tienda'}`}</title></Helmet>

      <div className="overflow-y-auto flex-1 p-6 lg:p-8">
        <div className="max-w-[960px]">

          {/* Page header */}
          <div className="mb-8">
            <p style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: `${T.muted}50`, marginBottom: 4 }}>
              Mi tienda · {s.shopName ?? ''}
            </p>
            <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.dark, marginBottom: 6 }}>
              Configuración de tienda
            </h1>
            <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}65`, lineHeight: 1.6 }}>
              {completedCount} de {totalCount} secciones completas · Cada sección tiene su propio asistente
            </p>
          </div>

          {/* Overview progress bar */}
          <div className="mb-8 p-5 rounded-2xl" style={{ ...glass, borderRadius: 20 }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.dark }}>
                Progreso general
              </span>
              <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: completedCount === totalCount ? '#166534' : T.orange }}>
                {Math.round(completedCount / totalCount * 100)}%
              </span>
            </div>
            <div className="relative h-[3px] rounded-full" style={{ background: 'rgba(21,27,45,0.06)' }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{ width: `${Math.round(completedCount / totalCount * 100)}%`, background: completedCount === totalCount ? '#166534' : T.orange }}
              />
            </div>
          </div>

          {/* Section cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SECTION_CARDS.map(section => {
              const status = statusMap[section.key];
              const isArtisanProfile = section.key === 's3';
              return (
                <div
                  key={section.key}
                  style={{ ...glass, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  {/* Card top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(236,109,19,0.08)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 22, color: T.orange }}>{section.icon}</span>
                    </div>
                    {isArtisanProfile ? (
                      <ScoreRing value={profilePct} />
                    ) : (
                      <StatusBadge status={status} />
                    )}
                  </div>

                  {/* Card content */}
                  <div className="flex-1">
                    <p style={{ fontFamily: T.serif, fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 4, lineHeight: 1.2 }}>
                      {section.label}
                    </p>
                    <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}70`, lineHeight: 1.5 }}>
                      {section.description}
                    </p>
                    {isArtisanProfile && (
                      <StatusBadge status={status} />
                    )}
                  </div>

                  {/* Edit button */}
                  <button
                    onClick={() => navigate(section.route)}
                    className="flex items-center justify-between w-full rounded-xl transition-opacity hover:opacity-80"
                    style={{ padding: '11px 16px', background: T.dark, border: 'none', cursor: 'pointer' }}
                  >
                    <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 800, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                      {status === 'empty' ? 'Configurar' : 'Editar'}
                    </span>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>
                      arrow_forward
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
};

export default ShopConfigDashboard;
