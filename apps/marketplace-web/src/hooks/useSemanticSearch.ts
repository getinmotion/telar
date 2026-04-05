import { useState, useCallback, useEffect } from 'react';
import { semanticSearch, SearchFilters } from '@/lib/semanticSearchClient';
import { useSearch } from '@/contexts/SearchContext';
import { Product } from '@/types/products.types';

interface UseSemanticSearchProps {
  products: Product[];
  filters?: {
    priceRange?: [number, number];
    categories?: string[];
    crafts?: string[];
    materials?: string[];
    techniques?: string[];
    minRating?: number | null;
    freeShipping?: boolean;
  };
}

export interface SemanticSearchResult {
  filteredProducts: Product[];
  isSearching: boolean;
  resultCount: number;
}

/**
 * Hook para búsqueda semántica exclusiva
 *
 * Ejecuta búsqueda semántica usando el endpoint del backend de NestJS
 *
 * @param products - Lista de productos para mapear resultados
 * @param filters - Filtros opcionales para la búsqueda
 * @returns Productos filtrados y estado de búsqueda
 */
export function useSemanticSearch({
  products,
  filters,
}: UseSemanticSearchProps): SemanticSearchResult {
  const { searchQuery } = useSearch();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [resultCount, setResultCount] = useState(0);

  const performSemanticSearch = useCallback(async (): Promise<Product[]> => {
    // Si no hay query, retornar todos los productos
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResultCount(products.length);
      return products;
    }

    // Si el query es muy corto, retornar productos vacíos
    if (searchQuery.trim().length < 3) {
      setResultCount(0);
      return [];
    }

    setIsSearching(true);

    try {
      const semanticFilters: SearchFilters = {};

      // Mapear filtros de precio
      if (filters?.priceRange) {
        semanticFilters.price_min = filters.priceRange[0];
        semanticFilters.price_max = filters.priceRange[1];
      }

      // Mapear filtro de categoría (usar la primera si hay múltiples)
      if (filters?.categories && filters.categories.length > 0) {
        semanticFilters.category = filters.categories[0];
      }

      // Mapear filtro de craft/oficio (usar el primero si hay múltiples)
      if (filters?.crafts && filters.crafts.length > 0) {
        semanticFilters.craft_type = filters.crafts[0];
      }

      const semanticResponse = await semanticSearch({
        query: searchQuery,
        limit: 50,
        min_similarity: 0.3,
        filters: semanticFilters,
      });

      console.log('[SemanticSearch] Response:', semanticResponse);

      // Mapear resultados semánticos a productos completos
      const productMap = new Map(products.map(p => [p.id, p]));

      const semanticProducts = semanticResponse.results
        .map(result => {
          const product = productMap.get(result.product_id);
          if (!product) return null;

          return {
            ...product,
            similarity_score: result.similarity,
          };
        })
        .filter((p): p is Product & { similarity_score: number } => p !== null);

      // Ordenar por similarity score
      semanticProducts.sort((a, b) => b.similarity_score - a.similarity_score);

      setResultCount(semanticProducts.length);
      return semanticProducts;
    } catch (error) {
      console.error('[SemanticSearch] Error:', error);
      setResultCount(0);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [products, searchQuery, filters]);

  // Ejecutar búsqueda cuando cambien los productos o el query (con debounce)
  useEffect(() => {
    // Si no hay productos, no hacer nada
    if (products.length === 0) {
      setFilteredProducts([]);
      setResultCount(0);
      return;
    }

    // Debounce: esperar 500ms después de que el usuario deje de escribir
    const timeoutId = setTimeout(() => {
      performSemanticSearch().then(setFilteredProducts);
    }, 500);

    // Limpiar timeout si el usuario sigue escribiendo
    return () => clearTimeout(timeoutId);
  }, [products, searchQuery, filters, performSemanticSearch]);

  return {
    filteredProducts,
    isSearching,
    resultCount,
  };
}
