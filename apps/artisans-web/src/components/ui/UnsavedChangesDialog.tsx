import React from 'react';

const T = {
  dark:  '#151b2d',
  orange:'#ec6d13',
  muted: '#54433e',
  sans:  "'Manrope', sans-serif",
  serif: "'Noto Serif', serif",
};

interface UnsavedChangesDialogProps {
  onSaveAndExit: () => void;
  onDiscardAndExit: () => void;
  onStay: () => void;
  isSaving?: boolean;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  onSaveAndExit,
  onDiscardAndExit,
  onStay,
  isSaving,
}) => (
  <div
    style={{ position: 'fixed', inset: 0, background: 'rgba(21,27,45,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}
    onClick={onStay}
  >
    <div
      style={{ background: 'white', borderRadius: 24, padding: 32, maxWidth: 360, width: '100%', boxShadow: '0 24px 64px rgba(21,27,45,0.2)' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 mb-4">
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(236,109,19,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: T.orange }}>warning</span>
        </div>
        <p style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 700, color: T.dark }}>
          Cambios sin guardar
        </p>
      </div>

      <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70`, lineHeight: 1.6, marginBottom: 24 }}>
        Tienes cambios que no se han guardado. ¿Qué deseas hacer antes de salir?
      </p>

      <div className="flex flex-col gap-2">
        <button
          onClick={onSaveAndExit}
          disabled={isSaving}
          style={{ width: '100%', padding: '12px 20px', borderRadius: 100, background: T.dark, color: 'white', border: 'none', cursor: 'pointer', fontFamily: T.sans, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', opacity: isSaving ? 0.6 : 1 }}
        >
          {isSaving ? 'Guardando…' : 'Guardar y salir'}
        </button>
        <button
          onClick={onDiscardAndExit}
          disabled={isSaving}
          style={{ width: '100%', padding: '12px 20px', borderRadius: 100, background: 'transparent', color: `${T.muted}70`, border: `1px solid rgba(84,67,62,0.15)`, cursor: 'pointer', fontFamily: T.sans, fontSize: 11, fontWeight: 700 }}
        >
          Descartar y salir
        </button>
        <button
          onClick={onStay}
          style={{ width: '100%', padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.orange }}
        >
          Seguir editando
        </button>
      </div>
    </div>
  </div>
);
