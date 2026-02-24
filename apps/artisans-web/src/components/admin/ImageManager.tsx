import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Upload, Copy, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { optimizeImage, ImageOptimizePresets } from '@/lib/imageOptimizer';

interface ImageFile {
  name: string;
  url: string;
  size?: number;
  lastModified?: string;
}

export const ImageManager: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const { toast } = useToast();

  // Obtener imágenes reales desde Supabase Storage
  const fetchImages = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching images from Supabase Storage...');
      
      const { data: files, error } = await supabase.storage
        .from('images')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Error fetching images:', error);
        throw error;
      }

      const imageFiles: ImageFile[] = files
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => {
          const { data: publicUrl } = supabase.storage
            .from('images')
            .getPublicUrl(file.name);
          
          return {
            name: file.name,
            url: publicUrl.publicUrl,
            size: file.metadata?.size,
            lastModified: file.created_at ? new Date(file.created_at).toISOString().split('T')[0] : undefined
          };
        });
      
      console.log('Images fetched successfully:', imageFiles.length);
      setImages(imageFiles);
      
      toast({
        title: 'Imágenes cargadas',
        description: `Se encontraron ${imageFiles.length} imágenes.`,
      });
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las imágenes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    const fileNames = fileArray.map(f => f.name);
    setUploadingFiles(fileNames);

    try {
      console.log('Uploading files:', fileNames);
      
      for (const file of fileArray) {
        // Optimize image before upload
        console.log(`[ImageManager] Optimizing ${file.name}...`);
        const optimizedFile = await optimizeImage(file, ImageOptimizePresets.product);
        
        // Generar un nombre único para evitar colisiones
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${optimizedFile.name}`;
        
        console.log(`[ImageManager] Uploading optimized file: ${uniqueFileName}`);
        
        const { data, error } = await supabase.storage
          .from('images')
          .upload(uniqueFileName, optimizedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error(`Error uploading ${file.name}:`, error);
          throw error;
        }

        console.log(`[ImageManager] File uploaded successfully: ${uniqueFileName}`);
      }
      
      // Refrescar la lista de imágenes después de subir
      await fetchImages();
      
      toast({
        title: 'Subida exitosa',
        description: `Se subieron ${fileArray.length} imagen(es).`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Error al subir las imágenes.',
        variant: 'destructive',
      });
    } finally {
      setUploadingFiles([]);
    }
  };

  const handleDeleteImage = async (imageName: string) => {
    try {
      console.log('Deleting image:', imageName);
      
      const { error } = await supabase.storage
        .from('images')
        .remove([imageName]);

      if (error) {
        console.error('Error deleting image:', error);
        throw error;
      }
      
      // Actualizar la lista local removiendo la imagen eliminada
      setImages(prev => prev.filter(img => img.name !== imageName));
      
      console.log('Image deleted successfully:', imageName);
      
      toast({
        title: 'Imagen eliminada',
        description: `La imagen ${imageName} ha sido eliminada.`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la imagen.',
        variant: 'destructive',
      });
    }
  };

  const copyUrlToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'URL copiada',
      description: 'La URL ha sido copiada al portapapeles.',
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-indigo-900/40 border-indigo-800/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Gestión de Imágenes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-indigo-600/50 rounded-lg p-6 text-center">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
              <p className="text-indigo-200 mb-1">
                Haz clic para subir imágenes o arrastra aquí
              </p>
              <p className="text-indigo-400 text-sm">
                Formatos soportados: PNG, JPG, GIF, WebP, SVG
              </p>
            </label>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button
              onClick={fetchImages}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="text-indigo-200 border-indigo-600 hover:bg-indigo-800/50"
            >
              {isLoading ? 'Cargando...' : 'Actualizar Lista'}
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
              <p className="text-indigo-200 mt-2">Cargando imágenes...</p>
            </div>
          )}

          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.name} className="bg-indigo-800/30 border-indigo-700/50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Image Preview */}
                    <div className="aspect-video bg-indigo-950/50 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Image Info */}
                    <div className="space-y-2">
                      <p className="text-foreground font-medium text-sm truncate" title={image.name}>
                        {image.name}
                      </p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(image.size)}</span>
                        <span>{image.lastModified}</span>
                      </div>
                    </div>

                    {/* URL Display */}
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {image.url}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyUrlToClipboard(image.url)}
                        className="flex-1 text-foreground border-border hover:bg-muted"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copiar URL
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-foreground border-border hover:bg-muted"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{image.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full max-h-96 object-contain rounded-lg"
                            />
                            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                              {image.url}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(image.name)}
                        className="text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Uploading Files */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Subiendo archivos:</p>
              {uploadingFiles.map((fileName) => (
                <div key={fileName} className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                  <span className="text-muted-foreground text-sm">{fileName}</span>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && images.length === 0 && (
            <div className="text-center py-8">
              <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground text-lg mb-2">No hay imágenes</p>
              <p className="text-muted-foreground">
                Sube tu primera imagen para comenzar
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
