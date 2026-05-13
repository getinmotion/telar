import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { updateArtisanShop } from '@/services/artisanShops.actions';
import { WizardHeader } from '@/components/shop/new-product-wizard/components/WizardHeader';
import { WizardFooter } from '@/components/shop/new-product-wizard/components/WizardFooter';
import { AgentPlaceholder } from '@/components/ui/AgentPlaceholder';

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

const TOTAL_STEPS = 3;

export default function ReturnPolicyWizardPage() {
  const navigate = useNavigate();
  const { shop, loading } = useArtisanShop();
  const [step, setStep] = useState(1);
  const [returnDays, setReturnDays] = useState('');
  const [acceptCustom, setAcceptCustom] = useState<boolean | null>(null);
  const [returnPolicy, setReturnPolicy] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!shop) return;
    const pc = shop.policiesConfig ?? {};
    setReturnPolicy(pc.returnPolicy ?? '');
  }, [shop?.id]);

  // Auto-build a base policy text from days + custom preference on step 2 → 3 transition
  const handleNextFromStep2 = () => {
    if (acceptCustom === null) { toast.error('Elige una opción'); return; }
    if (!returnPolicy) {
      const days = returnDays || '15';
      const custom = acceptCustom
        ? 'Las piezas personalizadas pueden ser devueltas con condiciones especiales acordadas previamente.'
        : 'No aceptamos devoluciones en piezas personalizadas o hechas a pedido.';
      setReturnPolicy(
        `Aceptamos devoluciones dentro de los ${days} días posteriores a la recepción del pedido, siempre que el producto esté en su estado original.\n\n${custom}\n\nPara solicitar una devolución, contáctanos por WhatsApp con tu número de pedido.`
      );
    }
    setStep(3);
  };

  const handleFinish = async () => {
    if (!shop) return;
    setSaving(true);
    try {
      const pc = shop.policiesConfig ?? {};
      await updateArtisanShop(shop.id, {
        policiesConfig: { ...pc, returnPolicy },
      });
      toast.success('Política de devoluciones guardada');
      navigate('/mi-tienda/configurar');
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 32, color: T.orange }}>progress_activity</span>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#f9f7f2' }}>
      <WizardHeader
        step={step} totalSteps={TOTAL_STEPS}
        icon="policy" title="Política de devoluciones"
        subtitle="Genera y personaliza tu política de devoluciones"
      />

      <div className="flex-1 overflow-y-auto px-6 py-8 pb-28">
        <div className="max-w-xl mx-auto">

          {step === 1 && (
            <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
              <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.dark, marginBottom: 8 }}>
                Plazo de devoluciones
              </p>
              <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70`, lineHeight: 1.6, marginBottom: 24 }}>
                ¿Cuántos días tiene el comprador para solicitar una devolución después de recibir su pedido?
              </p>
              <label style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: `${T.muted}80`, display: 'block', marginBottom: 6 }}>
                Días para devolución
              </label>
              <input
                type="number" min="1" max="60"
                value={returnDays}
                onChange={e => setReturnDays(e.target.value)}
                placeholder="Ej. 15"
                style={{ ...inputStyle, maxWidth: 160 }}
              />
              <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}45`, marginTop: 8 }}>
                El promedio en artesanías es 10–15 días.
              </p>
            </div>
          )}

          {step === 2 && (
            <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
              <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.dark, marginBottom: 8 }}>
                Piezas personalizadas
              </p>
              <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70`, lineHeight: 1.6, marginBottom: 24 }}>
                ¿Aceptas devoluciones en piezas hechas a pedido o personalizadas?
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Sí, con condiciones', sub: 'Con acuerdo previo o defecto de fabricación', value: true },
                  { label: 'No se aceptan', sub: 'Las piezas personalizadas son finales', value: false },
                ].map(opt => (
                  <button key={String(opt.value)}
                    onClick={() => setAcceptCustom(opt.value)}
                    className="text-left p-4 rounded-xl transition-all"
                    style={{
                      border: `2px solid ${acceptCustom === opt.value ? T.orange : `${T.dark}10`}`,
                      background: acceptCustom === opt.value ? 'rgba(236,109,19,0.05)' : 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <p style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 700, color: T.dark }}>{opt.label}</p>
                    <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}60`, marginTop: 2 }}>{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
                <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.dark, marginBottom: 8 }}>
                  Revisa y ajusta
                </p>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70`, lineHeight: 1.6, marginBottom: 24 }}>
                  Edita la política para que suene a tu voz. Será visible en la página de tu tienda.
                </p>
                <textarea
                  value={returnPolicy}
                  onChange={e => setReturnPolicy(e.target.value)}
                  rows={8}
                  placeholder="Aceptamos devoluciones dentro de los 15 días posteriores a la recepción…"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <AgentPlaceholder context="policy" />
            </div>
          )}
        </div>
      </div>

      <WizardFooter
        step={step} totalSteps={TOTAL_STEPS}
        onBack={step > 1 ? () => setStep(s => s - 1) : undefined}
        onNext={step === 1 ? () => setStep(2) : step === 2 ? handleNextFromStep2 : undefined}
        nextDisabled={step === 1 && !returnDays}
        disabledReason={step === 1 && !returnDays ? 'Ingresa los días de devolución' : undefined}
        isFinalStep={step === TOTAL_STEPS}
        onSubmit={handleFinish}
        isSubmitting={saving}
        submitLabel="Guardar política"
        leftOffset={80}
      />
    </div>
  );
}
