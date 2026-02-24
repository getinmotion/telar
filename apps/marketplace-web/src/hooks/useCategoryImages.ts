import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CACHE_KEY = 'marketplace_category_images';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface CachedImages {
  images: Record<string, string>;
  timestamp: number;
}

export const useCategoryImages = (categories: string[]) => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadFromCache = (): Record<string, string> | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsed: CachedImages = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - parsed.timestamp < CACHE_DURATION) {
        return parsed.images;
      }

      // Cache expired
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Error loading cached images:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  const saveToCache = (images: Record<string, string>) => {
    try {
      const cacheData: CachedImages = {
        images,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving images to cache:', error);
    }
  };

  const generateImage = async (category: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('search-unsplash-category', {
      body: { category }
    });

    if (error) throw error;
    if (!data?.imageUrl) throw new Error('No image URL returned from Unsplash');

    return data.imageUrl;
  };

  const generateAllImages = async () => {
    setLoading(true);
    const newImages: Record<string, string> = {};
    
    try {
      // Generate images sequentially to avoid rate limits
      for (const category of categories) {
        try {
          const imageUrl = await generateImage(category);
          newImages[category] = imageUrl;
        } catch (error) {
          console.error(`Error buscando imagen en Unsplash para ${category}:`, error);
          toast({
            title: "Error al buscar imagen",
            description: `No se pudo encontrar imagen en Unsplash para ${category}`,
            variant: "destructive",
          });
        }
      }

      setImages(newImages);
      saveToCache(newImages);
    } catch (error) {
      console.error('Error buscando imágenes de categorías en Unsplash:', error);
      toast({
        title: "Error",
        description: "No se pudieron buscar las imágenes de categorías en Unsplash",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerate = () => {
    localStorage.removeItem(CACHE_KEY);
    generateAllImages();
  };

  useEffect(() => {
    const cachedImages = loadFromCache();
    
    if (cachedImages && Object.keys(cachedImages).length === categories.length) {
      // Use cached images
      setImages(cachedImages);
      setLoading(false);
    } else {
      // Generate new images
      generateAllImages();
    }
  }, []);

  return { images, loading, regenerate };
};
