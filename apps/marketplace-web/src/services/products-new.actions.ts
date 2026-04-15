/**
 * Products New Service
 * Consume los endpoints de /products-new del backend NestJS
 * Estos son los productos con la nueva arquitectura multi-capa
 */

import { telarApiPublic } from '@/integrations/api/telarApi';

// ── Types matching backend entities ───────────────────

export interface ProductMedia {
  id: string;
  mediaUrl: string;
  mediaType: string; // 'image' | 'video'
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductMaterialLink {
  id: string;
  isPrimary: boolean;
  materialOrigin?: string;
  material: {
    id: string;
    name: string;
    isOrganic: boolean;
    isSustainable: boolean;
  };
}

export interface ProductBadgeLink {
  id: string;
  awardedAt?: string;
  badge: {
    id: string;
    code: string;
    name: string;
    description: string;
    iconUrl?: string;
  };
}

export interface ProductVariant {
  id: string;
  sku?: string;
  basePriceMinor?: number | string; // bigint from DB — price in COP cents
  currency?: string;
  stockQuantity?: number;
  isActive?: boolean;
  // Legacy aliases (in case backend ever sends these)
  name?: string;
  price?: number;
  stock?: number;
}

export interface ProductArtisanalIdentity {
  id: string;
  pieceType?: string;
  style?: string;
  isCollaboration?: boolean;
  processType?: string;
  estimatedElaborationTime?: string;
  primaryCraft?: { id: string; name: string };
  primaryTechnique?: { id: string; name: string };
  secondaryTechnique?: { id: string; name: string } | null;
  curatorialCategory?: { id: string; name: string; description: string } | null;
}

export interface ProductPhysicalSpecs {
  id: string;
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
}

export interface ProductProduction {
  id: string;
  productionTime?: string;
  batchSize?: number;
  productionYear?: number;
}

export interface ProductNewCore {
  id: string;
  storeId: string;
  categoryId: string;
  legacyProductId?: string;
  name: string;
  shortDescription?: string;
  history?: string;
  careNotes?: string;
  status: string; // 'draft' | 'published' | 'archived'
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  // Relations
  artisanShop?: {
    id: string;
    shopName: string;
    shopSlug: string;
    department?: string;
    municipality?: string;
    logoUrl?: string;
    bannerUrl?: string;
    userId?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    parentId?: string;
  };
  artisanalIdentity?: ProductArtisanalIdentity;
  physicalSpecs?: ProductPhysicalSpecs;
  logistics?: any;
  production?: ProductProduction;
  media: ProductMedia[];
  badges: ProductBadgeLink[];
  materials: ProductMaterialLink[];
  variants: ProductVariant[];
}

export interface ProductsNewPaginatedResponse {
  data: ProductNewCore[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Featured products endpoint returns a flattened structure
export interface ProductFeatured {
  id: string;
  name: string;
  shortDescription: string;
  history?: string;
  careNotes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  isNew: boolean;

  // Category info (flattened)
  categoryId: string;
  categoryName: string;

  // Artisanal identity (flattened)
  craftName?: string;
  primaryTechnique?: string;
  pieceType?: string;
  style?: string;

  // Physical specs (flattened)
  height?: string;
  width?: string;
  length?: string;
  weight?: string;

  // Logistics (flattened)
  availabilityType?: string;
  productionTimeDays?: number;

  // Pricing (flattened from variant)
  price: number;
  currency: string;
  stock: number;

  // Media (flattened)
  images: string[];
  imageUrl: string;

  // Materials (flattened)
  materials: string[];

  // Shop info (flattened)
  shopId: string;
  storeName: string;
  storeSlug: string;
  logoUrl?: string;
  bannerUrl?: string;
  storeDescription?: string;
  region?: string;
  department?: string;
  municipality?: string;
  craftType?: string;

  // Purchase capability
  bankDataStatus?: string;
  canPurchase: boolean;
}

// ── API Calls ─────────────────────────────────────────

/** GET /products-new — all products (with optional filters) */
export const getProductsNew = async (params?: {
  page?: number;
  limit?: number;
  storeId?: string;
  categoryId?: string;
  status?: string;
}): Promise<ProductsNewPaginatedResponse> => {
  const response = await telarApiPublic.get<ProductsNewPaginatedResponse>('/products-new', {
    params,
  });
  return response.data;
};

/** GET /products-new/:id — single product with all layers */
export const getProductNewById = async (id: string): Promise<ProductNewCore> => {
  const response = await telarApiPublic.get<ProductNewCore>(`/products-new/${id}`);
  return response.data;
};

/** GET /products-new/category/:categoryId — products by category */
export const getProductsByCategory = async (categoryId: string): Promise<ProductNewCore[]> => {
  const response = await telarApiPublic.get<ProductNewCore[]>(`/products-new/category/${categoryId}`);
  return response.data;
};

/** GET /products-new/store/:storeId — products by store */
export const getProductsByStore = async (storeId: string): Promise<ProductNewCore[]> => {
  const response = await telarApiPublic.get<ProductNewCore[]>(`/products-new/marketplace/store/${storeId}`);
  return response.data;
};

/** GET /products-new/marketplace/featured — featured products (isFeatured = true) */
export const getFeaturedProductsNew = async (): Promise<ProductFeatured[]> => {
  const response = await telarApiPublic.get<ProductFeatured[]>('/products-new/marketplace/featured');
  return response.data;
};

// ── Helpers ───────────────────────────────────────────

/** Get primary image URL from a product's media array */
export function getPrimaryImageUrl(product: ProductNewCore): string | null {
  const primary = product.media?.find(m => m.isPrimary);
  if (primary) return primary.mediaUrl;
  console.log(primary)
  console.log(product.media)
  const first = product.media?.[0];
  return first?.mediaUrl ?? null;
}

/** Get all image URLs sorted by display order */
export function getAllImageUrls(product: ProductNewCore): string[] {
  return (product.media ?? [])
    .filter(m => m.mediaType === 'image')
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(m => m.mediaUrl);
}

/** Get the price from variants (first variant or min price).
 *  basePriceMinor is bigint in DB — comes as string from Postgres.
 *  The column stores COP cents, so we divide by 100 to get COP pesos.
 *  If the result seems too small (< 100), we assume the value was already in pesos. */
export function getProductPrice(product: ProductNewCore): number | null {
  const variants = product.variants ?? [];
  if (variants.length === 0) return null;

  const prices = variants
    .map(v => {
      if (v.basePriceMinor != null) {
        const raw = typeof v.basePriceMinor === 'string'
          ? parseInt(v.basePriceMinor, 10)
          : Number(v.basePriceMinor);
        if (!isNaN(raw) && raw > 0) {
          const asPesos = raw / 100;
          // Sanity: COP artisan products are typically ≥ $1,000. If dividing
          // gives < 100, the value was likely stored in pesos, not cents.
          return asPesos >= 100 ? asPesos : raw;
        }
      }
      return v.price ?? null;
    })
    .filter((p): p is number => p != null && p > 0);

  if (prices.length === 0) return null;
  return Math.min(...prices);
}

/** Get total stock from variants */
export function getProductStock(product: ProductNewCore): number {
  return (product.variants ?? [])
    .reduce((sum, v) => sum + (v.stockQuantity ?? v.stock ?? 0), 0);
}

/** Get material names from product */
export function getMaterialNames(product: ProductNewCore): string[] {
  return (product.materials ?? [])
    .map(m => m.material?.name)
    .filter(Boolean) as string[];
}

/** Get primary craft name */
export function getCraftName(product: ProductNewCore): string | null {
  return product.artisanalIdentity?.primaryCraft?.name ?? null;
}

/** Get primary technique name */
export function getTechniqueName(product: ProductNewCore): string | null {
  return product.artisanalIdentity?.primaryTechnique?.name ?? null;
}
