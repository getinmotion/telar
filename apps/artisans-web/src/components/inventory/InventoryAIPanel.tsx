import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LegacyProduct } from '@telar/shared-types';

const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

interface InventoryAIPanelProps {
  products: LegacyProduct[];
}

export const InventoryAIPanel: React.FC<InventoryAIPanelProps> = ({ products }) => {
  const navigate = useNavigate();

  const analysis = useMemo(() => {
    const noImages    = products.filter(p => !p.images?.length || p.images[0] === '/placeholder.svg').length;
    const noDesc      = products.filter(p => !p.description || p.description.trim().length < 20).length;
    const lowStock    = products.filter(p => (p.inventory ?? 0) <= 3 && (p.inventory ?? 0) > 0).length;
    const outOfStock  = products.filter(p => (p.inventory ?? 0) === 0).length;
    const drafts      = products.filter(p => p.moderation_status === 'draft').length;

    if (noImages > 0) return {
      message: `${noImages} producto${noImages > 1 ? 's' : ''} sin imágenes`,
      sub: 'Las imágenes aumentan hasta 3× las conversiones. Súbelas y analízalas con IA para generar descripciones automáticas.',
      cta: 'Agregar imágenes',
      route: '/productos/subir',
    };
    if (noDesc > 0) return {
      message: `${noDesc} producto${noDesc > 1 ? 's' : ''} sin descripción`,
      sub: 'Las descripciones detalladas mejoran el posicionamiento y la confianza del comprador.',
      cta: 'Completar con IA',
      route: '/productos/subir',
    };
    if (drafts > 0) return {
      message: `${drafts} borrador${drafts > 1 ? 'es' : ''} pendiente${drafts > 1 ? 's' : ''}`,
      sub: 'Tienes productos incompletos. Completa su información para publicarlos en el marketplace.',
      cta: 'Completar productos',
      route: '/inventario',
    };
    if (outOfStock > 0) return {
      message: `${outOfStock} producto${outOfStock > 1 ? 's' : ''} agotado${outOfStock > 1 ? 's' : ''}`,
      sub: 'Actualiza tu stock para no perder ventas. Puedes ajustarlo rápidamente desde el inventario.',
      cta: 'Actualizar stock',
      route: '/stock-wizard',
    };
    if (lowStock > 0) return {
      message: `${lowStock} producto${lowStock > 1 ? 's' : ''} con stock bajo`,
      sub: 'Tu inventario está casi agotado. Repone stock antes de perder ventas importantes.',
      cta: 'Gestionar stock',
      route: '/stock-wizard',
    };

    return {
      message: '¡Catálogo en óptimas condiciones!',
      sub: 'Todos tus productos tienen imágenes, descripciones y stock. Considera agregar más piezas para ampliar tu oferta.',
      cta: 'Añadir producto',
      route: '/productos/subir',
    };
  }, [products]);

  return (
    <div
      className="p-6 rounded-2xl relative overflow-hidden"
      style={{ background: '#151b2d' }}
    >
      {/* Decorative blurs */}
      <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(236,109,19,0.12)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(236,109,19,0.06)', filter: 'blur(28px)', pointerEvents: 'none' }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(236,109,19,0.15)', border: '1px solid rgba(236,109,19,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#ec6d13' }}>smart_toy</span>
          </div>
          <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            Asistente IA · TELAR
          </span>
        </div>

        <h3 style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 8, lineHeight: 1.35 }}>
          {analysis.message}
        </h3>
        <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: 18 }}>
          {analysis.sub}
        </p>

        <button
          onClick={() => navigate(analysis.route)}
          className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-full transition-all hover:opacity-90"
          style={{ background: '#ec6d13', color: 'white', fontFamily: SANS, fontSize: 12, fontWeight: 700, boxShadow: '0 4px 12px rgba(236,109,19,0.3)', border: 'none', cursor: 'pointer' }}
        >
          {analysis.cta}
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>east</span>
        </button>
      </div>
    </div>
  );
};
