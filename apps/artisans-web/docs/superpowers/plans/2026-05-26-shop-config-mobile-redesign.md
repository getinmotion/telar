# ShopConfigDashboard Mobile Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el bento grid de ShopConfigDashboard en mobile con un nav de 6 iconos y una vista de sección completa por sección activa, con CTAs full-width y filas por sub-item para secciones complejas.

**Architecture:** Se extrae todo el layout mobile a un nuevo componente `MobileShopConfig` en `src/components/shop/mobile/`. La página `ShopConfigDashboard` pasa los datos necesarios como props y envuelve el bento grid existente con `hidden md:block`. El nuevo componente maneja su propio estado `activeSection`.

**Tech Stack:** React, TypeScript, Tailwind CSS, Material Symbols, react-router-dom `useNavigate`

---

## File Map

| Acción | Archivo | Responsabilidad |
|---|---|---|
| **Crear** | `src/components/shop/mobile/MobileShopConfig.tsx` | Componente completo mobile: nav + sección activa |
| **Modificar** | `src/pages/ShopConfigDashboard.tsx` | Renderizar `<MobileShopConfig>` + envolver desktop en `hidden md:block` |

---

## Task 1: Crear el esqueleto de `MobileShopConfig` con el nav de iconos

**Files:**
- Create: `src/components/shop/mobile/MobileShopConfig.tsx`

- [ ] **Paso 1.1: Crear el archivo con types, constantes y nav bar**

```tsx
// src/components/shop/mobile/MobileShopConfig.tsx
import React, { useState } from 'react';

const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

// ── Tipos ──────────────────────────────────────────────────────────────────────
type SectionId = 'perfil' | 'marca' | 'hero' | 'contacto' | 'legal' | 'diseno';

export interface MobileShopConfigProps {
  shop: any;
  userName: string;
  profile: any;
  navigate: (path: string, opts?: any) => void;
}

// ── Configuración de las 6 secciones ──────────────────────────────────────────
const SECTIONS: { id: SectionId; label: string; icon: string }[] = [
  { id: 'perfil',   label: 'Perfil',   icon: 'account_circle' },
  { id: 'marca',    label: 'Marca',    icon: 'palette' },
  { id: 'hero',     label: 'Hero',     icon: 'panorama' },
  { id: 'contacto', label: 'Contacto', icon: 'contacts' },
  { id: 'legal',    label: 'Legal',    icon: 'policy' },
  { id: 'diseno',   label: 'Diseño',   icon: 'style' },
];

// ── Helper: pill de estado ─────────────────────────────────────────────────────
const StatusPill: React.FC<{ done: boolean; partial?: boolean }> = ({ done, partial }) => {
  const bg    = done ? 'rgba(22,101,52,0.1)'    : partial ? 'rgba(236,109,19,0.1)'    : 'rgba(21,27,45,0.06)';
  const color = done ? '#166534'                 : partial ? '#ec6d13'                 : 'rgba(84,67,62,0.5)';
  const label = done ? '✓ Completo'              : partial ? 'En progreso'              : 'Pendiente';
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

// ── Componente principal ───────────────────────────────────────────────────────
export const MobileShopConfig: React.FC<MobileShopConfigProps> = ({ shop, userName, profile, navigate }) => {
  const s = shop as any;

  // Booleans derivados
  const brandDone    = !!(s.logoUrl && s.brandClaim);
  const brandPartial = !brandDone && !!(s.logoUrl || s.brandClaim || s.shopName);
  const heroDone     = !!(s.bannerUrl || s.heroConfig?.slides?.length > 0);
  const contactDone  = !!(s.contactConfig?.whatsapp || s.contactConfig?.email);
  const fiscalDone   = !!(profile?.rut && !profile?.rutPendiente);
  const paymentDone  = !!(s.idContraparty);
  const profileDone  = !!s.artisanProfileCompleted;

  // Sección por defecto: primera incompleta
  const defaultSection = (): SectionId => {
    if (!profileDone) return 'perfil';
    if (!brandDone)   return 'marca';
    if (!heroDone)    return 'hero';
    if (!contactDone || !fiscalDone || !paymentDone) return 'contacto';
    return 'perfil';
  };

  const [active, setActive] = useState<SectionId>(defaultSection);

  return (
    <div className="flex flex-col" style={{ flex: 1, minHeight: 0 }}>

      {/* ── Nav de iconos ── */}
      <div
        className="flex justify-around"
        style={{ background: 'white', borderBottom: '1px solid rgba(21,27,45,0.06)', padding: '7px 4px 6px', flexShrink: 0 }}
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
                style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? 'rgba(236,109,19,0.12)' : 'transparent' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: on ? '#ec6d13' : 'rgba(84,67,62,0.4)' }}>{icon}</span>
              </div>
              <span style={{ fontFamily: SANS, fontSize: 6.5, fontWeight: 800, color: on ? '#ec6d13' : 'rgba(84,67,62,0.38)', letterSpacing: '0.02em' }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Vista de sección activa (se completa en tareas siguientes) ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '0 0 80px' }}>
        <div style={{ padding: 16, color: 'rgba(84,67,62,0.4)', fontFamily: SANS, fontSize: 12 }}>
          Sección: {active}
        </div>
      </div>

    </div>
  );
};
```

- [ ] **Paso 1.2: Verificar que TypeScript no reporta errores**

```bash
cd /Users/mad/Proyectos/Telar/apps/artisans-web && npx tsc --noEmit 2>&1 | grep "MobileShopConfig" | head -10
```

Esperado: sin output (sin errores).

- [ ] **Paso 1.3: Commit**

```bash
git add src/components/shop/mobile/MobileShopConfig.tsx
git commit -m "feat: add MobileShopConfig skeleton with icon nav"
```

---

## Task 2: Implementar las secciones simples (Perfil, Marca, Hero, Diseño)

**Files:**
- Modify: `src/components/shop/mobile/MobileShopConfig.tsx`

Reemplazar el bloque `{/* ── Vista de sección activa ── */}` con el router de secciones completo.

- [ ] **Paso 2.1: Añadir el componente `SectionBand` y las vistas simples**

Justo antes de `export const MobileShopConfig`, añadir:

```tsx
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
  <div style={{ background: BAND_GRADIENT[id], padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
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
```

- [ ] **Paso 2.2: Añadir las 4 vistas de sección simple dentro de `MobileShopConfig`**

Reemplazar el bloque `{/* ── Vista de sección activa ── */}` con:

```tsx
      {/* ── Vista de sección activa ── */}
      <div className="flex-1 overflow-y-auto flex flex-col" style={{ minHeight: 0 }}>

        {/* PERFIL */}
        {active === 'perfil' && (() => {
          const ap = s.artisanProfile ?? {};
          const photoUrl = ap.artisanPhoto || ap.workshopPhoto || '';
          const craftType = ap.craftType || s.craftType || '';
          const dept = s.department || ap.department || '';
          const muni = s.municipality || ap.municipality || '';
          const bio = ap.shortBio || ap.story || ap.description || '';
          const initial = (ap.artisanName || userName || '?')[0].toUpperCase();
          return (
            <div className="flex flex-col">
              <SectionBand id="perfil" title="Identidad artesanal" done={profileDone} />
              {/* Preview */}
              <div style={{ height: 100, background: photoUrl ? 'transparent' : 'rgba(236,109,19,0.06)', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
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
                  <p style={{ fontFamily: SANS, fontSize: 10, color: s.brandClaim ? 'rgba(84,67,62,0.55)' : 'rgba(84,67,62,0.3)', fontStyle: s.brandClaim ? 'italic' : 'italic', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
              <div style={{ height: 100, background: s.bannerUrl ? 'transparent' : 'rgba(21,27,45,0.04)', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
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

      </div>
```

- [ ] **Paso 2.3: Verificar TypeScript**

```bash
cd /Users/mad/Proyectos/Telar/apps/artisans-web && npx tsc --noEmit 2>&1 | grep "MobileShopConfig" | head -10
```

Esperado: sin output.

- [ ] **Paso 2.4: Commit**

```bash
git add src/components/shop/mobile/MobileShopConfig.tsx
git commit -m "feat: implement simple sections in MobileShopConfig"
```

---

## Task 3: Implementar la sección Contacto (compleja con sub-items)

**Files:**
- Modify: `src/components/shop/mobile/MobileShopConfig.tsx`

- [ ] **Paso 3.1: Añadir la vista de Contacto dentro del bloque de sección activa**

Dentro del `<div className="flex-1 overflow-y-auto flex flex-col">`, antes del cierre `</div>`, añadir:

```tsx
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
              <div style={{ background: BAND_GRADIENT['contacto'], padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
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
```

- [ ] **Paso 3.2: Verificar TypeScript**

```bash
cd /Users/mad/Proyectos/Telar/apps/artisans-web && npx tsc --noEmit 2>&1 | head -10
```

Esperado: sin output.

- [ ] **Paso 3.3: Commit**

```bash
git add src/components/shop/mobile/MobileShopConfig.tsx
git commit -m "feat: implement Contacto section with sub-item rows"
```

---

## Task 4: Implementar la sección Legal (compleja con sub-items)

**Files:**
- Modify: `src/components/shop/mobile/MobileShopConfig.tsx`

- [ ] **Paso 4.1: Añadir la vista de Legal**

Dentro del bloque de sección activa, después del bloque de Contacto y antes del cierre `</div>`:

```tsx
        {/* LEGAL */}
        {active === 'legal' && (() => {
          const policiesDone = !!(s.idPoliciesConfig);
          const allDone = policiesDone;
          return (
            <div className="flex flex-col">
              <SectionBand id="legal" title="Políticas y FAQ" done={allDone} />
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
```

- [ ] **Paso 4.2: Verificar TypeScript**

```bash
cd /Users/mad/Proyectos/Telar/apps/artisans-web && npx tsc --noEmit 2>&1 | head -10
```

Esperado: sin output.

- [ ] **Paso 4.3: Commit**

```bash
git add src/components/shop/mobile/MobileShopConfig.tsx
git commit -m "feat: implement Legal section with sub-item rows"
```

---

## Task 5: Integrar `MobileShopConfig` en `ShopConfigDashboard`

**Files:**
- Modify: `src/pages/ShopConfigDashboard.tsx`

- [ ] **Paso 5.1: Añadir el import**

Al inicio de `ShopConfigDashboard.tsx`, después de los imports existentes, añadir:

```tsx
import { MobileShopConfig } from '@/components/shop/mobile/MobileShopConfig';
```

- [ ] **Paso 5.2: Localizar el bloque de main content**

Buscar en `ShopConfigDashboard.tsx` la línea:

```tsx
        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto px-4 md:px-12 pb-20" style={{ overscrollBehavior: 'contain' }}>
          <div className="max-w-[1300px] mx-auto pt-8">
```

- [ ] **Paso 5.3: Reemplazar el contenido de `<main>` con el split mobile/desktop**

```tsx
        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>

          {/* ── Mobile: hero + métricas + nav de iconos ── */}
          <div className="md:hidden flex flex-col" style={{ height: '100%' }}>
            <div style={{ padding: '0 12px' }}>
              {/* Hero card mobile (ya existente) */}
              <div className="mb-5 flex items-center gap-4 px-4 py-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 16px rgba(21,27,45,0.04)', marginTop: 8 }}
              >
                {s.logoUrl ? (
                  <img src={s.logoUrl} alt={shopName} className="w-16 h-16 rounded-2xl object-contain flex-shrink-0"
                    style={{ background: 'white', padding: 6, border: '1px solid rgba(21,27,45,0.07)', boxShadow: '0 2px 8px rgba(21,27,45,0.06)' }} />
                ) : (
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(236,109,19,0.07)', border: '1px solid rgba(236,109,19,0.12)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 30, color: '#ec6d13' }}>storefront</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, color: 'rgba(84,67,62,0.35)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 3 }}>Configuración</p>
                  <h1 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: '#151b2d', lineHeight: 1.15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {shopName}
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(21,27,45,0.08)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? '#166534' : '#ec6d13', transition: 'width 0.6s ease' }} />
                    </div>
                    <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: pct === 100 ? '#166534' : '#ec6d13', flexShrink: 0 }}>{pct}%</span>
                  </div>
                </div>
              </div>

              {/* 4 Metric Cards mobile */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <MetricCard label="Completadas" value={<span>{completedCount}<span style={{ fontSize: 20, opacity: 0.35 }}>/{sections.length}</span></span>} mobileValue={completedCount} mobileIconColor={completedCount === sections.length ? '#166534' : 'rgba(21,27,45,0.3)'} sub="secciones listas" icon="task_alt" />
                <MetricCard label="Progreso" value={<span style={{ color: pct === 100 ? '#166534' : pct >= 60 ? '#ec6d13' : '#151b2d' }}>{pct}<span style={{ fontSize: 20, opacity: 0.35 }}>%</span></span>} mobileValue={`${pct}%`} mobileIconColor={pct === 100 ? '#166534' : pct >= 60 ? '#ec6d13' : 'rgba(21,27,45,0.3)'} sub="configuración total" icon="donut_large" />
                <MetricCard label="Estado" value={<span style={{ fontSize: 18, fontWeight: 900, color: isShopActive ? '#166534' : '#ec6d13' }}>{isShopActive ? 'Activa' : 'Preparación'}</span>} mobileValue={isShopActive ? 'Live' : 'Prep.'} mobileIconColor={isShopActive ? '#166534' : '#ec6d13'} sub={isShopActive ? 'visible al público' : 'no activada aún'} icon={isShopActive ? 'storefront' : 'pending'} />
                <MetricCard label="Perfil" value={<span style={{ fontSize: 18, fontWeight: 900, color: profileDone ? '#166534' : 'rgba(21,27,45,0.4)' }}>{profileDone ? 'Completo' : 'Pendiente'}</span>} mobileValue={profileDone ? 'OK' : '—'} mobileIconColor={profileDone ? '#166534' : 'rgba(21,27,45,0.25)'} sub="historia y técnicas" icon="person_pin" />
              </div>
            </div>

            {/* Nav + sección — ocupa el resto de la pantalla */}
            <MobileShopConfig shop={shop} userName={userName} profile={profile} navigate={navigate} />
          </div>

          {/* ── Desktop: layout original sin cambios ── */}
          <div className="hidden md:block px-12 pb-20">
            <div className="max-w-[1300px] mx-auto pt-8">
```

> **Nota:** Después de insertar este bloque, necesitarás cerrar el `</div>` extra del desktop al final del `<main>`. Busca el cierre `</main>` y asegúrate de que el wrapper `hidden md:block` cierre antes.

- [ ] **Paso 5.4: Eliminar el bloque mobile duplicado del hero card y métricas**

Buscar y eliminar del cuerpo del `<main>` original:
1. El bloque `{/* ── Mobile shop hero ── */}` (ya estará duplicado en el nuevo split)
2. El div de métricas `<div className="grid grid-cols-4 gap-2 md:gap-4 mb-8">` (también duplicado)

> Mantener únicamente los del nuevo bloque `md:hidden`.

- [ ] **Paso 5.5: Añadir cierre correcto del div desktop antes de `</main>`**

Al final del contenido desktop (antes del `</main>`), asegurarse de que haya:

```tsx
            </div>{/* max-w */}
          </div>{/* hidden md:block */}

        </main>
```

- [ ] **Paso 5.6: Verificar TypeScript completo**

```bash
cd /Users/mad/Proyectos/Telar/apps/artisans-web && npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin output (sin errores).

- [ ] **Paso 5.7: Verificar que el build pasa**

```bash
cd /Users/mad/Proyectos/Telar/apps/artisans-web && npm run build 2>&1 | tail -5
```

Esperado: `✓ built in Xs`

- [ ] **Paso 5.8: Commit**

```bash
git add src/pages/ShopConfigDashboard.tsx src/components/shop/mobile/MobileShopConfig.tsx
git commit -m "feat: integrate MobileShopConfig into ShopConfigDashboard

- Mobile: icon nav + full section view
- Desktop: bento grid unchanged
- Hero card, metrics, and ORÁCULO context untouched"
```

---

## Self-Review

**Spec coverage:**
- ✅ Nav de 6 iconos fijos — Task 1
- ✅ Vista de sección completa por sección activa — Tasks 1-4
- ✅ Secciones simples con band + preview + CTA full-width — Task 2
- ✅ Contacto: 4 sub-items con CTAs directos — Task 3
- ✅ Legal: 2 sub-items con CTAs directos — Task 4
- ✅ Desktop intacto — Task 5
- ✅ `defaultSection` calcula primera sección incompleta — Task 1
- ✅ CTAs: `CtaOrange` si pendiente, `CtaOutline` si completo — Task 2

**Notas importantes para el ejecutor:**
- El Task 5 requiere cuidado con la anidación de `div`s — el main cambia su estructura.
- Los datos de la hero card y métricas se duplican en el split mobile/desktop — el bloque mobile del main original debe eliminarse (Paso 5.4).
- `profile` en `MobileShopConfigProps` viene de `useUnifiedUserData()` ya disponible en `ShopConfigDashboard`.
- Las variables `shopName`, `pct`, `sections`, `completedCount`, `isShopActive`, `profileDone` ya están computadas en `ShopConfigDashboard` — el split desktop las sigue usando.
