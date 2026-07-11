import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  submitDisabled?: boolean;
  submitDisabledReason?: string;
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
  submitDisabled,
  submitDisabledReason,
  leftOffset,
  onSaveAndExit,
  isSavingAndExiting,
  showSaveDraftOnAllSteps,
  saveDraftLabel,
}) => {
  const isMobile = useIsMobile();
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
        <span className="text-[10px] font-[700] uppercase tracking-widest">
          Atrás
        </span>
      </button>
    ) : (
      <div />
    );

  const NextButton = () => (
    <button
      onClick={nextDisabled ? undefined : onNext}
      disabled={nextDisabled}
      className="flex items-center gap-1.5 bg-[#151b2d] text-white px-5 py-2 rounded-full font-[700] text-[10px] uppercase tracking-widest hover:bg-[#ec6d13] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
    >
      <span>{nextLabel ?? "Guardar y continuar"}</span>
      <span className="material-symbols-outlined text-[14px]">east</span>
    </button>
  );

  const SaveAndExitButton = () =>
    onSaveAndExit ? (
      <button
        onClick={onSaveAndExit}
        disabled={isSavingAndExiting || isSubmitting || isSavingDraft}
        className="text-[10px] font-[700] text-[#54433e]/50 uppercase tracking-widest hover:text-[#54433e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isSavingAndExiting ? "Guardando…" : "Guardar y salir"}
      </button>
    ) : null;

  const innerClass =
    "max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between w-full";

  const SaveDraftButton = ({
    disabled: extraDisabled,
  }: {
    disabled?: boolean;
  }) =>
    onSaveDraft ? (
      <button
        onClick={onSaveDraft}
        disabled={isSavingDraft || extraDisabled}
        title="Guardar"
        className="flex items-center gap-1.5 text-[#54433e]/50 hover:text-[#ec6d13] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined text-[16px]">
          {isSavingDraft ? "progress_activity" : "save"}
        </span>
        <span className="text-[10px] font-[700] uppercase tracking-widest">
          {isSavingDraft ? "Guardando…" : "Guardar"}
        </span>
      </button>
    ) : null;

  if (isFinalStep) {
    return (
      <footer
        className="fixed bottom-0 right-0 z-50 border-t border-[#e2d5cf]/40 bg-[#fdfaf6]"
        style={{
          left: leftOffset ?? 0,
          bottom: isMobile ? "calc(60px + env(safe-area-inset-bottom))" : 0,
        }}
      >
        <ProgressBar />
        <div className={innerClass}>
          <BackButton />
          <div className="flex items-center gap-4">
            {/* <SaveDraftButton disabled={isSubmitting} /> */}
            {submitDisabledReason && submitDisabled && (
              <span className="text-[9px] text-[#54433e]/40 italic max-w-[45vw] sm:max-w-none truncate text-right">
                {submitDisabledReason}
              </span>
            )}
            <button
              onClick={submitDisabled ? undefined : onSubmit}
              disabled={isSubmitting || isSavingDraft || submitDisabled}
              className="flex items-center gap-2 bg-[#ec6d13] text-white px-6 py-2 rounded-full font-[700] text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[14px] animate-spin">
                    progress_activity
                  </span>{" "}
                  Enviando…
                </>
              ) : (
                <>{submitLabel ?? "Enviar a curaduría"}</>
              )}
            </button>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="fixed bottom-0 right-0 z-50 border-t border-[#e2d5cf]/40 bg-[#fdfaf6]"
      style={{
        left: leftOffset ?? 0,
        bottom: isMobile ? "calc(60px + env(safe-area-inset-bottom))" : 0,
      }}
    >
      <ProgressBar />
      <div className={innerClass}>
        <BackButton />
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto">
          {/* <SaveDraftButton /> */}
          <div className="hidden md:block">
            <SaveAndExitButton />
          </div>
          {disabledReason && nextDisabled && (
            <span className="text-[9px] text-[#54433e]/40 italic max-w-[45vw] sm:max-w-none truncate text-right">
              {disabledReason}
            </span>
          )}
          <NextButton />
        </div>
      </div>
    </footer>
  );
};
