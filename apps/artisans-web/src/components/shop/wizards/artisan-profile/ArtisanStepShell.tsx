import React from 'react';
import { WizardHeader } from '../../new-product-wizard/components/WizardHeader';
import { WizardFooter } from '../../new-product-wizard/components/WizardFooter';

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
  return (
    <div className="flex-1 overflow-y-auto flex flex-col pb-24 box-border">
      <WizardHeader step={step} totalSteps={totalSteps} icon={icon} title={title} subtitle={subtitle} onBack={onBack} />

      <main className="w-full max-w-[1200px] mx-auto px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start w-full">

            {/* Form content */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              {children}
            </div>

            {/* AI observation panel */}
            <div className="lg:col-span-5">
              <section
                className="h-full text-white flex flex-col relative overflow-hidden border border-white/10 shadow-lg rounded-xl p-5 min-h-[480px]"
                style={{ background: '#151b2d' }}
              >
                <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4 mb-6 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#ec6d13]">psychology</span>
                    <h3 className="font-['Noto_Serif'] text-[16px] font-[500] text-white">Observación IA</h3>
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

      <WizardFooter
        step={step}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        onSaveDraft={onSaveDraft}
        isSavingDraft={isSavingDraft}
        nextDisabled={nextDisabled}
        disabledReason={disabledReason}
        isFinalStep={isFinalStep}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        leftOffset={80}
      />
    </div>
  );
};
