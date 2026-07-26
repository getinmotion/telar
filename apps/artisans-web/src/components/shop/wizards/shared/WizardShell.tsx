/**
 * WizardShell — shell unificado para todos los wizards TELAR.
 *
 * Estructura: header en flujo (siempre visible, sin fixed/sticky) sobre un
 * scroller interno + footer fijo con progreso. Reemplaza a los antiguos
 * ConfigWizardShell y ArtisanStepShell, que ahora son wrappers delgados.
 *
 * - `variant="dashboard"`: dentro de DashboardLayout (sidebar 80px desktop,
 *   MobileBottomNav 60px mobile). `variant="standalone"`: página completa
 *   sin nav global (ej. /onboarding) — el contenedor padre debe aportar
 *   `h-screen flex flex-col`.
 * - `aiCards`/`aiNext` opcionales: sin ellas no hay panel ORÁCULO ni drawer
 *   mobile y el contenido ocupa el ancho completo.
 */
import React, { useEffect, useRef } from 'react';
import { WizardHeader } from '@/components/shop/new-product-wizard/components/WizardHeader';
import { WizardFooter } from '@/components/shop/new-product-wizard/components/WizardFooter';
import { TELAR_BG, glassContent } from '@/lib/telar-design';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOraculo } from '@/components/oraculo/OraculoContext';
import { WizardOraculoPanel, type AiCard } from './WizardOraculoPanel';
import { WizardOraculoMobileDrawer } from './WizardOraculoMobileDrawer';

export type { AiCard };

/** Alturas de las franjas fijas inferiores (mobile) — única fuente de verdad. */
const FOOTER_H = 59;      // ProgressBar 2px + fila py-3
const ORACULO_BAR_H = 46; // barra de activación del drawer ORÁCULO
const BOTTOM_NAV_H = 60;  // MobileBottomNav de DashboardLayout

export interface WizardShellProps {
  // ── Header ────────────────────────────────────────────────────────────────
  step: number;
  totalSteps: number;
  /** Nombre de icono Material Symbols (ej. "palette", "contacts") */
  icon: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Si se provee, muestra botón "Guardar" en el header */
  onSaveProgress?: () => void;
  isSavingProgress?: boolean;

  // ── Panel ORÁCULO (opcional) ──────────────────────────────────────────────
  aiCards?: AiCard[];
  aiNext?: string;

  // ── Footer ────────────────────────────────────────────────────────────────
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  disabledReason?: string;
  isFinalStep?: boolean;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSaveAndExit?: () => void;
  isSavingAndExiting?: boolean;

  // ── Layout ────────────────────────────────────────────────────────────────
  variant?: 'dashboard' | 'standalone';
  /** Envuelve el contenido en la tarjeta glass (estilo config-wizards) */
  glassCard?: boolean;
  /** Fondo de página propio (los wizards dentro de DashboardLayout heredan el suyo) */
  pageBackground?: boolean;

  children: React.ReactNode;
}

export const WizardShell: React.FC<WizardShellProps> = ({
  step, totalSteps, icon, title, subtitle,
  onBack, onSaveProgress, isSavingProgress,
  aiCards, aiNext,
  onNext, nextLabel, nextDisabled, disabledReason,
  isFinalStep, onSubmit, isSubmitting, submitLabel,
  onSaveAndExit, isSavingAndExiting,
  variant = 'dashboard',
  glassCard = false,
  pageBackground = false,
  children,
}) => {
  const isMobile = useIsMobile();
  const { setNode, clearNode } = useOraculo();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasOraculo = !!aiCards?.length;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  useEffect(() => {
    if (!hasOraculo) return;
    setNode(<WizardOraculoPanel variant="drawer" cards={aiCards!} next={aiNext ?? ''} />);
    return clearNode;
  }, [aiCards, aiNext, hasOraculo]);

  const bottomNav = variant === 'dashboard' ? BOTTOM_NAV_H : 0;
  const footerBottomOffset = bottomNav;
  const drawerBottomOffset = bottomNav + FOOTER_H;
  const mobileContentPb = bottomNav + FOOTER_H + (hasOraculo ? ORACULO_BAR_H : 0) + 24;

  return (
    <div
      className="flex-1 flex flex-col min-h-0"
      style={pageBackground ? { background: TELAR_BG } : undefined}
    >
      {/* ── Header en flujo: siempre visible, el scroll ocurre debajo ──────── */}
      <div
        className="shrink-0 z-30 border-b border-[#e2d5cf]/40"
        style={{
          background: 'rgba(249,247,242,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <WizardHeader
          step={step}
          totalSteps={totalSteps}
          icon={icon}
          title={title}
          subtitle={subtitle ?? ''}
          onBack={onBack}
          onSaveProgress={onSaveProgress}
          isSavingProgress={isSavingProgress}
        />
      </div>

      {/* ── Contenido scrolleable ──────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{
          paddingBottom: isMobile
            ? `calc(${mobileContentPb}px + env(safe-area-inset-bottom))`
            : 96,
        }}
      >
        <main className="w-full max-w-[1200px] mx-auto px-4 py-4">
          <div
            className={glassCard ? 'p-4 md:p-8 w-full rounded-xl' : 'w-full'}
            style={glassCard ? glassContent : undefined}
          >
            {hasOraculo ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start w-full">
                <div className="lg:col-span-7 flex flex-col gap-8">
                  {children}
                </div>
                <div className="hidden lg:block lg:col-span-5">
                  <WizardOraculoPanel cards={aiCards!} next={aiNext ?? ''} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-8 w-full">
                {children}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Drawer ORÁCULO mobile, anclado sobre el footer ─────────────────── */}
      {hasOraculo && (
        <WizardOraculoMobileDrawer bottomOffset={drawerBottomOffset}>
          <WizardOraculoPanel variant="drawer" cards={aiCards!} next={aiNext ?? ''} />
        </WizardOraculoMobileDrawer>
      )}

      {/* ── Footer fijo ────────────────────────────────────────────────────── */}
      <WizardFooter
        step={step}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        nextLabel={nextLabel}
        nextDisabled={nextDisabled}
        disabledReason={disabledReason}
        isFinalStep={isFinalStep}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        isSavingDraft={isSavingProgress}
        submitLabel={submitLabel}
        onSaveAndExit={onSaveAndExit}
        isSavingAndExiting={isSavingAndExiting}
        leftOffset={isMobile || variant === 'standalone' ? 0 : 80}
        bottomOffset={footerBottomOffset}
      />
    </div>
  );
};
