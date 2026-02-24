
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Loader2, CheckCircle } from 'lucide-react';

interface SiteImage {
  id: string;
  context: string;
  key: string;
  image_url: string;
  alt_text: string | null;
}

interface StorageImage {
  name: string;
  url: string;
}

interface ImageGridProps {
  images: SiteImage[];
  storageImages: StorageImage[];
  onImageUpdate: (imageId: string, newImageUrl: string) => Promise<void>;
  isUpdating: string | null;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, storageImages, onImageUpdate, isUpdating }) => {
  if (images.length === 0) {
    return <div className="text-center text-indigo-300">Selecciona una categoría para ver las imágenes.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map(image => (
        <Card key={image.id} className="bg-indigo-800/30 border-indigo-700/50 flex flex-col">
          <CardHeader>
            <CardTitle className="text-white text-base capitalize">{image.key.replace(/([A-Z])/g, ' $1').replace(/-/g, ' ')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow flex flex-col">
            <div className="aspect-video bg-indigo-950/50 rounded-lg overflow-hidden flex-shrink-0">
                <img src={image.image_url} alt={image.alt_text || ''} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <p className="text-sm text-indigo-300 truncate flex-grow" title={image.alt_text || ''}>{image.alt_text || 'Sin texto alternativo'}</p>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full text-indigo-200 border-indigo-600 hover:bg-indigo-800/50 mt-auto">
                  {isUpdating === image.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Cambiar Imagen"}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-indigo-950 text-white border-indigo-800 max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Selecciona una nueva imagen para: <span className="text-pink-400">{image.context} - {image.key}</span></DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {storageImages.map(storageImage => (
                    <DialogClose asChild key={storageImage.name}>
                        <div 
                        className="relative group border-2 border-transparent rounded-lg overflow-hidden cursor-pointer hover:border-pink-500 transition-all duration-200"
                        onClick={() => onImageUpdate(image.id, storageImage.url)}
                        >
                            <img src={storageImage.url} alt={storageImage.name} className="w-full h-32 object-cover" loading="lazy" />
                            {image.image_url === storageImage.url && (
                                <div className="absolute inset-0 bg-green-900/70 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-white"/>
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                                <p className="text-xs text-white truncate">{storageImage.name}</p>
                            </div>
                        </div>
                    </DialogClose>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
