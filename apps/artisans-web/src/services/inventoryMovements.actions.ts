import { telarApi } from '@/integrations/api/telarApi';

// DTO que retorna el backend (camelCase)
interface InventoryMovementDTO {
  id: string;
  productVariantId: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  qty: number;
  reason?: string | null;
  refId?: string | null;
  createdBy?: string | null;
  createdAt: string;
}

// Tipo snake_case para compatibilidad con useInventory
export interface InventoryMovementMapped {
  id: string;
  product_variant_id: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  qty: number;
  reason?: string;
  ref_id?: string;
  created_at: string;
}

function mapMovementFromDTO(dto: InventoryMovementDTO): InventoryMovementMapped {
  return {
    id: dto.id,
    product_variant_id: dto.productVariantId,
    type: dto.type,
    qty: dto.qty,
    reason: dto.reason ?? undefined,
    ref_id: dto.refId ?? undefined,
    created_at: dto.createdAt,
  };
}

/**
 * Obtiene los movimientos de inventario de una variante
 * Endpoint: GET /inventory-movements/variant/:productVariantId
 */
export async function getMovementsByVariantId(
  variantId: string
): Promise<InventoryMovementMapped[]> {
  const response = await telarApi.get<InventoryMovementDTO[]>(
    `/inventory-movements/variant/${variantId}`
  );
  return response.data.map(mapMovementFromDTO);
}
