/**
 * LegacyTab — Read-only view of the original legacy product data for comparison
 */
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Info, AlertTriangle } from 'lucide-react';
import { telarApi } from '@/integrations/api/telarApi';
import type { ProductResponse } from '@/services/products-new.types';

interface LegacyProduct {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  category?: string;
  subcategory?: string;
  tags?: string[];
  materials?: string[];
  techniques?: string[];
  sku?: string;
  inventory?: number;
  active?: boolean;
  featured?: boolean;
  moderationStatus?: string;
  customizable?: boolean;
  madeToOrder?: boolean;
  shippingDataComplete?: boolean;
  readyForCheckout?: boolean;
  allowsLocalPickup?: boolean;
  seoData?: Record<string, unknown>;
  marketplaceLinks?: Record<string, unknown>;
  images?: string[];
}

interface LegacyTabProps {
  product: ProductResponse;
}

export const LegacyTab: React.FC<LegacyTabProps> = ({ product }) => {
  const [legacy, setLegacy] = useState<LegacyProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!product.legacyProductId) return;

    const fetchLegacy = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await telarApi.get<LegacyProduct>(
          `/products/${product.legacyProductId}`
        );
        setLegacy(response.data);
      } catch (err) {
        console.error('Error fetching legacy product:', err);
        setError('No se pudo cargar el producto legacy.');
      } finally {
        setLoading(false);
      }
    };

    fetchLegacy();
  }, [product.legacyProductId]);

  if (!product.legacyProductId) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <Info className="mx-auto mb-2 h-8 w-8 opacity-50" />
        Este producto no fue creado vía migración (no tiene legacy_product_id).
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !legacy) {
    return (
      <div className="rounded-lg border border-dashed border-yellow-500 bg-yellow-50 p-8 text-center">
        <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-yellow-600" />
        <p className="text-sm text-yellow-700">
          {error || 'El producto legacy referenciado ya no existe en la BD.'}
        </p>
      </div>
    );
  }

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-2 py-1">
      <span className="min-w-[160px] text-sm font-medium text-muted-foreground">
        {label}:
      </span>
      <span className="text-sm">{value || '—'}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Datos Originales del Producto Legacy</h3>

      {/* Basic info */}
      <div className="rounded-lg border p-4 space-y-1">
        <InfoRow label="Nombre Original" value={legacy.name} />
        <InfoRow label="SKU" value={legacy.sku} />
        <InfoRow label="Inventario" value={legacy.inventory} />
        <InfoRow
          label="Precio"
          value={legacy.price ? `$${legacy.price.toLocaleString()}` : '—'}
        />
        <InfoRow
          label="Compare Price"
          value={legacy.comparePrice ? `$${legacy.comparePrice.toLocaleString()}` : '—'}
        />
        <InfoRow
          label="Categoría"
          value={
            <span>
              {legacy.category || '—'}
              {legacy.subcategory ? ` > ${legacy.subcategory}` : ''}
            </span>
          }
        />
      </div>

      {/* Fields not migrated */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">
          Campos NO migrados (información de referencia)
        </h4>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4 space-y-1">
            <InfoRow label="Active" value={String(legacy.active ?? '—')} />
            <InfoRow label="Featured" value={String(legacy.featured ?? '—')} />
            <InfoRow label="Moderation Status" value={legacy.moderationStatus} />
            <InfoRow label="Customizable" value={String(legacy.customizable ?? '—')} />
            <InfoRow label="Made to Order" value={String(legacy.madeToOrder ?? '—')} />
            <InfoRow label="Local Pickup" value={String(legacy.allowsLocalPickup ?? '—')} />
            <InfoRow label="Shipping Complete" value={String(legacy.shippingDataComplete ?? '—')} />
            <InfoRow label="Ready for Checkout" value={String(legacy.readyForCheckout ?? '—')} />
          </div>

          <div className="space-y-3">
            {legacy.tags && legacy.tags.length > 0 && (
              <div className="rounded-lg border p-4">
                <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {legacy.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {legacy.materials && legacy.materials.length > 0 && (
              <div className="rounded-lg border p-4">
                <span className="text-sm font-medium text-muted-foreground">Materials:</span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {legacy.materials.map((mat, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {mat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {legacy.techniques && legacy.techniques.length > 0 && (
              <div className="rounded-lg border p-4">
                <span className="text-sm font-medium text-muted-foreground">Techniques:</span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {legacy.techniques.map((tech, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legacy description */}
      {legacy.description && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Descripción Original Completa
          </h4>
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="whitespace-pre-wrap text-sm">{legacy.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};
