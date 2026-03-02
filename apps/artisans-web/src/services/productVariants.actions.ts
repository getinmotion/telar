import { telarApi } from '@/integrations/api/telarApi';

// DTO que retorna el backend (camelCase)
export interface ProductVariantDTO {
  id: string;
  productId: string;
  sku: string;
  optionValues: Record<string, string>;
  price: number | null;
  compareAtPrice: number | null;
  cost: number | null;
  stock: number;
  minStock: number;
  weight: number | null;
  dimensions: Record<string, any> | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Tipo snake_case para compatibilidad con useInventory
export interface ProductVariantMapped {
  id: string;
  product_id: string;
  sku: string;
  option_values?: Record<string, string>;
  price?: number;
  cost?: number;
  stock: number;
  min_stock: number;
  status: string;
}

function mapVariantFromDTO(dto: ProductVariantDTO): ProductVariantMapped {
  return {
    id: dto.id,
    product_id: dto.productId,
    sku: dto.sku,
    option_values: dto.optionValues,
    price: dto.price ?? undefined,
    cost: dto.cost ?? undefined,
    stock: dto.stock,
    min_stock: dto.minStock,
    status: dto.status,
  };
}

function toVariantPayload(data: Record<string, any>): Record<string, any> {
  const fieldMap: Record<string, string> = {
    product_id: 'productId',
    option_values: 'optionValues',
    min_stock: 'minStock',
    compare_at_price: 'compareAtPrice',
  };
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [fieldMap[key] ?? key, value])
  );
}

/**
 * Obtiene todas las variantes de un producto
 * Endpoint: GET /product-variants/product/:productId
 */
export async function getVariantsByProductId(
  productId: string
): Promise<ProductVariantMapped[]> {
  const response = await telarApi.get<ProductVariantDTO[]>(
    `/product-variants/product/${productId}`
  );
  return response.data.map(mapVariantFromDTO);
}

/**
 * Obtiene variantes con stock bajo
 * Endpoint: GET /product-variants/low-stock
 */
export async function getLowStockVariants(): Promise<ProductVariantMapped[]> {
  const response = await telarApi.get<ProductVariantDTO[]>(
    '/product-variants/low-stock'
  );
  return response.data.map(mapVariantFromDTO);
}

/**
 * Crea una variante de producto
 * Endpoint: POST /product-variants
 */
export async function createVariant(
  data: Record<string, any>
): Promise<ProductVariantMapped> {
  const response = await telarApi.post<ProductVariantDTO>(
    '/product-variants',
    toVariantPayload(data)
  );
  return mapVariantFromDTO(response.data);
}

/**
 * Actualiza una variante de producto
 * Endpoint: PATCH /product-variants/:id
 */
export async function updateVariant(
  variantId: string,
  updates: Record<string, any>
): Promise<ProductVariantMapped> {
  const response = await telarApi.patch<ProductVariantDTO>(
    `/product-variants/${variantId}`,
    toVariantPayload(updates)
  );
  return mapVariantFromDTO(response.data);
}

/**
 * Ajusta el stock de una variante
 * Endpoint: PATCH /product-variants/:id/stock?quantity=X&operation=add|subtract|set
 */
export async function adjustVariantStock(
  variantId: string,
  quantity: number,
  operation: 'add' | 'subtract' | 'set'
): Promise<ProductVariantMapped> {
  const response = await telarApi.patch<ProductVariantDTO>(
    `/product-variants/${variantId}/stock`,
    null,
    { params: { quantity, operation } }
  );
  return mapVariantFromDTO(response.data);
}
