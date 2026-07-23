import React from "react";

interface WizardHeaderProps {
  step: number;
  totalSteps: number;
  icon: string;
  title: string;
  subtitle: string;
  onBack?: () => void;
  onSaveProgress?: () => void;
  isSavingProgress?: boolean;
  onLogout?: () => void;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  step,
  totalSteps,
  icon,
  title,
  subtitle,
  onBack,
  onSaveProgress,
  isSavingProgress,
  onLogout,
}) => {
  return (
    <div className="flex items-center gap-2 py-4 px-4 md:px-10 max-w-[1200px] mx-auto w-full">
      <span className="material-symbols-outlined text-[18px] text-[#ec6d13] shrink-0">
        {icon}
      </span>

      <h1 className="font-['Manrope'] text-[13px] font-[700] text-[#151b2d] shrink-0 truncate">
        {title}
      </h1>

      <span className="text-[#54433e]/20 shrink-0 hidden sm:block">·</span>

      <p className="font-['Manrope'] text-[12px] font-[500] text-[#54433e]/50 truncate min-w-0 hidden sm:block">
        {subtitle}
      </p>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        {onSaveProgress && (
          <button
            onClick={onSaveProgress}
            disabled={isSavingProgress}
            title="Guardar"
            className="flex items-center gap-1 font-['Manrope'] text-[10px] font-[800] text-[#54433e]/60 hover:text-[#ec6d13] uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[15px]">
              {isSavingProgress ? "progress_activity" : "save"}
            </span>
            <span className="hidden sm:inline">
              {isSavingProgress ? "Guardando…" : "Guardar"}
            </span>
          </button>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="flex items-center gap-1 font-['Manrope'] text-[10px] font-[800] text-[#54433e]/60 hover:text-red-600 uppercase tracking-wider transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">
              logout
            </span>
            <span className="hidden sm:inline">Salir</span>
          </button>
        )}

        <span className="font-['Manrope'] text-[10px] font-[800] text-[#ec6d13] bg-[#ec6d13]/8 px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
          {step}/{totalSteps}
        </span>
      </div>
    </div>
  );
};
