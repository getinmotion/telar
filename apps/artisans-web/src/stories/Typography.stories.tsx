import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

/**
 * Escala tipográfica TELAR (DESIGN.md §3).
 * Los tamaños micro/3xs/2xs/2xs-plus reemplazan los text-[8px..11px] arbitrarios.
 */

function Typography() {
  return (
    <div className="space-y-10 max-w-3xl">
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-manrope text-sm font-extrabold uppercase tracking-widest text-on-surface-variant">
          Familias
        </h2>
        <p className="font-manrope text-2xl font-bold text-on-surface">Manrope — UI editorial (font-manrope)</p>
        <p className="font-noto-serif text-2xl italic text-on-surface">Noto Serif — acentos editoriales (font-noto-serif)</p>
        <p className="font-sans text-2xl text-on-surface">Open Sans — body legacy (font-sans)</p>
        <p className="font-display text-2xl text-on-surface">League Spartan — display legacy (font-display)</p>
      </section>

      <section className="glass-card rounded-2xl p-6 space-y-3">
        <h2 className="font-manrope text-sm font-extrabold uppercase tracking-widest text-on-surface-variant">
          Escala TELAR (tokens nuevos)
        </h2>
        <p className="font-manrope text-micro font-black uppercase tracking-widest text-on-surface-variant">
          text-micro · 8px · micro-tag — reemplaza text-[8px]
        </p>
        <p className="font-manrope text-3xs font-extrabold uppercase tracking-widest text-on-surface-variant">
          text-3xs · 9px — reemplaza text-[9px]
        </p>
        <p className="font-manrope text-2xs font-extrabold uppercase tracking-widest text-on-surface-variant">
          text-2xs · 10px · label-caps — reemplaza text-[10px]
        </p>
        <p className="font-manrope text-2xs-plus font-bold text-on-surface">
          text-2xs-plus · 11px — reemplaza text-[11px]
        </p>
        <p className="font-manrope text-xs text-on-surface">text-xs · 12px — reemplaza text-[12px]</p>
        <p className="font-manrope text-sm text-on-surface">text-sm · 14px · body-md — reemplaza text-[14px] y text-[13px]</p>
        <p className="font-manrope text-base text-on-surface">text-base · 16px — reemplaza text-[16px]</p>
      </section>

      <section className="glass-card rounded-2xl p-6 space-y-3">
        <h2 className="font-manrope text-sm font-extrabold uppercase tracking-widest text-on-surface-variant">
          Jerarquía editorial
        </h2>
        <h1 className="font-manrope text-5xl font-extrabold tracking-tight text-on-surface normal-case">
          Headline display
        </h1>
        <h2 className="font-manrope text-3xl font-bold text-on-surface normal-case">Headline sección</h2>
        <p className="font-noto-serif italic text-lg text-on-surface-variant">Subtítulo editorial en serif</p>
        <p className="font-manrope text-sm text-on-surface-variant leading-relaxed">
          Cuerpo de texto en Manrope 14px. El artesano registra su pieza, cuenta su historia y el
          sistema la presenta con dignidad editorial.
        </p>
      </section>
    </div>
  );
}

const meta: Meta<typeof Typography> = {
  title: 'Design System/Tipografía',
  component: Typography,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Escala: StoryObj<typeof Typography> = {};
