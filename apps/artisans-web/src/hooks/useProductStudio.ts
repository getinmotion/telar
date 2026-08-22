import { useState, useCallback } from "react";
import { toast } from "sonner";
import { telarApi } from "@/integrations/api/telarApi";
import { buildDuplicatePayload } from "@/services/duplicateProduct";
import { moderateProduct } from "@/services/moderation.actions";
import {
  fetchStudioTaxonomy,
  EMPTY_STUDIO_TAXONOMY,
  type StudioTaxonomy,
} from "@/services/studioTaxonomy.actions";
import type {
  ProductResponse,
  CreateProductsNewDto,
  ProductStatus,
} from "@/services/products-new.types";

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Perfil artesanal (jsonb) de la tienda: trae UUIDs reales de taxonomía. */
export interface StudioArtisanProfile {
  craftId?: string;
  craftIds?: string[];
  techniqueIds?: string[];
  materialIds?: string[];
  categoryIds?: string[];
}

export interface StudioShop {
  id: string;
  shopName: string;
  shopSlug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  region: string | null;
  // department/municipality/artisanProfile ya vienen en el payload de
  // /artisan-shops; se declaran para poder derivar datos de la tienda.
  department?: string | null;
  municipality?: string | null;
  artisanProfile?: StudioArtisanProfile | null;
  craftType: string | null;
  marketplaceApproved: boolean | null;
  publishStatus: string | null;
  active: boolean;
  createdAt: string;
  userId: string;
  idContraparty: string | null;
  agreementName: string | null;
  healthScore: number;
}

// Los catálogos viven en services/studioTaxonomy.actions (los comparte el inyector).
export type {
  TaxonomyItem,
  Category,
  StudioTaxonomy,
} from "@/services/studioTaxonomy.actions";

export type ModerationAction =
  | "approve"
  | "approve_with_edits"
  | "request_changes"
  | "reject";

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
  if (shop.publishStatus === "published") score += 25;
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

  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [saving, setSaving] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const [taxonomy, setTaxonomy] = useState<StudioTaxonomy>(
    EMPTY_STUDIO_TAXONOMY,
  );
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
        const res = await telarApi.get<{ data: StudioShop[]; total: number }>(
          "/artisan-shops",
          {
            params: {
              page: String(page),
              limit: String(PAGE_SIZE),
              order: "DESC",
            },
          },
        );
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
      toast.error("Error al cargar tiendas");
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
      const res = await telarApi.get<ProductResponse[]>(
        `/products-new/store/${shop.id}`,
      );
      setProducts(res.data ?? []);
    } catch {
      toast.error("Error al cargar productos");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // ── Select product → fetch full detail ───────────────────────────────────────

  const selectProduct = useCallback(async (productId: string) => {
    setLoadingProduct(true);
    try {
      const res = await telarApi.get<ProductResponse>(
        `/products-new/${productId}`,
      );
      setSelectedProduct(res.data);
      return res.data;
    } catch {
      toast.error("Error al cargar producto");
      return null;
    } finally {
      setLoadingProduct(false);
    }
  }, []);

  const clearProduct = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  // ── Update product (upsert) ───────────────────────────────────────────────────

  const updateProduct = useCallback(
    async (dto: CreateProductsNewDto): Promise<boolean> => {
      setSaving(true);
      try {
        const res = await telarApi.post<ProductResponse>("/products-new", dto);
        setSelectedProduct(res.data);
        setProducts((prev) =>
          prev.map((p) => (p.id === res.data.id ? res.data : p)),
        );
        toast.success("Producto actualizado");
        return true;
      } catch {
        toast.error("Error al actualizar producto");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  // ── Create product (en nombre de la tienda seleccionada) ─────────────────────

  const createProduct = useCallback(
    async (dto: CreateProductsNewDto): Promise<boolean> => {
      setSaving(true);
      try {
        // Mismo endpoint upsert que updateProduct, pero sin productId → inserta.
        const res = await telarApi.post<ProductResponse>("/products-new", {
          ...dto,
          productId: undefined,
        });
        // La respuesta del POST es más pobre que el detalle: re-leer para que la
        // ficha (wizard + readiness) reciba el producto completo.
        const created = res.data?.id
          ? (
              await telarApi.get<ProductResponse>(
                `/products-new/${res.data.id}`,
              )
            ).data
          : res.data;
        setProducts((prev) => [created, ...prev]);
        setSelectedProduct(created);
        toast.success("Producto creado");
        return true;
      } catch {
        toast.error("Error al crear producto");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  // ── Duplicate product (silent copy, remains in listing) ──────────────────────

  const duplicateProduct = useCallback(
    async (product: ProductResponse): Promise<boolean> => {
      if (duplicatingId) return false;
      setDuplicatingId(product.id);
      try {
        const dto = buildDuplicatePayload(product);
        const res = await telarApi.post<ProductResponse>("/products-new", dto);
        // Re-lee el detalle: la respuesta del POST es más pobre que el detalle.
        // Fallback a res.data si el GET falla.
        let created: ProductResponse = res.data;
        if (res.data?.id) {
          try {
            const detail = await telarApi.get<ProductResponse>(
              `/products-new/${res.data.id}`,
            );
            created = detail.data;
          } catch {
            // Fallback silencioso a res.data
          }
        }
        setProducts((prev) => [created, ...prev]);
        toast.success("Producto duplicado");
        return true;
      } catch (err: any) {
        console.error("[duplicateProduct] Error:", err);
        console.error("[duplicateProduct] Response:", err?.response?.data);
        console.error("[duplicateProduct] Status:", err?.response?.status);
        const backendMsg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Error desconocido";
        toast.error(
          `Error al duplicar producto: ${Array.isArray(backendMsg) ? backendMsg.join(", ") : backendMsg}`,
        );
        return false;
      } finally {
        setDuplicatingId(null);
      }
    },
    [duplicatingId],
  );

  // ── Moderate product ─────────────────────────────────────────────────────────

  const moderateProductAction = useCallback(
    async (
      productId: string,
      action: ModerationAction,
      comment?: string,
      edits?: Record<string, unknown>,
    ): Promise<boolean> => {
      setModerating(true);
      try {
        const previousStatus = selectedProduct?.status;
        await moderateProduct(
          productId,
          action,
          comment,
          edits,
          undefined,
          previousStatus,
        );

        const actionLabels: Record<ModerationAction, string> = {
          approve: "Producto aprobado",
          approve_with_edits: "Aprobado con ajustes",
          request_changes: "Se solicitaron cambios al artesano",
          reject: "Producto rechazado",
        };
        toast.success(actionLabels[action]);

        // Refresh selected product
        const updated = await telarApi.get<ProductResponse>(
          `/products-new/${productId}`,
        );
        setSelectedProduct(updated.data);
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? updated.data : p)),
        );
        return true;
      } catch {
        toast.error("Error al moderar producto");
        return false;
      } finally {
        setModerating(false);
      }
    },
    [selectedProduct],
  );

  // ── Load taxonomy ────────────────────────────────────────────────────────────

  const loadTaxonomy = useCallback(async () => {
    if (taxonomyLoaded) return;
    try {
      setTaxonomy(await fetchStudioTaxonomy());
      setTaxonomyLoaded(true);
    } catch {
      // Non-fatal — tabs degrade gracefully
    }
  }, [taxonomyLoaded]);

  // ── Product counts by status (computed from loaded products) ─────────────────

  const productCounts = {
    total: products.length,
    pending: products.filter((p) => p.status === "pending_moderation").length,
    approved: products.filter(
      (p) => p.status === "approved" || p.status === "approved_with_edits",
    ).length,
    changes_requested: products.filter((p) => p.status === "changes_requested")
      .length,
    rejected: products.filter((p) => p.status === "rejected").length,
    draft: products.filter((p) => p.status === "draft").length,
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
    createProduct,
    duplicatingId,
    duplicateProduct,
    moderating,
    moderateProductAction,

    // Taxonomy
    taxonomy,
    loadTaxonomy,
  };
};
