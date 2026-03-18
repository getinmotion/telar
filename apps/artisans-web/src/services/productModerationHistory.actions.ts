import { telarApi } from '@/integrations/api/telarApi';

/**
 * Registro de historial de moderación de producto
 */
export interface ProductModerationHistoryRecord {
  id: string;
  product_id: string;
  moderator_id?: string;
  old_status?: string;
  new_status: string;
  comment?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Obtener historial de moderación de un producto específico
 * @param productId - ID del producto
 * @returns Array de registros de historial de moderación
 *
 * Endpoint: GET /product-moderation-history/product/:productId
 */
export async function getProductModerationHistory(
  productId: string
): Promise<ProductModerationHistoryRecord[]> {
  try {
    const response = await telarApi.get<ProductModerationHistoryRecord[]>(
      `/product-moderation-history/product/${productId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('[productModerationHistory.actions] Error fetching moderation history:', error);
    throw error;
  }
}

/**
 * Obtener comentarios de moderación para múltiples productos
 * Filtra solo registros con status 'rejected' o 'changes_requested'
 * y retorna el comentario más reciente de cada producto
 *
 * @param productIds - Array de IDs de productos
 * @returns Map de productId -> comentario más reciente
 */
export async function getModerationCommentsForProducts(
  productIds: string[]
): Promise<Record<string, string>> {
  try {
    // Hacer llamadas en paralelo para cada producto
    const promises = productIds.map(productId =>
      getProductModerationHistory(productId)
        .then(records => ({ productId, records }))
        .catch(() => ({ productId, records: [] })) // Si falla uno, continuar con los demás
    );

    const results = await Promise.all(promises);

    // Procesar resultados para extraer el comentario más reciente
    const commentsMap: Record<string, string> = {};

    results.forEach(({ productId, records }) => {
      // Filtrar por status rejected o changes_requested
      const relevantRecords = records.filter(
        record =>
          record.new_status === 'rejected' ||
          record.new_status === 'changes_requested'
      );

      // Ordenar por fecha descendente (más reciente primero)
      relevantRecords.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Tomar el primer comentario no vacío
      const recordWithComment = relevantRecords.find(r => r.comment);
      if (recordWithComment?.comment) {
        commentsMap[productId] = recordWithComment.comment;
      }
    });

    return commentsMap;
  } catch (error: any) {
    console.error('[productModerationHistory.actions] Error fetching moderation comments:', error);
    return {}; // Retornar objeto vacío en caso de error total
  }
}
