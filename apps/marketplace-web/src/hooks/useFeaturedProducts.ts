/**
 * useFeaturedProducts Hook
 * Fetches featured products (isFeatured = true) via React Query.
 * Multiple pages share the cached result automatically.
 */

import { useQuery } from '@tanstack/react-query';
import { getFeaturedProductsNew, type ProductFeatured } from '@/services/products-new.actions';

export function useFeaturedProducts() {
  return useQuery<ProductFeatured[]>({
    queryKey: ['products-new', 'featured'],
    queryFn: getFeaturedProductsNew,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/** Get a featured product image by index (wraps around if index > length) */
export function getFeaturedImage(
  products: ProductFeatured[] | undefined,
  index: number = 0,
): string | null {
  if (!products || products.length === 0) return null;
  const product = products[index % products.length];
  return product.imageUrl || product.images?.[0] || null;
}

/** Get featured products filtered by technique name */
export function getFeaturedByTechnique(
  products: ProductFeatured[] | undefined,
  techniqueName: string,
): ProductFeatured[] {
  if (!products || !techniqueName) return [];
  const normalized = techniqueName.toLowerCase();
  return products.filter(
    (p) => p.primaryTechnique?.toLowerCase().includes(normalized),
  );
}
