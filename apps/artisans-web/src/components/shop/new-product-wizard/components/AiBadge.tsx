import React from 'react';

export const AiBadge: React.FC = () => (
  <span className="inline-flex items-center gap-0.5 bg-[#151b2d] text-white text-[8px] font-[800] uppercase tracking-widest px-1.5 py-0.5 rounded-full leading-none select-none">
    <span className="material-symbols-outlined" style={{ fontSize: 10, fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
    IA
  </span>
);

export const aiInputClass =
  'w-full rounded-lg border border-[#151b2d]/30 px-3 py-2.5 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#151b2d] focus:ring-2 focus:ring-[#151b2d]/8 hover:border-[#151b2d]/50 transition-all placeholder:text-[#54433e]/40 bg-white';

export const aiSelectClass =
  'w-full rounded-lg border border-[#151b2d]/30 px-3 py-2.5 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#151b2d] focus:ring-2 focus:ring-[#151b2d]/8 hover:border-[#151b2d]/50 transition-all bg-white appearance-none cursor-pointer';
