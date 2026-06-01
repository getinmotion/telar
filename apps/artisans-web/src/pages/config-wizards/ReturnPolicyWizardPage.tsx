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
import { UnsavedChangesDialog } from '@/components/ui/UnsavedChangesDialog';
import { ConfigWizardShell } from '@/components/shop/config-wizards/ConfigWizardShell';
import { T, inputStyle } from '@/lib/telar-design';
import { SpeechTextarea } from '@/components/ui/speech-textarea';

// ── Helpers de UI ─────────────────────────────────────────────────────────────
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: `${T.muted}65`, margin: '0 0 6px' }}>
    {children}
  </p>
);

// ── Datos del panel de IA ─────────────────────────────────────────────────────
const AI_CARDS = [
  {
    label: 'Plazo estándar',
    text: 'En artesanías el plazo habitual es de 10 a 15 días. Un plazo más generoso genera más confianza, uno más corto protege mejor tu inventario.',
  },
  {
    label: 'Piezas personalizadas',
    text: 'Los compradores valoran la claridad: si una pieza es hecha a pedido y no admite devolución, comunicarlo desde el inicio evita conflictos y construye reputación.',
  },
  {
    label: 'Texto de la política',
    text: 'Una política clara y específica reduce disputas. Incluye cómo contactarse, en qué estado debe estar el producto y qué documentación se necesita.',
  },
];

const AI_NEXT = 'Con la política publicada, los compradores sabrán exactamente qué esperar antes de comprar — eso aumenta la conversión y reduce las consultas repetitivas.';

// ── Generador automático de política ─────────────────────────────────────────
function buildPolicy(days: string, acceptCustom: boolean | null): string {
  const d = days || '15';
  const customLine = acceptCustom === true
    ? 'Las piezas personalizadas o hechas a pedido pueden devolverse únicamente por defecto de fabricación o acuerdo previo con el artesano.'
    : acceptCustom === false
    ? 'Las piezas personalizadas o hechas a pedido no admiten devolución, dado que se producen exclusivamente para cada comprador.'
    : 'Las condiciones para piezas personalizadas se acordarán caso a caso.';
  return `Aceptamos devoluciones dentro de los ${d} días posteriores a la recepción del pedido, siempre que el producto esté en su estado original sin señales de uso.\n\n${customLine}\n\nPara iniciar una devolución, contáctanos por WhatsApp con tu número de pedido y fotografías del producto.`;
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function ReturnPolicyWizardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo ?? '/mi-tienda/configurar';
  const { shop, loading } = useArtisanShop();

  const [returnDays,   setReturnDays]   = useState('');
  const [acceptCustom, setAcceptCustom] = useState<boolean | null>(null);
  const [returnPolicy, setReturnPolicy] = useState('');
  const [policyEdited, setPolicyEdited] = useState(false);

  const [saving,         setSaving]         = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [showGuard,      setShowGuard]      = useState(false);
  const initRef = useRef('');

  useEffect(() => {
    if (!shop) return;
    const policiesId = (shop as any).idPoliciesConfig as string | null;
    if (!policiesId) { initRef.current = ''; return; }
    getStorePoliciesConfig(policiesId)
      .then(pc => {
        const policy = pc.returnPolicy ?? '';
        setReturnPolicy(policy);
        if (policy) setPolicyEdited(true);
        initRef.current = policy;
      })
      .catch(() => {});
  }, [shop?.id]);

  useEffect(() => {
    if (policyEdited) return;
    if (!returnDays && acceptCustom === null) return;
    setReturnPolicy(buildPolicy(returnDays, acceptCustom));
  }, [returnDays, acceptCustom, policyEdited]);

  const isDirty = returnPolicy !== initRef.current;

  const saveData = async () => {
    if (!shop) return;
    const policiesId = (shop as any).idPoliciesConfig as string | null;
    if (policiesId) {
      await updateStorePoliciesConfig(policiesId, { returnPolicy });
    } else {
      const created = await createStorePoliciesConfig({ returnPolicy });
      await updateArtisanShop(shop.id, { idPoliciesConfig: created.id } as any);
    }
    initRef.current = returnPolicy;
  };

  const handleSaveProgress = async () => {
    setSavingProgress(true);
    try { await saveData(); toast.success('Progreso guardado'); }
    catch { toast.error('Error al guardar'); }
    finally { setSavingProgress(false); }
  };

  const handleFinish = async () => {
    setSaving(true);
    try { await saveData(); toast.success('Política de devoluciones guardada'); navigate(returnTo); }
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
        icon="policy"
        title="Política de devoluciones"
        subtitle="Configura y personaliza la política de tu tienda"
        onBack={handleBack}
        onSaveProgress={isDirty ? handleSaveProgress : undefined}
        isSavingProgress={savingProgress}
        aiCards={AI_CARDS}
        aiNext={AI_NEXT}
        submitLabel="Guardar política"
        onSubmit={handleFinish}
        isSubmitting={saving}
        onSaveAndExit={isDirty ? handleSaveAndExit : undefined}
        isSavingAndExiting={saving}
      >

        {/* ── Plazo de devolución ──────────────────────────────────────── */}
        <div>
          <p style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 700, color: T.dark, margin: '0 0 4px' }}>
            Plazo de devolución
          </p>
          <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}60`, lineHeight: 1.5, margin: '0 0 16px' }}>
            ¿Cuántos días tiene el comprador para solicitar una devolución después de recibir su pedido?
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="number" min="1" max="60"
              value={returnDays}
              onChange={e => setReturnDays(e.target.value)}
              placeholder="15"
              style={{ ...inputStyle, maxWidth: 100, textAlign: 'center' }}
            />
            <span style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70` }}>días hábiles</span>
          </div>
          <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}40`, margin: '6px 0 0' }}>
            El promedio en artesanías es 10–15 días.
          </p>
        </div>

        <div style={{ height: 1, background: 'rgba(84,67,62,0.08)' }} />

        {/* ── Piezas personalizadas ────────────────────────────────────── */}
        <div>
          <p style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 700, color: T.dark, margin: '0 0 4px' }}>
            Piezas personalizadas
          </p>
          <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}60`, lineHeight: 1.5, margin: '0 0 16px' }}>
            ¿Aceptas devoluciones en piezas hechas a pedido o personalizadas?
          </p>
          <div className="flex flex-col gap-3">
            {([
              { label: 'Sí, con condiciones', sub: 'Con acuerdo previo o defecto de fabricación', value: true },
              { label: 'No se aceptan',       sub: 'Las piezas personalizadas son finales',       value: false },
            ] as { label: string; sub: string; value: boolean }[]).map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => setAcceptCustom(opt.value)}
                className="text-left p-4 rounded-xl transition-all"
                style={{
                  border: `2px solid ${acceptCustom === opt.value ? T.orange : `${T.dark}10`}`,
                  background: acceptCustom === opt.value ? 'rgba(236,109,19,0.05)' : 'white',
                  cursor: 'pointer',
                }}
              >
                <p style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.dark, margin: 0 }}>{opt.label}</p>
                <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}60`, margin: '2px 0 0' }}>{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(84,67,62,0.08)' }} />

        {/* ── Texto de la política ─────────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
            <p style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 700, color: T.dark, margin: 0 }}>
              Texto de la política
            </p>
            {policyEdited && (
              <button
                onClick={() => { setPolicyEdited(false); setReturnPolicy(buildPolicy(returnDays, acceptCustom)); }}
                style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: `${T.muted}50`, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Regenerar automático
              </button>
            )}
          </div>
          <SectionLabel>Vista previa pública</SectionLabel>
          <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}60`, lineHeight: 1.5, margin: '0 0 12px' }}>
            Se genera automáticamente con tus respuestas. Edítala para que suene a tu voz.
          </p>
          <SpeechTextarea
            value={returnPolicy}
            onChange={(v) => { setReturnPolicy(v); setPolicyEdited(true); }}
            rows={9}
            placeholder="Completa el plazo y la opción de piezas personalizadas para generar la política automáticamente…"
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

      </ConfigWizardShell>
    </>
  );
}
