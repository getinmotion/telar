import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

/**
 * Paleta de tokens del design system (DESIGN.md §2 + src/index.css).
 * Cada swatch lee la CSS var en vivo y la compara con el hex esperado:
 * si el Design System Editor cambia una var, esto se actualiza en vivo.
 */

const TOKENS: { group: string; items: { name: string; cssVar: string; expected?: string }[] }[] = [
  {
    group: 'TELAR Editorial (DESIGN.md §2)',
    items: [
      { name: 'brand-orange', cssVar: '--brand-orange', expected: '#ec6d13' },
      { name: 'on-surface', cssVar: '--on-surface', expected: '#151b2d' },
      { name: 'on-surface-variant', cssVar: '--on-surface-variant', expected: '#54433e' },
      { name: 'brand-cream', cssVar: '--brand-cream', expected: '#fdfaf6' },
      { name: 'brand-border', cssVar: '--brand-border', expected: '#e2d5cf' },
      { name: 'accent-green', cssVar: '--accent-green', expected: '#166534' },
    ],
  },
  {
    group: 'Domain colors — backoffice (DESIGN.md §26.1)',
    items: [
      { name: 'domain-moderation', cssVar: '--domain-moderation', expected: '#15803d' },
      { name: 'domain-content', cssVar: '--domain-content', expected: '#ec6d13' },
      { name: 'domain-business', cssVar: '--domain-business', expected: '#7c3aed' },
    ],
  },
  {
    group: 'Semánticos (shadcn)',
    items: [
      { name: 'primary / navy', cssVar: '--primary' },
      { name: 'secondary / golden', cssVar: '--secondary' },
      { name: 'accent / coral', cssVar: '--accent' },
      { name: 'background', cssVar: '--background' },
      { name: 'destructive', cssVar: '--destructive' },
      { name: 'success', cssVar: '--success' },
      { name: 'warning', cssVar: '--warning' },
      { name: 'muted', cssVar: '--muted' },
    ],
  },
];

function hslTripletToHex(triplet: string): string | null {
  const m = triplet.trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) return null;
  const [h, s, l] = [parseFloat(m[1]), parseFloat(m[2]) / 100, parseFloat(m[3]) / 100];
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const mm = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return (
    '#' + [r, g, b].map((v) => Math.round((v + mm) * 255).toString(16).padStart(2, '0')).join('')
  );
}

function Swatch({ name, cssVar, expected }: { name: string; cssVar: string; expected?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('');
  useEffect(() => {
    if (!ref.current) return;
    const read = () => setValue(getComputedStyle(ref.current!).getPropertyValue(cssVar).trim());
    read();
    const id = setInterval(read, 1000); // refleja cambios en vivo del Design System Editor
    return () => clearInterval(id);
  }, [cssVar]);
  const hex = hslTripletToHex(value);
  const ok = !expected || (hex && hex.toLowerCase() === expected.toLowerCase());
  return (
    <div ref={ref} className="glass-card-sm rounded-xl p-3 w-44">
      <div
        className="h-14 rounded-lg border border-black/5"
        style={{ background: `hsl(${value})` }}
      />
      <div className="mt-2 font-manrope text-2xs font-extrabold uppercase tracking-widest text-on-surface-variant">
        {name}
      </div>
      <div className="font-mono text-2xs text-on-surface/60">
        {cssVar} → {hex ?? value}
      </div>
      {expected && (
        <div className={`font-mono text-2xs ${ok ? 'text-accent-green' : 'text-destructive font-bold'}`}>
          {ok ? '✓ coincide con' : '✗ esperado'} {expected}
        </div>
      )}
    </div>
  );
}

function Palette() {
  return (
    <div className="space-y-8">
      {TOKENS.map(({ group, items }) => (
        <section key={group}>
          <h2 className="font-manrope text-sm font-extrabold uppercase tracking-widest text-on-surface mb-3">
            {group}
          </h2>
          <div className="flex flex-wrap gap-3">
            {items.map((t) => (
              <Swatch key={t.cssVar} {...t} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const meta: Meta<typeof Palette> = {
  title: 'Design System/Tokens de color',
  component: Palette,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Paleta: StoryObj<typeof Palette> = {};
