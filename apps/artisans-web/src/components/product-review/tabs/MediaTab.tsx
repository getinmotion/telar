/**
 * MediaTab — View migrated images for a product (read-only gallery)
 */
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon } from 'lucide-react';
import type { ProductResponse } from '@/services/products-new.types';

interface MediaTabProps {
  product: ProductResponse;
}

export const MediaTab: React.FC<MediaTabProps> = ({ product }) => {
  const mediaItems = (product.media || [])
    .filter((m) => m.mediaType === 'image')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (mediaItems.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
        No hay imágenes migradas para este producto.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Imágenes Migradas ({mediaItems.length})
      </h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {mediaItems.map((media) => {
          const url = media.mediaUrl || '';
          const isExternal = url.startsWith('http');

          return (
            <div
              key={media.id}
              className="relative overflow-hidden rounded-lg border bg-muted"
            >
              {isExternal ? (
                <img
                  src={url}
                  alt={`Imagen ${media.displayOrder + 1}`}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex aspect-square flex-col items-center justify-center p-4 text-center">
                  <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                  <code className="break-all text-xs text-muted-foreground">
                    {url}
                  </code>
                  <span className="mt-1 text-xs text-muted-foreground">
                    (ruta local)
                  </span>
                </div>
              )}

              {/* Overlay badges */}
              <div className="absolute bottom-2 left-2 flex gap-1">
                <Badge variant="secondary" className="text-xs">
                  #{media.displayOrder}
                </Badge>
                {media.isPrimary && (
                  <Badge className="text-xs">Principal</Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
