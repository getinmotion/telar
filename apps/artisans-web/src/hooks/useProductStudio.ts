import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { telarApi } from '@/integrations/api/telarApi';
import { getActiveCategories } from '@/services/categories.actions';
import { moderateProduct } from '@/services/moderation.actions';
import type { ProductResponse, CreateProductsNewDto, ProductStatus } from '@/services/products-new.types';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface StudioShop {
  id: string;
  shopName: string;
  shopSlug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  region: string | null;
  craftType: string | null;
  marketplaceApproved: boolean | null;
  publishStatus: string | null;
  active: boolean;
  createdAt: string;
  userId: string;
  idContraparty: string | null;
  healthScore: number;
}

export interface TaxonomyItem {
  id: string;
  name: string;
  slug?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export interface StudioTaxonomy {
  categories: Category[];
  crafts: TaxonomyItem[];
  techniques: TaxonomyItem[];
  curatorialCategories: TaxonomyItem[];
  materials: TaxonomyItem[];
}

export type ModerationAction = 'approve' | 'approve_with_edits' | 'request_changes' | 'reject';

// ─── Health score ───────────────────────────────────────────────────────────────

function computeHealthScore(shop: {
  logoUrl: string | null;
  marketplaceApproved: boolean | null;
  publishStatus: string | null;
  idContraparty: string | null;
}): number {
  let score = 0;
  if (shop.logoUrl) score += 20;
  if (shop.marketplaceApproved) score += 30;
  if (shop.publishStatus === 'published') score += 25;
  if (shop.idContraparty) score += 25;
  return score;
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export const useProductStudio = () => {
  const [shops, setShops] = useState<StudioShop[]>([]);
  const [loadingShops, setLoadingShops] = useState(false);

  const [selectedShop, setSelectedShop] = useState<StudioShop | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [saving, setSaving] = useState(false);
  const [moderating, setModerating] = useState(false);

  const [taxonomy, setTaxonomy] = useState<StudioTaxonomy>({
    categories: [],
    crafts: [],
    techniques: [],
    curatorialCategories: [],
    materials: [],
  });
  const [taxonomyLoaded, setTaxonomyLoaded] = useState(false);

  // ── Fetch all shops (multi-page) ─────────────────────────────────────────────

  const fetchAllShops = useCallback(async () => {
    setLoadingShops(true);
    try {
      const PAGE_SIZE = 100;
      let page = 1;
      let allShops: StudioShop[] = [];
      let total = 0;

      do {
        const res = await telarApi.get<{ data: StudioShop[]; total: number }>('/artisan-shops', {
          params: { page: String(page), limit: String(PAGE_SIZE), order: 'DESC' },
        });
        const raw: StudioShop[] = res.data.data ?? [];
        total = res.data.total ?? 0;

        const enriched = raw.map((s) => ({
          ...s,
          healthScore: computeHealthScore(s),
        }));
        allShops = [...allShops, ...enriched];
        page++;
      } while (allShops.length < total);

      setShops(allShops);
    } catch {
      toast.error('Error al cargar tiendas');
    } finally {
      setLoadingShops(false);
    }
  }, []);

  // ── Select shop → fetch its products ─────────────────────────────────────────

  const selectShop = useCallback(async (shop: StudioShop) => {
    setSelectedShop(shop);
    setSelectedProduct(null);
    setLoadingProducts(true);
    try {
      const res = await telarApi.get<ProductResponse[]>(`/products-new/store/${shop.id}`);
      setProducts(res.data ?? []);
    } catch {
      toast.error('Error al cargar productos');
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // ── Select product → fetch full detail ───────────────────────────────────────

  const selectProduct = useCallback(async (productId: string) => {
    setLoadingProduct(true);
    try {
      const res = await telarApi.get<ProductResponse>(`/products-new/${productId}`);
      setSelectedProduct(res.data);
      return res.data;
    } catch {
      toast.error('Error al cargar producto');
      return null;
    } finally {
      setLoadingProduct(false);
    }
  }, []);

  const clearProduct = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  // ── Update product (upsert) ───────────────────────────────────────────────────

  const updateProduct = useCallback(async (dto: CreateProductsNewDto): Promise<boolean> => {
    setSaving(true);
    try {
      const res = await telarApi.post<ProductResponse>('/products-new', dto);
      setSelectedProduct(res.data);
      setProducts((prev) => prev.map((p) => (p.id === res.data.id ? res.data : p)));
      toast.success('Producto actualizado');
      return true;
    } catch {
      toast.error('Error al actualizar producto');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Moderate product ─────────────────────────────────────────────────────────

  const moderateProductAction = useCallback(async (
    productId: string,
    action: ModerationAction,
    comment?: string,
    edits?: Record<string, unknown>,
  ): Promise<boolean> => {
    setModerating(true);
    try {
      const previousStatus = selectedProduct?.status;
      await moderateProduct(productId, action, comment, edits, undefined, previousStatus);

      const actionLabels: Record<ModerationAction, string> = {
        approve: 'Producto aprobado',
        approve_with_edits: 'Aprobado con ajustes',
        request_changes: 'Se solicitaron cambios al artesano',
        reject: 'Producto rechazado',
      };
      toast.success(actionLabels[action]);

      // Refresh selected product
      const updated = await telarApi.get<ProductResponse>(`/products-new/${productId}`);
      setSelectedProduct(updated.data);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated.data : p)));
      return true;
    } catch {
      toast.error('Error al moderar producto');
      return false;
    } finally {
      setModerating(false);
    }
  }, [selectedProduct]);

  // ── Load taxonomy ────────────────────────────────────────────────────────────

  const loadTaxonomy = useCallback(async () => {
    if (taxonomyLoaded) return;
    try {
      const [catsRes, craftsRes, techsRes, curatRes, matsRes] = await Promise.allSettled([
        getActiveCategories(),
        telarApi.get<TaxonomyItem[]>('/crafts'),
        telarApi.get<TaxonomyItem[]>('/techniques'),
        telarApi.get<TaxonomyItem[]>('/curatorial-categories'),
        telarApi.get<TaxonomyItem[]>('/materials'),
      ]);

      setTaxonomy({
        categories: catsRes.status === 'fulfilled' ? (catsRes.value as Category[]) : [],
        crafts: craftsRes.status === 'fulfilled' ? craftsRes.value.data : [],
        techniques: techsRes.status === 'fulfilled' ? techsRes.value.data : [],
        curatorialCategories: curatRes.status === 'fulfilled' ? curatRes.value.data : [],
        materials: matsRes.status === 'fulfilled' ? matsRes.value.data : [],
      });
      setTaxonomyLoaded(true);
    } catch {
      // Non-fatal — tabs degrade gracefully
    }
  }, [taxonomyLoaded]);

  // ── Product counts by status (computed from loaded products) ─────────────────

  const productCounts = {
    total: products.length,
    pending: products.filter((p) => p.status === 'pending_moderation').length,
    approved: products.filter((p) => p.status === 'approved' || p.status === 'approved_with_edits').length,
    changes_requested: products.filter((p) => p.status === 'changes_requested').length,
    rejected: products.filter((p) => p.status === 'rejected').length,
    draft: products.filter((p) => p.status === 'draft').length,
  };

  return {
    // Shops
    shops,
    loadingShops,
    fetchAllShops,
    selectedShop,
    selectShop,

    // Products
    products,
    loadingProducts,
    productCounts,

    // Selected product
    selectedProduct,
    loadingProduct,
    selectProduct,
    clearProduct,
    setSelectedProduct,

    // Mutations
    saving,
    updateProduct,
    moderating,
    moderateProductAction,

    // Taxonomy
    taxonomy,
    loadTaxonomy,
  };
};
