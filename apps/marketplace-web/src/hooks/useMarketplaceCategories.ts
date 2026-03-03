import { useState, useEffect } from 'react';
import { telarApiPublic } from '@/integrations/api/telarApi';
import { MarketplaceCategory, getStoryblokImageUrl } from '@/types/storyblok';
import { FALLBACK_MARKETPLACE_CATEGORIES } from '@/lib/marketplaceCategories';

interface LocalMarketplaceCategory {
  name: string;
  icon: string;
  description: string;
  color: string;
  imageUrl: string;
  keywords: string[];
  is_featured?: boolean;
  order?: number;
}

export function useMarketplaceCategories() {
  const [categories, setCategories] = useState<LocalMarketplaceCategory[]>(FALLBACK_MARKETPLACE_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await telarApiPublic.post<{ data: MarketplaceCategory[] }>('/cms', {
        action: 'categories',
      });

      const cmsCategories = response.data.data;
      
      if (cmsCategories && cmsCategories.length > 0) {
        // Transform CMS categories to local format, filtering out invalid entries
        const transformedCategories: LocalMarketplaceCategory[] = cmsCategories
          .filter(cat => cat && cat.name) // Only include categories with valid names
          .map(cat => ({
            name: cat.name,
            icon: cat.icon || 'Package',
            description: cat.description || '',
            color: cat.color || 'from-gray-500/20 to-gray-600/20',
            imageUrl: cat.imageUrl || getStoryblokImageUrl(cat.image),
            keywords: cat.keywords || [],
            is_featured: cat.is_featured,
            order: cat.order
          }));
        
        console.log('Loaded', transformedCategories.length, 'categories from CMS');
        setCategories(transformedCategories);
      } else {
        console.log('No CMS categories found, using fallback');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Error al cargar categorías';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Filter to get only featured categories
  const featuredCategories = categories.filter(cat => cat.is_featured !== false);
  
  // Get category names for filters
  const categoryNames = categories.map(c => c.name);

  return { 
    categories, 
    featuredCategories,
    categoryNames,
    loading, 
    error,
    refetch: fetchCategories 
  };
}
