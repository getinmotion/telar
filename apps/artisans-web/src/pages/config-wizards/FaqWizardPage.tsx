import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { updateArtisanShop } from '@/services/artisanShops.actions';
import {
  getStorePoliciesConfig,
  createStorePoliciesConfig,
  updateStorePoliciesConfig,
} from '@/services/storePoliciesConfig.actions';
import { SpeechTextarea } from '@/components/ui/speech-textarea';
import { UnsavedChangesDialog } from '@/components/ui/UnsavedChangesDialog';
import { ConfigWizardShell } from '@/components/shop/config-wizards/ConfigWizardShell';
import { T, inputStyle } from '@/lib/telar-design';

// ── Datos del panel de IA ─────────────────────────────────────────────────────
const AI_CARDS = [
  {
    label: 'Por qué importa el FAQ',
    text: 'Los compradores que encuentran respuestas antes de comprar tienen 2× más probabilidad de completar su pedido. Un FAQ bien hecho reemplaza conversaciones repetitivas.',
  },
  {
    label: 'Preguntas más frecuentes en artesanías',
    text: '¿Cuánto tarda el envío? ¿Haces piezas personalizadas? ¿Cómo cuido el producto? Son las tres preguntas que más reducen la fricción de compra.',
  },
  {
    label: 'Agente IA — próximamente',
    text: 'Pronto el agente generará preguntas frecuentes automáticamente basándose en tu perfil artesanal, productos y ubicación.',
  },
];

const AI_NEXT = 'Con el FAQ completo, los compradores tendrán menos dudas y más confianza para finalizar su pedido.';

// ── Página ────────────────────────────────────────────────────────────────────
export default function FaqWizardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo ?? '/mi-tienda/configurar';
  const { shop, loading } = useArtisanShop();

  const [faqItems, setFaqItems] = useState<{ q: string; a: string }[]>([]);
  const [saving,         setSaving]         = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [showGuard,      setShowGuard]      = useState(false);
  const initRef = useRef('');

  useEffect(() => {
    if (!shop) return;
    const policiesId = (shop as any).idPoliciesConfig as string | null;
    if (!policiesId) { initRef.current = JSON.stringify([]); return; }
    getStorePoliciesConfig(policiesId)
      .then(pc => {
        const items = pc.faq ?? [];
        setFaqItems(items);
        initRef.current = JSON.stringify(items);
      })
      .catch(() => {});
  }, [shop?.id]);

  const isDirty = JSON.stringify(faqItems) !== initRef.current;

  const addFaq    = () => setFaqItems(prev => [...prev, { q: '', a: '' }]);
  const removeFaq = (i: number) => setFaqItems(prev => prev.filter((_, j) => j !== i));
  const updateFaq = (i: number, field: 'q' | 'a', val: string) =>
    setFaqItems(prev => prev.map((item, j) => j === i ? { ...item, [field]: val } : item));

  const saveData = async () => {
    if (!shop) return;
    const policiesId = (shop as any).idPoliciesConfig as string | null;
    if (policiesId) {
      await updateStorePoliciesConfig(policiesId, { faq: faqItems });
    } else {
      const created = await createStorePoliciesConfig({ faq: faqItems });
      await updateArtisanShop(shop.id, { idPoliciesConfig: created.id } as any);
    }
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
    try { await saveData(); toast.success('Preguntas frecuentes guardadas'); navigate(returnTo); }
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
        icon="quiz"
        title="Preguntas frecuentes"
        subtitle="Resuelve las dudas más comunes de tus compradores"
        onBack={handleBack}
        onSaveProgress={isDirty ? handleSaveProgress : undefined}
        isSavingProgress={savingProgress}
        aiCards={AI_CARDS}
        aiNext={AI_NEXT}
        submitLabel="Guardar FAQ"
        onSubmit={handleFinish}
        isSubmitting={saving}
        onSaveAndExit={isDirty ? handleSaveAndExit : undefined}
        isSavingAndExiting={saving}
      >

        {/* ── Editor de FAQs ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 700, color: T.dark, margin: 0 }}>
              Preguntas y respuestas
            </p>
            <button
              onClick={addFaq}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: `1px solid rgba(236,109,19,0.3)`,
                borderRadius: 100, padding: '6px 14px', cursor: 'pointer',
                color: T.orange, fontFamily: T.sans, fontSize: 11, fontWeight: 800,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
              Agregar pregunta
            </button>
          </div>
          <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}60`, lineHeight: 1.5, margin: '4px 0 20px' }}>
            Agrega las preguntas que más te hacen los compradores. Aparecen en la página pública de tu tienda.
          </p>

          {faqItems.length === 0 ? (
            <div
              className="py-12 flex flex-col items-center gap-3"
              style={{ borderRadius: 16, background: `${T.dark}03`, border: `1px dashed ${T.dark}10` }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: `${T.muted}20` }}>quiz</span>
              <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}45`, textAlign: 'center' }}>
                Sin preguntas aún — presiona "Agregar pregunta" para empezar
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ background: `${T.dark}04`, border: `1px solid ${T.dark}07` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: `${T.muted}50` }}>
                      Pregunta {i + 1}
                    </span>
                    <button
                      onClick={() => removeFaq(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: `${T.muted}35`, display: 'flex', padding: 2 }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                    </button>
                  </div>
                  <input
                    value={item.q}
                    onChange={e => updateFaq(i, 'q', e.target.value)}
                    placeholder="¿Cuánto tarda en llegar mi pedido?"
                    style={{ ...inputStyle, marginBottom: 8 }}
                  />
                  <SpeechTextarea
                    value={item.a}
                    onChange={(v) => updateFaq(i, 'a', v)}
                    placeholder="Los pedidos tardan entre 3 y 7 días hábiles…"
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' as const }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      </ConfigWizardShell>
    </>
  );
}
