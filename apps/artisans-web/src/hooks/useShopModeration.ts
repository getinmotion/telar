import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ModerationShop {
  id: string;
  shop_name: string;
  shop_slug: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  region: string | null;
  craft_type: string | null;
  marketplace_approved: boolean | null;
  marketplace_approved_at: string | null;
  marketplace_approved_by: string | null;
  publish_status: string | null;
  active: boolean;
  created_at: string;
  user_id: string;
  has_bank_data: boolean;
  id_contraparty: string | null;
  contact_info?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    address?: string;
  } | null;
  product_counts?: {
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

  const fetchShops = useCallback(async (
    filter: string = 'all',
    advancedFilters?: ShopAdvancedFilters,
    page: number = 1,
    pageSize: number = 20
  ) => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Construir query params
      const params = new URLSearchParams({
        type: 'shops',
        filter,
        page: String(page),
        pageSize: String(pageSize),
      });

      if (advancedFilters?.search?.trim()) {
        params.append('search', advancedFilters.search);
      }
      if (advancedFilters?.hasBankData && advancedFilters.hasBankData !== 'all') {
        params.append('hasBankData', advancedFilters.hasBankData);
      }
      if (advancedFilters?.minApprovedProducts && advancedFilters.minApprovedProducts !== 'all') {
        params.append('minApprovedProducts', advancedFilters.minApprovedProducts);
      }
      if (advancedFilters?.region && advancedFilters.region !== 'all') {
        params.append('region', advancedFilters.region);
      }
      if (advancedFilters?.craftType && advancedFilters.craftType !== 'all') {
        params.append('craftType', advancedFilters.craftType);
      }

      // Llamar al edge function con query params
      const { data, error } = await supabase.functions.invoke(
        `get-moderation-queue?${params.toString()}`,
        { method: 'GET' }
      );

      if (error) throw error;

      // Obtener conteos de productos para cada tienda
      // Usar id_contraparty directamente del edge function (evita problemas de RLS con tiendas inactivas)
      const shopsWithCounts = await Promise.all(
        (data.shops || []).map(async (shop: any) => {
          const { data: products } = await supabase
            .from('products')
            .select('id, moderation_status')
            .eq('shop_id', shop.id);

          const productCounts = {
            total: products?.length || 0,
            approved: products?.filter(p => 
              p.moderation_status === 'approved' || 
              p.moderation_status === 'approved_with_edits'
            ).length || 0,
            pending: products?.filter(p => 
              p.moderation_status === 'pending_moderation'
            ).length || 0,
          };

          return {
            ...shop,
            product_counts: productCounts,
            // Usar id_contraparty directamente del edge function (ya viene con service role)
            has_bank_data: shop.id_contraparty != null,
          };
        })
      );

      setShops(shopsWithCounts);
      setCounts(data.counts || { all: 0, approved: 0, not_approved: 0 });
      setPagination({
        page: data.page || page,
        pageSize: data.pageSize || pageSize,
        total: data.total || shopsWithCounts.length,
        totalPages: data.totalPages || Math.ceil((data.total || shopsWithCounts.length) / pageSize),
      });

      // Update available regions and craft types
      if (data.availableRegions) setAvailableRegions(data.availableRegions);
      if (data.availableCraftTypes) setAvailableCraftTypes(data.availableCraftTypes);

    } catch (error: any) {
      console.error('Error fetching shops:', error);
      toast.error('Error al cargar tiendas');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleMarketplaceApproval = useCallback(async (
    shopId: string,
    approved: boolean,
    comment?: string
  ) => {
    try {
      setUpdating(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { error } = await supabase.functions.invoke('moderate-shop-marketplace', {
        body: {
          shopId,
          approved,
          comment,
        },
      });

      if (error) throw error;

      toast.success(
        approved 
          ? '✅ Tienda aprobada para marketplace' 
          : '❌ Tienda removida del marketplace'
      );

      return true;
    } catch (error: any) {
      console.error('Error toggling marketplace approval:', error);
      toast.error('Error al actualizar aprobación');
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  const bulkToggleMarketplaceApproval = useCallback(async (
    shopIds: string[],
    approved: boolean,
    onProgress?: (current: number, total: number) => void
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

  const deleteShop = useCallback(async (
    shopId: string,
    reason: string
  ): Promise<boolean> => {
    try {
      setUpdating(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data, error } = await supabase.functions.invoke('delete-shop', {
        body: { shopId, reason },
      });

      if (error) throw error;
      if (!data?.success) {
        toast.error(data?.error || 'Error al eliminar tienda');
        return false;
      }

      toast.success(data.message || 'Tienda eliminada correctamente');
      return true;
    } catch (error: any) {
      console.error('Error deleting shop:', error);
      toast.error(error.message || 'Error al eliminar tienda');
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  const bulkDeleteShops = useCallback(async (
    shopIds: string[],
    reason: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;

    for (let i = 0; i < shopIds.length; i++) {
      const result = await deleteShop(shopIds[i], reason);
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
    comment?: string
  ): Promise<boolean> => {
    try {
      setUpdating(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { data, error } = await supabase.functions.invoke('publish-shop-admin', {
        body: { shopId, action, comment },
      });

      if (error) throw error;
      if (!data?.success) {
        toast.error(data?.error || 'Error al cambiar estado de publicación');
        return false;
      }

      toast.success(data.message || (action === 'publish' ? 'Tienda publicada' : 'Tienda despublicada'));
      return true;
    } catch (error: any) {
      console.error('Error publishing shop:', error);
      toast.error(error.message || 'Error al cambiar estado de publicación');
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
