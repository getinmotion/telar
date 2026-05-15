import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getModerationStats, ModerationShopApi } from '@/services/moderation.actions';
import type { ProductResponse } from '@telar/shared-types';

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
  shopName: string;
  shopSlug: string;
  craftType: string | null;
  hasBankData: boolean;
  marketplaceApproved: boolean;
  publishStatus: string | null;
  createdAt: string;
  logoUrl: string | null;
  region: string | null;
}

export interface ProductSummary {
  id: string;
  name: string;
  shopId: string;
  shopName: string | null;
  status: string;
  price: number;
  imageUrl: string | null;
  createdAt: string;
}

export interface ModerationStats {
  products: ProductCounts;
  shops: ShopCounts;
  shopsWithBankData: number;
  shopsWithoutBankData: number;
  publishedShops: number;
  pendingPublishShops: number;
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
  shops: { all: 0, approved: 0, not_approved: 0 },
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

function mapShopSummary(s: ModerationShopApi): ShopSummary {
  return {
    id: s.id,
    shopName: s.shopName,
    shopSlug: s.shopSlug,
    craftType: s.craftType,
    hasBankData: s.idContraparty != null,
    marketplaceApproved: s.marketplaceApproved === true,
    publishStatus: s.publishStatus,
    createdAt: s.createdAt,
    logoUrl: s.logoUrl,
    region: s.region,
  };
}

function mapProductSummary(p: ProductResponse): ProductSummary {
  const firstVariant = p.variants?.[0];
  const priceInPesos = firstVariant?.basePriceMinor
    ? Math.round(parseInt(firstVariant.basePriceMinor) / 100)
    : 0;
  const imageUrl = p.media
    ?.filter((m) => m.mediaType === 'image')
    .sort((a, b) => a.displayOrder - b.displayOrder)[0]?.mediaUrl ?? null;

  return {
    id: p.id,
    name: p.name,
    shopId: p.storeId,
    shopName: p.artisanShop?.shopName ?? null,
    status: p.status,
    price: priceInPesos,
    imageUrl,
    createdAt: p.createdAt,
  };
}

export const useModerationStats = () => {
  const [stats, setStats] = useState<ModerationStats>(defaultStats);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getModerationStats();

      const productCounts: ProductCounts = {
        pending_moderation: data.productCounts.pending_moderation ?? 0,
        approved: data.productCounts.approved ?? 0,
        approved_with_edits: data.productCounts.approved_with_edits ?? 0,
        changes_requested: data.productCounts.changes_requested ?? 0,
        rejected: data.productCounts.rejected ?? 0,
        draft: data.productCounts.draft ?? 0,
      };

      const shopSummaries = data.shops.map(mapShopSummary);

      const shopDetails: ModerationStats['shopDetails'] = {
        all: shopSummaries,
        approved: shopSummaries.filter((s) => s.marketplaceApproved),
        notApproved: shopSummaries.filter((s) => !s.marketplaceApproved),
        published: shopSummaries.filter((s) => s.publishStatus === 'published'),
        pendingPublish: shopSummaries.filter((s) => s.publishStatus !== 'published'),
        withBankData: shopSummaries.filter((s) => s.hasBankData),
        withoutBankData: shopSummaries.filter((s) => !s.hasBankData),
      };

      const ps = data.productsByStatus ?? {};
      const productDetails: ModerationStats['productDetails'] = {
        pending_moderation: (ps.pending_moderation ?? []).map(mapProductSummary),
        approved: (ps.approved ?? []).map(mapProductSummary),
        approved_with_edits: (ps.approved_with_edits ?? []).map(mapProductSummary),
        changes_requested: (ps.changes_requested ?? []).map(mapProductSummary),
        rejected: (ps.rejected ?? []).map(mapProductSummary),
        draft: (ps.draft ?? []).map(mapProductSummary),
      };

      setStats({
        products: productCounts,
        shops: data.shopCounts,
        shopsWithBankData: data.shopsWithBankData,
        shopsWithoutBankData: data.shopsWithoutBankData,
        publishedShops: data.publishedShops,
        pendingPublishShops: data.pendingPublishShops,
        shopDetails,
        productDetails,
      });
    } catch {
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, fetchStats };
};
