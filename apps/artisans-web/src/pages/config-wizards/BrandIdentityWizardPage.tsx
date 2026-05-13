import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { updateArtisanShop } from '@/services/artisanShops.actions';
import { uploadImage, UploadFolder } from '@/services/fileUpload.actions';
import { WizardHeader } from '@/components/shop/new-product-wizard/components/WizardHeader';
import { WizardFooter } from '@/components/shop/new-product-wizard/components/WizardFooter';
import { ImageUploadSlot } from '@/components/ui/ImageUploadSlot';
import { AgentPlaceholder } from '@/components/ui/AgentPlaceholder';
import { UnsavedChangesDialog } from '@/components/ui/UnsavedChangesDialog';

const T = {
  dark:  '#151b2d',
  orange:'#ec6d13',
  muted: '#54433e',
  sans:  "'Manrope', sans-serif",
  serif: "'Noto Serif', serif",
};
const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 12,
  border: '1px solid rgba(84,67,62,0.14)', outline: 'none',
  fontFamily: T.sans, fontSize: 14, color: T.dark,
  background: 'rgba(247,244,239,0.5)',
};

const TOTAL_STEPS = 2;

export default function BrandIdentityWizardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo ?? '/mi-tienda/configurar';
  const { shop, loading } = useArtisanShop();
  const [step, setStep] = useState(1);
  const [logoUrl, setLogoUrl] = useState('');
  const [brandClaim, setBrandClaim] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [showGuard, setShowGuard] = useState(false);
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
    <div className="flex flex-col min-h-screen" style={{ background: '#f9f7f2' }}>
      {showGuard && (
        <UnsavedChangesDialog
          onSaveAndExit={handleSaveAndExit}
          onDiscardAndExit={() => navigate(returnTo)}
          onStay={() => setShowGuard(false)}
          isSaving={saving}
        />
      )}

      <WizardHeader
        step={step} totalSteps={TOTAL_STEPS}
        icon="palette" title="Identidad de marca"
        subtitle="Logo y tagline que representan tu taller"
        onBack={handleBack}
        onSaveProgress={isDirty ? handleSaveProgress : undefined}
        isSavingProgress={savingProgress}
      />

      <div className="flex-1 overflow-y-auto px-6 py-8 pb-28">
        <div className="max-w-xl mx-auto">

          {step === 1 && (
            <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
              <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.dark, marginBottom: 8 }}>
                El logo de tu tienda
              </p>
              <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70`, lineHeight: 1.6, marginBottom: 24 }}>
                Tu logo es la primera imagen que verán los compradores. Sube una imagen cuadrada, en fondo transparente o blanco.
              </p>
              <ImageUploadSlot
                label="Logo de la tienda" hint="Imagen cuadrada recomendada"
                url={logoUrl} uploading={uploadingLogo}
                onFile={handleLogoFile}
                onRemove={() => { setLogoUrl(''); updateArtisanShop(shop!.id, { logoUrl: '' } as any); }}
                aspect="aspect-square" icon="storefront"
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
                <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.dark, marginBottom: 8 }}>
                  El tagline de tu marca
                </p>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70`, lineHeight: 1.6, marginBottom: 24 }}>
                  Una frase corta que capture la esencia de tu taller. Aparece en tu tienda y en el marketplace.
                </p>
                <label style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: `${T.muted}80`, display: 'block', marginBottom: 6 }}>
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
              </div>
              <AgentPlaceholder context="brand" />
            </div>
          )}
        </div>
      </div>

      <WizardFooter
        step={step} totalSteps={TOTAL_STEPS}
        onBack={step > 1 ? () => setStep(s => s - 1) : undefined}
        onNext={step < TOTAL_STEPS ? () => setStep(s => s + 1) : undefined}
        isFinalStep={step === TOTAL_STEPS}
        onSubmit={handleFinish}
        isSubmitting={saving}
        submitLabel="Guardar identidad"
        onSaveAndExit={isDirty ? handleSaveAndExit : undefined}
        isSavingAndExiting={saving}
        leftOffset={80}
      />
    </div>
  );
}
