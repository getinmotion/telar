import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductCounts {
  pending_moderation: number;
  approved: number;
  approved_with_edits: number;
  changes_requested: number;
  rejected: number;
  draft: number;
}

interface ShopCounts {
  all: number;
  approved: number;
  not_approved: number;
}

export interface ShopSummary {
  id: string;
  shop_name: string;
  shop_slug: string;
  craft_type: string | null;
  has_bank_data: boolean;
  marketplace_approved: boolean;
  publish_status: string | null;
  created_at: string;
  logo_url: string | null;
  region: string | null;
}

export interface ProductSummary {
  id: string;
  name: string;
  shop_name: string;
  shop_id: string;
  moderation_status: string | null;
  created_at: string;
  images: any;
  price: number;
}

export interface ModerationStats {
  products: ProductCounts;
  shops: ShopCounts;
  shopsWithBankData: number;
  shopsWithoutBankData: number;
  publishedShops: number;
  pendingPublishShops: number;
  // Detailed data for drill-down
  shopDetails: {
    all: ShopSummary[];
    approved: ShopSummary[];
    notApproved: ShopSummary[];
    published: ShopSummary[];
    pendingPublish: ShopSummary[];
    withBankData: ShopSummary[];
    withoutBankData: ShopSummary[];
  };
  productDetails: {
    pending_moderation: ProductSummary[];
    approved: ProductSummary[];
    approved_with_edits: ProductSummary[];
    changes_requested: ProductSummary[];
    rejected: ProductSummary[];
    draft: ProductSummary[];
  };
}

const defaultStats: ModerationStats = {
  products: {
    pending_moderation: 0,
    approved: 0,
    approved_with_edits: 0,
    changes_requested: 0,
    rejected: 0,
    draft: 0,
  },
  shops: {
    all: 0,
    approved: 0,
    not_approved: 0,
  },
  shopsWithBankData: 0,
  shopsWithoutBankData: 0,
  publishedShops: 0,
  pendingPublishShops: 0,
  shopDetails: {
    all: [],
    approved: [],
    notApproved: [],
    published: [],
    pendingPublish: [],
    withBankData: [],
    withoutBankData: [],
  },
  productDetails: {
    pending_moderation: [],
    approved: [],
    approved_with_edits: [],
    changes_requested: [],
    rejected: [],
    draft: [],
  },
};

export const useModerationStats = () => {
  const [stats, setStats] = useState<ModerationStats>(defaultStats);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch products with shop info
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, moderation_status, created_at, images, price, shop_id, artisan_shops(shop_name)');

      if (productsError) throw productsError;

      const productCounts: ProductCounts = {
        pending_moderation: 0,
        approved: 0,
        approved_with_edits: 0,
        changes_requested: 0,
        rejected: 0,
        draft: 0,
      };

      const productDetails: ModerationStats['productDetails'] = {
        pending_moderation: [],
        approved: [],
        approved_with_edits: [],
        changes_requested: [],
        rejected: [],
        draft: [],
      };

      products?.forEach((p) => {
        const status = (p.moderation_status || 'draft') as keyof ProductCounts;
        if (status in productCounts) {
          productCounts[status]++;
          productDetails[status].push({
            id: p.id,
            name: p.name,
            shop_name: (p.artisan_shops as any)?.shop_name || 'Sin tienda',
            shop_id: p.shop_id,
            moderation_status: p.moderation_status,
            created_at: p.created_at,
            images: p.images,
            price: p.price,
          });
        }
      });

      // Fetch shop data with id_contraparty for bank data status
      const { data: shops, error: shopsError } = await supabase
        .from('artisan_shops')
        .select('id, shop_name, shop_slug, craft_type, marketplace_approved, publish_status, id_contraparty, created_at, logo_url, region');

      if (shopsError) throw shopsError;

      const shopCounts: ShopCounts = {
        all: shops?.length || 0,
        approved: shops?.filter(s => s.marketplace_approved === true).length || 0,
        not_approved: shops?.filter(s => !s.marketplace_approved).length || 0,
      };

      const shopsWithBankData = shops?.filter(s => s.id_contraparty != null).length || 0;
      const shopsWithoutBankData = (shops?.length || 0) - shopsWithBankData;
      const publishedShops = shops?.filter(s => s.publish_status === 'published').length || 0;
      const pendingPublishShops = shops?.filter(s => s.publish_status === 'pending_publish' || !s.publish_status).length || 0;

      // Build shop details for drill-down
      const mapShop = (s: any): ShopSummary => ({
        id: s.id,
        shop_name: s.shop_name,
        shop_slug: s.shop_slug,
        craft_type: s.craft_type,
        has_bank_data: s.id_contraparty != null,
        marketplace_approved: s.marketplace_approved === true,
        publish_status: s.publish_status,
        created_at: s.created_at,
        logo_url: s.logo_url,
        region: s.region,
      });

      const shopDetails: ModerationStats['shopDetails'] = {
        all: shops?.map(mapShop) || [],
        approved: shops?.filter(s => s.marketplace_approved === true).map(mapShop) || [],
        notApproved: shops?.filter(s => !s.marketplace_approved).map(mapShop) || [],
        published: shops?.filter(s => s.publish_status === 'published').map(mapShop) || [],
        pendingPublish: shops?.filter(s => s.publish_status === 'pending_publish' || !s.publish_status).map(mapShop) || [],
        withBankData: shops?.filter(s => s.id_contraparty != null).map(mapShop) || [],
        withoutBankData: shops?.filter(s => s.id_contraparty == null).map(mapShop) || [],
      };

      setStats({
        products: productCounts,
        shops: shopCounts,
        shopsWithBankData,
        shopsWithoutBankData,
        publishedShops,
        pendingPublishShops,
        shopDetails,
        productDetails,
      });
    } catch (error: any) {
      console.error('Error fetching moderation stats:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    fetchStats,
  };
};
