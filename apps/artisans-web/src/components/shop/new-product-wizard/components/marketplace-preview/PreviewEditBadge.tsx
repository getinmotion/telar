import React from 'react';

/**
 * Pill "Editar" flotante para las secciones de la vista previa del marketplace.
 * El contenedor de la sección debe ser `relative group`.
 * Visible en touch; en desktop aparece al hacer hover sobre la sección.
 */
export const PreviewEditBadge = ({
  step,
  onGoToStep,
  label = 'Editar',
}: {
  step: number;
  onGoToStep: (n: number) => void;
  label?: string;
}) => (
  <button
    onClick={() => onGoToStep(step)}
    className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-sm border border-[#ec6d13]/25 text-[#ec6d13] font-['Manrope'] text-[10px] font-[800] uppercase tracking-wide shadow-sm opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
  >
    {label}
    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
      edit
    </span>
  </button>
);
