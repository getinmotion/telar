import React from 'react';

export interface WizardFooterProps {
  step: number;
  totalSteps: number;
  onBack?: () => void;
  onNext?: () => void;
  onSaveDraft?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  disabledReason?: string;
  isFinalStep?: boolean;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  isSavingDraft?: boolean;
  submitLabel?: string;
  leftOffset?: number;
  onSaveAndExit?: () => void;
  isSavingAndExiting?: boolean;
  showSaveDraftOnAllSteps?: boolean;
  saveDraftLabel?: string;
}

export const WizardFooter: React.FC<WizardFooterProps> = ({
  step,
  totalSteps,
  onBack,
  onNext,
  onSaveDraft,
  nextLabel,
  nextDisabled,
  disabledReason,
  isFinalStep,
  onSubmit,
  isSubmitting,
  isSavingDraft,
  submitLabel,
  leftOffset,
  onSaveAndExit,
  isSavingAndExiting,
  showSaveDraftOnAllSteps,
  saveDraftLabel,
}) => {
  const progress = Math.round((step / totalSteps) * 100);

  const ProgressBar = () => (
    <div className="relative h-[2px] bg-[#e2d5cf]/30">
      <div
        className="h-full bg-[#ec6d13] transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  const BackButton = () =>
    onBack ? (
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[#54433e]/60 hover:text-[#54433e] transition-colors group"
      >
        <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">
          arrow_back
        </span>
        <span className="text-[10px] font-[700] uppercase tracking-widest">Volver</span>
      </button>
    ) : (
      <div />
    );

  const NextButton = () => (
    <div className="flex items-center gap-2">
      {disabledReason && (
        <span className="text-[9px] text-[#54433e]/40 italic hidden sm:block">{disabledReason}</span>
      )}
      <button
        onClick={nextDisabled ? undefined : onNext}
        disabled={nextDisabled}
        className="flex items-center gap-1.5 bg-[#151b2d] text-white px-5 py-2 rounded-full font-[700] text-[10px] uppercase tracking-widest hover:bg-[#ec6d13] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
      >
        <span>{nextLabel ?? 'Continuar'}</span>
        <span className="material-symbols-outlined text-[14px]">east</span>
      </button>
    </div>
  );

  const SaveAndExitButton = () => onSaveAndExit ? (
    <button
      onClick={onSaveAndExit}
      disabled={isSavingAndExiting || isSubmitting || isSavingDraft}
      className="text-[10px] font-[700] text-[#54433e]/50 uppercase tracking-widest hover:text-[#54433e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {isSavingAndExiting ? 'Guardando…' : 'Guardar y salir'}
    </button>
  ) : null;

  if (isFinalStep) {
    return (
      <footer className="fixed bottom-0 right-0 z-50 border-t border-[#e2d5cf]/40 bg-[#fdfaf6]" style={{ left: leftOffset ?? 0 }}>
        <ProgressBar />
        <div className="flex items-center justify-center gap-4 px-6 py-3">
          <BackButton />
          {onSaveDraft && (
            <button
              onClick={onSaveDraft}
              disabled={isSavingDraft || isSubmitting}
              className="text-[10px] font-[700] text-[#54433e]/50 uppercase tracking-widest hover:text-[#54433e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSavingDraft ? 'Guardando...' : (saveDraftLabel ?? 'Guardar borrador')}
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={isSubmitting || isSavingDraft}
            className="flex items-center gap-2 bg-[#ec6d13] text-white px-6 py-2 rounded-full font-[700] text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando...' : (submitLabel ?? 'Enviar a curaduría')}
          </button>
        </div>
      </footer>
    );
  }

  return (
    <footer className="fixed bottom-0 right-0 z-50 border-t border-[#e2d5cf]/40 bg-[#fdfaf6]" style={{ left: leftOffset ?? 0 }}>
      <ProgressBar />
      <div className="flex items-center justify-center gap-4 px-6 py-3">
        <BackButton />
        {(step === 1 || showSaveDraftOnAllSteps) && onSaveDraft && (
          <button
            onClick={onSaveDraft}
            className="text-[10px] font-[700] text-[#54433e]/50 uppercase tracking-widest hover:text-[#ec6d13] transition-colors"
          >
            {saveDraftLabel ?? 'Guardar borrador'}
          </button>
        )}
        <SaveAndExitButton />
        <NextButton />
      </div>
    </footer>
  );
};
