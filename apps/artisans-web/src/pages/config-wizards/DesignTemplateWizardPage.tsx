import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { updateArtisanShop } from '@/services/artisanShops.actions';
import { UnsavedChangesDialog } from '@/components/ui/UnsavedChangesDialog';
import { ConfigWizardShell } from '@/components/shop/config-wizards/ConfigWizardShell';
import { T } from '@/lib/telar-design';

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface PreviewProps {
  shopName: string; brandClaim: string; craftType: string;
  region: string; municipality: string; logoUrl: string;
  bannerUrl: string; marketplaceApproved: boolean; slug: string;
}

// ── Previews ──────────────────────────────────────────────────────────────────
const EcommercePreview: React.FC<PreviewProps> = ({ shopName, brandClaim, craftType, region, municipality, logoUrl, bannerUrl, slug }) => (
  <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.dark}10`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
    <div className="relative" style={{ height: 110, background: bannerUrl ? 'transparent' : `linear-gradient(135deg, ${T.dark} 0%, #2a3550 100%)` }}>
      {bannerUrl && <img src={bannerUrl} className="w-full h-full object-cover" alt="" />}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-3 py-2" style={{ background: 'rgba(21,27,45,0.5)', backdropFilter: 'blur(8px)' }}>
        <span style={{ fontFamily: T.serif, fontSize: 10, color: 'white', letterSpacing: '0.06em' }}>TELAR</span>
        <div className="flex gap-1.5">
          {['Inicio', 'Catálogo', 'Historia'].map(t => (
            <span key={t} style={{ fontFamily: T.sans, fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{t}</span>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-4 left-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: 'white', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
          {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain" alt="" /> : <span className="material-symbols-outlined" style={{ fontSize: 18, color: `${T.muted}40` }}>storefront</span>}
        </div>
      </div>
    </div>
    <div style={{ background: 'white', padding: '22px 12px 12px' }}>
      <p style={{ fontFamily: T.serif, fontSize: 14, color: T.dark }}>{shopName || 'Nombre de la tienda'}</p>
      {brandClaim && <p style={{ fontFamily: T.sans, fontSize: 9, color: `${T.muted}70`, marginTop: 2, fontStyle: 'italic' }}>"{brandClaim}"</p>}
      <div className="flex items-center gap-2 mt-2">
        {craftType && <span style={{ fontFamily: T.sans, fontSize: 8, fontWeight: 700, color: T.orange, background: 'rgba(236,109,19,0.08)', padding: '3px 7px', borderRadius: 100, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{craftType}</span>}
        {(municipality || region) && <span style={{ fontFamily: T.sans, fontSize: 8, color: `${T.muted}60` }}>{[municipality, region].filter(Boolean).join(', ')}</span>}
      </div>
    </div>
    {slug && (
      <div style={{ background: `${T.dark}04`, borderTop: `1px solid ${T.dark}06`, padding: '5px 12px' }}>
        <span style={{ fontFamily: T.sans, fontSize: 9, color: `${T.muted}40` }}>telar.co/tienda/{slug}</span>
      </div>
    )}
  </div>
);

const MarketplacePreview: React.FC<PreviewProps> = ({ shopName, craftType, region, municipality, logoUrl, bannerUrl, marketplaceApproved }) => (
  <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.dark}10`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', background: 'white' }}>
    <div style={{ height: 100, background: bannerUrl ? 'transparent' : `${T.dark}08`, position: 'relative', overflow: 'hidden' }}>
      {bannerUrl ? <img src={bannerUrl} className="w-full h-full object-cover" alt="" />
        : logoUrl ? <img src={logoUrl} className="w-full h-full object-contain p-4" alt="" style={{ background: '#fafafa' }} />
        : <div className="flex items-center justify-center h-full"><span className="material-symbols-outlined" style={{ fontSize: 32, color: `${T.muted}20` }}>storefront</span></div>
      }
      {marketplaceApproved && (
        <div className="absolute top-2 left-2 flex items-center gap-1" style={{ background: 'rgba(34,197,94,0.9)', borderRadius: 100, padding: '3px 8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 10, color: 'white' }}>verified</span>
          <span style={{ fontFamily: T.sans, fontSize: 8, fontWeight: 800, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Verificado</span>
        </div>
      )}
    </div>
    <div style={{ padding: '10px 12px 12px' }}>
      <p style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.dark }}>{shopName || 'Nombre de la tienda'}</p>
      {craftType && <p style={{ fontFamily: T.sans, fontSize: 10, color: T.orange, marginTop: 2, fontWeight: 600 }}>{craftType}</p>}
      {(municipality || region) && (
        <div className="flex items-center gap-1 mt-1.5">
          <span className="material-symbols-outlined" style={{ fontSize: 11, color: `${T.muted}40` }}>location_on</span>
          <span style={{ fontFamily: T.sans, fontSize: 10, color: `${T.muted}60` }}>{[municipality, region].filter(Boolean).join(', ')}</span>
        </div>
      )}
    </div>
  </div>
);

// ── Datos del panel de IA por paso ────────────────────────────────────────────
const PANEL = {
  1: {
    cards: [
      {
        label: 'Plantilla Editorial',
        text: 'La plantilla TELAR Editorial prioriza la historia detrás de cada pieza. Ideal para artesanías con tradición y contexto cultural.',
      },
      {
        label: 'Consistencia de marca',
        text: 'La plantilla se combina automáticamente con tu logo, colores y fotos hero para crear una experiencia visual coherente.',
      },
      {
        label: 'Más plantillas pronto',
        text: 'Estamos diseñando plantillas Minimalista, Premium y Floral. Podrás cambiar de plantilla en cualquier momento sin perder tu contenido.',
      },
    ],
    next: 'En el siguiente paso verás cómo quedará tu tienda antes de confirmar.',
  },
  2: {
    cards: [
      {
        label: 'Vista de tienda',
        text: 'Así verán tu tienda los compradores que llegan directamente desde un enlace o redes sociales.',
      },
      {
        label: 'Vista de marketplace',
        text: 'Esta es la tarjeta que aparece en el catálogo de TELAR. Cuida que el banner y el logo se vean bien recortados.',
      },
      {
        label: 'Mantén el contenido actualizado',
        text: 'La vista previa refleja la información actual. Edita tu logo, banner y tagline en las secciones correspondientes.',
      },
    ],
    next: 'Confirma el diseño y tu tienda quedará lista para recibir compradores.',
  },
};

const TOTAL_STEPS = 2;

// ── Página ────────────────────────────────────────────────────────────────────
export default function DesignTemplateWizardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo ?? '/mi-tienda/configurar';
  const { shop, loading } = useArtisanShop();

  const [step,           setStep]          = useState(1);
  const [activeThemeId,  setActiveThemeId] = useState('editorial');
  const [previewMode,    setPreviewMode]   = useState<'ecommerce' | 'marketplace'>('ecommerce');
  const [saving,         setSaving]        = useState(false);
  const [showGuard,      setShowGuard]     = useState(false);
  const initRef = useRef('editorial');

  useEffect(() => {
    if (!shop) return;
    const s = shop as any;
    const theme = s.activeThemeId ?? 'editorial';
    setActiveThemeId(theme);
    initRef.current = theme;
  }, [shop?.id]);

  const isDirty = activeThemeId !== initRef.current;

  const selectTheme = async (id: string) => {
    if (!shop) return;
    setActiveThemeId(id);
    try {
      await updateArtisanShop(shop.id, { activeThemeId: id } as any);
      initRef.current = id;
    } catch { toast.error('Error al seleccionar plantilla'); }
  };

  const handleBack = () => {
    if (step > 1) { setStep(s => s - 1); return; }
    if (isDirty) { setShowGuard(true); return; }
    navigate(returnTo);
  };

  const handleFinish = async () => {
    toast.success('Plantilla guardada');
    navigate(returnTo);
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 32, color: T.orange }}>progress_activity</span>
    </div>
  );

  const s = shop as any;
  const previewProps: PreviewProps = {
    shopName:           s?.shopName ?? '',
    brandClaim:         s?.brandClaim ?? '',
    craftType:          s?.craftType ?? '',
    region:             s?.department ?? s?.artisanProfile?.department ?? '',
    municipality:       s?.municipality ?? s?.artisanProfile?.municipality ?? '',
    logoUrl:            s?.logoUrl ?? '',
    bannerUrl:          s?.bannerUrl ?? '',
    marketplaceApproved: !!s?.marketplaceApproved,
    slug:               s?.slug ?? s?.shopSlug ?? '',
  };

  const panel = PANEL[step as 1 | 2];

  return (
    <>
      {showGuard && (
        <UnsavedChangesDialog
          onSaveAndExit={async () => { setSaving(true); navigate(returnTo); }}
          onDiscardAndExit={() => navigate(returnTo)}
          onStay={() => setShowGuard(false)}
          isSaving={saving}
        />
      )}

      <ConfigWizardShell
        icon="preview"
        title="Diseño y plantilla"
        subtitle="Elige el estilo visual de tu tienda"
        step={step}
        totalSteps={TOTAL_STEPS}
        onBack={handleBack}
        aiCards={panel.cards}
        aiNext={panel.next}
        submitLabel="Confirmar diseño"
        onSubmit={handleFinish}
        isSubmitting={saving}
        onNext={step < TOTAL_STEPS ? () => setStep(s => s + 1) : undefined}
      >

        {/* ── Paso 1: Selección de plantilla ──────────────────────────── */}
        {step === 1 && (
          <div>
            <p style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 700, color: T.dark, margin: '0 0 4px' }}>
              Plantilla de tienda
            </p>
            <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}60`, lineHeight: 1.5, margin: '0 0 20px' }}>
              Elige el diseño visual de tu tienda personal. Más plantillas estarán disponibles próximamente.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => selectTheme('editorial')}
                className="relative flex flex-col items-center gap-2 p-5 rounded-xl transition-all"
                style={{
                  cursor: 'pointer',
                  border: `2px solid ${activeThemeId === 'editorial' || !activeThemeId ? T.orange : `${T.dark}10`}`,
                  background: activeThemeId === 'editorial' || !activeThemeId ? 'rgba(236,109,19,0.05)' : `${T.dark}03`,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: activeThemeId === 'editorial' || !activeThemeId ? T.orange : `${T.muted}30` }}>auto_stories</span>
                <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: activeThemeId === 'editorial' || !activeThemeId ? T.dark : `${T.muted}65` }}>TELAR Editorial</span>
                {(activeThemeId === 'editorial' || !activeThemeId) && (
                  <span style={{ position: 'absolute', top: 8, right: 8, fontFamily: T.sans, fontSize: 8, fontWeight: 800, background: T.orange, color: 'white', padding: '2px 6px', borderRadius: 100 }}>Activa</span>
                )}
              </button>
              {[
                { id: 'premium',  icon: 'workspace_premium', label: 'Premium' },
                { id: 'minimal',  icon: 'tonality',          label: 'Minimalista' },
                { id: 'floral',   icon: 'local_florist',     label: 'Floral' },
              ].map(tpl => (
                <div
                  key={tpl.id}
                  style={{ position: 'relative', cursor: 'not-allowed', border: `2px solid ${T.dark}08`, background: `${T.dark}03`, borderRadius: 12, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.45, pointerEvents: 'none' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 32, color: `${T.muted}30` }}>{tpl.icon}</span>
                  <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: `${T.muted}50` }}>{tpl.label}</span>
                  <span style={{ position: 'absolute', top: 8, right: 8, fontFamily: T.sans, fontSize: 8, fontWeight: 800, background: `${T.dark}15`, color: `${T.muted}60`, padding: '2px 6px', borderRadius: 100 }}>Pronto</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Paso 2: Vista previa ─────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <p style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 700, color: T.dark, margin: '0 0 4px' }}>
              Vista previa
            </p>
            <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}60`, lineHeight: 1.5, margin: '0 0 16px' }}>
              Así se verá tu tienda en cada contexto. Guarda cambios en otras secciones para actualizar la vista previa.
            </p>

            {/* Selector de modo */}
            <div className="flex items-center gap-1 p-1 rounded-2xl mb-6" style={{ background: `${T.dark}06`, width: 'fit-content' }}>
              {(['ecommerce', 'marketplace'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl transition-all"
                  style={{ border: 'none', cursor: 'pointer', fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, background: previewMode === mode ? T.dark : 'transparent', color: previewMode === mode ? 'white' : `${T.muted}55` }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{mode === 'ecommerce' ? 'storefront' : 'apps'}</span>
                  {mode === 'ecommerce' ? 'Mi tienda' : 'Marketplace'}
                </button>
              ))}
            </div>

            <div className="max-w-xs">
              {previewMode === 'ecommerce' ? <EcommercePreview {...previewProps} /> : <MarketplacePreview {...previewProps} />}
            </div>
          </div>
        )}

      </ConfigWizardShell>
    </>
  );
}
