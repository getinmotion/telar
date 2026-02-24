/**
 * Custom hook for semantic search functionality
 * Integrates with FastAPI backend for vector similarity search
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SemanticSearchFilters {
  craft_type?: string;
  region?: string;
  category?: string;
  price_min?: number;
  price_max?: number;
}

export interface SemanticSearchResult {
  shop_id: string;
  product_id?: string;
  shop_name: string;
  similarity_score: number;
  shop_description?: string;
  shop_story?: string;
  craft_type?: string;
  region?: string;
  product_name?: string;
  product_description?: string;
  price?: number;
  category?: string;
  combined_text: string;
}

export interface SemanticSearchResponse {
  success: boolean;
  query: string;
  results: SemanticSearchResult[];
  count: number;
  execution_time_ms: number;
}

interface UseSemanticSearchReturn {
  search: (query: string, limit?: number, filters?: SemanticSearchFilters) => Promise<SemanticSearchResult[]>;
  loading: boolean;
  error: string | null;
  results: SemanticSearchResult[];
  executionTime: number;
}

const SEMANTIC_SEARCH_ENDPOINT = import.meta.env.VITE_SEMANTIC_SEARCH_URL || 'http://localhost:8000/search';
const SEMANTIC_SEARCH_API_KEY = import.meta.env.VITE_SEMANTIC_SEARCH_API_KEY || 'ZzmB_u_5ipK8IqEoMmBtEJ6Tzg7oS1lT7ttbGTcHZOM';

export const useSemanticSearch = (): UseSemanticSearchReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [executionTime, setExecutionTime] = useState(0);

  const search = useCallback(async (
    query: string,
    limit: number = 20,
    filters?: SemanticSearchFilters
  ): Promise<SemanticSearchResult[]> => {
    if (!query || query.trim().length === 0) {
      setError('Search query cannot be empty');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // Call the FastAPI semantic search endpoint
      const response = await fetch(SEMANTIC_SEARCH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': SEMANTIC_SEARCH_API_KEY,
        },
        body: JSON.stringify({
          query: query.trim(),
          limit,
          filters: filters || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Search failed with status ${response.status}`);
      }

      const data: SemanticSearchResponse = await response.json();

      if (!data.success) {
        throw new Error('Search was not successful');
      }

      setResults(data.results);
      setExecutionTime(data.execution_time_ms);

      // Store recent search in localStorage
      const recentSearches = JSON.parse(localStorage.getItem('recent_semantic_searches') || '[]');
      const updatedSearches = [query, ...recentSearches.filter((s: string) => s !== query)].slice(0, 10);
      localStorage.setItem('recent_semantic_searches', JSON.stringify(updatedSearches));

      return data.results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during search';
      setError(errorMessage);
      console.error('Semantic search error:', err);
      
      // Fallback to traditional search if semantic search fails
      console.log('Falling back to traditional search...');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    search,
    loading,
    error,
    results,
    executionTime,
  };
};

/**
 * Hook for fallback to traditional keyword search
 */
export const useFallbackSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const search = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const searchResults: any[] = [];

      // Search products
      const { data: products } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          images,
          category,
          description,
          shop:artisan_shops(id, shop_name, shop_slug, contact_info)
        `)
        .eq('active', true)
        .textSearch('name', query)
        .limit(10);

      if (products) {
        searchResults.push(...products.map(product => ({
          id: product.id,
          type: 'product',
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          shop_name: product.shop?.shop_name,
          shop_id: product.shop?.id,
          path: `/tienda/${product.shop?.shop_slug}/producto/${product.id}`
        })));
      }

      // Search shops
      const { data: shops } = await supabase
        .from('artisan_shops')
        .select('id, shop_name, shop_slug, banner_url, description, craft_type, region')
        .eq('active', true)
        .textSearch('shop_name', query)
        .limit(10);

      if (shops) {
        searchResults.push(...shops.map(shop => ({
          id: shop.id,
          type: 'shop',
          name: shop.shop_name,
          image: shop.banner_url,
          craft_type: shop.craft_type,
          region: shop.region,
          path: `/tienda/${shop.shop_slug}`
        })));
      }

      setResults(searchResults);
      return searchResults;
    } catch (error) {
      console.error('Fallback search error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { search, loading, results };
};

