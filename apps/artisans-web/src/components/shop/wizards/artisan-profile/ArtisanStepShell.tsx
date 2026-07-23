/**
 * ArtisanStepShell — wrapper delgado sobre WizardShell para los flujos por
 * pasos del perfil artesano y el onboarding. Mantiene la API previa; el
 * layout real vive en @/components/shop/wizards/shared/WizardShell.
 */
import React from 'react';
import { WizardShell, type AiCard } from '@/components/shop/wizards/shared/WizardShell';

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
  /** "standalone" para flujos fuera de DashboardLayout (ej. /onboarding) */
  variant?: 'dashboard' | 'standalone';
  children: React.ReactNode;
}

export const ArtisanStepShell: React.FC<Props> = ({
  step, totalSteps, icon, title, subtitle,
  aiCards, aiNext,
  onBack, onNext, onSaveDraft, isSavingDraft,
  nextDisabled, disabledReason,
  isFinalStep, onSubmit, isSubmitting, submitLabel,
  variant = 'dashboard',
  children,
}) => (
  <WizardShell
    step={step}
    totalSteps={totalSteps}
    icon={icon}
    title={title}
    subtitle={subtitle}
    onBack={onBack}
    onSaveProgress={onSaveDraft}
    isSavingProgress={isSavingDraft}
    aiCards={aiCards}
    aiNext={aiNext}
    onNext={onNext}
    nextDisabled={nextDisabled}
    disabledReason={disabledReason}
    isFinalStep={isFinalStep}
    onSubmit={onSubmit}
    isSubmitting={isSubmitting}
    submitLabel={submitLabel}
    variant={variant}
  >
    {children}
  </WizardShell>
);
