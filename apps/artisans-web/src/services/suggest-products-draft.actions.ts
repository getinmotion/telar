/**
 * Suggest Products Draft Service
 * Handles persistence and retrieval of AI agent suggestions for product drafts
 */

import { telarApi } from '@/integrations/api/telarApi';

export interface SuggestProductsDraftPayload {
  suggestAgentStep12?: Record<string, any>;
  suggestAgentStep34?: Record<string, any>;
}

export interface SuggestProductsDraftResponse {
  id: string;
  productId: string;
  suggestAgentStep12: Record<string, any>;
  suggestAgentStep34: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Upsert (create or update) suggestions for a product draft
 */
export const upsertSuggestProductsDraft = async (
  productId: string,
  data: SuggestProductsDraftPayload,
): Promise<SuggestProductsDraftResponse> => {
  const response = await telarApi.put<SuggestProductsDraftResponse>(
    `/suggest-products-draft/product/${productId}`,
    data,
    { _suppressToast: true } as any,
  );
  return response.data;
};

/**
 * Get suggestions for a product draft by product ID
 * Returns null if no suggestions exist (404)
 */
export const getSuggestProductsDraft = async (
  productId: string,
): Promise<SuggestProductsDraftResponse | null> => {
  try {
    const response = await telarApi.get<SuggestProductsDraftResponse>(
      `/suggest-products-draft/product/${productId}`,
      { _suppressToast: true } as any,
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};
