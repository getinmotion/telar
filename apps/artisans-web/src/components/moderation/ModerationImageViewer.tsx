import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ZoomIn, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModerationImageViewerProps {
  images: string[];
}

export const ModerationImageViewer: React.FC<ModerationImageViewerProps> = ({
  images,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 bg-muted/30 rounded-lg border border-dashed">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
          <p className="text-sm">Sin imágenes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Imágenes del producto ({images.length})</label>

      <div className="grid grid-cols-4 gap-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative group aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary/50 transition-colors"
          >
            <img
              src={img}
              alt={`Imagen ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />

            {/* Overlay con zoom (solo lectura) */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => setPreviewImage(img)}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Número de imagen */}
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
              {idx + 1}
            </div>

            {/* Badge de imagen principal */}
            {idx === 0 && (
              <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                Principal
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de vista previa */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-3xl">
            <img
              src={previewImage}
              alt="Vista previa"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </DialogContent>
        </Dialog>
      )}

      <p className="text-xs text-muted-foreground">
        Imágenes en modo solo lectura. Para editar imágenes, usa el formulario de edición del producto.
      </p>
    </div>
  );
};
