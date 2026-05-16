import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getModerationShops,
  getShopProductCounts,
  toggleShopMarketplaceApproval,
  deleteShopAdmin,
  publishShopAdmin as publishShopAdminApi,
} from '@/services/moderation.actions';

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface ModerationShop {
  // Campos directos del API (camelCase, igual que la entidad NestJS)
  id: string;
  userId: string;
  shopName: string;
  shopSlug: string;
  logoUrl: string | null;       // Ya viene como URL completa (@AfterLoad)
  bannerUrl: string | null;     // Ya viene como URL completa (@AfterLoad)
  description: string | null;
  region: string | null;
  craftType: string | null;
  marketplaceApproved: boolean | null;
  marketplaceApprovedAt: string | null;
  marketplaceApprovedBy: string | null;
  publishStatus: string | null;
  active: boolean;
  createdAt: string;
  idContraparty: string | null;
  contactConfig: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    address?: string;
    hours?: string;
    map_embed?: string;
  } | null;
  // Campos calculados por el hook
  hasBankData: boolean;
  productCounts?: {
    total: number;
    approved: number;
    pending: number;
  };
}

interface ShopFilterCounts {
  all: number;
  approved: number;
  not_approved: number;
}

interface ShopPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ShopAdvancedFilters {
  search: string;
  hasBankData: 'all' | 'yes' | 'no';
  minApprovedProducts: 'all' | '0' | '1' | '5';
  region: string;
  craftType: string;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export const useShopModeration = () => {
  const [shops, setShops] = useState<ModerationShop[]>([]);
  const [counts, setCounts] = useState<ShopFilterCounts>({
    all: 0,
    approved: 0,
    not_approved: 0,
  });
  const [pagination, setPagination] = useState<ShopPagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableCraftTypes, setAvailableCraftTypes] = useState<string[]>([]);

  const fetchShops = useCallback(async (params: {
    filter?: string;
    page?: number;
    pageSize?: number;
    advancedFilters?: ShopAdvancedFilters;
  } = {}) => {
    const { filter = 'all', page = 1, pageSize = 20, advancedFilters } = params;
    setLoading(true);
    try {
      const result = await getModerationShops({
        filter,
        page,
        pageSize,
        search: advancedFilters?.search,
        hasBankData: advancedFilters?.hasBankData,
        region: advancedFilters?.region,
        craftType: advancedFilters?.craftType,
      });

      const rawShops = result.data ?? [];

      // Enriquecer con conteos de productos y campo hasBankData calculado
      const shopsEnriched = await Promise.all(
        rawShops.map(async (shop) => {
          const productCounts = await getShopProductCounts(shop.id);
          const enriched: ModerationShop = {
            id: shop.id,
            userId: shop.userId,
            shopName: shop.shopName,
            shopSlug: shop.shopSlug,
            logoUrl: shop.logoUrl,
            bannerUrl: shop.bannerUrl ?? null,
            description: shop.description,
            region: shop.region,
            craftType: shop.craftType,
            marketplaceApproved: shop.marketplaceApproved,
            marketplaceApprovedAt: shop.marketplaceApprovedAt ?? null,
            marketplaceApprovedBy: shop.marketplaceApprovedBy ?? null,
            publishStatus: shop.publishStatus,
            active: shop.active,
            createdAt: shop.createdAt,
            idContraparty: shop.idContraparty,
            contactConfig: (shop.contactConfig as ModerationShop['contactConfig']) ?? null,
            hasBankData: shop.idContraparty != null,
            productCounts,
          };
          return enriched;
        }),
      );

      setShops(shopsEnriched);

      const allCount = result.total ?? 0;
      const approvedCount = shopsEnriched.filter((s) => s.marketplaceApproved === true).length;
      const notApprovedCount = shopsEnriched.filter((s) => !s.marketplaceApproved).length;

      setCounts({ all: allCount, approved: approvedCount, not_approved: notApprovedCount });
      setPagination({
        page: result.page ?? page,
        pageSize,
        total: result.total ?? 0,
        totalPages: Math.ceil((result.total ?? 0) / pageSize),
      });

      const regions = [...new Set(shopsEnriched.map((s) => s.region).filter(Boolean) as string[])];
      const craftTypes = [...new Set(shopsEnriched.map((s) => s.craftType).filter(Boolean) as string[])];
      setAvailableRegions(regions);
      setAvailableCraftTypes(craftTypes);
    } catch {
      toast.error('Error al cargar tiendas');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleMarketplaceApproval: (shopId: string, approved: boolean, comment?: string) => Promise<boolean> =
    useCallback(async (shopId: string, approved: boolean, comment?: string) => {
      setUpdating(true);
      try {
        await toggleShopMarketplaceApproval(shopId, approved, { comment });
        toast.success(
          approved
            ? 'Tienda aprobada para marketplace'
            : 'Tienda removida del marketplace',
        );
        return true;
      } catch {
        toast.error('Error al actualizar aprobación');
        return false;
      } finally {
        setUpdating(false);
      }
    }, []);

  const bulkToggleMarketplaceApproval = useCallback(async (
    shopIds: string[],
    approved: boolean,
    onProgress?: (current: number, total: number) => void,
  ): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;

    for (let i = 0; i < shopIds.length; i++) {
      const result = await toggleMarketplaceApproval(shopIds[i], approved);
      if (result) {
        success++;
      } else {
        failed++;
      }
      onProgress?.(i + 1, shopIds.length);
    }

    return { success, failed };
  }, [toggleMarketplaceApproval]);

  const deleteShop: (shopId: string, reason?: string) => Promise<boolean> =
    useCallback(async (shopId: string, reason?: string) => {
      void reason;
      setUpdating(true);
      try {
        await deleteShopAdmin(shopId);
        toast.success('Tienda eliminada correctamente');
        return true;
      } catch {
        toast.error('Error al eliminar tienda');
        return false;
      } finally {
        setUpdating(false);
      }
    }, []);

  const bulkDeleteShops = useCallback(async (
    shopIds: string[],
    _reason: string,
    onProgress?: (current: number, total: number) => void,
  ): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;

    for (let i = 0; i < shopIds.length; i++) {
      const result = await deleteShop(shopIds[i]);
      if (result) {
        success++;
      } else {
        failed++;
      }
      onProgress?.(i + 1, shopIds.length);
    }

    return { success, failed };
  }, [deleteShop]);

  const publishShopAdmin = useCallback(async (
    shopId: string,
    action: 'publish' | 'unpublish',
    comment?: string,
  ): Promise<boolean> => {
    setUpdating(true);
    try {
      await publishShopAdminApi(shopId, action, { comment });
      toast.success(action === 'publish' ? 'Tienda publicada' : 'Tienda despublicada');
      return true;
    } catch {
      toast.error('Error al cambiar estado de publicación');
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  return {
    shops,
    counts,
    pagination,
    loading,
    updating,
    availableRegions,
    availableCraftTypes,
    fetchShops,
    toggleMarketplaceApproval,
    bulkToggleMarketplaceApproval,
    deleteShop,
    bulkDeleteShops,
    publishShopAdmin,
  };
};
