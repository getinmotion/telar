import { telarApi } from '@/integrations/api/telarApi';
import type { ProductResponse } from '@telar/shared-types';

// ─── Interfaces de productos ──────────────────────────────────────────────────

export interface ModerationProductApi {
  id: string;
  shopId: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  subcategory: string | null;
  images: string[];
  tags: string[] | null;
  materials: string[] | null;
  techniques: string[] | null;
  inventory: number;
  sku: string | null;
  moderationStatus: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  weight: number | null;
  dimensions: { length: number | null; width: number | null; height: number | null } | null;
  shippingDataComplete: boolean;
  shop: {
    id: string;
    shopName: string;
    shopSlug: string;
    userId: string;
    region: string | null;
    craftType: string | null;
    logoUrl: string | null;
    marketplaceApproved: boolean | null;
  } | null;
}

export interface ModerationQueueParams {
  status?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  region?: string;
  onlyNonMarketplace?: boolean;
}

export interface ModerationQueueResponse {
  data: ModerationProductApi[];
  total: number;
  page: number;
  limit: number;
}

// ─── Interfaces de tiendas ────────────────────────────────────────────────────

export interface ModerationShopApi {
  id: string;
  shopName: string;
  shopSlug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  region: string | null;
  craftType: string | null;
  marketplaceApproved: boolean | null;
  marketplaceApprovedAt: string | null;
  marketplaceApprovedBy: string | null;
  publishStatus: string | null;
  active: boolean;
  createdAt: string;
  userId: string;
  idContraparty: string | null;
  contactConfig?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    address?: string;
  } | null;
}

export interface ModerationShopsParams {
  filter?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  hasBankData?: 'all' | 'yes' | 'no';
  minApprovedProducts?: string;
  region?: string;
  craftType?: string;
}

export interface ModerationShopsResponse {
  data: ModerationShopApi[];
  total: number;
  page: number;
  limit: number;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

/**
 * Mapea ProductResponse (products-new) a ModerationProductApi (formato legacy)
 * Para mantener compatibilidad con componentes de moderación existentes
 */
function mapProductResponseToModerationApi(product: ProductResponse): ModerationProductApi {
  const firstVariant = product.variants?.[0];
  const firstImage = product.media
    ?.filter((m) => m.mediaType === 'image')
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((m) => m.mediaUrl) || [];

  // Convertir precio de minor units (centavos) a pesos
  const priceInPesos = firstVariant?.basePriceMinor
    ? Math.round(parseInt(firstVariant.basePriceMinor) / 100)
    : 0;

  return {
    id: product.id,
    shopId: product.storeId,
    name: product.name,
    description: product.history || null,
    shortDescription: product.shortDescription || null,
    price: priceInPesos,
    comparePrice: null, // No existe en products-new
    subcategory: product.categoryId || null,
    images: firstImage,
    tags: null, // TODO: Mapear cuando se agreguen tags a products-new
    materials: product.materials?.map((m) => m.materialId) || null,
    techniques: null, // Mapear desde artisanalIdentity si existe
    inventory: firstVariant?.stockQuantity || 0,
    sku: firstVariant?.sku || null,
    moderationStatus: product.status,
    active: product.status === 'approved',
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    weight: product.physicalSpecs?.realWeightKg || null,
    dimensions: product.physicalSpecs ? {
      length: product.physicalSpecs.lengthOrDiameterCm || null,
      width: product.physicalSpecs.widthCm || null,
      height: product.physicalSpecs.heightCm || null,
    } : null,
    shippingDataComplete: !!(product.physicalSpecs && product.logistics),
    shop: product.artisanShop ? {
      id: product.artisanShop.id,
      shopName: product.artisanShop.shopName,
      shopSlug: product.artisanShop.shopSlug,
      userId: product.artisanShop.userId,
      region: product.artisanShop.region || null,
      craftType: product.artisanShop.craftType || null,
      logoUrl: product.artisanShop.logoUrl || null,
      marketplaceApproved: product.artisanShop.marketplaceApproved || null,
    } : null,
  };
}

// ─── Productos ────────────────────────────────────────────────────────────────

export async function getModerationQueue(
  params: ModerationQueueParams,
): Promise<ModerationQueueResponse> {
  const {
    status = 'pending_moderation',
    page = 1,
    pageSize = 20,
    search,
    category,
    region,
    onlyNonMarketplace,
  } = params;

  const queryParams: Record<string, string> = {
    page: String(page),
    limit: String(pageSize),
  };

  // Usar products-new endpoint en lugar de products legacy
  if (status !== 'all') queryParams.status = status;

  // TODO: El endpoint /products-new actualmente no soporta estos filtros:
  // - search (q)
  // - category
  // - region
  // - onlyNonMarketplace
  // Estos deberían agregarse al backend en products-new.controller.ts
  if (search) console.warn('Search filter not yet supported in products-new');
  if (category && category !== 'all') console.warn('Category filter not yet supported in products-new');
  if (region && region !== 'all') console.warn('Region filter not yet supported in products-new');
  if (onlyNonMarketplace) console.warn('onlyNonMarketplace filter not yet supported in products-new');

  try {
    const response = await telarApi.get<{
      data: ProductResponse[];
      total: number;
      page: number;
      limit: number;
    }>('/products-new', {
      params: queryParams,
    });

    // Mapear ProductResponse[] a ModerationProductApi[]
    const mappedData: ModerationProductApi[] = response.data.data.map(
      mapProductResponseToModerationApi
    );

    return {
      data: mappedData,
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
    };
  } catch (error) {
    throw error;
  }
}

const NUMERIC_PRODUCT_FIELDS = new Set(['price', 'comparePrice', 'inventory', 'weight']);

function sanitizeEdits(edits: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(edits).map(([key, value]) => {
      if (NUMERIC_PRODUCT_FIELDS.has(key) && value != null && value !== '') {
        return [key, Number(value)];
      }
      return [key, value];
    })
  );
}

/**
 * Convierte edits en formato legacy a formato products-new (UpdateProductsNewDto)
 * Mapea campos legacy a la estructura multicapa
 */
function mapLegacyEditsToProductsNew(edits: Record<string, unknown>): Record<string, unknown> {
  const productsNewEdits: Record<string, unknown> = {};

  Object.entries(edits).forEach(([key, value]) => {
    switch (key) {
      // Campos del núcleo (products_core)
      case 'name':
      case 'shortDescription':
      case 'description': // En products-new es 'history'
        if (key === 'description') {
          productsNewEdits.history = value;
        } else {
          productsNewEdits[key] = value;
        }
        break;

      // Precio e inventario (en variants)
      // NOTA: Estos campos pertenecen a product_variants, no a products_core
      // Para actualizarlos correctamente necesitamos el ID de la variante
      // Por ahora se ignoran en la migración a products-new
      // TODO: Implementar actualización de variantes mediante endpoint específico
      case 'price':
      case 'inventory':
        console.warn(`Edit de variante ignorado (requiere ID de variante): ${key}`, value);
        break;

      // Dimensiones y peso (en physicalSpecs)
      case 'weight':
        if (value != null && value !== '') {
          productsNewEdits.physicalSpecs = productsNewEdits.physicalSpecs || {};
          (productsNewEdits.physicalSpecs as any).realWeightKg = Number(value);
        }
        break;

      case 'dimensions':
        if (value && typeof value === 'object') {
          const dims = value as any;
          productsNewEdits.physicalSpecs = productsNewEdits.physicalSpecs || {};
          const specs = productsNewEdits.physicalSpecs as any;
          if (dims.length != null) specs.lengthOrDiameterCm = Number(dims.length);
          if (dims.width != null) specs.widthCm = Number(dims.width);
          if (dims.height != null) specs.heightCm = Number(dims.height);
        }
        break;

      // Materiales (en materials)
      case 'materials':
        if (Array.isArray(value) && value.length > 0) {
          // Convertir array de IDs a array de objetos CreateProductMaterialLinkDto
          productsNewEdits.materials = value.map((materialId: string, index: number) => ({
            materialId,
            isPrimary: index === 0,
          }));
        }
        break;

      // Campos válidos del núcleo que se pueden editar directamente
      case 'categoryId':
      case 'history':
      case 'careNotes':
        productsNewEdits[key] = value;
        break;

      // Campos legacy que NO existen en products-new - ignorar silenciosamente
      case 'comparePrice':
      case 'subcategory':
      case 'images':
      case 'tags':
      case 'techniques':
      case 'sku':
      case 'active':
      case 'featured':
      case 'customizable':
      case 'made_to_order':
      case 'lead_time_days':
      case 'production_time':
      case 'production_time_hours':
      case 'requires_customization':
        // Estos campos no existen en products-new, se ignoran
        console.warn(`Campo legacy ignorado en edits: ${key}`);
        break;

      default:
        // Si llegamos aquí, es un campo desconocido - log para debugging
        console.warn(`Campo desconocido en edits, ignorado: ${key}`, value);
        break;
    }
  });

  return productsNewEdits;
}

export async function moderateProduct(
  productId: string,
  action: 'approve' | 'approve_with_edits' | 'request_changes' | 'reject',
  comment?: string,
  edits?: Record<string, unknown>,
  moderatorId?: string,
  previousStatus?: string,
): Promise<void> {
  const statusMap: Record<string, string> = {
    approve: 'approved',
    approve_with_edits: 'approved_with_edits',
    request_changes: 'changes_requested',
    reject: 'rejected',
  };

  const newStatus = statusMap[action];

  try {
    // 1. Actualizar status del producto usando products-new
    await telarApi.patch(`/products-new/${productId}/status`, {
      status: newStatus,
    });

    // 2. Si hay edits adicionales (para approve_with_edits), aplicarlos
    if (edits && Object.keys(edits).length > 0) {
      // Verificar si hay edits de precio o inventario (campos de variante)
      const hasVariantEdits = 'price' in edits || 'inventory' in edits;

      // Si hay edits de variante, obtener el producto para conseguir el ID de la variante
      let variantId: string | undefined;
      if (hasVariantEdits) {
        const product = await telarApi.get<ProductResponse>(`/products-new/${productId}`);
        variantId = product.data.variants?.[0]?.id;

        if (!variantId) {
          console.error('No se encontró variante para aplicar edits de precio/inventario');
        }
      }

      // Aplicar edits de variante usando endpoints específicos
      // if (variantId) {
      //   if ('inventory' in edits && edits.inventory != null) {
      //     const { adjustVariantStock } = await import('./productVariants.actions');
      //     await adjustVariantStock(variantId, Number(edits.inventory), 'set');
      //   }

      //   if ('price' in edits && edits.price != null) {
      //     const { updateVariant } = await import('./productVariants.actions');
      //     await updateVariant(variantId, { price: Number(edits.price) });
      //   }
      // }

      // Mapear edits legacy a formato products-new (excluyendo price e inventory)
      const productsNewEdits = mapLegacyEditsToProductsNew(edits);

      // Aplicar edits del producto core usando products-new endpoint
      if (Object.keys(productsNewEdits).length > 0) {
        await telarApi.patch(`/products-new/${productId}`, productsNewEdits);
      }
    }

    // 3. Crear registro en el historial de moderación
    await createProductModerationHistory({
      productId,
      newStatus,
      previousStatus,
      comment,
      moderatorId,
      editsMade: edits,
    });
  } catch (error) {
    throw error;
  }
}

export async function updateShopMarketplaceApproval(
  shopId: string,
  approved: boolean,
): Promise<void> {
  try {
    await telarApi.patch(`/artisan-shops/${shopId}`, {
      marketplaceApproved: approved,
      marketplaceApprovalStatus: approved ? 'approved' : 'rejected',
    });
  } catch (error) {
    throw error;
  }
}

export interface ProductModerationHistoryApi {
  id: string;
  productId: string;
  previousStatus: string | null;
  newStatus: string;
  moderatorId: string | null;
  artisanId: string | null;
  comment: string | null;
  editsMade: Record<string, unknown>;
  createdAt: string;
}

export async function getProductHistoryByProductId(
  productId: string,
): Promise<ProductModerationHistoryApi[]> {
  try {
    const response = await telarApi.get<ProductModerationHistoryApi[]>(
      `/product-moderation-history/product/${productId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createProductModerationHistory(payload: {
  productId: string;
  previousStatus?: string;
  newStatus: string;
  moderatorId?: string;
  artisanId?: string;
  comment?: string;
  editsMade?: Record<string, unknown>;
}): Promise<void> {
  try {
    await telarApi.post('/product-moderation-history', payload);
  } catch (error) {
    throw error;
  }
}

// ─── Tiendas ──────────────────────────────────────────────────────────────────

export async function getModerationShops(
  params: ModerationShopsParams,
): Promise<ModerationShopsResponse> {
  const {
    filter = 'all',
    page = 1,
    pageSize = 20,
    search,
    hasBankData,
    region,
    craftType,
  } = params;

  const queryParams: Record<string, string> = {
    page: String(page),
    limit: String(pageSize),
    order: 'DESC',
  };

  if (filter === 'approved') queryParams.marketplaceApproved = 'true';
  if (filter === 'not_approved') queryParams.marketplaceApproved = 'false';

  if (search) queryParams.q = search;
  if (hasBankData === 'yes') queryParams.hasBankData = 'yes';
  if (hasBankData === 'no') queryParams.hasBankData = 'no';
  if (region && region !== 'all') queryParams.region = region;
  if (craftType && craftType !== 'all') queryParams.craftType = craftType;

  try {
    const response = await telarApi.get<ModerationShopsResponse>(
      '/artisan-shops',
      { params: queryParams },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getShopProductCounts(
  shopId: string,
): Promise<{ total: number; approved: number; pending: number }> {
  try {
    const [allRes, approvedRes, pendingRes] = await Promise.all([
      telarApi.get<{ total: number }>('/products-new', {
        params: { storeId: shopId, limit: 1, page: 1, status: 'pending_moderation' },
      }),
      telarApi.get<{ total: number }>('/products-new', {
        params: { storeId: shopId, limit: 1, page: 1, status: 'approved' },
      }),
      telarApi.get<{ total: number }>('/products-new', {
        params: { storeId: shopId, limit: 1, page: 1, status: 'approved_with_edits' },
      }),
    ]);

    return {
      total: (allRes.data.total || 0) + (approvedRes.data.total || 0) + (pendingRes.data.total || 0),
      approved: (approvedRes.data.total || 0) + (pendingRes.data.total || 0),
      pending: allRes.data.total || 0,
    };
  } catch {
    return { total: 0, approved: 0, pending: 0 };
  }
}

export async function toggleShopMarketplaceApproval(
  shopId: string,
  approved: boolean,
): Promise<void> {
  try {
    await telarApi.patch(`/artisan-shops/${shopId}`, {
      marketplaceApproved: approved,
      marketplaceApprovalStatus: approved ? 'approved' : 'rejected',
    });
  } catch (error) {
    throw error;
  }
}

export async function deleteShopAdmin(shopId: string): Promise<void> {
  try {
    await telarApi.delete(`/artisan-shops/${shopId}`);
  } catch (error) {
    throw error;
  }
}

export async function publishShopAdmin(
  shopId: string,
  action: 'publish' | 'unpublish',
): Promise<void> {
  try {
    await telarApi.patch(`/artisan-shops/${shopId}`, {
      publishStatus: action === 'publish' ? 'published' : 'pending_publish',
    });
  } catch (error) {
    throw error;
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

const MODERATION_STATUSES = [
  'pending_moderation',
  'approved',
  'approved_with_edits',
  'changes_requested',
  'rejected',
  'draft',
] as const;

export interface ModerationStatsData {
  productCounts: Record<string, number>;
  shopCounts: { all: number; approved: number; not_approved: number };
  shopsWithBankData: number;
  shopsWithoutBankData: number;
  publishedShops: number;
  pendingPublishShops: number;
  shops: ModerationShopApi[];
}

export async function getPendingModerationCount(): Promise<number> {
  try {
    const response = await telarApi.get<{ total: number }>('/products-new', {
      params: { status: 'pending_moderation', limit: 1, page: 1 },
    });
    return response.data.total || 0;
  } catch {
    return 0;
  }
}

export async function getModerationStats(): Promise<ModerationStatsData> {
  try {
    const [productCountsResults, shopsRes] = await Promise.all([
      Promise.all(
        MODERATION_STATUSES.map((status) =>
          telarApi
            .get<{ total: number }>('/products-new', {
              params: { status, limit: 1, page: 1 },
            })
            .then((r) => ({ status, total: r.data.total || 0 }))
            .catch(() => ({ status, total: 0 })),
        ),
      ),
      telarApi
        .get<ModerationShopsResponse>('/artisan-shops', {
          params: { limit: 100, page: 1 },
        })
        .catch(() => ({ data: { data: [], total: 0 } })),
    ]);

    const productCounts: Record<string, number> = {};
    productCountsResults.forEach(({ status, total }) => {
      productCounts[status] = total;
    });

    const shops = shopsRes.data.data || [];

    const approvedShops = shops.filter((s) => s.marketplaceApproved === true).length;
    const notApprovedShops = shops.filter((s) => !s.marketplaceApproved).length;
    const withBankData = shops.filter((s) => s.idContraparty != null).length;
    const publishedShops = shops.filter((s) => s.publishStatus === 'published').length;
    const pendingPublishShops = shops.filter(
      (s) => s.publishStatus !== 'published',
    ).length;

    return {
      productCounts,
      shopCounts: {
        all: shops.length,
        approved: approvedShops,
        not_approved: notApprovedShops,
      },
      shopsWithBankData: withBankData,
      shopsWithoutBankData: shops.length - withBankData,
      publishedShops,
      pendingPublishShops,
      shops,
    };
  } catch (error) {
    throw error;
  }
}
