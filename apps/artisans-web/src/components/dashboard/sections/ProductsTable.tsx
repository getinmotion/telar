import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// ── Design tokens (kept local to avoid coupling) ─────────────────────────────
const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

const glassPrimary: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 4px 20px rgba(21,27,45,0.02)',
};

type PillVariant = 'success' | 'warning' | 'error' | 'draft' | 'orange' | 'info';

const PILL_STYLES: Record<PillVariant, React.CSSProperties> = {
  success: { background: 'rgba(22,101,52,0.1)',  color: '#166534' },
  warning: { background: 'rgba(236,109,19,0.1)', color: '#ec6d13' },
  error:   { background: 'rgba(239,68,68,0.1)',  color: '#ef4444' },
  draft:   { background: 'rgba(21,27,45,0.06)',  color: '#54433e' },
  orange:  { background: '#ec6d13',              color: 'white'   },
  info:    { background: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
};

const Pill: React.FC<{ children: React.ReactNode; variant?: PillVariant }> = ({
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

const OrangeBtn: React.FC<{
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStock      = (p: any) => p.inventory ?? p.stock ?? 0;
const isProductActive = (p: any) => !!(p.active || p.moderation_status === 'approved' || p.moderation_status === 'approved_with_edits');
const isProductDraft  = (p: any) => p.moderation_status === 'draft' || (!p.active && !p.moderation_status);
const getImage        = (p: any) => typeof p.images?.[0] === 'string' ? p.images[0] : p.images?.[0]?.url;

// ── Props ─────────────────────────────────────────────────────────────────────
export interface ProductsTableProps {
  products: any[];
  loadingProducts: boolean;
  isActivated: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  loadingProducts,
  isActivated,
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ ...glassPrimary, borderRadius: 32 }} className="p-10">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h3 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: '#151b2d' }}>
          Mis Productos
        </h3>
        <div className="flex gap-3 items-center">
          {isActivated && (
            <button
              onClick={() => navigate('/inventario')}
              className="hover:underline"
              style={{ fontFamily: SANS, fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ec6d13' }}
            >
              Gestionar catálogo
            </button>
          )}
          <OrangeBtn onClick={() => navigate('/productos/subir')}>
            <span className="material-symbols-outlined text-[16px]">add</span>
            Crear producto
          </OrangeBtn>
        </div>
      </div>

      {loadingProducts ? (
        <div className="py-12 text-center" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: 'rgba(84,67,62,0.5)' }}>
          Cargando productos...
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(21,27,45,0.03)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'rgba(21,27,45,0.15)' }}>inventory_2</span>
          </div>
          <h4 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: '#151b2d', marginBottom: 8 }}>
            Aún no tienes productos
          </h4>
          <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: 'rgba(84,67,62,0.6)', maxWidth: 280, marginBottom: 24, lineHeight: 1.6 }}>
            Crea tu primer producto para activar tu catálogo de tienda.
          </p>
          <OrangeBtn onClick={() => navigate('/productos/subir')}>
            <span className="material-symbols-outlined text-[16px]">add</span>
            Crear producto
          </OrangeBtn>
        </div>
      ) : (
        <>
          <table className="w-full text-left">
            <thead style={{ borderBottom: '1px solid rgba(21,27,45,0.04)' }}>
              <tr>
                {['', 'Nombre', 'Estado', 'Precio', 'Stock', 'Acción'].map((h, i) => (
                  <th
                    key={h || i}
                    className={cn('pb-4', i > 2 ? 'text-right' : '', i === 0 ? 'w-16' : '')}
                    style={{ fontFamily: SANS, fontSize: 9, fontWeight: 900, color: 'rgba(84,67,62,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 8).map((product) => {
                const stock  = getStock(product);
                const active = isProductActive(product);
                const draft  = isProductDraft(product);
                const isLow  = active && stock > 0 && stock <= 5;
                const isOut  = active && stock === 0;
                const imgSrc = getImage(product);
                return (
                  <tr
                    key={product.id}
                    style={{ borderBottom: '1px solid rgba(21,27,45,0.03)' }}
                    className="hover:bg-black/[0.015] transition-colors"
                  >
                    <td className="py-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden" style={{ background: 'rgba(21,27,45,0.04)' }}>
                        {imgSrc && (
                          <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 max-w-[160px] truncate" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>
                      {product.name}
                    </td>
                    <td className="py-4">
                      {active && !isLow && <Pill variant="success">Publicado</Pill>}
                      {active && isLow  && <Pill variant="warning">Bajo stock</Pill>}
                      {draft            && <Pill variant="draft">Borrador</Pill>}
                      {!active && !draft && <Pill variant="info">En revisión</Pill>}
                    </td>
                    <td className="py-4 text-right" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>
                      {product.price ? `$${product.price.toLocaleString('es-CO')}` : '—'}
                    </td>
                    <td className="py-4 text-right" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>
                      {stock ?? '—'}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => navigate(`/productos/editar/${product.id}`)}
                        className="hover:underline"
                        style={{ fontFamily: SANS, fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ec6d13' }}
                      >
                        {isOut || isLow ? 'Reponer' : draft ? 'Completar' : 'Editar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {products.length > 8 && (
            <div className="pt-6 text-center">
              <button
                onClick={() => navigate('/inventario')}
                className="inline-flex items-center gap-1 hover:underline"
                style={{ fontFamily: SANS, fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ec6d13' }}
              >
                Ver todos los {products.length} productos
                <span className="material-symbols-outlined text-[16px]">east</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
