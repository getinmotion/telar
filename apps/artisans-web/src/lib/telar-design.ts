/**
 * Telar Design System — constantes compartidas.
 * Importa T, TELAR_BG, glassPrimary, inputStyle en lugar de redefinirlos en cada wizard.
 */
import type { CSSProperties } from 'react';

/** Paleta de colores y tipografías base */
export const T = {
  dark:   '#151b2d',
  orange: '#ec6d13',
  muted:  '#54433e',
  sans:   "'Manrope', sans-serif",
  serif:  "'Noto Serif', serif",
} as const;

/** Color de fondo de página para wizards */
export const TELAR_BG = '#f9f7f2';

/** Estilo glassmorphism para tarjetas principales */
export const glassPrimary: CSSProperties = {
  background:           'rgba(255,255,255,0.82)',
  backdropFilter:       'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border:               '1px solid rgba(255,255,255,0.65)',
  boxShadow:            '0 4px 20px rgba(21,27,45,0.02)',
};

/** Estilo glassmorphism para tarjetas de contenido de wizard */
export const glassContent: CSSProperties = {
  background:           'rgba(255,255,255,0.8)',
  backdropFilter:       'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border:               '1px solid rgba(255,255,255,0.65)',
  boxShadow:            '0 2px 12px -2px rgba(0,0,0,0.02)',
};

/** Estilo base para inputs dentro de wizards */
export const inputStyle: CSSProperties = {
  width:        '100%',
  padding:      '10px 14px',
  borderRadius: 10,
  border:       '1px solid rgba(84,67,62,0.14)',
  outline:      'none',
  fontFamily:   T.sans,
  fontSize:     13,
  color:        T.dark,
  background:   'rgba(247,244,239,0.5)',
};

/** Divisor horizontal */
export const divider: CSSProperties = {
  height:     1,
  background: 'rgba(84,67,62,0.08)',
};
