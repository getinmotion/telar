
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteImage {
  id: string;
  context: string;
  key: string;
  image_url: string;
  alt_text: string | null;
}

export const useSiteImages = (context: string) => {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('site_images')
        .select('*')
        .eq('context', context)
        .eq('is_active', true)
        .order('key');

      if (fetchError) {
        console.error(`Error fetching images for context "${context}":`, fetchError);
        setError(fetchError);
      } else {
        setImages(data || []);
      }
      
      setIsLoading(false);
    };

    if (context) {
      fetchImages();
    }
  }, [context]);

  return { images, isLoading, error };
};
