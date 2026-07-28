import React, { useMemo } from 'react';
import type { NewWizardState } from '../hooks/useNewWizardState';
import { useResolvedNames } from '../hooks/useResolvedNames';
import { useImagePreviews } from '../hooks/useImagePreviews';
import { derivePassportId } from '../utils/passport';
import { DigitalPassport } from '../components/passport/DigitalPassport';
import { WizardFooter } from '../components/WizardFooter';

interface Props {
  state: NewWizardState;
  update: (updates: Partial<NewWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  step: number;
  totalSteps: number;
  onGoToStep?: (step: number) => void;
  leftOffset?: number;
}

export const Step5DigitalPassport: React.FC<Props> = ({
  state,
  onNext,
  onBack,
  onSaveDraft,
  isSavingDraft,
  step,
  totalSteps,
  onGoToStep,
  leftOffset,
}) => {
  const names = useResolvedNames(state);
  const imagePreviews = useImagePreviews(state.images);
  // Estable entre renders; determinista cuando la pieza ya existe en backend
  const passportId = useMemo(() => derivePassportId(state.productId), [state.productId]);

  return (
    <div className="pb-32" style={{ background: 'transparent' }}>
      <div className="px-4 pt-4 md:px-6 md:pt-6 flex flex-col gap-4">
        <DigitalPassport
          state={state}
          names={names}
          imagePreviews={imagePreviews}
          passportId={passportId}
          onGoToStep={onGoToStep}
        />

        {/* Aviso de activación */}
        <div
          className="max-w-4xl mx-auto w-full flex items-start gap-2.5 p-3.5 rounded-xl"
          style={{ background: 'rgba(236,109,19,0.05)', border: '1px solid rgba(236,109,19,0.15)' }}
        >
          <span className="material-symbols-outlined text-[#ec6d13] shrink-0" style={{ fontSize: 16 }}>
            info
          </span>
          <p className="font-['Manrope'] text-[12px] font-[500] text-[#54433e]">
            Así verá cualquier persona el pasaporte de tu pieza. Se activará automáticamente cuando la
            pieza sea aprobada para marketplace.
          </p>
        </div>
      </div>

      <WizardFooter
        step={step}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        onSaveDraft={onSaveDraft}
        isSavingDraft={isSavingDraft}
        nextLabel="Continuar a revisión final"
        leftOffset={leftOffset}
      />
    </div>
  );
};
