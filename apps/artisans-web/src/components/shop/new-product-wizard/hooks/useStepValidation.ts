import { useCallback, useMemo, useState } from "react";

export interface RequiredField {
  key: string;
  label: string;
  isValid: boolean;
  /** Mensaje inline personalizado (por defecto "Este campo es obligatorio"). */
  errorMessage?: string;
}

/**
 * Validación por paso del wizard: recibe los campos obligatorios con su
 * estado actual y expone `attemptNext()` para el handler del botón Siguiente.
 * Los errores solo se muestran después del primer intento de avanzar
 * (`showErrors`) y desaparecen en vivo al completar cada campo.
 *
 * Cada campo debe tener un contenedor con `id="wizard-field-<key>"` para que
 * el scroll al primer faltante funcione.
 */
export const useStepValidation = (fields: RequiredField[]) => {
  const [showErrors, setShowErrors] = useState(false);

  const missing = useMemo(() => fields.filter((f) => !f.isValid), [fields]);

  const attemptNext = useCallback(() => {
    if (missing.length === 0) return true;
    setShowErrors(true);
    document
      .getElementById(`wizard-field-${missing[0].key}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }, [missing]);

  /** Devuelve el campo si debe mostrarse su error inline, o undefined. */
  const fieldError = useCallback(
    (key: string) =>
      showErrors ? missing.find((f) => f.key === key) : undefined,
    [showErrors, missing],
  );

  return {
    missing: showErrors ? missing : [],
    showErrors,
    attemptNext,
    fieldError,
  };
};
