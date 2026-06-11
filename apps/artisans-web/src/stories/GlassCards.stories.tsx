import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

/**
 * Sistema glass TELAR — utilities .glass-card / .glass-card-sm / .glass-header
 * (src/index.css). Estas clases reemplazan los style={{ background: 'rgba(255,255,255,0.82)',
 * backdropFilter: 'blur(12px)', ... }} duplicados inline en 100+ archivos.
 */

function Glass() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="glass-header rounded-xl px-6 py-4">
        <span className="font-manrope text-2xs font-extrabold uppercase tracking-widest text-on-surface-variant">
          .glass-header — headers sticky
        </span>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-manrope text-lg font-bold text-on-surface">.glass-card</h3>
        <p className="font-manrope text-sm text-on-surface-variant mt-1">
          Card principal: blur(12px), fill 82%. Para paneles y secciones.
        </p>
      </div>

      <div className="glass-card-sm rounded-xl p-4">
        <h3 className="font-manrope text-sm font-bold text-on-surface">.glass-card-sm</h3>
        <p className="font-manrope text-xs text-on-surface-variant mt-1">
          Card secundaria: blur(8px), fill 68%. Para items de lista y chips grandes.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 border-l-4 border-l-domain-moderation">
        <span className="font-manrope text-2xs font-extrabold uppercase tracking-widest text-domain-moderation">
          Moderación
        </span>
        <p className="font-manrope text-sm text-on-surface-variant mt-1">
          Glass + acento de dominio (text-domain-moderation / border-domain-moderation).
        </p>
      </div>
    </div>
  );
}

const meta: Meta<typeof Glass> = {
  title: 'Design System/Glass cards',
  component: Glass,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Variantes: StoryObj<typeof Glass> = {};
