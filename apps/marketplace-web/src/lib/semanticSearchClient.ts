// Cliente para la API de búsqueda semántica en AWS Lightsail
// Documentación: https://getinmotion.bgwc43c90at7y.us-east-1.cs.amazonlightsail.com/docs

const SEMANTIC_SEARCH_API_URL = import.meta.env.VITE_SEMANTIC_SEARCH_API_URL || 
  'https://getinmotion.bgwc43c90at7y.us-east-1.cs.amazonlightsail.com';

const SEMANTIC_SEARCH_API_KEY = import.meta.env.VITE_SEMANTIC_SEARCH_API_KEY;

export interface SearchFilters {
  craft_type?: string;
  region?: string;
  category?: string;
  price_min?: number;
  price_max?: number;
}

export interface SearchRequest {
  query: string;
  limit?: number;
  min_similarity?: number;
  filters?: SearchFilters;
}

export interface SearchResult {
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
  price?: string;
  category?: string;
  combined_text: string;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  count: number;
  execution_time_ms: number;
}

/**
 * Realiza una búsqueda semántica usando el backend de AWS Lightsail
 */
export async function semanticSearch(request: SearchRequest): Promise<SearchResponse> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Agregar API key si está configurada
    if (SEMANTIC_SEARCH_API_KEY) {
      headers['x-api-key'] = SEMANTIC_SEARCH_API_KEY;
    }

    const response = await fetch(`${SEMANTIC_SEARCH_API_URL}/api/v1/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: request.query,
        limit: request.limit || 20,
        min_similarity: request.min_similarity || 0.3,
        filters: request.filters,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SemanticSearch] API error:', response.status, errorText);
      throw new Error(`Semantic search failed: ${response.status}`);
    }

    const data: SearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('[SemanticSearch] Error:', error);
    throw error;
  }
}

/**
 * Verifica si la búsqueda semántica está disponible
 */
export async function isSemanticSearchAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${SEMANTIC_SEARCH_API_URL}/health`);
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.status === 'healthy' && data.services?.semantic_search === true;
  } catch (error) {
    console.error('[SemanticSearch] Health check failed:', error);
    return false;
  }
}

/**
 * Mapea IDs de productos de búsqueda semántica a productos completos
 * desde la lista de productos cargados
 */
export function mapSemanticResultsToProducts<T extends { id: string }>(
  semanticResults: SearchResult[],
  allProducts: T[]
): Array<T & { similarity_score?: number }> {
  const productMap = new Map(allProducts.map(p => [p.id, p]));
  
  return semanticResults
    .map(result => {
      const productId = result.product_id;
      if (!productId) return null;
      
      const product = productMap.get(productId);
      if (!product) return null;
      
      return {
        ...product,
        similarity_score: result.similarity_score,
      };
    })
    .filter((p): p is T & { similarity_score: number } => p !== null);
}

