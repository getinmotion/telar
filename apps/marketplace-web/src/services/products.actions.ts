/**
 * Products Service — NOW backed by /products-new (shop.products_core)
 *
 * Maps ProductNewCore → legacy Product type so every existing component
 * (ProductCard, ProductDetail, FilterSidebar, etc.) keeps working unchanged.
 */

import { telarApiPublic, telarApi } from '@/integrations/api/telarApi';
import type {
  Product,
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
  getProductStock,
  getMaterialNames,
  getCraftName,
  getTechniqueName,
} from './products-new.actions';

// ── Mapper: ProductNewCore → legacy Product ─────────────

function mapNewToLegacy(p: ProductNewCore): Product {
  const price = getProductPrice(p);
  const stock = getProductStock(p);
  const imageUrl = getPrimaryImageUrl(p);
  const images = getAllImageUrls(p);
  const materialNames = getMaterialNames(p);
  const craft = getCraftName(p);
  const technique = getTechniqueName(p);

  const createdAt = new Date(p.createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const ps = p.physicalSpecs;
  const hasAnyDimension = !!ps && !!(ps.width || ps.height || ps.depth);
  const hasWeight = !!ps && !!ps.weight;

  return {
    id: p.id,
    name: p.name,
    description: p.shortDescription ?? '',
    shortDescription: p.shortDescription ?? '',
    history: p.history ?? null,
    price: price != null ? String(price) : '0',
    imageUrl,
    images,

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
      ? {
          width: ps!.width || undefined,
          height: ps!.height || undefined,
          length: ps!.depth || undefined,
        }
      : undefined,
    weight: hasWeight ? String(ps!.weight) : undefined,
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
 * Tries /products-new/:id first. If the ID is a legacyProductId, falls back to
 * fetching all and searching (until a dedicated endpoint exists).
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await telarApiPublic.get<ProductNewCore>(
      `/products-new/${id}`,
    );
    return mapNewToLegacy(response.data);
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
