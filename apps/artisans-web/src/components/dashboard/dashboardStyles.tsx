import React from 'react';
import { cn } from '@/lib/utils';

// ── Typography ────────────────────────────────────────────────────────────────
export const SERIF = "'Noto Serif', serif";
export const SANS  = "'Manrope', sans-serif";

// ── Domain color tokens ───────────────────────────────────────────────────────
// Negocio (business admin) — purple
export const PURPLE      = '#7c3aed';
export const PURPLE_DARK = '#3b0764';
export const PURPLE_MID  = '#4c1d95';

// Moderación — forest green
export const GREEN_MOD   = '#15803d';
export const GREEN_DARK  = '#052e16';
export const GREEN_MID   = '#166534';

// ── Glass surfaces ────────────────────────────────────────────────────────────
export const glassPrimary: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 20px rgba(21,27,45,0.02)',
};

export const glassSecondary: React.CSSProperties = {
  background: 'rgba(255,255,255,0.68)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.65)',
};

export const glassPurple: React.CSSProperties = {
  background: 'rgba(124,58,237,0.05)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(124,58,237,0.15)',
  boxShadow: '0 4px 20px rgba(124,58,237,0.04)',
};

export const glassGreen: React.CSSProperties = {
  background: 'rgba(21,128,61,0.05)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(21,128,61,0.15)',
  boxShadow: '0 4px 20px rgba(21,128,61,0.04)',
};

// ── Currency formatter ────────────────────────────────────────────────────────
export function formatCurrency(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}k`;
  return `$${v.toLocaleString('es-CO')}`;
}

// ── Label-caps style helper ───────────────────────────────────────────────────
export const lc = (opacity = 0.4): React.CSSProperties => ({
  fontFamily: SANS,
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: `rgba(84,67,62,${opacity})`,
  display: 'block',
});

// ── Pill badge ────────────────────────────────────────────────────────────────
export type PillVariant = 'success' | 'warning' | 'error' | 'draft' | 'orange' | 'info' | 'purple' | 'green_mod';

const PILL_STYLES: Record<PillVariant, React.CSSProperties> = {
  success:   { background: 'rgba(22,101,52,0.1)',   color: '#166534' },
  warning:   { background: 'rgba(236,109,19,0.1)',  color: '#ec6d13' },
  error:     { background: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
  draft:     { background: 'rgba(21,27,45,0.06)',   color: '#54433e' },
  orange:    { background: '#ec6d13',               color: 'white'   },
  info:      { background: 'rgba(59,130,246,0.1)',  color: '#3b82f6' },
  purple:    { background: 'rgba(124,58,237,0.1)',  color: '#7c3aed' },
  green_mod: { background: 'rgba(21,128,61,0.1)',   color: '#15803d' },
};

export const Pill: React.FC<{ children: React.ReactNode; variant?: PillVariant }> = ({
  children,
  variant = 'draft',
}) => (
  <span
    style={{
      ...PILL_STYLES[variant],
      borderRadius: '9999px',
      padding: '2px 10px',
      fontFamily: SANS,
      fontSize: 9,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      display: 'inline-block',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

// ── CTA Button (orange) ───────────────────────────────────────────────────────
export const OrangeBtn: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={cn('flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:opacity-90 hover:scale-[1.02]', className)}
    style={{
      background: '#ec6d13',
      color: 'white',
      fontFamily: SANS,
      fontSize: 13,
      fontWeight: 700,
      boxShadow: '0 4px 12px rgba(236,109,19,0.3)',
    }}
  >
    {children}
  </button>
);

// ── Outline Button ────────────────────────────────────────────────────────────
export const OutlineBtn: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={cn('flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:bg-white/60', className)}
    style={{
      border: '1px solid rgba(21,27,45,0.1)',
      color: '#151b2d',
      fontFamily: SANS,
      fontSize: 13,
      fontWeight: 700,
    }}
  >
    {children}
  </button>
);

// ── MetricCard ────────────────────────────────────────────────────────────────
export const MetricCard: React.FC<{
  label: string;
  value: React.ReactNode;
  sub: string;
  icon: string;
}> = ({ label, value, sub, icon }) => (
  <div style={{ ...glassPrimary, borderRadius: 24 }} className="p-5 h-32 flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div>
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(84,67,62,0.5)' }}>
          {label}
        </span>
        <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(84,67,62,0.4)', marginTop: 2 }}>
          {sub}
        </p>
      </div>
      <span className="material-symbols-outlined" style={{ color: 'rgba(21,27,45,0.15)', fontSize: 20 }}>
        {icon}
      </span>
    </div>
    <div style={{ fontFamily: SANS, fontSize: 36, fontWeight: 700, color: '#151b2d', lineHeight: 1.1 }}>
      {value}
    </div>
  </div>
);
