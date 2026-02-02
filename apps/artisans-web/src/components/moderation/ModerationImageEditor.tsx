import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GripVertical, X, Plus, ZoomIn, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { optimizeImage, ImageOptimizePresets } from '@/lib/imageOptimizer';

interface ModerationImageEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
  productId?: string;
}

export const ModerationImageEditor: React.FC<ModerationImageEditorProps> = ({
  images,
  onChange,
  productId,
}) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const uploadImages = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of files) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} no es una imagen válida`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} excede el límite de 10MB`);
          continue;
        }

        // Optimize image before upload
        let optimizedFile: File;
        try {
          optimizedFile = await optimizeImage(file, ImageOptimizePresets.product);
          console.log(`[ModerationImageEditor] Optimized: ${Math.round(file.size / 1024)}KB → ${Math.round(optimizedFile.size / 1024)}KB`);
        } catch {
          optimizedFile = file;
        }

        const timestamp = Date.now();
        const ext = optimizedFile.name.split('.').pop() || 'jpg';
        const path = productId 
          ? `moderation/${productId}/${timestamp}.${ext}`
          : `moderation/temp/${timestamp}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, optimizedFile, { upsert: true });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Error subiendo ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(path);

        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} imagen(es) subida(s)`);
        setUploadDialogOpen(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir imágenes');
    } finally {
      setIsUploading(false);
    }
  }, [images, onChange, productId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: uploadImages,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
    maxSize: 5 * 1024 * 1024,
    disabled: isUploading,
  });

  const addImage = () => {
    const trimmed = newImageUrl.trim();
    if (trimmed && !images.includes(trimmed)) {
      onChange([...images, trimmed]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    onChange(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Imágenes ({images.length})</label>
      
      <div className="grid grid-cols-4 gap-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            className={`
              relative group aspect-square rounded-lg overflow-hidden border-2 
              ${draggedIndex === idx ? 'border-primary opacity-50' : 'border-transparent'}
              cursor-move
            `}
          >
            <img
              src={img}
              alt={`Imagen ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            
            {/* Overlay con acciones */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => setPreviewImage(img)}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-destructive/80"
                onClick={() => removeImage(idx)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Indicador de arrastre */}
            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-white drop-shadow" />
            </div>
            
            {/* Número de imagen */}
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
              {idx + 1}
            </div>
          </div>
        ))}
        
        {/* Botón para subir imagen */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Upload className="w-6 h-6" />
              <span className="text-xs">Subir</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir imágenes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'}
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Subiendo...</p>
                  </div>
                ) : isDragActive ? (
                  <p className="text-sm text-primary">Suelta las imágenes aquí</p>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Arrastra imágenes aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Máximo 5MB por imagen
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Botón para agregar por URL */}
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs">URL</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar imagen por URL</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="URL de la imagen..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              {newImageUrl && (
                <div className="aspect-video rounded-lg overflow-hidden border">
                  <img
                    src={newImageUrl}
                    alt="Vista previa"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}
              <Button onClick={addImage} disabled={!newImageUrl.trim()} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar imagen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {images.length === 0 && (
        <div className="flex items-center justify-center h-24 bg-muted/30 rounded-lg border border-dashed">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
            <p className="text-sm">Sin imágenes</p>
          </div>
        </div>
      )}

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
        Arrastra las imágenes para reordenar. La primera imagen será la principal.
      </p>
    </div>
  );
};
