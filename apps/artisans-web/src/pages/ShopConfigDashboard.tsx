import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useArtisanShop } from '@/hooks/useArtisanShop';

const T = {
  dark:   '#151b2d',
  orange: '#ec6d13',
  muted:  '#54433e',
  green:  '#166534',
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
  complete: { label: 'Completo',    color: T.green,              bg: 'rgba(22,101,52,0.08)'   },
  partial:  { label: 'En progreso', color: T.orange,             bg: 'rgba(236,109,19,0.08)'  },
  empty:    { label: 'Pendiente',   color: `${T.muted}80`,       bg: `${T.dark}06`            },
};
const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const cfg = statusConfig[status];
  return (
    <span style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '3px 8px', borderRadius: 100, color: cfg.color, background: cfg.bg, flexShrink: 0 }}>
      {cfg.label}
    </span>
  );
};

// ─── Score ring ───────────────────────────────────────────────────────────────
const ScoreRing: React.FC<{ value: number }> = ({ value }) => {
  const r = 14; const circ = 2 * Math.PI * r; const dash = (value / 100) * circ;
  return (
    <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
      <svg width={36} height={36} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={18} cy={18} r={r} fill="none" stroke={`${T.orange}18`} strokeWidth={3} />
        <circle cx={18} cy={18} r={r} fill="none" stroke={T.orange} strokeWidth={3}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 800, color: T.dark }}>{value}<span style={{ fontSize: 6 }}>%</span></span>
      </div>
    </div>
  );
};

// ─── Contact chip ─────────────────────────────────────────────────────────────
const ContactChip: React.FC<{ icon: string; label: string; filled: boolean }> = ({ icon, label, filled }) => (
  <div className="flex items-center gap-1" style={{ padding: '3px 8px', borderRadius: 100, background: filled ? 'rgba(22,101,52,0.08)' : `${T.dark}06`, border: `1px solid ${filled ? 'rgba(22,101,52,0.15)' : `${T.dark}08`}` }}>
    <span className="material-symbols-outlined" style={{ fontSize: 10, color: filled ? T.green : `${T.muted}35` }}>{filled ? 'check_circle' : 'radio_button_unchecked'}</span>
    <span style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: filled ? T.green : `${T.muted}40` }}>{label}</span>
  </div>
);

// ─── Hint pill ────────────────────────────────────────────────────────────────
const Hint: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-1.5" style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(236,109,19,0.05)', border: '1px solid rgba(236,109,19,0.1)' }}>
    <span style={{ fontFamily: T.sans, fontSize: 10, color: `${T.muted}60`, lineHeight: 1.5 }}>{text}</span>
  </div>
);

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
  const artisanProfile  = s.artisanProfile ?? {};
  const heroSlides      = s.heroConfig?.slides ?? [];
  const returnPolicy    = s.policiesConfig?.returnPolicy ?? '';
  const faqItems        = s.policiesConfig?.faq ?? [];
  const whatsapp        = s.contactConfig?.whatsapp ?? '';
  const email           = s.contactConfig?.email ?? '';
  const socialInsta     = s.socialLinks?.instagram ?? '';
  const socialFb        = s.socialLinks?.facebook ?? '';
  const socialTiktok    = s.socialLinks?.tiktok ?? '';

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

  const statusMap: Record<string, Status> = { s1: s1Status, s2: s2Status, s3: s3Status, s4: s4Status, s5a: s5aStatus, s5b: s5bStatus, s6: s6Status };
  const completedCount = Object.values(statusMap).filter(v => v === 'complete').length;
  const totalCount = 7;

  const go = (route: string) => navigate(route, { state: { returnTo: '/mi-tienda/configurar' } });

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
              {completedCount} de {totalCount} secciones completas
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8 p-5 rounded-2xl" style={{ ...glass, borderRadius: 20 }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.dark }}>Progreso general</span>
              <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: completedCount === totalCount ? T.green : T.orange }}>
                {Math.round(completedCount / totalCount * 100)}%
              </span>
            </div>
            <div className="relative h-[3px] rounded-full" style={{ background: 'rgba(21,27,45,0.06)' }}>
              <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{ width: `${Math.round(completedCount / totalCount * 100)}%`, background: completedCount === totalCount ? T.green : T.orange }} />
            </div>
          </div>

          {/* Card grid — 2-col desktop / 1-col mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* S1 — Brand Identity */}
            <SectionCard
              icon="palette" title="Identidad de marca" status={s1Status}
              onEdit={() => go('/mi-tienda/configurar/brand')}
              hint="Una marca visual clara genera hasta 3× más confianza en el comprador"
            >
              <div className="flex items-center gap-3">
                {s.logoUrl ? (
                  <img src={s.logoUrl} className="w-10 h-10 rounded-xl object-contain shrink-0" style={{ background: `${T.dark}04`, border: `1px solid ${T.dark}06` }} alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${T.dark}04`, border: `1px dashed ${T.dark}12` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: `${T.muted}25` }}>storefront</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.dark }}>{s.shopName || '—'}</p>
                  {s.brandClaim ? (
                    <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}60`, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{s.brandClaim}"</p>
                  ) : (
                    <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}30`, fontStyle: 'italic' }}>Sin tagline</p>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* S2 — Hero Images */}
            <SectionCard
              icon="panorama" title="Imágenes de portada" status={s2Status}
              onEdit={() => go('/mi-tienda/configurar/hero')}
              hint="Las tiendas con hero visual reciben el doble de visitas"
            >
              <div className="flex items-center gap-3">
                {s.bannerUrl ? (
                  <img src={s.bannerUrl} className="w-16 h-10 rounded-lg object-cover shrink-0" style={{ border: `1px solid ${T.dark}06` }} alt="" />
                ) : (
                  <div className="w-16 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${T.dark}04`, border: `1px dashed ${T.dark}12` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: `${T.muted}25` }}>panorama</span>
                  </div>
                )}
                <div>
                  <p style={{ fontFamily: T.sans, fontSize: 12, color: s.bannerUrl ? T.dark : `${T.muted}40` }}>
                    {s.bannerUrl ? 'Banner configurado' : 'Sin banner'}
                  </p>
                  <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}45`, marginTop: 1 }}>
                    {heroSlides.length > 0 ? `${heroSlides.length} slide${heroSlides.length !== 1 ? 's' : ''} configurado${heroSlides.length !== 1 ? 's' : ''}` : 'Sin slides'}
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* S3 — Artisan Profile */}
            <SectionCard
              icon="person_pin" title="Perfil artesanal" status={s3Status}
              onEdit={() => go('/dashboard/artisan-profile-wizard')}
              hint={profilePct < 50 ? 'Completa tu historia para aumentar visibilidad en el marketplace' : profilePct < 100 ? 'Perfil casi completo — agrega fotos de proceso para destacar' : 'Perfil completo — ¡tu historia está visible en el marketplace!'}
              scoreRing={<ScoreRing value={profilePct} />}
            >
              <div>
                {artisanProfile.artisanName && (
                  <p style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.dark }}>{artisanProfile.artisanName}</p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {artisanProfile.territory && (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: 10, color: `${T.muted}40` }}>location_on</span>
                      <span style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}55` }}>{artisanProfile.territory}</span>
                    </div>
                  )}
                  {artisanProfile.techniques?.length > 0 && (
                    <span style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}55` }}>{artisanProfile.techniques.length} técnica{artisanProfile.techniques.length !== 1 ? 's' : ''}</span>
                  )}
                  {!artisanProfile.artisanName && !artisanProfile.territory && (
                    <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}30`, fontStyle: 'italic' }}>Sin información aún</p>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* S4 — Contact */}
            <SectionCard
              icon="contacts" title="Contacto y ubicación" status={s4Status}
              onEdit={() => go('/mi-tienda/configurar/contact')}
              hint="WhatsApp activo cierra ventas hasta 5× más rápido que el email"
            >
              <div className="flex flex-wrap gap-1.5">
                <ContactChip icon="whatsapp" label="WhatsApp" filled={!!whatsapp} />
                <ContactChip icon="email"    label="Email"    filled={!!email} />
                <ContactChip icon="photo_camera" label="Instagram" filled={!!socialInsta} />
                <ContactChip icon="thumb_up" label="Facebook"  filled={!!socialFb} />
                <ContactChip icon="music_video" label="TikTok" filled={!!socialTiktok} />
              </div>
            </SectionCard>

            {/* S5a — Return Policy */}
            <SectionCard
              icon="policy" title="Política de devoluciones" status={s5aStatus}
              onEdit={() => go('/mi-tienda/configurar/return-policy')}
              hint="Los compradores revisan la política antes de comprar artesanías"
            >
              {returnPolicy ? (
                <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}60`, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                  {returnPolicy}
                </p>
              ) : (
                <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}30`, fontStyle: 'italic' }}>Sin política configurada</p>
              )}
            </SectionCard>

            {/* S5b — FAQ */}
            <SectionCard
              icon="quiz" title="Preguntas frecuentes" status={s5bStatus}
              onEdit={() => go('/mi-tienda/configurar/faq')}
              hint="3+ preguntas reducen los mensajes de soporte un 40%"
            >
              {faqItems.length > 0 ? (
                <div>
                  <p style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.dark }}>
                    {faqItems.length} pregunta{faqItems.length !== 1 ? 's' : ''} respondida{faqItems.length !== 1 ? 's' : ''}
                  </p>
                  <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}50`, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {faqItems[0]?.q}
                  </p>
                </div>
              ) : (
                <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}30`, fontStyle: 'italic' }}>Sin preguntas configuradas</p>
              )}
            </SectionCard>

            {/* S6 — Design */}
            <SectionCard
              icon="preview" title="Diseño y plantilla" status={s6Status}
              onEdit={() => go('/mi-tienda/configurar/design')}
              hint="Más plantillas disponibles próximamente"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(236,109,19,0.08)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.orange }}>auto_stories</span>
                </div>
                <div>
                  <p style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.dark }}>TELAR Editorial</p>
                  <p style={{ fontFamily: T.sans, fontSize: 10, color: `${T.muted}45` }}>Plantilla activa</p>
                </div>
              </div>
            </SectionCard>

          </div>
        </div>
      </div>
    </>
  );
};

// ─── Section card shell ───────────────────────────────────────────────────────
interface SectionCardProps {
  icon: string;
  title: string;
  status: Status;
  onEdit: () => void;
  hint: string;
  children: React.ReactNode;
  scoreRing?: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, title, status, onEdit, hint, children, scoreRing }) => (
  <div style={{ ...glass, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
    {/* Top row */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center justify-center shrink-0" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(236,109,19,0.08)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.orange }}>{icon}</span>
        </div>
        <p style={{ fontFamily: T.serif, fontSize: 15, fontWeight: 700, color: T.dark, lineHeight: 1.2 }}>{title}</p>
      </div>
      {scoreRing ?? <StatusBadge status={status} />}
    </div>

    {/* Data preview */}
    <div className="flex-1">{children}</div>

    {/* Hint */}
    <Hint text={hint} />

    {/* Edit button */}
    <button
      onClick={onEdit}
      className="flex items-center justify-between w-full rounded-xl transition-opacity hover:opacity-80"
      style={{ padding: '10px 16px', background: T.dark, border: 'none', cursor: 'pointer' }}
    >
      <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
        {status === 'empty' ? 'Configurar' : 'Editar'}
      </span>
      <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>arrow_forward</span>
    </button>
  </div>
);

export default ShopConfigDashboard;
