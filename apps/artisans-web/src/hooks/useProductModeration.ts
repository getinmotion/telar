import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
  getModerationQueue,
  moderateProduct as moderateProductApi,
  toggleShopMarketplaceApproval as updateShopMarketplaceApproval,
  getProductHistoryByProductId,
  ModerationProductApi,
  ProductModerationHistoryApi,
} from '@/services/moderation.actions';

export interface ModerationProduct {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  compare_price: number | null;
  category: string;
  subcategory: string | null;
  images: string[];
  tags: string[];
  materials: string[];
  techniques: string[];
  inventory: number;
  sku: string | null;
  moderation_status: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  weight: number | null;
  dimensions: {
    length: number | null;
    width: number | null;
    height: number | null;
  } | null;
  shipping_data_complete: boolean;
  artisan_shops: {
    id: string;
    shop_name: string;
    shop_slug: string;
    user_id: string;
    region: string | null;
    craft_type: string | null;
    logo_url: string | null;
    marketplace_approved?: boolean;
  };
}

export interface ModerationHistory {
  id: string;
  product_id: string;
  previous_status: string | null;
  new_status: string;
  moderator_id: string | null;
  artisan_id: string | null;
  comment: string | null;
  edits_made: Record<string, unknown>;
  created_at: string;
}

export interface ModerationCounts {
  pending_moderation: number;
  approved: number;
  approved_with_edits: number;
  changes_requested: number;
  rejected: number;
  draft: number;
}

export interface AdvancedFilters {
  search: string;
  category: string;
  region: string;
  onlyNonMarketplace: boolean;
}

interface ProductPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Mapea historial camelCase de NestJS → snake_case del componente
function mapHistory(h: ProductModerationHistoryApi): ModerationHistory {
  return {
    id: h.id,
    product_id: h.productId,
    previous_status: h.previousStatus ?? null,
    new_status: h.newStatus,
    moderator_id: h.moderatorId ?? null,
    artisan_id: h.artisanId ?? null,
    comment: h.comment ?? null,
    edits_made: h.editsMade ?? {},
    created_at: h.createdAt,
  };
}

// Mapea respuesta camelCase de NestJS → snake_case del componente
function mapProduct(p: ModerationProductApi): ModerationProduct {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    short_description: p.shortDescription ?? '',
    price: p.price,
    compare_price: p.comparePrice,
    category: p.subcategory ?? '',
    subcategory: p.subcategory,
    images: p.images ?? [],
    tags: p.tags ?? [],
    materials: p.materials ?? [],
    techniques: p.techniques ?? [],
    inventory: p.inventory,
    sku: p.sku,
    moderation_status: p.moderationStatus,
    active: p.active,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    weight: p.weight,
    dimensions: p.dimensions ?? null,
    shipping_data_complete: p.shippingDataComplete,
    artisan_shops: {
      id: p.shop?.id ?? '',
      shop_name: p.shop?.shopName ?? '',
      shop_slug: p.shop?.shopSlug ?? '',
      user_id: p.shop?.userId ?? '',
      region: p.shop?.region ?? null,
      craft_type: p.shop?.craftType ?? null,
      logo_url: p.shop?.logoUrl ?? null,
      marketplace_approved: p.shop?.marketplaceApproved ?? undefined,
    },
  };
}

export const useProductModeration = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<ModerationProduct[]>([]);
  const [counts, setCounts] = useState<ModerationCounts>({
    pending_moderation: 0,
    approved: 0,
    approved_with_edits: 0,
    changes_requested: 0,
    rejected: 0,
    draft: 0,
  });
  const [pagination, setPagination] = useState<ProductPagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [moderating, setModerating] = useState(false);

  const fetchModerationQueue = useCallback(async (params: {
    status?: string;
    page?: number;
    pageSize?: number;
    advancedFilters?: AdvancedFilters;
  } = {}) => {
    const { status = 'pending_moderation', page = 1, pageSize = 20, advancedFilters } = params;
    setLoading(true);
    try {
      const result = await getModerationQueue({
        status,
        page,
        pageSize,
        search: advancedFilters?.search,
        category: advancedFilters?.category,
        region: advancedFilters?.region,
        onlyNonMarketplace: advancedFilters?.onlyNonMarketplace,
      });

      setProducts((result.data ?? []).map(mapProduct));
      setPagination({
        page: result.page ?? page,
        pageSize,
        total: result.total ?? 0,
        totalPages: Math.ceil((result.total ?? 0) / pageSize),
      });
    } catch {
      toast.error('Error al cargar la cola de moderación');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const statuses = ['pending_moderation', 'approved', 'approved_with_edits', 'changes_requested', 'rejected', 'draft'] as const;
      const results = await Promise.all(
        statuses.map((s) =>
          getModerationQueue({ status: s, page: 1, pageSize: 1 })
            .then((r) => ({ status: s, total: r.total }))
            .catch(() => ({ status: s, total: 0 }))
        )
      );
      const newCounts = results.reduce((acc, { status: s, total }) => {
        acc[s] = total;
        return acc;
      }, {} as ModerationCounts);
      setCounts(newCounts);
    } catch {
      // counts are non-critical, fail silently
    }
  }, []);

  const moderateProduct = useCallback(async (
    productId: string,
    action: 'approve' | 'approve_with_edits' | 'request_changes' | 'reject',
    comment?: string,
    edits?: Record<string, unknown>,
  ) => {
    setModerating(true);

    const currentProduct = products.find((p) => p.id === productId);
    const previousStatus = currentProduct?.moderation_status;

    try {
      await moderateProductApi(
        productId,
        action,
        comment,
        edits,
        user?.id,
        previousStatus,
      );
      toast.success('Producto moderado exitosamente');
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      toast.error('Error al moderar el producto');
      throw new Error('moderation failed');
    } finally {
      setModerating(false);
    }
  }, [products, user?.id]);

  const updateShopMarketplaceApprovalFn = useCallback(async (
    shopId: string,
    approved: boolean,
  ) => {
    try {
      await updateShopMarketplaceApproval(shopId, approved);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.artisan_shops?.id === shopId) {
            return {
              ...p,
              artisan_shops: { ...p.artisan_shops, marketplace_approved: approved },
            };
          }
          return p;
        }),
      );
    } catch {
      toast.error('Error al actualizar la aprobación de la tienda');
      throw new Error('approval update failed');
    }
  }, []);

  const fetchProductHistory: (productId?: string) => Promise<ModerationHistory[]> =
    useCallback(async (productId?: string) => {
      if (!productId) return [];
      try {
        const history = await getProductHistoryByProductId(productId);
        return history.map(mapHistory);
      } catch {
        return [];
      }
    }, []);

  const bulkModerateProducts = useCallback(async (
    productIds: string[],
    action: 'approve' | 'approve_with_edits' | 'request_changes' | 'reject',
    comment?: string,
    onProgress?: (current: number, total: number) => void,
  ): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;
    for (let i = 0; i < productIds.length; i++) {
      try {
        const product = products.find(p => p.id === productIds[i]);
        await moderateProductApi(productIds[i], action, comment, undefined, user?.id, product?.moderation_status);
        setProducts(prev => prev.filter(p => p.id !== productIds[i]));
        success++;
      } catch {
        failed++;
      }
      onProgress?.(i + 1, productIds.length);
    }
    if (success > 0) toast.success(`${success} producto${success > 1 ? 's' : ''} procesado${success > 1 ? 's' : ''}`);
    if (failed > 0) toast.error(`${failed} producto${failed > 1 ? 's' : ''} fallaron`);
    return { success, failed };
  }, [products, user?.id]);

  return {
    products,
    counts,
    pagination,
    loading,
    moderating,
    fetchModerationQueue,
    fetchCounts,
    moderateProduct,
    bulkModerateProducts,
    updateShopMarketplaceApproval: updateShopMarketplaceApprovalFn,
    fetchProductHistory,
  };
};
