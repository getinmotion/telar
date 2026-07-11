/**
 * Products Service — NOW backed by /products-new (shop.products_core)
 *
 * Maps ProductNewCore → legacy Product type so every existing component
 * (ProductCard, ProductDetail, FilterSidebar, etc.) keeps working unchanged.
 */

import { telarApiPublic, telarApi } from '@/integrations/api/telarApi';
import type {
  Product,
  MarketplaceVariant,
  ProductBadge,
  ProductMaterialDetail,
  ProductsResponse,
  ProductsFilters,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types/products.types';
import type {
  ProductNewCore,
  ProductsNewPaginatedResponse,
} from './products-new.actions';
import {
  getPrimaryImageUrl,
  getAllImageUrls,
  getProductPrice,
  getProductPriceMax,
  getProductStock,
  getMaterialNames,
  getCraftName,
  getTechniqueName,
  variantPriceInPesos,
} from './products-new.actions';

// ── Mapper: ProductNewCore → legacy Product ─────────────

function mapNewToLegacy(p: ProductNewCore): Product {
  const price = getProductPrice(p);
  const priceMax = getProductPriceMax(p);
  const stock = getProductStock(p);

  // Variantes normalizadas: precio ABSOLUTO en pesos por variante
  const variants: MarketplaceVariant[] = (p.variants ?? []).map(v => ({
    id: v.id,
    sku: v.sku,
    variantName: v.variantName ?? v.name ?? null,
    optionValues: v.optionValues ?? {},
    price: variantPriceInPesos(v) ?? 0,
    stock: v.stockQuantity ?? v.stock ?? 0,
    minStock: v.minStock,
    isActive: v.isActive ?? true,
  }));
  const imageUrl = getPrimaryImageUrl(p);
  const images = getAllImageUrls(p);
  const materialNames = getMaterialNames(p);
  const craft = getCraftName(p);
  const technique = getTechniqueName(p);

  const createdAt = new Date(p.createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const ps = p.physicalSpecs;
  // TypeORM serializes `decimal` columns as strings — coerce to number.
  const toNum = (v: unknown): number | undefined => {
    if (v == null) return undefined;
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const psWidth = toNum(ps?.widthCm);
  const psHeight = toNum(ps?.heightCm);
  const psLength = toNum(ps?.lengthOrDiameterCm);
  const psWeight = toNum(ps?.realWeightKg);
  const hasAnyDimension = !!(psWidth || psHeight || psLength);

  return {
    id: p.id,
    name: p.name,
    description: p.shortDescription ?? '',
    shortDescription: p.shortDescription ?? '',
    history: p.history ?? null,
    price: price != null ? String(price) : '0',
    priceMax: priceMax ?? undefined,
    imageUrl,
    images,
    variants,

    // Calculated
    stock,
    inventory: stock,
    rating: 0,
    reviewsCount: 0,
    isNew: createdAt > thirtyDaysAgo,
    freeShipping: false,
    canPurchase: stock > 0,

    // Metadata
    tags: [],
    materials: materialNames,
    techniques: technique ? [technique] : [],
    category: p.category?.name ?? '',
    craft: craft,
    material: materialNames[0] ?? null,

    // Physical specs — only include when real values exist
    dimensions: hasAnyDimension
      ? { width: psWidth, height: psHeight, length: psLength }
      : undefined,
    weight: psWeight !== undefined ? String(psWeight) : undefined,
    productionTime: p.artisanalIdentity?.estimatedElaborationTime ?? null,
    leadTimeDays: p.production?.productionTime
      ? parseInt(p.production.productionTime) || undefined
      : undefined,

    // Shop
    shopId: p.storeId,
    storeName: p.artisanShop?.shopName ?? '',
    storeSlug: p.artisanShop?.shopSlug ?? '',
    logoUrl: p.artisanShop?.logoUrl ?? undefined,
    bannerUrl: p.artisanShop?.bannerUrl ?? undefined,
    storeDescription: undefined,
    region: p.artisanShop?.department ?? undefined,
    city: p.artisanShop?.municipality ?? undefined,
    department: p.artisanShop?.department ?? undefined,
    craftType: craft ?? undefined,
    bankDataStatus: undefined,

    // Shop object for components that read product.shop
    shop: p.artisanShop
      ? {
          id: p.artisanShop.id,
          userId: p.artisanShop.userId ?? '',
          shopName: p.artisanShop.shopName,
          shopSlug: p.artisanShop.shopSlug,
          description: undefined,
          department: p.artisanShop.department,
          municipality: p.artisanShop.municipality,
          active: true,
          featured: false,
        }
      : undefined,

    // Dates
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),

    // New architecture fields
    careNotes: p.careNotes ?? null,

    allowsLocalPickup: false,
    shippingDataComplete: false,
  };
}

// ── Mapper: GET /products-new/marketplace/:id → legacy Product ─────────────

/**
 * Shape del response de GET /products-new/marketplace/:id
 * (getMarketplaceProductById en el API: precios ya en pesos, relaciones aplanadas).
 */
interface MarketplaceDetailResponse {
  id: string;
  name: string;
  shortDescription?: string | null;
  history?: string | null;
  careNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  isNew?: boolean;
  categoryId?: string;
  categoryName?: string;
  artisanalIdentity?: {
    primaryCraft?: string | null;
    primaryTechnique?: string | null;
    secondaryTechnique?: string | null;
    curatorialCategory?: string | null;
    pieceType?: string | null;
    style?: string | null;
    processType?: string | null;
    estimatedElaborationTime?: string | null;
    isCollaboration?: boolean;
    collaborationName?: string | null;
  };
  physicalSpecs?: {
    heightCm?: number | string | null;
    widthCm?: number | string | null;
    lengthOrDiameterCm?: number | string | null;
    realWeightKg?: number | string | null;
  };
  production?: {
    availabilityType?: string | null;
    productionTimeDays?: number | null;
    monthlyCapacity?: number | null;
    requirementsToStart?: string | null;
    processDescription?: string | null;
    processEvidenceUrls?: string[] | null;
  };
  price: number;
  priceMax?: number;
  stock: number;
  variants?: Array<{
    id: string;
    sku?: string;
    variantName?: string | null;
    optionValues?: Record<string, string>;
    price: number;
    stock?: number;
    minStock?: number;
    isActive?: boolean;
  }>;
  images?: string[];
  materials?: ProductMaterialDetail[];
  badges?: ProductBadge[];
  shop?: {
    id: string;
    name?: string;
    slug?: string;
    logoUrl?: string;
    bannerUrl?: string;
    description?: string;
    region?: string;
    department?: string;
    municipality?: string;
    craftType?: string;
    bankDataStatus?: string;
  };
  canPurchase?: boolean;
}

function mapMarketplaceDetailToProduct(p: MarketplaceDetailResponse): Product {
  const toNum = (v: unknown): number | undefined => {
    if (v == null) return undefined;
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  const variants: MarketplaceVariant[] = (p.variants ?? []).map(v => ({
    id: v.id,
    sku: v.sku,
    variantName: v.variantName ?? null,
    optionValues: v.optionValues ?? {},
    price: v.price ?? 0,
    stock: v.stock ?? 0,
    minStock: v.minStock,
    isActive: v.isActive ?? true,
  }));

  const identity = p.artisanalIdentity;
  const materials = p.materials ?? [];
  const materialNames = materials.map(m => m.name).filter(Boolean);
  const techniques = [identity?.primaryTechnique, identity?.secondaryTechnique]
    .filter((t): t is string => !!t);

  const psWidth = toNum(p.physicalSpecs?.widthCm);
  const psHeight = toNum(p.physicalSpecs?.heightCm);
  const psLength = toNum(p.physicalSpecs?.lengthOrDiameterCm);
  const psWeight = toNum(p.physicalSpecs?.realWeightKg);

  const createdAt = new Date(p.createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return {
    id: p.id,
    name: p.name,
    description: p.shortDescription ?? '',
    shortDescription: p.shortDescription ?? '',
    history: p.history ?? null,
    price: p.price != null ? String(p.price) : '0',
    priceMax: p.priceMax ?? undefined,
    imageUrl: p.images?.[0] ?? null,
    images: p.images ?? [],
    variants,

    // Calculated (canPurchase ya considera datos bancarios + stock en el API)
    stock: p.stock ?? 0,
    inventory: p.stock ?? 0,
    rating: 0,
    reviewsCount: 0,
    isNew: p.isNew ?? createdAt > thirtyDaysAgo,
    freeShipping: false,
    canPurchase: p.canPurchase ?? false,

    // Metadata
    tags: [],
    materials: materialNames,
    techniques,
    category: p.categoryName ?? '',
    craft: identity?.primaryCraft ?? null,
    material: materialNames[0] ?? null,

    dimensions: psWidth || psHeight || psLength
      ? { width: psWidth, height: psHeight, length: psLength }
      : undefined,
    weight: psWeight !== undefined ? String(psWeight) : undefined,
    productionTime: identity?.estimatedElaborationTime ?? null,
    leadTimeDays: p.production?.productionTimeDays ?? undefined,

    // Shop
    shopId: p.shop?.id ?? '',
    storeName: p.shop?.name ?? '',
    storeSlug: p.shop?.slug ?? '',
    logoUrl: p.shop?.logoUrl,
    bannerUrl: p.shop?.bannerUrl,
    storeDescription: p.shop?.description,
    region: p.shop?.region ?? p.shop?.department,
    city: p.shop?.municipality,
    department: p.shop?.department,
    craftType: p.shop?.craftType ?? identity?.primaryCraft ?? undefined,
    bankDataStatus: p.shop?.bankDataStatus,

    shop: p.shop
      ? {
          id: p.shop.id,
          userId: '',
          shopName: p.shop.name ?? '',
          shopSlug: p.shop.slug ?? '',
          description: p.shop.description,
          department: p.shop.department,
          municipality: p.shop.municipality,
          active: true,
          featured: false,
        }
      : undefined,

    createdAt,
    updatedAt: new Date(p.updatedAt),

    careNotes: p.careNotes ?? null,

    // Detalle marketplace
    processDescription: p.production?.processDescription ?? null,
    processEvidenceUrls: p.production?.processEvidenceUrls ?? undefined,
    availabilityType: p.production?.availabilityType ?? null,
    secondaryTechnique: identity?.secondaryTechnique ?? null,
    badges: p.badges ?? [],
    isCollaboration: identity?.isCollaboration ?? false,
    collaborationName: identity?.collaborationName ?? null,
    monthlyCapacity: p.production?.monthlyCapacity ?? null,
    materialsDetailed: materials,

    allowsLocalPickup: false,
    shippingDataComplete: false,
  };
}

// ── API Calls — now consuming /products-new ─────────────

/**
 * Obtener productos paginados con filtros.
 * Calls GET /products-new and maps results to legacy Product type.
 */
export const getProducts = async (
  filters?: ProductsFilters
): Promise<ProductsResponse> => {
  const params: Record<string, any> = {};
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;
  if (filters?.categoryId) params.categoryId = filters.categoryId;
  if (filters?.storeId) params.storeId = filters.storeId;
  // Backend /products-new currently supports: page, limit, storeId, categoryId, status

  const response = await telarApiPublic.get<ProductsNewPaginatedResponse>(
    '/products-new',
    { params },
  );
  const raw = response.data;

  return {
    data: (raw.data ?? []).map(mapNewToLegacy),
    total: raw.total ?? 0,
    page: raw.page ?? 1,
    limit: raw.limit ?? 20,
  };
};

/**
 * Obtener detalle de un producto por ID.
 * Usa GET /products-new/marketplace/:id — solo devuelve productos aprobados de
 * tiendas publicadas, con canPurchase calculado (banco + stock) y la identidad
 * artesanal/producción completas. Si el ID es un legacyProductId, cae al
 * endpoint legacy.
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await telarApiPublic.get<MarketplaceDetailResponse>(
      `/products-new/marketplace/${id}`,
    );
    return mapMarketplaceDetailToProduct(response.data);
  } catch (err: any) {
    // If not found by primary ID, try legacy endpoint
    if (err?.response?.status === 404 || err?.response?.status === 400) {
      const fallback = await telarApiPublic.get<ProductNewCore>(
        `/products-new/legacy/${id}`,
      );
      return mapNewToLegacy(fallback.data);
    }
    throw err;
  }
};

/**
 * Obtener productos activos
 */
export const getActiveProducts = async (): Promise<ProductsResponse> => {
  return getProducts({ page: 1, limit: 50 });
};

/**
 * Obtener productos destacados (no hay endpoint featured en products-new,
 * so we return latest products for now)
 */
export const getFeaturedProducts = async (): Promise<Product[]> => {
  const res = await getProducts({ page: 1, limit: 20 });
  return res.data;
};

/**
 * Obtener productos de una tienda por storeId
 */
export const getProductsByShop = async (
  shopId: string,
): Promise<Product[]> => {
  const response = await telarApiPublic.get<ProductNewCore[]>(
    `/products-new/store/${shopId}`,
  );
  return (response.data ?? []).map(mapNewToLegacy);
};

/**
 * Obtener productos de un usuario (por ahora usa getProducts genérico)
 */
export const getProductsByUser = async (
  userId: string,
): Promise<Product[]> => {
  // products-new doesn't have a user endpoint yet — return empty
  return [];
};

// ── Write operations (still hit old endpoints until products-new supports them) ──

export const createProduct = async (
  data: CreateProductRequest,
): Promise<Product> => {
  const response = await telarApi.post<Product>('/products', data);
  return response.data;
};

export const updateProduct = async (
  id: string,
  data: UpdateProductRequest,
): Promise<Product> => {
  const response = await telarApi.patch<Product>(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await telarApi.delete<{ message: string }>(
    `/products/${id}`,
  );
  return response.data;
};
