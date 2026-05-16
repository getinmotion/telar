/**
 * ConfigWizardShell — Layout estándar para todos los wizards de configuración de tienda.
 *
 * Provee:
 * - Header sticky con icono, título, subtítulo y botón de retroceso
 * - Área de contenido (form 7 cols) + panel oscuro de IA (5 cols)
 * - Footer fijo con botones Cancelar / Guardar
 * - Soporte opcional para "Guardar progreso" y "Guardar y salir"
 */
import React from 'react';
import { WizardHeader } from '@/components/shop/new-product-wizard/components/WizardHeader';
import { WizardFooter } from '@/components/shop/new-product-wizard/components/WizardFooter';
import { T, TELAR_BG, glassContent } from '@/lib/telar-design';

// ── Tipos ──────────────────────────────────────────────────────────────────────
export interface AiCard { label: string; text: string; }

export interface ConfigWizardShellProps {
  // ── Header ────────────────────────────────────────────────────────────────
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

  // ── Panel de IA ───────────────────────────────────────────────────────────
  aiCards: AiCard[];
  aiNext: string;

  // ── Footer ────────────────────────────────────────────────────────────────
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

// ── Componente del panel de IA (centralizado) ─────────────────────────────────
const AIObservationPanel: React.FC<{ cards: AiCard[]; next: string }> = ({ cards, next }) => (
  <section
    className="h-full text-white flex flex-col relative overflow-hidden border border-white/10 shadow-lg rounded-xl p-5 min-h-[480px]"
    style={{ background: T.dark, position: 'sticky', top: 76 }}
  >
    {/* Encabezado del panel */}
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

    {/* Tarjetas de observación */}
    <div className="relative z-10 flex-1 flex flex-col gap-3">
      {cards.map(({ label, text }) => (
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

    {/* Próximo paso */}
    <div className="relative z-10 pt-5 border-t border-white/10 shrink-0 mt-auto">
      <div className="flex items-start gap-2.5">
        <span className="material-symbols-outlined text-[14px] text-[#ec6d13] mt-0.5 shrink-0">lightbulb</span>
        <div>
          <p className="text-[9px] font-[800] uppercase tracking-widest text-white/30 mb-1">Próximo paso</p>
          <p className="text-[12px] text-white/60 leading-snug">{next}</p>
        </div>
      </div>
    </div>
  </section>
);

// ── Shell principal ────────────────────────────────────────────────────────────
export const ConfigWizardShell: React.FC<ConfigWizardShellProps> = ({
  icon, title, subtitle, step = 1, totalSteps = 1,
  onBack, onSaveProgress, isSavingProgress,
  aiCards, aiNext,
  submitLabel, onSubmit, isSubmitting,
  onNext,
  onSaveAndExit, isSavingAndExiting,
  children,
}) => {
  return (
    <div className="flex flex-col h-screen" style={{ background: TELAR_BG }}>

      {/* ── Header sticky ─────────────────────────────────────────────────── */}
      <div style={{
        position:         'sticky',
        top:              0,
        zIndex:           20,
        background:       'rgba(249,247,242,0.92)',
        backdropFilter:   'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom:     '1px solid rgba(84,67,62,0.08)',
      }}>
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

      {/* ── Contenido principal scrolleable ───────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <div
            className="p-8 w-full rounded-xl"
            style={glassContent}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

              {/* Formulario — 7 columnas */}
              <div className="lg:col-span-7 flex flex-col gap-8">
                {children}
              </div>

              {/* Panel de IA — 5 columnas */}
              <div className="lg:col-span-5">
                <AIObservationPanel cards={aiCards} next={aiNext} />
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* ── Footer fijo ───────────────────────────────────────────────────── */}
      <WizardFooter
        step={step}
        totalSteps={totalSteps}
        onBack={onBack}
        isFinalStep={step >= totalSteps}
        onNext={step < totalSteps ? onNext : undefined}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        onSaveAndExit={onSaveAndExit}
        isSavingAndExiting={isSavingAndExiting}
        leftOffset={80}
      />

    </div>
  );
};
