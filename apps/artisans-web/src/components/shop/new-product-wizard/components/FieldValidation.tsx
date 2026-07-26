import React from "react";

/** Clase para inputs con error (espejo del focus naranja actual). */
export const fieldErrorClass = "border-[#ef4444] ring-2 ring-[#ef4444]/10";

/** Asterisco rojo para marcar campos obligatorios en las etiquetas. */
export const RequiredMark: React.FC = () => (
  <span className="text-[#ef4444] ml-1 font-[800]" aria-hidden>
    *
  </span>
);

/** Mensaje de error inline bajo un campo. */
export const FieldErrorMessage: React.FC<{ message?: string }> = ({
  message = "Este campo es obligatorio",
}) => (
  <p className="mt-1.5 flex items-center gap-1 text-[11px] font-[600] text-[#ef4444]">
    <span className="material-symbols-outlined text-[13px]">error</span>
    {message}
  </p>
);

export interface MissingField {
  key: string;
  label: string;
}

/**
 * Banner con la lista de campos obligatorios pendientes.
 * Visible en todos los viewports; cada ítem hace scroll a su campo.
 */
export const MissingFieldsBanner: React.FC<{ missing: MissingField[] }> = ({
  missing,
}) => {
  if (missing.length === 0) return null;
  return (
    <div
      className="rounded-xl border border-[#ef4444]/30 px-4 py-3"
      style={{ background: "rgba(239,68,68,0.08)" }}
      role="alert"
    >
      <p className="flex items-center gap-1.5 text-[12px] font-[700] text-[#ef4444]">
        <span className="material-symbols-outlined text-[16px]">error</span>
        Completa los campos obligatorios para continuar:
      </p>
      <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
        {missing.map((f) => (
          <li key={f.key}>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById(`wizard-field-${f.key}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" })
              }
              className="text-[11px] font-[600] text-[#ef4444] underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              {f.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
