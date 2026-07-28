import React, { createContext, useContext } from "react";

/**
 * Modo de operación del wizard de producto.
 *
 * - `author`          → flujo normal de creación/edición por el artesano.
 * - `review-readonly` → moderación: se ven exactamente los mismos componentes,
 *                       todo bloqueado (el bloqueo real lo hace un <fieldset disabled>
 *                       en el host de revisión; aquí solo se anuncia el modo).
 * - `review-edit`     → moderación con edición: los mismos componentes, desbloqueados.
 *
 * El objetivo es que el moderador vea EXACTO lo que diligenció el usuario,
 * sin reinterpretar el wizard con formularios administrativos nuevos.
 */
export type WizardMode = "author" | "review-readonly" | "review-edit";

const WizardModeContext = createContext<WizardMode>("author");

export const WizardModeProvider: React.FC<{
  mode: WizardMode;
  children: React.ReactNode;
}> = ({ mode, children }) => (
  <WizardModeContext.Provider value={mode}>
    {children}
  </WizardModeContext.Provider>
);

/** Modo actual del wizard. Por defecto `author` (flujo de creación). */
export const useWizardMode = (): WizardMode => useContext(WizardModeContext);

/** `true` cuando el wizard se renderiza dentro de un Studio de moderación. */
export const useIsReviewMode = (): boolean =>
  useContext(WizardModeContext) !== "author";
