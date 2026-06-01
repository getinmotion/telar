import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { updateArtisanShop } from '@/services/artisanShops.actions';
import { uploadImage, UploadFolder } from '@/services/fileUpload.actions';
import { ImageUploadSlot } from '@/components/ui/ImageUploadSlot';
import { UnsavedChangesDialog } from '@/components/ui/UnsavedChangesDialog';
import { ConfigWizardShell } from '@/components/shop/config-wizards/ConfigWizardShell';
import { T, inputStyle } from '@/lib/telar-design';

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Tab = 'banner' | 'hero';
type CtaType = 'products' | 'product' | 'profile';

interface HeroSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaType: CtaType;
  ctaProductUrl?: string;
}

const CTA_OPTIONS: { value: CtaType; label: string }[] = [
  { value: 'products', label: 'Ver productos' },
  { value: 'product',  label: 'Ver producto específico' },
  { value: 'profile',  label: 'Ir al perfil' },
];

// ── Datos del panel de IA por pestaña ─────────────────────────────────────────
const PANEL: Record<Tab, { cards: Array<{ label: string; text: string }>; next: string }> = {
  banner: {
    cards: [
      { label: 'Tarjeta de marketplace', text: 'Esta imagen aparece en la sección Talleres del marketplace y en el directorio de tiendas. Es la primera impresión visual de tu taller.' },
      { label: 'Dimensiones recomendadas', text: '1440×500px. El sujeto principal debe estar centrado — en mobile se recortan los bordes laterales.' },
      { label: 'Impacto visual', text: 'Los talleres con banner obtienen significativamente más clics. Prioriza una foto real de tus piezas o tu espacio de trabajo.' },
    ],
    next: 'Con el banner listo, configura los slides del hero para que los visitantes de tu tienda tengan una bienvenida impactante.',
  },
  hero: {
    cards: [
      { label: 'Hero del ecommerce', text: 'Los slides son lo primero que ven los visitantes de tu tienda. Máximo 3 slides en rotación automática.' },
      { label: 'Estructura de un slide', text: 'Cada slide combina imagen de fondo, título, subtítulo y un botón de acción. El template de tu tienda define los estilos tipográficos.' },
      { label: 'CTAs efectivos', text: 'Dirige al comprador: al catálogo completo, a un producto destacado, o a tu historia como artesano.' },
    ],
    next: 'Con el hero listo, tu tienda tiene una presentación completa. Revisa el resto de la configuración para publicar.',
  },
};

// ── Página ────────────────────────────────────────────────────────────────────
export default function HeroImagesWizardPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const returnTo  = (location.state as any)?.returnTo ?? '/mi-tienda/configurar';
  const { shop, loading } = useArtisanShop();

  const [activeTab,       setActiveTab]       = useState<Tab>('banner');
  const [bannerUrl,       setBannerUrl]       = useState('');
  const [heroSlides,      setHeroSlides]      = useState<HeroSlide[]>([]);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingSlide,  setUploadingSlide]  = useState<string | null>(null);
  const [saving,          setSaving]          = useState(false);
  const [showGuard,       setShowGuard]       = useState(false);
  const initRef = useRef({ bannerUrl: '', slides: '[]' });

  useEffect(() => {
    if (!shop) return;
    const s = shop as any;
    const slides: HeroSlide[] = (s.heroConfig?.slides ?? []).map((sl: any) => ({
      id: sl.id ?? `sl-${Date.now()}-${Math.random()}`,
      imageUrl: sl.imageUrl ?? '',
      title: sl.title ?? '',
      subtitle: sl.subtitle ?? '',
      ctaType: (sl.ctaType ?? 'products') as CtaType,
      ctaProductUrl: sl.ctaProductUrl ?? '',
    }));
    const url = s.bannerUrl ?? '';
    setBannerUrl(url);
    setHeroSlides(slides);
    initRef.current = { bannerUrl: url, slides: JSON.stringify(slides) };
  }, [shop?.id]);

  const isDirty = bannerUrl !== initRef.current.bannerUrl
    || JSON.stringify(heroSlides) !== initRef.current.slides;

  const handleBannerFile = async (file: File) => {
    if (!shop) return;
    setUploadingBanner(true);
    try {
      const r = await uploadImage(file, UploadFolder.HERO);
      setBannerUrl(r.url);
      await updateArtisanShop(shop.id, { bannerUrl: r.url } as any);
      initRef.current = { ...initRef.current, bannerUrl: r.url };
      toast.success('Banner guardado');
    } catch { toast.error('Error al subir banner'); }
    finally { setUploadingBanner(false); }
  };

  const handleSlideImageFile = async (slideId: string, file: File) => {
    setUploadingSlide(slideId);
    try {
      const r = await uploadImage(file, UploadFolder.HERO);
      setHeroSlides(prev => prev.map(s => s.id === slideId ? { ...s, imageUrl: r.url } : s));
    } catch { toast.error('Error al subir imagen'); }
    finally { setUploadingSlide(null); }
  };

  const addSlide = () => {
    if (heroSlides.length >= 3) return;
    setHeroSlides(prev => [...prev, { id: `slide-${Date.now()}`, imageUrl: '', title: '', subtitle: '', ctaType: 'products' }]);
  };

  const updateSlide = (id: string, patch: Partial<HeroSlide>) =>
    setHeroSlides(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));

  const removeSlide = (id: string) =>
    setHeroSlides(prev => prev.filter(s => s.id !== id));

  const saveData = async () => {
    if (!shop) return;
    await updateArtisanShop(shop.id, {
      bannerUrl,
      heroConfig: { slides: heroSlides, autoplay: true, duration: 5000 },
    } as any);
    initRef.current = { bannerUrl, slides: JSON.stringify(heroSlides) };
  };

  const handleFinish = async () => {
    setSaving(true);
    try { await saveData(); toast.success('Imágenes de portada guardadas'); navigate(returnTo); }
    catch { toast.error('Error al guardar'); }
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

  const panel = PANEL[activeTab];

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
        icon="panorama"
        title="Imágenes de portada"
        subtitle="Banner y hero de tu tienda"
        onBack={handleBack}
        onSaveProgress={isDirty ? handleSaveAndExit : undefined}
        isSavingProgress={saving}
        aiCards={panel.cards}
        aiNext={panel.next}
        submitLabel="Guardar imágenes"
        onSubmit={handleFinish}
        isSubmitting={saving}
        onSaveAndExit={isDirty ? handleSaveAndExit : undefined}
        isSavingAndExiting={saving}
      >

        {/* ── Tabs Banner / Hero ───────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(84,67,62,0.06)', borderRadius: 12, padding: 4 }}>
          {(['banner', 'hero'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontFamily: T.sans, fontSize: 12, fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? T.dark : `${T.muted}55`,
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tab === 'banner' ? 'Banner' : 'Hero'}
            </button>
          ))}
        </div>

        {/* ── Tab: Banner ──────────────────────────────────────────────── */}
        {activeTab === 'banner' && (
          <div className="flex flex-col gap-6">
            <div>
              <p style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 700, color: T.dark, marginBottom: 4 }}>
                Imagen de banner
              </p>
              <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70`, lineHeight: 1.6, marginBottom: 20 }}>
                Imagen horizontal que representa tu taller. Se muestra en el marketplace y en el directorio de tiendas.
              </p>
              <ImageUploadSlot
                label="Banner de tienda" hint="1440×500px recomendado"
                url={bannerUrl} uploading={uploadingBanner}
                onFile={handleBannerFile}
                onRemove={() => {
                  setBannerUrl('');
                  updateArtisanShop(shop!.id, { bannerUrl: '' } as any);
                  initRef.current = { ...initRef.current, bannerUrl: '' };
                }}
                aspect="aspect-video" icon="panorama"
              />
            </div>

            {/* Previsualización */}
            <div>
              <p style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: `${T.muted}45`, marginBottom: 12 }}>
                Previsualización
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Talleres card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: `${T.muted}40` }}>Talleres · Marketplace</p>
                  <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(84,67,62,0.1)', background: 'white', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)' }}>
                    <div style={{ height: 80, position: 'relative', overflow: 'hidden', background: 'rgba(84,67,62,0.05)' }}>
                      {bannerUrl
                        ? <img src={bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20, color: `${T.muted}18` }}>panorama</span>
                          </div>
                      }
                      <div style={{ position: 'absolute', bottom: -12, left: 10, width: 26, height: 26, borderRadius: '50%', background: 'white', border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13, color: `${T.muted}35` }}>storefront</span>
                      </div>
                    </div>
                    <div style={{ padding: '18px 12px 12px' }}>
                      <div style={{ height: 7, width: '68%', borderRadius: 4, background: 'rgba(84,67,62,0.1)', marginBottom: 5 }} />
                      <div style={{ height: 5, width: '48%', borderRadius: 4, background: 'rgba(84,67,62,0.06)', marginBottom: 10 }} />
                      <div style={{ height: 22, width: '60%', borderRadius: 100, background: 'rgba(84,67,62,0.07)' }} />
                    </div>
                  </div>
                </div>
                {/* Directorio card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: `${T.muted}40` }}>Directorio · Tiendas</p>
                  <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(84,67,62,0.1)', background: 'white', boxShadow: '0 2px 8px -2px rgba(0,0,0,0.06)' }}>
                    <div style={{ height: 80, position: 'relative', overflow: 'hidden', background: 'rgba(84,67,62,0.05)' }}>
                      {bannerUrl
                        ? <img src={bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20, color: `${T.muted}18` }}>panorama</span>
                          </div>
                      }
                      <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(236,109,19,0.88)', borderRadius: 100, padding: '2px 7px' }}>
                        <span style={{ fontFamily: T.sans, fontSize: 7, fontWeight: 800, color: 'white', letterSpacing: '0.08em' }}>VERIFICADO</span>
                      </div>
                    </div>
                    <div style={{ padding: '10px 12px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(84,67,62,0.07)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 12, color: `${T.muted}35` }}>storefront</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 7, width: '65%', borderRadius: 4, background: 'rgba(84,67,62,0.1)', marginBottom: 4 }} />
                        <div style={{ height: 5, width: '42%', borderRadius: 4, background: 'rgba(84,67,62,0.06)' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Hero slides ─────────────────────────────────────────── */}
        {activeTab === 'hero' && (
          <div className="flex flex-col gap-4">
            <div>
              <p style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 700, color: T.dark, marginBottom: 4 }}>
                Slides del hero
              </p>
              <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70`, lineHeight: 1.6 }}>
                Hasta 3 slides en rotación. Cada uno tiene imagen de fondo, título, subtítulo y un botón de acción.
              </p>
            </div>

            {heroSlides.length === 0 && (
              <div style={{ borderRadius: 12, padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'rgba(84,67,62,0.03)', border: '1px dashed rgba(84,67,62,0.1)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: `${T.muted}20` }}>view_carousel</span>
                <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}40`, margin: 0 }}>Sin slides — agrega el primero abajo</p>
              </div>
            )}

            {heroSlides.map((slide, i) => (
              <div key={slide.id} style={{ borderRadius: 14, border: '1px solid rgba(84,67,62,0.1)', overflow: 'hidden', background: 'rgba(247,244,239,0.5)' }}>
                <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(84,67,62,0.07)' }}>
                  <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, color: `${T.muted}55`, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                    Slide {i + 1} de {heroSlides.length}
                  </span>
                  <button onClick={() => removeSlide(slide.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: `${T.muted}30`, display: 'flex', padding: 2 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                  </button>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <ImageUploadSlot
                    label="Imagen de fondo" hint="1440×700px recomendado"
                    url={slide.imageUrl} uploading={uploadingSlide === slide.id}
                    onFile={f => handleSlideImageFile(slide.id, f)}
                    onRemove={() => updateSlide(slide.id, { imageUrl: '' })}
                    aspect="aspect-video" icon="image"
                  />
                  <div>
                    <label style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, color: `${T.muted}55`, display: 'block', marginBottom: 5, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Título</label>
                    <input value={slide.title} onChange={e => updateSlide(slide.id, { title: e.target.value })} placeholder="Ej. Piezas únicas hechas a mano" style={inputStyle} maxLength={60} />
                  </div>
                  <div>
                    <label style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, color: `${T.muted}55`, display: 'block', marginBottom: 5, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Subtítulo</label>
                    <input value={slide.subtitle} onChange={e => updateSlide(slide.id, { subtitle: e.target.value })} placeholder="Ej. Cada pieza lleva la historia de tu región" style={inputStyle} maxLength={100} />
                  </div>
                  <div>
                    <label style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, color: `${T.muted}55`, display: 'block', marginBottom: 5, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Botón de acción</label>
                    <select value={slide.ctaType} onChange={e => updateSlide(slide.id, { ctaType: e.target.value as CtaType, ctaProductUrl: '' })} style={inputStyle}>
                      {CTA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  {slide.ctaType === 'product' && (
                    <div>
                      <label style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, color: `${T.muted}55`, display: 'block', marginBottom: 5, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>URL del producto</label>
                      <input value={slide.ctaProductUrl ?? ''} onChange={e => updateSlide(slide.id, { ctaProductUrl: e.target.value })} placeholder="Ej. /tienda/mi-taller/producto/mochila-wayuu" style={inputStyle} />
                      <p style={{ fontFamily: T.sans, fontSize: 10, color: `${T.muted}40`, marginTop: 4 }}>Copia la URL del producto desde tu catálogo.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {heroSlides.length < 3 && (
              <button onClick={addSlide} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px dashed rgba(84,67,62,0.18)', borderRadius: 12, padding: '12px 16px', cursor: 'pointer', color: T.orange, fontFamily: T.sans, fontSize: 12, fontWeight: 700, width: '100%', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                Agregar slide ({heroSlides.length}/3)
              </button>
            )}
          </div>
        )}

      </ConfigWizardShell>
    </>
  );
}
