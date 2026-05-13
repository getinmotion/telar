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
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1px solid rgba(84,67,62,0.14)', outline: 'none',
  fontFamily: T.sans, fontSize: 13, color: T.dark,
  background: 'rgba(247,244,239,0.5)',
};

const TOTAL_STEPS = 2;

export default function HeroImagesWizardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo ?? '/mi-tienda/configurar';
  const { shop, loading } = useArtisanShop();
  const [step, setStep] = useState(1);
  const [bannerUrl, setBannerUrl] = useState('');
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSub, setNewSlideSub] = useState('');
  const [showAddSlide, setShowAddSlide] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [showGuard, setShowGuard] = useState(false);
  const initRef = useRef({ slides: '[]' });

  useEffect(() => {
    if (!shop) return;
    const s = shop as any;
    const slides = s.heroConfig?.slides ?? [];
    setBannerUrl(s.bannerUrl ?? '');
    setHeroSlides(slides);
    initRef.current = { slides: JSON.stringify(slides) };
  }, [shop?.id]);

  const isDirty = JSON.stringify(heroSlides) !== initRef.current.slides;

  const handleBannerFile = async (file: File) => {
    if (!shop) return;
    setUploadingBanner(true);
    try {
      const r = await uploadImage(file, UploadFolder.HERO);
      setBannerUrl(r.url);
      await updateArtisanShop(shop.id, { bannerUrl: r.url } as any);
      toast.success('Banner guardado');
    } catch { toast.error('Error al subir banner'); }
    finally { setUploadingBanner(false); }
  };

  const addSlide = () => {
    if (!newSlideTitle.trim()) return;
    setHeroSlides(prev => [...prev, { id: `manual-${Date.now()}`, title: newSlideTitle, subtitle: newSlideSub }]);
    setNewSlideTitle(''); setNewSlideSub(''); setShowAddSlide(false);
  };

  const saveData = async () => {
    if (!shop) return;
    await updateArtisanShop(shop.id, {
      bannerUrl,
      heroConfig: { slides: heroSlides, autoplay: true, duration: 5000 },
    } as any);
    initRef.current = { slides: JSON.stringify(heroSlides) };
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
      toast.success('Imágenes de portada guardadas');
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
        icon="panorama" title="Imágenes de portada"
        subtitle="Banner y slides que dan vida a tu tienda"
        onBack={handleBack}
        onSaveProgress={isDirty ? handleSaveProgress : undefined}
        isSavingProgress={savingProgress}
      />

      <div className="flex-1 overflow-y-auto px-6 py-8 pb-28">
        <div className="max-w-xl mx-auto">

          {step === 1 && (
            <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
              <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.dark, marginBottom: 8 }}>
                Banner principal
              </p>
              <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70`, lineHeight: 1.6, marginBottom: 24 }}>
                La imagen de cabecera de tu tienda. Usa una foto horizontal de alta calidad (1440×500px recomendado).
              </p>
              <ImageUploadSlot
                label="Banner de tienda" hint="1440×500px recomendado"
                url={bannerUrl} uploading={uploadingBanner}
                onFile={handleBannerFile}
                onRemove={() => { setBannerUrl(''); updateArtisanShop(shop!.id, { bannerUrl: '' } as any); }}
                aspect="aspect-video" icon="panorama"
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
                <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.dark, marginBottom: 8 }}>
                  Slides del hero
                </p>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70`, lineHeight: 1.6, marginBottom: 24 }}>
                  Mensajes en rotación que aparecen sobre el banner. Agrega hasta 5 slides con título y subtítulo.
                </p>

                {showAddSlide ? (
                  <div className="rounded-xl p-4 mb-4 flex flex-col gap-3" style={{ background: 'rgba(236,109,19,0.05)', border: '1px solid rgba(236,109,19,0.15)' }}>
                    <input value={newSlideTitle} onChange={e => setNewSlideTitle(e.target.value)} placeholder="Título del slide" style={inputStyle} />
                    <input value={newSlideSub} onChange={e => setNewSlideSub(e.target.value)} placeholder="Subtítulo (opcional)" style={inputStyle} />
                    <div className="flex gap-2">
                      <button onClick={addSlide} disabled={!newSlideTitle.trim()}
                        style={{ padding: '8px 18px', borderRadius: 100, background: T.dark, color: 'white', border: 'none', cursor: 'pointer', fontFamily: T.sans, fontSize: 11, fontWeight: 800, opacity: newSlideTitle.trim() ? 1 : 0.4 }}>
                        Agregar
                      </button>
                      <button onClick={() => setShowAddSlide(false)}
                        style={{ padding: '8px 18px', borderRadius: 100, background: 'transparent', color: T.orange, border: `1px solid rgba(236,109,19,0.3)`, cursor: 'pointer', fontFamily: T.sans, fontSize: 11, fontWeight: 800 }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddSlide(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px dashed rgba(84,67,62,0.2)`, borderRadius: 10, padding: '10px 16px', cursor: 'pointer', color: T.orange, fontFamily: T.sans, fontSize: 12, fontWeight: 700, marginBottom: 16, width: '100%', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                    Agregar slide
                  </button>
                )}

                {heroSlides.length === 0 ? (
                  <div className="rounded-xl py-8 flex flex-col items-center gap-2" style={{ background: `${T.dark}03`, border: `1px dashed ${T.dark}10` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 24, color: `${T.muted}20` }}>view_carousel</span>
                    <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}40` }}>Sin slides — agrega uno arriba</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {heroSlides.map((slide, i) => (
                      <div key={slide.id ?? i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${T.dark}04`, border: `1px solid ${T.dark}07` }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: `${T.muted}30` }}>drag_indicator</span>
                        <div className="flex-1 min-w-0">
                          <p style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slide.title}</p>
                          {slide.subtitle && <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}55`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slide.subtitle}</p>}
                        </div>
                        <button onClick={() => setHeroSlides(heroSlides.filter((_, j) => j !== i))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: `${T.muted}35`, display: 'flex', padding: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <AgentPlaceholder context="hero" />
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
        submitLabel="Guardar imágenes"
        onSaveAndExit={isDirty ? handleSaveAndExit : undefined}
        isSavingAndExiting={saving}
        leftOffset={80}
      />
    </div>
  );
}
