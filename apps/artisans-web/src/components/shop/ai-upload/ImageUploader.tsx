import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { optimizeImage, ImageOptimizePresets } from '@/lib/imageOptimizer';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  bucket: string;
  folder?: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  placeholder?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = [],
  onChange,
  maxFiles = 5,
  bucket,
  folder = '',
  aspectRatio = 'landscape',
  placeholder = 'Arrastra imágenes o haz clic para subir',
  className,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      // Optimize image before upload
      const optimizedFile = await optimizeImage(file, ImageOptimizePresets.product);
      console.log(`[ImageUploader] Optimized: ${Math.round(file.size / 1024)}KB → ${Math.round(optimizedFile.size / 1024)}KB`);

      const fileExt = optimizedFile.name.split('.').pop();
      const fileName = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, optimizedFile, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Error al subir imagen",
          description: uploadError.message || "No se pudo subir la imagen. Verifica que el bucket exista.",
          variant: "destructive",
        });
        return null;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return urlData?.publicUrl || null;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error al subir imagen",
        description: error?.message || "Error inesperado al subir la imagen",
        variant: "destructive",
      });
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const remainingSlots = maxFiles - value.length;
    const filesToUpload = acceptedFiles.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast({
        title: "Límite alcanzado",
        description: `Solo puedes subir ${maxFiles} imágenes`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of filesToUpload) {
      const url = await uploadFile(file);
      if (url) {
        newUrls.push(url);
      }
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls]);
      toast({
        title: "Imágenes subidas",
        description: `${newUrls.length} imagen(es) subida(s) correctamente`,
      });
    }

    setUploading(false);
  }, [value, maxFiles, onChange, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading || value.length >= maxFiles,
  });

  const removeImage = (index: number) => {
    const newUrls = [...value];
    newUrls.splice(index, 1);
    onChange(newUrls);
  };

  const aspectRatioClass = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
  }[aspectRatio];

  return (
    <div className={cn("space-y-3", className)}>
      {/* Upload Zone */}
      {value.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary/50",
            uploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Subiendo...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{placeholder}</p>
              <p className="text-xs text-muted-foreground">
                {value.length}/{maxFiles} imágenes
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {value.map((url, index) => (
            <div 
              key={index} 
              className={cn("relative group rounded-lg overflow-hidden bg-muted", aspectRatioClass)}
            >
              <img
                src={url}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
