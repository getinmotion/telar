/**
 * Store Policies Config Service
 * Lee la configuración de políticas de una tienda (FAQ + política de devoluciones).
 * Vive en la tabla store_policies_config, referenciada por artisan_shops.idPoliciesConfig.
 *
 * @endpoint GET /store-policies-config/:id  (público)
 */

import { telarApiPublic } from '@/integrations/api/telarApi';

export interface FaqItem {
  q: string;
  a: string;
}

export interface StorePoliciesConfig {
  id: string;
  returnPolicy?: string | null;
  faq?: FaqItem[] | null;
  createdAt?: string;
  updatedAt?: string | null;
}

/**
 * Obtener la configuración de políticas por su UUID (artisan_shops.idPoliciesConfig).
 * Devuelve null ante cualquier error para no romper el render de la tienda.
 */
export const getStorePoliciesConfig = async (
  id: string,
): Promise<StorePoliciesConfig | null> => {
  try {
    const response = await telarApiPublic.get<StorePoliciesConfig>(
      `/store-policies-config/${id}`,
    );
    return response.data;
  } catch {
    return null;
  }
};
