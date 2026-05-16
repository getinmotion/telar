/**
 * MarketplacePreviewShell — renderiza cualquier sección CMS tal como aparece
 * en marketplace-web, escalada proporcionalmente al ancho del panel.
 *
 * - Inyecta Playfair Display + Manrope (fuentes del marketplace)
 * - Simula un viewport de 900px escalado al ancho disponible
 * - Actualiza en tiempo real al cambiar el draft
 */

import { useLayoutEffect, useRef, useState } from 'react';
import type { CmsSectionType } from '@/services/cms-sections.types';
import { CmsMarketplaceRenderer } from './CmsMarketplaceRenderer';

// Google Fonts del marketplace (Playfair Display + Manrope)
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,700&family=Manrope:wght@300;400;500;600;700;800&display=swap');`;

const VIRTUAL_VIEWPORT = 900; // px — ancho que el marketplace usa para el contenido

interface Props {
  type: CmsSectionType;
  draft: Record<string, any>;
}

export function MarketplacePreviewShell({ type, draft }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ scale: 0.48, outerHeight: 240 });

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const measure = () => {
      const outerW = outer.offsetWidth;
      const innerH = inner.scrollHeight;
      const s = Math.min(outerW / VIRTUAL_VIEWPORT, 1);
      setState({ scale: s, outerHeight: Math.max(innerH * s, 80) });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [type, draft]);

  const section = {
    id: 'preview',
    pageKey: '',
    position: 0,
    type,
    payload: draft,
    published: true,
    createdAt: '',
    updatedAt: '',
  } as const;

  return (
    <div className="flex flex-col h-full">
      {/* Label */}
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-[#ec6d13]" />
        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#54433e]/50 font-sans">
          Preview · marketplace
        </p>
        <div className="flex-1 h-px bg-[#54433e]/08" />
        <p className="text-[8px] text-[#54433e]/30 font-sans">{Math.round(state.scale * 100)}%</p>
      </div>

      {/* Scaled viewport */}
      <div
        ref={outerRef}
        className="flex-1 overflow-hidden rounded-xl"
        style={{
          background: '#f9f7f2',
          border: '1px solid rgba(44,44,44,0.08)',
          minHeight: state.outerHeight,
          position: 'relative',
        }}
      >
        {/* Font injection scoped to this wrapper */}
        <style>{FONT_IMPORT + `
          .mkt-preview { font-family: 'Manrope', sans-serif; color: #1b1c19; }
          .mkt-preview .font-serif { font-family: 'Playfair Display', Georgia, serif; }
          .mkt-preview .font-sans  { font-family: 'Manrope', system-ui, sans-serif; }
        `}</style>

        <div
          ref={innerRef}
          className="mkt-preview"
          style={{
            width: VIRTUAL_VIEWPORT,
            transform: `scale(${state.scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
            padding: '24px 32px',
            boxSizing: 'border-box',
          }}
        >
          <CmsMarketplaceRenderer section={section as any} />
        </div>
      </div>

      <p className="text-[8px] text-center text-[#54433e]/30 mt-1.5 font-sans shrink-0">
        Renderizado real del marketplace · widgets y links externos usan placeholders
      </p>
    </div>
  );
}
