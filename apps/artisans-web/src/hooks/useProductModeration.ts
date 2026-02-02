import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  edits_made: Record<string, any>;
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

export const useProductModeration = () => {
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

  const fetchModerationQueue = useCallback(async (
    status: string = 'pending_moderation',
    advancedFilters?: AdvancedFilters,
    page: number = 1,
    pageSize: number = 20
  ) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const url = new URL(`https://ylooqmqmoufqtxvetxuj.supabase.co/functions/v1/get-moderation-queue`);
      url.searchParams.set('status', status);
      url.searchParams.set('page', String(page));
      url.searchParams.set('pageSize', String(pageSize));
      
      if (advancedFilters) {
        if (advancedFilters.search) url.searchParams.set('search', advancedFilters.search);
        if (advancedFilters.category && advancedFilters.category !== 'all') {
          url.searchParams.set('category', advancedFilters.category);
        }
        if (advancedFilters.region && advancedFilters.region !== 'all') {
          url.searchParams.set('region', advancedFilters.region);
        }
        if (advancedFilters.onlyNonMarketplace) {
          url.searchParams.set('only_non_marketplace', 'true');
        }
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch moderation queue');
      }

      const data = await response.json();
      setProducts(data.products || []);
      setCounts(data.counts || counts);
      setPagination({
        page: data.page || page,
        pageSize: data.pageSize || pageSize,
        total: data.total || 0,
        totalPages: data.totalPages || Math.ceil((data.total || 0) / pageSize),
      });
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
      toast.error('Error al cargar la cola de moderación');
    } finally {
      setLoading(false);
    }
  }, []);

  const moderateProduct = useCallback(async (
    productId: string,
    action: 'approve' | 'approve_with_edits' | 'request_changes' | 'reject',
    comment?: string,
    edits?: Record<string, any>
  ) => {
    setModerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `https://ylooqmqmoufqtxvetxuj.supabase.co/functions/v1/moderate-product`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId,
            action,
            comment,
            edits,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to moderate product');
      }

      const result = await response.json();
      toast.success(result.message || 'Producto moderado exitosamente');
      
      // Remove from current list
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      return result;
    } catch (error) {
      console.error('Error moderating product:', error);
      toast.error('Error al moderar el producto');
      throw error;
    } finally {
      setModerating(false);
    }
  }, []);

  const updateShopMarketplaceApproval = useCallback(async (
    shopId: string,
    approved: boolean,
    comment?: string
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `https://ylooqmqmoufqtxvetxuj.supabase.co/functions/v1/moderate-shop-marketplace`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shopId,
            approved,
            comment,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update shop approval');
      }

      const result = await response.json();
      
      // Update the shop in our local products list
      setProducts(prev => prev.map(p => {
        if (p.artisan_shops?.id === shopId) {
          return {
            ...p,
            artisan_shops: {
              ...p.artisan_shops,
              marketplace_approved: approved,
            }
          };
        }
        return p;
      }));
      
      return result;
    } catch (error) {
      console.error('Error updating shop marketplace approval:', error);
      toast.error('Error al actualizar la aprobación de la tienda');
      throw error;
    }
  }, []);

  const fetchProductHistory = useCallback(async (productId: string): Promise<ModerationHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('product_moderation_history')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ModerationHistory[];
    } catch (error) {
      console.error('Error fetching product history:', error);
      return [];
    }
  }, []);

  return {
    products,
    counts,
    pagination,
    loading,
    moderating,
    fetchModerationQueue,
    moderateProduct,
    updateShopMarketplaceApproval,
    fetchProductHistory,
  };
};
