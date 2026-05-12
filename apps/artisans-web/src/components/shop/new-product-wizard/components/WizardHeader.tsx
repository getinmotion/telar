import React from 'react';

interface WizardHeaderProps {
  step: number;
  totalSteps: number;
  icon: string;
  title: string;
  subtitle: string;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  step,
  totalSteps,
  icon,
  title,
  subtitle,
}) => {
  return (
    <div className="flex items-center gap-3 py-4 px-6 md:px-10 max-w-[1200px] mx-auto w-full">
      <span className="material-symbols-outlined text-[18px] text-[#ec6d13] shrink-0">{icon}</span>

      <h1 className="font-['Manrope'] text-[13px] font-[700] text-[#151b2d] shrink-0">
        {title}
      </h1>

      <span className="text-[#54433e]/20 shrink-0">·</span>

      <p className="font-['Manrope'] text-[12px] font-[500] text-[#54433e]/50 truncate min-w-0">
        {subtitle}
      </p>

      <span className="ml-auto shrink-0 font-['Manrope'] text-[10px] font-[800] text-[#ec6d13] bg-[#ec6d13]/8 px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
        {step}/{totalSteps}
      </span>
    </div>
  );
};
