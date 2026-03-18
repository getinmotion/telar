import { telarApi } from '@/integrations/api/telarApi';

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

  if (status !== 'all') queryParams.moderationStatus = status;
  if (search) queryParams.q = search;
  if (category && category !== 'all') queryParams.category = category;
  if (region && region !== 'all') queryParams.region = region;
  if (onlyNonMarketplace) queryParams.onlyNonMarketplace = 'true';

  try {
    const response = await telarApi.get<ModerationQueueResponse>('/products', {
      params: queryParams,
    });
    return response.data;
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

  const productPayload: Record<string, unknown> = {
    moderationStatus: newStatus,
  };

  if (edits && Object.keys(edits).length > 0) {
    Object.assign(productPayload, sanitizeEdits(edits));
  }

  try {
    await telarApi.patch(`/products/${productId}`, productPayload);

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
      telarApi.get<{ total: number }>('/products', {
        params: { shopId, limit: 1, page: 1, moderationStatus: 'pending_moderation' },
      }),
      telarApi.get<{ total: number }>('/products', {
        params: { shopId, limit: 1, page: 1, moderationStatus: 'approved' },
      }),
      telarApi.get<{ total: number }>('/products', {
        params: { shopId, limit: 1, page: 1, moderationStatus: 'approved_with_edits' },
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
    const response = await telarApi.get<{ total: number }>('/products', {
      params: { moderationStatus: 'pending_moderation', limit: 1, page: 1 },
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
            .get<{ total: number }>('/products', {
              params: { moderationStatus: status, limit: 1, page: 1 },
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
