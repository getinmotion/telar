import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';

export type ShopFilter = 'all' | 'marketplace' | 'pending' | 'inactive' | 'no_cobre' | 'new';

export interface ShopWithMetrics {
  id: string;
  shop_name: string;
  shop_slug: string;
  user_id: string;
  logo_url: string | null;
  banner_url: string | null;
  craft_type: string | null;
  region: string | null;
  department: string | null;
  municipality: string | null;
  active: boolean;
  featured: boolean;
  publish_status: string | null;
  marketplace_approved: boolean | null;
  marketplace_approval_status: string | null;
  id_contraparty: string | null;
  created_at: string;
  updated_at: string;
  description: string | null;
  total_products: number;
  approved_products: number;
  pending_products: number;
  owner_name?: string;
}

export interface ShopStats {
  total: number;
  active: number;
  inactive: number;
  marketplace_visible: number;
  pending_approval: number;
  with_cobre: number;
  without_cobre: number;
  new_this_week: number;
  new_this_month: number;
  by_region: { region: string; count: number }[];
  by_craft_type: { craft_type: string; count: number }[];
}

export const useAdminShops = () => {
  const [shops, setShops] = useState<ShopWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ShopFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch shops with product counts
      const { data: shopsData, error: shopsError } = await supabase
        .from('artisan_shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (shopsError) throw shopsError;

      // Fetch product counts per shop
      const { data: productCounts, error: productsError } = await supabase
        .from('products')
        .select('shop_id, moderation_status');

      if (productsError) throw productsError;

      // Fetch user names (email not available in user_profiles)
      // TODO: Crear endpoint NestJS para obtener múltiples perfiles: POST /user-profiles/batch
      const userIds = [...new Set(shopsData?.map(s => s.user_id) || [])];
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      if (profilesError) console.error('[useAdminShops] Error fetching profiles:', profilesError);

      const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      // Aggregate product counts
      const productCountsMap = new Map<string, { total: number; approved: number; pending: number }>();
      productCounts?.forEach(product => {
        const current = productCountsMap.get(product.shop_id) || { total: 0, approved: 0, pending: 0 };
        current.total++;
        if (product.moderation_status === 'approved') current.approved++;
        else if (product.moderation_status === 'pending') current.pending++;
        productCountsMap.set(product.shop_id, current);
      });

      const shopsWithMetrics: ShopWithMetrics[] = (shopsData || []).map(shop => ({
        ...shop,
        total_products: productCountsMap.get(shop.id)?.total || 0,
        approved_products: productCountsMap.get(shop.id)?.approved || 0,
        pending_products: productCountsMap.get(shop.id)?.pending || 0,
        owner_name: nameMap.get(shop.user_id) || undefined,
      }));

      setShops(shopsWithMetrics);
    } catch (error) {
      console.error('Error fetching shops:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las tiendas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Calculate stats
  const stats: ShopStats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const byRegion = new Map<string, number>();
    const byCraftType = new Map<string, number>();

    shops.forEach(shop => {
      const region = shop.region || 'Sin región';
      byRegion.set(region, (byRegion.get(region) || 0) + 1);
      
      const craftType = shop.craft_type || 'Sin tipo';
      byCraftType.set(craftType, (byCraftType.get(craftType) || 0) + 1);
    });

    return {
      total: shops.length,
      active: shops.filter(s => s.active).length,
      inactive: shops.filter(s => !s.active).length,
      marketplace_visible: shops.filter(s => s.marketplace_approved).length,
      pending_approval: shops.filter(s => !s.marketplace_approved && s.active).length,
      with_cobre: shops.filter(s => s.id_contraparty).length,
      without_cobre: shops.filter(s => !s.id_contraparty).length,
      new_this_week: shops.filter(s => new Date(s.created_at) > oneWeekAgo).length,
      new_this_month: shops.filter(s => new Date(s.created_at) > oneMonthAgo).length,
      by_region: Array.from(byRegion.entries())
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      by_craft_type: Array.from(byCraftType.entries())
        .map(([craft_type, count]) => ({ craft_type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  }, [shops]);

  // Filter shops
  const filteredShops = useMemo(() => {
    let result = shops;

    // Apply filter
    switch (filter) {
      case 'marketplace':
        result = result.filter(s => s.marketplace_approved);
        break;
      case 'pending':
        result = result.filter(s => !s.marketplace_approved && s.active);
        break;
      case 'inactive':
        result = result.filter(s => !s.active);
        break;
      case 'no_cobre':
        result = result.filter(s => !s.id_contraparty);
        break;
      case 'new':
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        result = result.filter(s => new Date(s.created_at) > oneWeekAgo);
        break;
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.shop_name.toLowerCase().includes(term) ||
        s.shop_slug.toLowerCase().includes(term) ||
        s.craft_type?.toLowerCase().includes(term) ||
        s.region?.toLowerCase().includes(term) ||
        s.owner_name?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [shops, filter, searchTerm]);

  // Actions
  const approveMarketplace = useCallback(async (shopId: string) => {
    setActionLoading(shopId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const response = await supabase.functions.invoke('moderate-shop-marketplace', {
        body: { shopId, approved: true },
      });

      if (response.error) throw response.error;

      toast({ title: 'Tienda aprobada', description: 'La tienda ahora es visible en el marketplace' });
      await fetchShops();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  }, [fetchShops, toast]);

  const rejectMarketplace = useCallback(async (shopId: string, reason?: string) => {
    setActionLoading(shopId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const response = await supabase.functions.invoke('moderate-shop-marketplace', {
        body: { shopId, approved: false, comment: reason },
      });

      if (response.error) throw response.error;

      toast({ title: 'Tienda rechazada', description: 'La tienda ha sido removida del marketplace' });
      await fetchShops();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  }, [fetchShops, toast]);

  const togglePublish = useCallback(async (shopId: string, publish: boolean) => {
    setActionLoading(shopId);
    try {
      const { error } = await supabase
        .from('artisan_shops')
        .update({ 
          publish_status: publish ? 'published' : 'draft',
          active: publish,
          updated_at: new Date().toISOString()
        })
        .eq('id', shopId);

      if (error) throw error;

      toast({ 
        title: publish ? 'Tienda publicada' : 'Tienda despublicada',
        description: publish ? 'La tienda ahora está activa' : 'La tienda ha sido ocultada'
      });
      await fetchShops();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  }, [fetchShops, toast]);

  const deleteShop = useCallback(async (shopId: string, reason: string) => {
    setActionLoading(shopId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const response = await supabase.functions.invoke('delete-shop', {
        body: { shopId, reason },
      });

      if (response.error) throw response.error;

      toast({ title: 'Tienda eliminada', description: 'La tienda ha sido eliminada correctamente' });
      await fetchShops();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  }, [fetchShops, toast]);

  const createCobre = useCallback(async (shopId: string) => {
    setActionLoading(shopId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No hay sesión activa');

      const response = await supabase.functions.invoke('create-counterparty-admin', {
        body: { shopId },
      });

      if (response.error) throw response.error;

      toast({ title: 'Cuenta Cobre creada', description: 'La cuenta de pagos ha sido creada exitosamente' });
      await fetchShops();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  }, [fetchShops, toast]);

  // Bulk actions
  const bulkApprove = useCallback(async () => {
    for (const shopId of selectedShops) {
      await approveMarketplace(shopId);
    }
    setSelectedShops([]);
  }, [selectedShops, approveMarketplace]);

  const bulkReject = useCallback(async (reason?: string) => {
    for (const shopId of selectedShops) {
      await rejectMarketplace(shopId, reason);
    }
    setSelectedShops([]);
  }, [selectedShops, rejectMarketplace]);

  const toggleSelectShop = useCallback((shopId: string) => {
    setSelectedShops(prev =>
      prev.includes(shopId)
        ? prev.filter(id => id !== shopId)
        : [...prev, shopId]
    );
  }, []);

  const selectAllFiltered = useCallback(() => {
    setSelectedShops(filteredShops.map(s => s.id));
  }, [filteredShops]);

  const clearSelection = useCallback(() => {
    setSelectedShops([]);
  }, []);

  return {
    shops: filteredShops,
    allShops: shops,
    stats,
    loading,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    selectedShops,
    toggleSelectShop,
    selectAllFiltered,
    clearSelection,
    actionLoading,
    // Actions
    approveMarketplace,
    rejectMarketplace,
    togglePublish,
    deleteShop,
    createCobre,
    bulkApprove,
    bulkReject,
    refetch: fetchShops,
  };
};
