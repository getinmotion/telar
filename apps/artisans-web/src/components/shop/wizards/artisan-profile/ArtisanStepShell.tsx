import React, { useState, useEffect, useRef } from 'react';
import { WizardHeader } from '../../new-product-wizard/components/WizardHeader';
import { WizardFooter } from '../../new-product-wizard/components/WizardFooter';
import { useOraculo } from '@/components/oraculo/OraculoContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface AiCard { label: string; text: string; }

interface Props {
  step: number;
  totalSteps: number;
  icon: string;
  title: string;
  subtitle: string;
  aiCards: AiCard[];
  aiNext: string;
  onBack?: () => void;
  onNext?: () => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  nextDisabled?: boolean;
  disabledReason?: string;
  isFinalStep?: boolean;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  children: React.ReactNode;
}

export const ArtisanStepShell: React.FC<Props> = ({
  step, totalSteps, icon, title, subtitle,
  aiCards, aiNext,
  onBack, onNext, onSaveDraft, isSavingDraft,
  nextDisabled, disabledReason,
  isFinalStep, onSubmit, isSubmitting, submitLabel,
  children,
}) => {
  const isMobile = useIsMobile();
  const { setNode, clearNode, node } = useOraculo();
  const [oraculoOpen, setOraculoOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  useEffect(() => {
    setNode(
      <section className="text-white flex flex-col relative overflow-hidden p-5" style={{ background: '#151b2d', borderRadius: 16 }}>
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#ec6d13]">psychology</span>
            <h3 className="font-['Noto_Serif'] text-[16px] font-[500] text-white">ORÁCULO</h3>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ec6d13] animate-pulse" />
            <span className="text-[9px] font-[800] tracking-widest text-white/60 uppercase">Analizando</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {aiCards.map(({ label, text }) => (
            <div key={label} className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[9px] font-[800] uppercase tracking-widest text-white/40 mb-1.5">{label}</p>
              <p className="text-[13px] text-white/80 leading-snug">{text}</p>
            </div>
          ))}
        </div>
        <div className="pt-5 border-t border-white/10 mt-4">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[14px] text-[#ec6d13] mt-0.5 shrink-0">lightbulb</span>
            <div>
              <p className="text-[9px] font-[800] uppercase tracking-widest text-white/30 mb-1">Próximo paso</p>
              <p className="text-[12px] text-white/60 leading-snug">{aiNext}</p>
            </div>
          </div>
        </div>
      </section>
    );
    return clearNode;
  }, [aiCards, aiNext]);

  return (
    <div className="flex-1 flex flex-col min-h-0">

      {/* Header: fixed en mobile, sticky en desktop — Guardar movido aquí */}
      <div
        className="fixed md:sticky top-0 left-0 right-0 md:left-auto md:right-auto z-30 border-b border-[#e2d5cf]/40 shrink-0"
        style={{ background: 'rgba(249,247,242,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <WizardHeader
          step={step}
          totalSteps={totalSteps}
          icon={icon}
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          onSaveProgress={onSaveDraft}
          isSavingProgress={isSavingDraft}
        />
      </div>

      {/* Contenido scrollable — pb extra para footer + drawer Oráculo en mobile */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-14 md:pt-0 pb-[200px] md:pb-24">
        <main className="w-full max-w-[1200px] mx-auto px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start w-full">

            {/* Formulario */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              {children}
            </div>

            {/* Panel IA — solo desktop */}
            <div className="hidden lg:block lg:col-span-5">
              <section
                className="h-full text-white flex flex-col relative overflow-hidden border border-white/10 shadow-lg rounded-xl p-5 min-h-[480px]"
                style={{ background: '#151b2d' }}
              >
                <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4 mb-6 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#ec6d13]">psychology</span>
                    <h3 className="font-['Noto_Serif'] text-[16px] font-[500] text-white">ORÁCULO</h3>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/10"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ec6d13] animate-pulse" />
                    <span className="text-[9px] font-[800] tracking-widest text-white/60 uppercase">Analizando</span>
                  </div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col gap-3">
                  {aiCards.map(({ label, text }) => (
                    <div
                      key={label}
                      className="p-4 backdrop-blur-sm rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <p className="text-[9px] font-[800] uppercase tracking-widest text-white/40 mb-1.5">{label}</p>
                      <p className="text-[13px] text-white/80 leading-snug">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="relative z-10 pt-5 border-t border-white/10 shrink-0 mt-auto">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[14px] text-[#ec6d13] mt-0.5 shrink-0">lightbulb</span>
                    <div>
                      <p className="text-[9px] font-[800] uppercase tracking-widest text-white/30 mb-1">Próximo paso</p>
                      <p className="text-[12px] text-white/60 leading-snug">{aiNext}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

          </div>
        </main>
      </div>

      {/* Drawer Oráculo — mobile, anclado sobre el footer */}
      <div
        className="md:hidden fixed left-0 right-0 z-40"
        style={{ bottom: 'calc(119px + env(safe-area-inset-bottom))' }}
      >
        {/* Panel expandible */}
        <div style={{ overflow: 'hidden', maxHeight: oraculoOpen ? '55vh' : 0, transition: 'max-height 0.28s ease' }}>
          <div style={{ overflowY: 'auto', maxHeight: '55vh', background: '#151b2d', borderRadius: '16px 16px 0 0' }}>
            {node}
          </div>
        </div>

        {/* Barra de activación */}
        <button
          onClick={() => setOraculoOpen(v => !v)}
          className="w-full flex items-center justify-between px-5"
          style={{
            background: '#151b2d',
            height: 46,
            borderTopLeftRadius:  oraculoOpen ? 0 : 14,
            borderTopRightRadius: oraculoOpen ? 0 : 14,
            borderTop: oraculoOpen ? '1px solid rgba(255,255,255,0.08)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ color: '#ec6d13', fontSize: 16 }}>psychology</span>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>
              ORÁCULO
            </span>
          </div>
          <span
            className="material-symbols-outlined"
            style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: 18,
              transform: oraculoOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.25s ease',
            }}
          >
            expand_less
          </span>
        </button>
      </div>

      {/* Footer — sin onSaveDraft (movido al header) */}
      <WizardFooter
        step={step}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        isSavingDraft={isSavingDraft}
        nextDisabled={nextDisabled}
        disabledReason={disabledReason}
        isFinalStep={isFinalStep}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        leftOffset={isMobile ? 0 : 80}
      />
    </div>
  );
};
