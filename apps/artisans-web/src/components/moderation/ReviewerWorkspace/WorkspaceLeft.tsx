import React, { useState } from 'react';
import { ImageOff, MapPin, Palette, Package, ChevronLeft, ChevronRight, Tag, ExternalLink } from 'lucide-react';
import { ModerationStatusBadge } from '../ModerationStatusBadge';
import { formatCurrency } from '@/utils/currency';
import { SANS, SERIF } from '@/components/dashboard/dashboardStyles';
import type { ModerationProduct } from '@/hooks/useProductModeration';

interface WorkspaceLeftProps {
  product: ModerationProduct;
}

export const WorkspaceLeft: React.FC<WorkspaceLeftProps> = ({ product }) => {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const [activeImg, setActiveImg] = useState(0);
  const hasShop = !!product.artisan_shops;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'white' }}>
      {/* ── Hero image gallery ─────────────────────────────── */}
      <div style={{ position: 'relative', background: '#f3f4f6' }}>
        <div style={{ aspectRatio: '4/3', width: '100%', overflow: 'hidden', background: '#f3f4f6' }}>
          {images.length > 0 ? (
            <img
              key={activeImg}
              src={images[activeImg]}
              alt={product.name}
              style={{ height: '100%', width: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
            />
          ) : (
            <div style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#d1d5db' }}>
              <ImageOff style={{ width: 48, height: 48 }} />
              <span style={{ fontFamily: SANS, fontSize: 13 }}>Sin fotos</span>
            </div>
          )}
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', borderRadius: 9999, background: 'rgba(255,255,255,0.92)', padding: 6, boxShadow: '0 1px 4px rgba(21,27,45,0.12)', border: 'none', cursor: 'pointer', display: 'flex' }}
            >
              <ChevronLeft style={{ width: 16, height: 16, color: '#374151' }} />
            </button>
            <button
              onClick={() => setActiveImg((p) => (p + 1) % images.length)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', borderRadius: 9999, background: 'rgba(255,255,255,0.92)', padding: 6, boxShadow: '0 1px 4px rgba(21,27,45,0.12)', border: 'none', cursor: 'pointer', display: 'flex' }}
            >
              <ChevronRight style={{ width: 16, height: 16, color: '#374151' }} />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: 12, right: 12, borderRadius: 9999, background: 'rgba(21,27,45,0.55)', padding: '2px 8px', fontFamily: SANS, fontSize: 10, color: 'white' }}>
            {activeImg + 1} / {images.length}
          </div>
        )}

        {/* Low-image warning */}
        {images.length < 3 && images.length > 0 && (
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            display: 'flex', alignItems: 'center', gap: 4,
            borderRadius: 9999, background: 'rgba(245,158,11,0.9)', padding: '4px 10px',
            fontFamily: SANS, fontSize: 10, fontWeight: 600, color: 'white',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span>
            Pocas fotos ({images.length}/3)
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', background: '#f9f9f9', padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              style={{
                width: 48, height: 48, flexShrink: 0, borderRadius: 4, overflow: 'hidden',
                border: `2px solid ${i === activeImg ? '#151b2d' : 'transparent'}`,
                opacity: i === activeImg ? 1 : 0.55,
                transition: 'all 0.12s', padding: 0, cursor: 'pointer',
              }}
            >
              <img src={img} alt="" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      {/* ── Product info ───────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Title block */}
        <div style={{ padding: '16px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, lineHeight: 1.3, color: '#151b2d', flex: 1, margin: 0 }}>{product.name}</h2>
            <ModerationStatusBadge status={product.moderation_status} size="sm" />
          </div>

          {/* Price + meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: '#151b2d' }}>
              {formatCurrency(product.price)}
            </span>
            {product.category && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, borderRadius: 9999, border: '1px solid rgba(84,67,62,0.15)', background: 'rgba(84,67,62,0.04)', padding: '2px 8px', fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.65)' }}>
                <Tag style={{ width: 11, height: 11 }} />
                {product.category}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, borderRadius: 9999, border: '1px solid rgba(84,67,62,0.15)', background: 'rgba(84,67,62,0.04)', padding: '2px 8px', fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.65)' }}>
              <Package style={{ width: 11, height: 11 }} />
              {product.inventory} en stock
            </span>
          </div>

          {/* Short description */}
          {product.short_description && (
            <p style={{ marginTop: 8, fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.6)', lineHeight: 1.5, margin: '8px 0 0' }}>{product.short_description}</p>
          )}
        </div>

        <div style={{ height: 1, background: 'rgba(84,67,62,0.06)', margin: '0 16px' }} />

        {/* ── Shop card ─────────────────────────────────────── */}
        {hasShop && (
          <div style={{ padding: '12px 16px' }}>
            <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(84,67,62,0.4)', marginBottom: 8 }}>Taller artesano</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 12, border: '1px solid rgba(84,67,62,0.08)', background: 'rgba(84,67,62,0.03)', padding: 12 }}>
              {product.artisan_shops!.logo_url ? (
                <img
                  src={product.artisan_shops!.logo_url}
                  alt={product.artisan_shops!.shop_name}
                  style={{ width: 44, height: 44, borderRadius: 9999, objectFit: 'cover', border: '2px solid white', boxShadow: '0 1px 4px rgba(21,27,45,0.08)', flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 9999, background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#6b7280' }}>
                    {product.artisan_shops!.shop_name?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#151b2d', lineHeight: 1.2, margin: 0 }}>{product.artisan_shops!.shop_name}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px', marginTop: 2 }}>
                  {product.artisan_shops!.region && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.55)' }}>
                      <MapPin style={{ width: 11, height: 11 }} />
                      {product.artisan_shops!.region}
                    </span>
                  )}
                  {product.artisan_shops!.craft_type && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.55)' }}>
                      <Palette style={{ width: 11, height: 11 }} />
                      {product.artisan_shops!.craft_type}
                    </span>
                  )}
                </div>
              </div>
              <ExternalLink style={{ width: 13, height: 13, color: 'rgba(84,67,62,0.25)', flexShrink: 0 }} />
            </div>
          </div>
        )}

        {hasShop && <div style={{ height: 1, background: 'rgba(84,67,62,0.06)', margin: '0 16px' }} />}

        {/* ── Materials ─────────────────────────────────────── */}
        {product.materials && product.materials.length > 0 && (
          <div style={{ padding: '12px 16px' }}>
            <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(84,67,62,0.4)', marginBottom: 8 }}>Materiales</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {product.materials.map((m, i) => (
                <span key={i} style={{ borderRadius: 9999, border: '1px solid rgba(84,67,62,0.12)', background: 'white', padding: '2px 10px', fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.7)', boxShadow: '0 1px 2px rgba(21,27,45,0.04)' }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {product.materials && product.materials.length > 0 && <div style={{ height: 1, background: 'rgba(84,67,62,0.06)', margin: '0 16px' }} />}

        {/* ── Historia ──────────────────────────────────────── */}
        {product.description && (
          <div style={{ padding: '12px 16px 24px' }}>
            <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(84,67,62,0.4)', marginBottom: 8 }}>Historia del producto</p>
            <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.7)', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>{product.description}</p>
            {product.description.length < 80 && (
              <div style={{
                marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
                borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.06)',
                padding: '6px 12px', fontFamily: SANS, fontSize: 11, color: '#b45309',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 13, flexShrink: 0 }}>warning</span>
                Historia muy corta — se recomienda mínimo 80 caracteres
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
