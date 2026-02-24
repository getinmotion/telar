
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { ImageManagerLayout } from './image-manager/ImageManagerLayout';
import { ImageGrid } from './image-manager/ImageGrid';

import type { Database } from '@/integrations/supabase/types';

type SiteImage = Database['public']['Tables']['site_images']['Row'];

interface StorageImage {
  name: string;
  url: string;
}

export const SiteImageManager: React.FC = () => {
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [storageImages, setStorageImages] = useState<StorageImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSiteImages = async () => {
    const { data, error } = await supabase.from('site_images').select('*').order('context').order('key');
    if (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar las imágenes del sitio.', variant: 'destructive' });
      console.error(error);
    } else {
      setSiteImages((data as unknown as SiteImage[]) || []);
      if (data && data.length > 0) {
        const contexts = [...new Set((data as unknown as SiteImage[]).map(img => img.context))];
        if (contexts.length > 0 && !selectedContext) {
          setSelectedContext(contexts[0]);
        }
      }
    }
  };

  const fetchStorageImages = async () => {
    const { data, error } = await supabase.storage.from('images').list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar las imágenes de la galería.', variant: 'destructive' });
    } else {
      const urls = (data || [])
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => {
          const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(file.name);
          return { name: file.name, url: publicUrlData.publicUrl };
        });
      setStorageImages(urls);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        await Promise.all([fetchSiteImages(), fetchStorageImages()]);
        setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleImageUpdate = async (imageId: string, newImageUrl: string) => {
    setIsUpdating(imageId);
    const { error } = await supabase
      .from('site_images')
      .update({ 
        image_url: newImageUrl, 
        updated_at: new Date().toISOString() 
      } as any)
      .eq('id', imageId as any);
    if (error) {
      toast({ title: 'Error', description: 'Error al actualizar la imagen.', variant: 'destructive' });
      console.error(error);
    } else {
      toast({ title: 'Éxito', description: 'Imagen actualizada correctamente.' });
      setSiteImages(prevImages => prevImages.map(img => img.id === imageId ? { ...img, image_url: newImageUrl } : img));
    }
    setIsUpdating(null);
  };

  const contexts = useMemo(() => [...new Set(siteImages.map(image => image.context))].sort(), [siteImages]);
  
  const filteredImages = useMemo(() => {
    if (!selectedContext) return [];
    return siteImages.filter(image => image.context === selectedContext);
  }, [siteImages, selectedContext]);

  if (isLoading) {
    return <div className="flex justify-center items-center p-8 h-full"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>;
  }

  return (
    <ImageManagerLayout
      contexts={contexts}
      selectedContext={selectedContext}
      onSelectContext={setSelectedContext}
    >
      <ImageGrid
        images={filteredImages}
        storageImages={storageImages}
        onImageUpdate={handleImageUpdate}
        isUpdating={isUpdating}
      />
    </ImageManagerLayout>
  );
};
