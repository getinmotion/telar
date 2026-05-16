import React, { useState } from 'react';
import { ImageOff, MapPin, Palette, Package, ChevronLeft, ChevronRight, Tag, AlertTriangle, ExternalLink } from 'lucide-react';
import { ModerationStatusBadge } from '../ModerationStatusBadge';
import { formatCurrency } from '@/utils/currency';
import type { ModerationProduct } from '@/hooks/useProductModeration';

interface WorkspaceLeftProps {
  product: ModerationProduct;
}

export const WorkspaceLeft: React.FC<WorkspaceLeftProps> = ({ product }) => {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const [activeImg, setActiveImg] = useState(0);
  const hasShop = !!product.artisan_shops;

  return (
    <div className="flex flex-col overflow-y-auto bg-white">
      {/* ── Hero image gallery ─────────────────────────────── */}
      <div className="relative bg-gray-100">
        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
          {images.length > 0 ? (
            <img
              key={activeImg}
              src={images[activeImg]}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-300">
              <ImageOff className="h-12 w-12" />
              <span className="text-sm">Sin fotos</span>
            </div>
          )}
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-md hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => setActiveImg((p) => (p + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-md hover:bg-white transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-700" />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
            {activeImg + 1} / {images.length}
          </div>
        )}

        {/* Low-image warning */}
        {images.length < 3 && images.length > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-medium text-white">
            <AlertTriangle className="h-3 w-3" />
            Pocas fotos ({images.length}/3)
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto bg-gray-50 px-3 py-2 border-b border-gray-100">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`h-12 w-12 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                i === activeImg ? 'border-[#151b2d] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── Product info ───────────────────────────────────── */}
      <div className="flex flex-col gap-0">
        {/* Title block */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-lg font-bold leading-snug text-[#151b2d] flex-1">{product.name}</h2>
            <ModerationStatusBadge status={product.moderation_status} size="sm" />
          </div>

          {/* Price + meta row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl font-bold text-[#151b2d]">
              {formatCurrency(product.price)}
            </span>
            {product.category && (
              <span className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600">
                <Tag className="h-3 w-3" />
                {product.category}
              </span>
            )}
            <span className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600">
              <Package className="h-3 w-3" />
              {product.inventory} en stock
            </span>
          </div>

          {/* Short description */}
          {product.short_description && (
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{product.short_description}</p>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-gray-100 mx-4" />

        {/* ── Shop card ─────────────────────────────────────── */}
        {hasShop && (
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Taller artesano</p>
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
              {product.artisan_shops!.logo_url ? (
                <img
                  src={product.artisan_shops!.logo_url}
                  alt={product.artisan_shops!.shop_name}
                  className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-gray-500">
                    {product.artisan_shops!.shop_name?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#151b2d] leading-tight">{product.artisan_shops!.shop_name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  {product.artisan_shops!.region && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {product.artisan_shops!.region}
                    </span>
                  )}
                  {product.artisan_shops!.craft_type && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Palette className="h-3 w-3 text-gray-400" />
                      {product.artisan_shops!.craft_type}
                    </span>
                  )}
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* ── Divider ── */}
        {hasShop && <div className="h-px bg-gray-100 mx-4" />}

        {/* ── Materials ─────────────────────────────────────── */}
        {product.materials && product.materials.length > 0 && (
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Materiales</p>
            <div className="flex flex-wrap gap-1.5">
              {product.materials.map((m, i) => (
                <span
                  key={i}
                  className="rounded-full border border-gray-200 bg-white px-3 py-0.5 text-xs text-gray-700 shadow-sm"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Divider ── */}
        {product.materials && product.materials.length > 0 && <div className="h-px bg-gray-100 mx-4" />}

        {/* ── Historia ──────────────────────────────────────── */}
        {product.description && (
          <div className="px-4 py-3 pb-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Historia del producto</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
            {product.description.length < 80 && (
              <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                Historia muy corta — se recomienda mínimo 80 caracteres
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
