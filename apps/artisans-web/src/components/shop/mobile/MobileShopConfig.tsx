// src/components/shop/mobile/MobileShopConfig.tsx
import React from 'react';

const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

// ── Tipos ──────────────────────────────────────────────────────────────────────
export type SectionId = 'perfil' | 'marca' | 'hero' | 'contacto' | 'legal' | 'diseno';

export const SECTIONS: { id: SectionId; label: string; icon: string }[] = [
  { id: 'perfil',   label: 'Perfil',   icon: 'account_circle' },
  { id: 'marca',    label: 'Marca',    icon: 'palette' },
  { id: 'hero',     label: 'Hero',     icon: 'panorama' },
  { id: 'contacto', label: 'Contacto', icon: 'contacts' },
  { id: 'legal',    label: 'Legal',    icon: 'policy' },
  { id: 'diseno',   label: 'Diseño',   icon: 'style' },
];

export interface MobileShopConfigProps {
  shop: any;
  userName: string;
  profile: any;
  navigate: (path: string, opts?: any) => void;
  active: SectionId;
}

// ── Nav bar — exportado para usarse en el header sticky ───────────────────────
export const MobileShopNav: React.FC<{
  active: SectionId;
  setActive: (id: SectionId) => void;
}> = ({ active, setActive }) => (
  <div
    className="flex justify-around"
    style={{
      background: 'white',
      borderBottom: '1px solid rgba(21,27,45,0.06)',
      padding: '7px 4px 6px',
    }}
  >
    {SECTIONS.map(({ id, label, icon }) => {
      const on = active === id;
      return (
        <button
          key={id}
          onClick={() => setActive(id)}
          className="flex flex-col items-center gap-[2px] flex-1"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div
            style={{
              width: 28, height: 28, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: on ? 'rgba(236,109,19,0.12)' : 'transparent',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 15, color: on ? '#ec6d13' : 'rgba(84,67,62,0.4)' }}
            >
              {icon}
            </span>
          </div>
          <span
            style={{
              fontFamily: SANS, fontSize: 6.5, fontWeight: 800,
              color: on ? '#ec6d13' : 'rgba(84,67,62,0.38)', letterSpacing: '0.02em',
            }}
          >
            {label}
          </span>
        </button>
      );
    })}
  </div>
);

// ── Helper: pill de estado ─────────────────────────────────────────────────────
const StatusPill: React.FC<{ done: boolean; partial?: boolean }> = ({ done, partial }) => {
  const bg    = done ? 'rgba(22,101,52,0.1)'  : partial ? 'rgba(236,109,19,0.1)'  : 'rgba(21,27,45,0.06)';
  const color = done ? '#166534'               : partial ? '#ec6d13'               : 'rgba(84,67,62,0.5)';
  const label = done ? '✓ Completo'            : partial ? 'En progreso'            : 'Pendiente';
  return (
    <span style={{ fontFamily: SANS, fontSize: 7, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: bg, color }}>
      {label}
    </span>
  );
};

// ── Helper: fila de sub-item tappable ─────────────────────────────────────────
const SubRow: React.FC<{
  icon: string;
  name: string;
  value: string | null;
  done: boolean;
  ctaDone?: string;
  ctaPending: string;
  onClick: () => void;
}> = ({ icon, name, value, done, ctaDone = 'Editar', ctaPending, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 text-left"
    style={{ background: 'white', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(21,27,45,0.05)' }}
  >
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{ width: 32, height: 32, borderRadius: 9, background: done ? 'rgba(22,101,52,0.08)' : 'rgba(236,109,19,0.08)' }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 16, color: done ? '#166534' : '#ec6d13' }}>{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#151b2d', margin: 0 }}>{name}</p>
      <p style={{ fontFamily: SANS, fontSize: 9, margin: 0, marginTop: 1, color: done ? '#166534' : 'rgba(84,67,62,0.38)', fontStyle: done ? 'normal' : 'italic', fontWeight: done ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value ?? (done ? 'Configurado' : 'Sin configurar')}
      </p>
    </div>
    <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, color: done ? 'rgba(84,67,62,0.35)' : '#ec6d13', flexShrink: 0 }}>
      {done ? ctaDone : ctaPending}
    </span>
  </button>
);

// ── Band de color por sección ──────────────────────────────────────────────────
const BAND_GRADIENT: Record<SectionId, string> = {
  perfil:   'linear-gradient(135deg, rgba(236,109,19,0.08) 0%, rgba(21,27,45,0.03) 100%)',
  marca:    'linear-gradient(135deg, rgba(236,109,19,0.08) 0%, rgba(21,27,45,0.03) 100%)',
  hero:     'linear-gradient(135deg, rgba(21,27,45,0.06) 0%, rgba(59,130,246,0.04) 100%)',
  contacto: 'linear-gradient(135deg, rgba(37,211,102,0.08) 0%, rgba(59,130,246,0.05) 100%)',
  legal:    'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(21,27,45,0.03) 100%)',
  diseno:   'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(21,27,45,0.03) 100%)',
};

const SectionBand: React.FC<{ id: SectionId; title: string; done: boolean; partial?: boolean }> = ({ id, title, done, partial }) => (
  <div style={{ background: BAND_GRADIENT[id], padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: '#151b2d' }}>{title}</span>
    <StatusPill done={done} partial={partial} />
  </div>
);

// ── CTA botones mobile ─────────────────────────────────────────────────────────
const CtaOrange: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button onClick={onClick} style={{ width: '100%', padding: '10px 0', border: 'none', borderRadius: 11, background: '#ec6d13', color: 'white', fontFamily: SANS, fontSize: 11, fontWeight: 800, boxShadow: '0 3px 12px rgba(236,109,19,0.25)', cursor: 'pointer' }}>
    {label}
  </button>
);

const CtaOutline: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button onClick={onClick} style={{ width: '100%', padding: '10px 0', border: '1.5px solid rgba(21,27,45,0.14)', borderRadius: 11, background: 'transparent', color: '#151b2d', fontFamily: SANS, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
    {label}
  </button>
);

// ── Contenido de sección — sin nav, sin scroll propio ─────────────────────────
export const MobileShopConfig: React.FC<MobileShopConfigProps> = ({ shop, userName, profile, navigate, active }) => {
  const s = shop as any;

  const brandDone    = !!(s.logoUrl && s.brandClaim);
  const brandPartial = !brandDone && !!(s.logoUrl || s.brandClaim || s.shopName);
  const heroDone     = !!(s.bannerUrl || s.heroConfig?.slides?.length > 0);
  const contactDone  = !!(s.contactConfig?.whatsapp || s.contactConfig?.email);
  const fiscalDone   = !!(profile?.rut && !profile?.rutPendiente);
  const paymentDone  = !!(s.idContraparty);
  const profileDone  = !!s.artisanProfileCompleted;
  const policiesDone = !!(s.idPoliciesConfig);

  return (
    <div className="flex flex-col">

      {/* PERFIL */}
      {active === 'perfil' && (() => {
        const ap       = s.artisanProfile ?? {};
        const photoUrl = ap.artisanPhoto || ap.workshopPhoto || '';
        const craftType = ap.craftType || s.craftType || '';
        const dept     = s.department || ap.department || '';
        const muni     = s.municipality || ap.municipality || '';
        const bio      = ap.shortBio || ap.story || ap.description || '';
        const initial  = (ap.artisanName || userName || '?')[0].toUpperCase();
        return (
          <div className="flex flex-col">
            <SectionBand id="perfil" title="Identidad artesanal" done={profileDone} />
            <div style={{ height: 100, background: photoUrl ? 'transparent' : 'rgba(236,109,19,0.06)', position: 'relative', overflow: 'hidden' }}>
              {photoUrl
                ? <img src={photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 700, color: 'rgba(236,109,19,0.15)' }}>{initial}</span>
                  </div>
              }
              {craftType && (
                <span style={{ position: 'absolute', bottom: 8, left: 12, fontFamily: SANS, fontSize: 9, fontWeight: 700, color: 'white', background: 'rgba(236,109,19,0.8)', borderRadius: 99, padding: '2px 9px' }}>
                  {craftType}
                </span>
              )}
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <p style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: '#151b2d', margin: 0 }}>{ap.artisanName || userName}</p>
                {(dept || muni) && (
                  <p style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.5)', margin: '3px 0 0' }}>📍 {[dept, muni].filter(Boolean).join(' · ')}</p>
                )}
                {bio && <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.65)', lineHeight: 1.6, margin: '8px 0 0' }}>{bio.length > 120 ? bio.slice(0, 120) + '…' : bio}</p>}
              </div>
              {profileDone
                ? <CtaOutline label="Editar perfil →" onClick={() => navigate('/dashboard/artisan-profile-wizard', { state: { returnTo: '/mi-tienda/configurar' } })} />
                : <CtaOrange label="Completar perfil →" onClick={() => navigate('/dashboard/artisan-profile-wizard', { state: { returnTo: '/mi-tienda/configurar' } })} />
              }
            </div>
          </div>
        );
      })()}

      {/* MARCA */}
      {active === 'marca' && (
        <div className="flex flex-col">
          <SectionBand id="marca" title="Marca" done={brandDone} partial={brandPartial} />
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'white', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(21,27,45,0.05)' }}>
              {s.logoUrl
                ? <img src={s.logoUrl} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'contain', background: 'white', border: '1px solid rgba(21,27,45,0.07)', padding: 4, flexShrink: 0, boxShadow: '0 2px 8px rgba(21,27,45,0.06)' }} alt="" />
                : <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(21,27,45,0.04)', border: '1.5px dashed rgba(21,27,45,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'rgba(21,27,45,0.2)' }}>palette</span>
                  </div>
              }
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: '#151b2d', margin: 0 }}>{s.shopName || userName}</p>
                <p style={{ fontFamily: SANS, fontSize: 10, color: s.brandClaim ? 'rgba(84,67,62,0.55)' : 'rgba(84,67,62,0.3)', fontStyle: 'italic', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.brandClaim ? `"${s.brandClaim}"` : 'Sin tagline configurado'}
                </p>
              </div>
            </div>
            {brandDone
              ? <CtaOutline label="Editar marca →" onClick={() => navigate('/mi-tienda/configurar/brand')} />
              : <CtaOrange label="Configurar marca →" onClick={() => navigate('/mi-tienda/configurar/brand')} />
            }
          </div>
        </div>
      )}

      {/* HERO */}
      {active === 'hero' && (() => {
        const slideCount = s.heroConfig?.slides?.length ?? 0;
        return (
          <div className="flex flex-col">
            <SectionBand id="hero" title="Imágenes de portada" done={heroDone} />
            <div style={{ height: 100, background: s.bannerUrl ? 'transparent' : 'rgba(21,27,45,0.04)', position: 'relative', overflow: 'hidden' }}>
              {s.bannerUrl
                ? <img src={s.bannerUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'rgba(21,27,45,0.1)' }}>panorama</span>
                  </div>
              }
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.6)', lineHeight: 1.5, margin: 0 }}>
                {heroDone
                  ? slideCount > 0 ? `${slideCount} slide${slideCount > 1 ? 's' : ''} configurado${slideCount > 1 ? 's' : ''}` : 'Banner del marketplace listo'
                  : 'Agrega imágenes de tus piezas o tu taller para el hero de tu tienda.'}
              </p>
              {heroDone
                ? <CtaOutline label="Editar imágenes →" onClick={() => navigate('/mi-tienda/configurar/hero')} />
                : <CtaOrange label="Agregar imágenes →" onClick={() => navigate('/mi-tienda/configurar/hero')} />
              }
            </div>
          </div>
        );
      })()}

      {/* DISEÑO */}
      {active === 'diseno' && (() => {
        const colors = (s.primaryColors ?? []).slice(0, 4);
        return (
          <div className="flex flex-col">
            <SectionBand id="diseno" title="Diseño de tienda" done={false} partial />
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#3b82f6' }}>style</span>
                </div>
                <div>
                  <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#151b2d', margin: 0 }}>Template Artesano</p>
                  <p style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.55)', margin: '2px 0 0' }}>Controla el look de tu tienda</p>
                </div>
              </div>
              {colors.length > 0 && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {colors.map((c: string, i: number) => (
                    <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }} />
                  ))}
                </div>
              )}
              <CtaOutline label="Personalizar diseño →" onClick={() => navigate('/mi-tienda/configurar/design')} />
            </div>
          </div>
        );
      })()}

      {/* CONTACTO */}
      {active === 'contacto' && (() => {
        const cc = s.contactConfig ?? {};
        const allDone = contactDone && fiscalDone && paymentDone;
        const pendingCount = [!contactDone, !fiscalDone, !paymentDone].filter(Boolean).length;
        const addrRaw = cc.address;
        const addrStr = typeof addrRaw === 'string'
          ? addrRaw
          : addrRaw ? [addrRaw.streetAddress, addrRaw.municipality].filter(Boolean).join(', ') : null;

        return (
          <div className="flex flex-col">
            <div style={{ background: BAND_GRADIENT['contacto'], padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: '#151b2d' }}>Contacto y cobros</span>
              {allDone
                ? <StatusPill done={true} />
                : <span style={{ fontFamily: SANS, fontSize: 7, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: 'rgba(236,109,19,0.1)', color: '#ec6d13' }}>
                    {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                  </span>
              }
            </div>
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SubRow
                icon="chat"
                name="WhatsApp / Email"
                value={cc.whatsapp || cc.email || null}
                done={contactDone}
                ctaPending="Agregar →"
                onClick={() => navigate('/mi-tienda/configurar/contact')}
              />
              <SubRow
                icon="receipt_long"
                name="RUT / NIT"
                value={profile?.rut ?? null}
                done={fiscalDone}
                ctaPending={profile?.rut ? 'Verificar →' : 'Registrar →'}
                ctaDone="Editar"
                onClick={() => navigate('/mi-tienda/configurar/contact?tab=rut', { state: { returnTo: '/mi-tienda/configurar' } })}
              />
              <SubRow
                icon="account_balance"
                name="Cuenta bancaria"
                value={paymentDone ? 'Cuenta configurada' : null}
                done={paymentDone}
                ctaPending="Configurar →"
                onClick={() => navigate('/mi-tienda/configurar/contact?tab=banco', { state: { returnTo: '/mi-tienda/configurar' } })}
              />
              <SubRow
                icon="location_on"
                name="Dirección"
                value={addrStr}
                done={!!addrStr}
                ctaPending="Agregar →"
                onClick={() => navigate('/mi-tienda/configurar/contact')}
              />
            </div>
          </div>
        );
      })()}

      {/* LEGAL */}
      {active === 'legal' && (() => {
        return (
          <div className="flex flex-col">
            <SectionBand id="legal" title="Políticas y FAQ" done={policiesDone} />
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SubRow
                icon="policy"
                name="Política de devoluciones"
                value={policiesDone ? 'Política configurada' : null}
                done={policiesDone}
                ctaPending="Crear política →"
                onClick={() => navigate('/mi-tienda/configurar/return-policy')}
              />
              <SubRow
                icon="quiz"
                name="Preguntas frecuentes"
                value={policiesDone ? 'Preguntas agregadas' : null}
                done={policiesDone}
                ctaPending="Agregar FAQ →"
                onClick={() => navigate('/mi-tienda/configurar/faq')}
              />
            </div>
          </div>
        );
      })()}

    </div>
  );
};
