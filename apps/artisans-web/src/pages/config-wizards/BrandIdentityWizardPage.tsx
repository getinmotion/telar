import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { updateArtisanShop } from '@/services/artisanShops.actions';
import { uploadImage, UploadFolder } from '@/services/fileUpload.actions';
import { ImageUploadSlot } from '@/components/ui/ImageUploadSlot';
import { UnsavedChangesDialog } from '@/components/ui/UnsavedChangesDialog';
import { ConfigWizardShell } from '@/components/shop/config-wizards/ConfigWizardShell';
<<<<<<< HEAD
import { T, inputStyle } from '@/lib/telar-design';
=======
import { T } from '@/lib/telar-design';
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119

// ── Datos del panel de IA ─────────────────────────────────────────────────────
const AI_CARDS = [
  {
    label: 'Identidad visual',
    text: 'El logo es el ancla visual de tu marca. Una imagen cuadrada con fondo neutro garantiza coherencia en todos los puntos de contacto.',
  },
  {
    label: 'Tagline efectivo',
    text: 'Un buen tagline captura la esencia en menos de 10 palabras. Evita generalismos — cuanto más específico, más memorable.',
  },
  {
    label: 'Coherencia de marca',
    text: 'Logo y tagline trabajan juntos. TELAR los usará para construir automáticamente el hero y la presentación pública de tu tienda.',
  },
];

const AI_NEXT = 'Con la identidad definida podrás configurar la paleta de colores y el hero visual de tu tienda.';

// ── Página ────────────────────────────────────────────────────────────────────
export default function BrandIdentityWizardPage() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const returnTo    = (location.state as any)?.returnTo ?? '/mi-tienda/configurar';
  const { shop, loading } = useArtisanShop();

  const [logoUrl,         setLogoUrl]         = useState('');
  const [brandClaim,      setBrandClaim]      = useState('');
  const [uploadingLogo,   setUploadingLogo]   = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [savingProgress,  setSavingProgress]  = useState(false);
  const [showGuard,       setShowGuard]       = useState(false);
  const initRef = useRef({ brandClaim: '' });

  useEffect(() => {
    if (!shop) return;
    const s = shop as any;
    const claim = s.brandClaim ?? '';
    setLogoUrl(s.logoUrl ?? '');
    setBrandClaim(claim);
    initRef.current = { brandClaim: claim };
  }, [shop?.id]);

  const isDirty = brandClaim !== initRef.current.brandClaim;

  const handleLogoFile = async (file: File) => {
    if (!shop) return;
    setUploadingLogo(true);
    try {
      const r = await uploadImage(file, UploadFolder.SHOPS);
      setLogoUrl(r.url);
      await updateArtisanShop(shop.id, { logoUrl: r.url } as any);
      toast.success('Logo guardado');
    } catch { toast.error('Error al subir logo'); }
    finally { setUploadingLogo(false); }
  };

  const saveData = async () => {
    if (!shop) return;
    await updateArtisanShop(shop.id, { brandClaim } as any);
    initRef.current = { brandClaim };
  };

  const handleSaveProgress = async () => {
    setSavingProgress(true);
    try { await saveData(); toast.success('Progreso guardado'); }
    catch { toast.error('Error al guardar'); }
    finally { setSavingProgress(false); }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await saveData();
      toast.success('Identidad de marca guardada');
      navigate(returnTo);
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleSaveAndExit = async () => {
    setSaving(true);
    try { await saveData(); toast.success('Guardado'); navigate(returnTo); }
    catch { toast.error('Error al guardar'); setSaving(false); }
  };

  const handleBack = () => {
    if (isDirty) { setShowGuard(true); return; }
    navigate(returnTo);
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 32, color: T.orange }}>progress_activity</span>
    </div>
  );

  return (
    <>
      {showGuard && (
        <UnsavedChangesDialog
          onSaveAndExit={handleSaveAndExit}
          onDiscardAndExit={() => navigate(returnTo)}
          onStay={() => setShowGuard(false)}
          isSaving={saving}
        />
      )}

      <ConfigWizardShell
        icon="palette"
        title="Identidad de marca"
        subtitle="Logo y tagline que representan tu taller"
        onBack={handleBack}
        onSaveProgress={isDirty ? handleSaveProgress : undefined}
        isSavingProgress={savingProgress}
        aiCards={AI_CARDS}
        aiNext={AI_NEXT}
        submitLabel="Guardar identidad"
        onSubmit={handleFinish}
        isSubmitting={saving}
        onSaveAndExit={isDirty ? handleSaveAndExit : undefined}
        isSavingAndExiting={saving}
      >

        {/* ── Logo ────────────────────────────────────────────────────── */}
<<<<<<< HEAD
        <div>
          <p style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 700, color: T.dark, marginBottom: 4 }}>
            Logo de tu tienda
          </p>
          <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}60`, lineHeight: 1.5, marginBottom: 20 }}>
            Primera imagen que ven los compradores. Imagen cuadrada en fondo transparente o blanco.
          </p>
          <div className="w-1/3 md:w-1/4">
            <ImageUploadSlot
              label="Logo de la tienda" hint="Imagen cuadrada recomendada"
              url={logoUrl} uploading={uploadingLogo}
              onFile={handleLogoFile}
              onRemove={() => { setLogoUrl(''); updateArtisanShop(shop!.id, { logoUrl: '' } as any); }}
              aspect="aspect-square" icon="storefront"
            />
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(84,67,62,0.08)' }} />

        {/* ── Tagline ─────────────────────────────────────────────────── */}
        <div>
          <p style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 700, color: T.dark, marginBottom: 4 }}>
            Tagline de tu marca
          </p>
          <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}60`, lineHeight: 1.5, marginBottom: 16 }}>
            Una frase corta que capture la esencia de tu taller. Aparece en tu tienda y en el marketplace.
          </p>
          <label style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: `${T.muted}65`, display: 'block', marginBottom: 6 }}>
            Tagline / Claim
          </label>
          <input
            value={brandClaim}
            onChange={e => setBrandClaim(e.target.value)}
            placeholder="Ej. Tejidos que cuentan historias ancestrales"
            style={inputStyle}
            maxLength={120}
          />
          <p style={{ fontFamily: T.sans, fontSize: 10, color: `${T.muted}40`, marginTop: 6, textAlign: 'right' }}>
            {brandClaim.length}/120
          </p>
=======
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-['Noto_Serif'] text-[18px] md:text-[17px] font-[700] text-[#151b2d] leading-snug">
              Logo de tu tienda
            </p>
            <p className="font-['Manrope'] text-[14px] md:text-[13px] text-[#54433e]/55 leading-relaxed mt-1.5">
              Primera imagen que ven los compradores. Usa una imagen cuadrada con fondo transparente o blanco.
            </p>
          </div>

          <div className="flex items-start gap-5">
            <div className="w-[120px] md:w-[100px] shrink-0">
              <ImageUploadSlot
                label="Logo de la tienda" hint="Imagen cuadrada"
                url={logoUrl} uploading={uploadingLogo}
                onFile={handleLogoFile}
                onRemove={() => { setLogoUrl(''); updateArtisanShop(shop!.id, { logoUrl: '' } as any); }}
                aspect="aspect-square" icon="storefront"
              />
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <p className="font-['Manrope'] text-[12px] font-[700] text-[#54433e]/60">
                Recomendaciones
              </p>
              {[
                { icon: 'crop_square',    text: 'Formato cuadrado (1:1)' },
                { icon: 'brightness_high', text: 'Fondo blanco o transparente' },
                { icon: 'high_quality',   text: 'Mínimo 400×400 px' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px] text-[#ec6d13]">{icon}</span>
                  <span className="font-['Manrope'] text-[12px] text-[#54433e]/50">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-[#54433e]/8" />

        {/* ── Tagline ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-['Noto_Serif'] text-[18px] md:text-[17px] font-[700] text-[#151b2d] leading-snug">
              Tagline de tu marca
            </p>
            <p className="font-['Manrope'] text-[14px] md:text-[13px] text-[#54433e]/55 leading-relaxed mt-1.5">
              Una frase corta que capture la esencia de tu taller. Aparece en tu tienda y en el marketplace.
            </p>
          </div>

          <div>
            <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-2">
              Tagline / Claim
            </label>
            <input
              value={brandClaim}
              onChange={e => setBrandClaim(e.target.value)}
              placeholder="Ej. Tejidos que cuentan historias ancestrales"
              maxLength={120}
              className="w-full rounded-[10px] px-4 py-3 font-['Manrope'] text-[16px] md:text-[14px] text-[#151b2d] border border-[#54433e]/14 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 transition-all placeholder:text-[#151b2d]/25"
              style={{ background: 'rgba(247,244,239,0.5)' }}
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="font-['Manrope'] text-[11px] text-[#54433e]/40">
                Máximo 10 palabras, sé específico y auténtico
              </p>
              <p className="font-['Manrope'] text-[11px] text-[#54433e]/35 shrink-0">
                {brandClaim.length}/120
              </p>
            </div>
          </div>

          {brandClaim.trim() && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(236,109,19,0.05)', border: '1px solid rgba(236,109,19,0.15)' }}
            >
              <span className="material-symbols-outlined text-[16px] text-[#ec6d13] shrink-0 mt-0.5">format_quote</span>
              <div>
                <p className="font-['Manrope'] text-[9px] font-[800] uppercase tracking-widest text-[#ec6d13]/70 mb-1">
                  Vista previa
                </p>
                <p className="font-['Noto_Serif'] text-[15px] text-[#151b2d] leading-snug italic">
                  {brandClaim}
                </p>
              </div>
            </div>
          )}
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119
        </div>

      </ConfigWizardShell>
    </>
  );
}
