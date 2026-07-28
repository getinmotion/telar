/**
 * ConfigWizardShell — wrapper delgado sobre WizardShell para los wizards de
 * configuración de tienda (/mi-tienda/configurar/*). Mantiene la API previa;
 * el layout real (header en flujo, footer fijo, panel ORÁCULO) vive en
 * @/components/shop/wizards/shared/WizardShell.
 */
import React from 'react';
import { WizardShell, type AiCard } from '@/components/shop/wizards/shared/WizardShell';

export type { AiCard };

export interface ConfigWizardShellProps {
  /** Nombre de icono Material Symbols (ej. "palette", "contacts") */
  icon: string;
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
  onBack: () => void;
  /** Si se provee, muestra botón "Guardar progreso" en el header */
  onSaveProgress?: () => void;
  isSavingProgress?: boolean;

  aiCards: AiCard[];
  aiNext: string;

  submitLabel?: string;
  onSubmit: () => void;
  isSubmitting?: boolean;
  /** Avanzar al siguiente paso (en wizards multi-step) */
  onNext?: () => void;
  /** Botón secundario "Guardar y salir" */
  onSaveAndExit?: () => void;
  isSavingAndExiting?: boolean;

  children: React.ReactNode;
}

export const ConfigWizardShell: React.FC<ConfigWizardShellProps> = ({
  icon, title, subtitle, step = 1, totalSteps = 1,
  onBack, onSaveProgress, isSavingProgress,
  aiCards, aiNext,
  submitLabel, onSubmit, isSubmitting,
  onNext,
  onSaveAndExit, isSavingAndExiting,
  children,
}) => (
  <WizardShell
    step={step}
    totalSteps={totalSteps}
    icon={icon}
    title={title}
    subtitle={subtitle}
    onBack={onBack}
    onSaveProgress={onSaveProgress}
    isSavingProgress={isSavingProgress}
    aiCards={aiCards}
    aiNext={aiNext}
    isFinalStep={step >= totalSteps}
    onNext={step < totalSteps ? onNext : undefined}
    onSubmit={onSubmit}
    isSubmitting={isSubmitting}
    submitLabel={submitLabel}
    onSaveAndExit={onSaveAndExit}
    isSavingAndExiting={isSavingAndExiting}
    glassCard
    pageBackground
  >
    {children}
  </WizardShell>
);
