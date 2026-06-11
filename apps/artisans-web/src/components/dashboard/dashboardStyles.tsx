import React from 'react';
import { cn } from '@/lib/utils';

// ── Typography ────────────────────────────────────────────────────────────────
export const SERIF   = "'Noto Serif', serif";
export const SANS    = "'Manrope', sans-serif";
export const SPARTAN = "'League Spartan', sans-serif";

// ── Domain color tokens ───────────────────────────────────────────────────────
// Consumen CSS vars del design system: responden al Design System Editor.
// El hex en el comentario es el valor exacto que reemplazan (light mode).

// Negocio (business admin) — purple
export const PURPLE        = 'hsl(var(--domain-business))';      // #7c3aed
export const PURPLE_ACTIVE = 'hsl(var(--domain-business-dark))'; // #5b21b6
export const PURPLE_MID    = '#4c1d95'; // sin token aún (decorativo)
export const PURPLE_DARK   = '#3b0764'; // sin token aún (decorativo)

// Moderación — forest green
export const GREEN_MOD   = 'hsl(var(--domain-moderation))'; // #15803d
export const GREEN_MID   = 'hsl(var(--accent-green))';      // #166534
export const GREEN_DARK  = '#052e16'; // sin token aún (decorativo)

// Contenido / marca
export const ORANGE        = 'hsl(var(--brand-orange))';        // #ec6d13
export const ORANGE_DARK   = 'hsl(var(--brand-orange-dark))';   // #c45a0a
export const ORANGE_DARKER = 'hsl(var(--brand-orange-darker))'; // #9c3f00

// Texto sobre superficie
export const INK      = 'hsl(var(--on-surface))';         // #151b2d
export const INK_SOFT = 'hsl(var(--on-surface-variant))'; // #54433e
export const NAVY     = 'hsl(var(--navy))';               // #142239

// Status (backoffice: aprobado/pendiente/rechazado/info)
export const RED         = 'hsl(var(--status-error))';         // #dc2626
export const DESTRUCTIVE = 'hsl(var(--destructive))';          // #ef4444
export const AMBER       = 'hsl(var(--status-warning))';       // #d97706
export const AMBER_DARK  = 'hsl(var(--status-warning-dark))';  // #b45309
export const AMBER_LIGHT = 'hsl(var(--status-warning-light))'; // #f59e0b
export const SKY         = 'hsl(var(--status-info))';          // #0369a1

// Neutrales (escala gray de Tailwind) — sin CSS var aún; centralizados aquí
// para que un futuro token de neutrales sea un cambio de una línea.
export const GRAY_50  = '#f9fafb';
export const GRAY_100 = '#f3f4f6';
export const GRAY_200 = '#e5e7eb';
export const GRAY_300 = '#d1d5db';
export const GRAY_400 = '#9ca3af';
export const GRAY_500 = '#6b7280';
export const GRAY_700 = '#374151';
export const GRAY_900 = '#111827';

// ── Alpha helpers ─────────────────────────────────────────────────────────────
// Reemplazan rgba(r,g,b,a) hardcodeados manteniendo el color base tokenizado.
const varAlpha = (cssVar: string) => (alpha: number) => `hsl(var(--${cssVar}) / ${alpha})`;

export const purpleA    = varAlpha('domain-business');      // rgba(124,58,237,a)
export const greenA     = varAlpha('domain-moderation');    // rgba(21,128,61,a)
export const greenMidA  = varAlpha('accent-green');         // rgba(22,101,52,a)
export const orangeA    = varAlpha('brand-orange');         // rgba(236,109,19,a)
export const navyA      = varAlpha('navy');                 // rgba(20,34,57,a)
export const inkA       = varAlpha('on-surface');           // rgba(21,27,45,a)
export const inkSoftA   = varAlpha('on-surface-variant');   // rgba(84,67,62,a)
export const redA       = varAlpha('destructive');          // rgba(239,68,68,a)
export const amberA     = varAlpha('status-warning-light'); // rgba(245,158,11,a)
export const amberDarkA = varAlpha('status-warning-dark');  // rgba(180,83,9,a)
export const skyA       = varAlpha('status-info');          // rgba(3,105,161,a)

// ── Glass surfaces ────────────────────────────────────────────────────────────
export const glassPrimary: React.CSSProperties = {
  background: 'var(--glass-fill)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--glass-border)',
  boxShadow: '0 4px 20px hsl(var(--on-surface) / 0.02)',
};

export const glassSecondary: React.CSSProperties = {
  background: 'var(--glass-fill-sm)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid var(--glass-border)',
};

export const glassPurple: React.CSSProperties = {
  background: purpleA(0.05),
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${purpleA(0.15)}`,
  boxShadow: `0 4px 20px ${purpleA(0.04)}`,
};

export const glassGreen: React.CSSProperties = {
  background: greenA(0.05),
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${greenA(0.15)}`,
  boxShadow: `0 4px 20px ${greenA(0.04)}`,
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
  color: inkSoftA(opacity),
  display: 'block',
});

// ── Pill badge ────────────────────────────────────────────────────────────────
export type PillVariant = 'success' | 'warning' | 'error' | 'draft' | 'orange' | 'info' | 'purple' | 'green_mod';

const PILL_STYLES: Record<PillVariant, React.CSSProperties> = {
  success:   { background: greenMidA(0.1),         color: GREEN_MID   },
  warning:   { background: orangeA(0.1),           color: ORANGE      },
  error:     { background: redA(0.1),              color: DESTRUCTIVE },
  draft:     { background: inkA(0.06),             color: INK_SOFT    },
  orange:    { background: ORANGE,                 color: 'white'     },
  info:      { background: 'rgba(59,130,246,0.1)', color: '#3b82f6'   }, // blue-500: sin token aún
  purple:    { background: purpleA(0.1),           color: PURPLE      },
  green_mod: { background: greenA(0.1),            color: GREEN_MOD   },
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
      background: ORANGE,
      color: 'white',
      fontFamily: SANS,
      fontSize: 13,
      fontWeight: 700,
      boxShadow: `0 4px 12px ${orangeA(0.3)}`,
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
      border: `1px solid ${inkA(0.1)}`,
      color: INK,
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
        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: inkSoftA(0.5) }}>
          {label}
        </span>
        <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: inkSoftA(0.4), marginTop: 2 }}>
          {sub}
        </p>
      </div>
      <span className="material-symbols-outlined" style={{ color: inkA(0.15), fontSize: 20 }}>
        {icon}
      </span>
    </div>
    <div style={{ fontFamily: SANS, fontSize: 36, fontWeight: 700, color: INK, lineHeight: 1.1 }}>
      {value}
    </div>
  </div>
);
