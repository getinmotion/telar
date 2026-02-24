import { useState, useCallback, useEffect } from 'react';
import { semanticSearch, isSemanticSearchAvailable, mapSemanticResultsToProducts, SearchFilters } from '@/lib/semanticSearchClient';

interface UseHybridSearchProps<T extends { id: string; name: string; description?: string; store_name?: string }> {
  products: T[];
  searchQuery: string;
  semanticEnabled?: boolean; // Nuevo: control manual de búsqueda semántica
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

export interface HybridSearchResult<T> {
  filteredProducts: T[];
  isSemanticEnabled: boolean;
  semanticResultsCount: number;
  simpleSearchCount: number;
}

/**
 * Hook para búsqueda híbrida que combina:
 * 1. Búsqueda semántica (usando la API de AWS Lightsail)
 * 2. Búsqueda simple (filtrado de texto local)
 * 
 * La búsqueda semántica se usa cuando:
 * - Hay un query de búsqueda
 * - El servicio está disponible
 * - El query tiene más de 2 caracteres
 */
export function useHybridSearch<T extends { id: string; name: string; description?: string; store_name?: string }>({
  products,
  searchQuery,
  semanticEnabled: semanticEnabledProp,
  filters,
}: UseHybridSearchProps<T>): HybridSearchResult<T> {
  const [semanticAvailable, setSemanticAvailable] = useState(false);
  const [semanticResultsCount, setSemanticResultsCount] = useState(0);

  // Verificar disponibilidad de búsqueda semántica al montar
  useEffect(() => {
    isSemanticSearchAvailable().then(setSemanticAvailable);
  }, []);

  // La búsqueda semántica está habilitada solo si:
  // 1. La API está disponible
  // 2. El usuario la activó (o no se especificó preferencia)
  const semanticEnabled = semanticAvailable && (semanticEnabledProp !== false);

  const performHybridSearch = useCallback(async (): Promise<T[]> => {
    // Si no hay query, retornar todos los productos
    if (!searchQuery || searchQuery.trim().length === 0) {
      setSemanticResultsCount(0);
      return products;
    }

    // Búsqueda simple (siempre activa como fallback)
    const simpleResults = products.filter(product => {
      const matchesText = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.store_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesText;
    });

    // Si búsqueda semántica no está disponible o el query es muy corto, usar solo simple
    if (!semanticEnabled || searchQuery.trim().length < 3) {
      setSemanticResultsCount(0);
      return simpleResults;
    }

    // Intentar búsqueda semántica
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

      // Mapear resultados semánticos a productos completos
      const semanticProducts = mapSemanticResultsToProducts(
        semanticResponse.results,
        products
      );

      setSemanticResultsCount(semanticProducts.length);

      // Combinar resultados: priorizar semánticos, agregar simples que no estén
      const semanticProductIds = new Set(semanticProducts.map(p => p.id));
      const additionalSimpleResults = simpleResults.filter(p => !semanticProductIds.has(p.id));

      // Ordenar resultados semánticos por similarity_score
      const sortedSemanticProducts = [...semanticProducts].sort((a, b) => {
        const scoreA = (a as any).similarity_score || 0;
        const scoreB = (b as any).similarity_score || 0;
        return scoreB - scoreA;
      });

      // Combinar: semánticos primero, luego simples adicionales
      const combinedResults = [...sortedSemanticProducts, ...additionalSimpleResults];

      return combinedResults;
    } catch (error) {
      console.error('[HybridSearch] Semantic search failed, falling back to simple search:', error);
      setSemanticResultsCount(0);
      return simpleResults;
    }
  }, [products, searchQuery, filters, semanticEnabled]);

  const [filteredProducts, setFilteredProducts] = useState<T[]>([]);

  // Ejecutar búsqueda cuando cambien los productos o el query
  useEffect(() => {
    // Si no hay productos, no hacer nada
    if (products.length === 0) {
      setFilteredProducts([]);
      return;
    }
    
    performHybridSearch().then(setFilteredProducts);
  }, [products, searchQuery, filters, semanticEnabled]);

  return {
    filteredProducts,
    isSemanticEnabled: semanticEnabled && semanticResultsCount > 0,
    semanticResultsCount,
    simpleSearchCount: filteredProducts.length - semanticResultsCount,
  };
}

