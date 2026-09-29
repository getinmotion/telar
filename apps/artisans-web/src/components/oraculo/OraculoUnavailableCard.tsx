import React from "react";

interface OraculoUnavailableCardProps {
  onRetry?: () => void;
  isRetrying?: boolean;
  description?: string;
}

/**
 * Estado degradado del Oráculo: el servicio de agentes no respondió.
 * Se usa tanto en el aside de escritorio como en el drawer móvil del wizard.
 */
export const OraculoUnavailableCard: React.FC<OraculoUnavailableCardProps> = ({
  onRetry,
  isRetrying = false,
  description = "Puedes seguir con el registro de tu pieza y completar los campos a mano. No se pierde nada de lo que ya escribiste.",
}) => (
  <div
    className="p-5 flex flex-col gap-4 rounded-2xl"
    style={{ background: "#151b2d" }}
  >
    <div className="flex flex-col gap-1 pb-3 border-b border-white/10">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[#ec6d13] text-[16px]">
          psychology
        </span>
        <h2 className="font-['Manrope'] text-[10px] font-[800] text-white tracking-widest uppercase">
          ORÁCULO
        </h2>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#eab308] shrink-0" />
        <span className="text-[9px] font-[800] tracking-widest text-white/50 uppercase">
          Sin conexión con el agente
        </span>
      </div>
    </div>

    <div
      className="p-3 rounded-xl flex flex-col gap-2"
      style={{
        background: "rgba(234,179,8,0.08)",
        border: "1px solid rgba(234,179,8,0.2)",
      }}
    >
      <div className="flex items-start gap-2">
        <span className="material-symbols-outlined text-[#eab308] text-[16px] shrink-0">
          cloud_off
        </span>
        <p className="text-[12px] font-[700] text-white/85 leading-snug">
          El Oráculo no está disponible en este momento
        </p>
      </div>
      <p className="text-[11px] text-white/60 leading-snug">{description}</p>
    </div>

    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-white/20 text-white/80 text-[10px] font-[800] uppercase tracking-widest transition-all hover:text-white hover:border-white/40 disabled:opacity-50"
      >
        <span
          className={`material-symbols-outlined text-[14px] ${isRetrying ? "animate-spin" : ""}`}
        >
          {isRetrying ? "progress_activity" : "refresh"}
        </span>
        {isRetrying ? "Reintentando..." : "Reintentar"}
      </button>
    )}
  </div>
);
