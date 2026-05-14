import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { updateArtisanShop } from '@/services/artisanShops.actions';
import { WizardHeader } from '@/components/shop/new-product-wizard/components/WizardHeader';
import { WizardFooter } from '@/components/shop/new-product-wizard/components/WizardFooter';
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

export default function FaqWizardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo ?? '/mi-tienda/configurar';
  const { shop, loading } = useArtisanShop();
  const [step, setStep] = useState(1);
  const [faqItems, setFaqItems] = useState<{ q: string; a: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [showGuard, setShowGuard] = useState(false);
  const initRef = useRef('');

  useEffect(() => {
    if (!shop) return;
    const pc = shop.policiesConfig ?? {};
    const items = pc.faq ?? [];
    setFaqItems(items);
    initRef.current = JSON.stringify(items);
  }, [shop?.id]);

  const isDirty = JSON.stringify(faqItems) !== initRef.current;

  const addFaq    = () => setFaqItems(prev => [...prev, { q: '', a: '' }]);
  const removeFaq = (i: number) => setFaqItems(prev => prev.filter((_, j) => j !== i));
  const updateFaq = (i: number, field: 'q' | 'a', val: string) =>
    setFaqItems(prev => prev.map((item, j) => j === i ? { ...item, [field]: val } : item));

  const saveData = async () => {
    if (!shop) return;
    const pc = shop.policiesConfig ?? {};
    await updateArtisanShop(shop.id, {
      policiesConfig: { ...pc, faq: faqItems },
    });
    initRef.current = JSON.stringify(faqItems);
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
      toast.success('Preguntas frecuentes guardadas');
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
        icon="quiz" title="Preguntas frecuentes"
        subtitle="Resuelve las dudas más comunes de tus compradores"
        onBack={handleBack}
        onSaveProgress={isDirty ? handleSaveProgress : undefined}
        isSavingProgress={savingProgress}
      />

      <div className="flex-1 overflow-y-auto px-6 py-8 pb-28">
        <div className="max-w-xl mx-auto">

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
                <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.dark, marginBottom: 8 }}>
                  Asistente de FAQ
                </p>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70`, lineHeight: 1.6, marginBottom: 24 }}>
                  Próximamente, el agente IA generará preguntas frecuentes basadas en tu perfil artesanal. Por ahora, agrega las tuyas manualmente en el siguiente paso.
                </p>
                <button
                  onClick={() => setStep(2)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 100, background: T.dark, color: 'white', border: 'none', cursor: 'pointer', fontFamily: T.sans, fontSize: 12, fontWeight: 800, letterSpacing: '0.06em' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit_note</span>
                  Agregar preguntas manualmente
                </button>
              </div>
              <AgentPlaceholder context="faq" />
            </div>
          )}

          {step === 2 && (
            <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
              <div className="flex items-center justify-between mb-6">
                <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.dark }}>
                  Tus preguntas frecuentes
                </p>
                <button onClick={addFaq}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: `1px solid rgba(236,109,19,0.3)`, borderRadius: 100, padding: '6px 14px', cursor: 'pointer', color: T.orange, fontFamily: T.sans, fontSize: 11, fontWeight: 800 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>Agregar
                </button>
              </div>

              {faqItems.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3" style={{ borderRadius: 16, background: `${T.dark}03`, border: `1px dashed ${T.dark}10` }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, color: `${T.muted}20` }}>quiz</span>
                  <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}45`, textAlign: 'center' }}>
                    Sin preguntas aún — presiona "Agregar" para empezar
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {faqItems.map((item, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: `${T.dark}04`, border: `1px solid ${T.dark}07` }}>
                      <div className="flex items-center justify-between mb-3">
                        <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: `${T.muted}50` }}>
                          Pregunta {i + 1}
                        </span>
                        <button onClick={() => removeFaq(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: `${T.muted}35`, display: 'flex', padding: 2 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                        </button>
                      </div>
                      <input value={item.q} onChange={e => updateFaq(i, 'q', e.target.value)}
                        placeholder="¿Cuánto tarda en llegar mi pedido?" style={{ ...inputStyle, marginBottom: 8 }} />
                      <textarea value={item.a} onChange={e => updateFaq(i, 'a', e.target.value)}
                        placeholder="Los pedidos tardan entre 3 y 7 días hábiles…" rows={3}
                        style={{ ...inputStyle, resize: 'vertical' as const }} />
                    </div>
                  ))}
                </div>
              )}
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
        submitLabel="Guardar FAQ"
        onSaveAndExit={isDirty ? handleSaveAndExit : undefined}
        isSavingAndExiting={saving}
        leftOffset={80}
      />
    </div>
  );
}
