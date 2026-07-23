/**
 * WizardOraculoPanel — panel oscuro del ORÁCULO compartido por todos los wizards.
 * variant "desktop": columna lateral (sticky dentro del scroller del wizard).
 * variant "drawer": contenido del drawer mobile (sin min-height ni sticky).
 */
import React from 'react';
import { T } from '@/lib/telar-design';

export interface AiCard { label: string; text: string; }

interface Props {
  cards: AiCard[];
  next: string;
  variant?: 'desktop' | 'drawer';
}

export const WizardOraculoPanel: React.FC<Props> = ({ cards, next, variant = 'desktop' }) => {
  const isDesktop = variant === 'desktop';
  return (
    <section
      className={
        isDesktop
          ? 'h-full text-white flex flex-col relative overflow-hidden border border-white/10 shadow-lg rounded-xl p-5 min-h-[480px]'
          : 'text-white flex flex-col relative overflow-hidden p-5'
      }
      style={{
        background: T.dark,
        ...(isDesktop ? { position: 'sticky' as const, top: 16 } : { borderRadius: 16 }),
      }}
    >
      {/* Encabezado del panel */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-[#ec6d13]">psychology</span>
          <h3 className="font-['Noto_Serif'] text-[16px] font-[500] text-white">ORÁCULO</h3>
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
      <div className={`relative z-10 flex flex-col gap-3 ${isDesktop ? 'flex-1' : ''}`}>
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
      <div className={`relative z-10 pt-5 border-t border-white/10 shrink-0 ${isDesktop ? 'mt-auto' : 'mt-4'}`}>
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
};
