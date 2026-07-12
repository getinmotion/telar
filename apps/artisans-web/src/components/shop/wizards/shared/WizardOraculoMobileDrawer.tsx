/**
 * WizardOraculoMobileDrawer — drawer del ORÁCULO en mobile, anclado sobre el
 * WizardFooter del wizard. `bottomOffset` es la distancia en px desde el borde
 * inferior del viewport (footer + bottom-nav si aplica).
 */
import React, { useState } from 'react';
import { T } from '@/lib/telar-design';

interface Props {
  bottomOffset: number;
  children: React.ReactNode;
}

export const WizardOraculoMobileDrawer: React.FC<Props> = ({ bottomOffset, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="md:hidden fixed left-0 right-0 z-40"
      style={{ bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom))` }}
    >
      {/* Panel expandible */}
      <div style={{ overflow: 'hidden', maxHeight: open ? '55vh' : 0, transition: 'max-height 0.28s ease' }}>
        <div style={{ overflowY: 'auto', maxHeight: '55vh', background: T.dark, borderRadius: '16px 16px 0 0' }}>
          {children}
        </div>
      </div>

      {/* Barra de activación */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5"
        style={{
          background: T.dark,
          height: 46,
          borderTopLeftRadius: open ? 0 : 14,
          borderTopRightRadius: open ? 0 : 14,
          borderTop: open ? '1px solid rgba(255,255,255,0.08)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: T.orange, fontSize: 16 }}>psychology</span>
          <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>
            ORÁCULO
          </span>
        </div>
        <span
          className="material-symbols-outlined"
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: 18,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.25s ease',
          }}
        >
          expand_less
        </span>
      </button>
    </div>
  );
};
