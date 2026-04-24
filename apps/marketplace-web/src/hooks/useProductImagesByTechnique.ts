/**
 * useProductImagesByTechnique
 * Fetches a batch of products and builds a map:  technique-name → first valid image URL.
 * Rewrites CDN URLs to S3 when the CDN host is unreachable (local dev).
 */

import { useQuery } from '@tanstack/react-query';
import { getProductsNew } from '@/services/products-new.actions';

const CDN_HOST = 'https://cdn.telar.co/';
const S3_HOST =
  'https://telar-prod-bucket.s3.us-east-1.amazonaws.com/';

/**
 * Rewrite CDN URLs to direct S3 URLs.
 * In local dev, cdn.telar.co doesn't resolve, but the S3 bucket does.
 * The file keys (including double extensions) are preserved because
 * they ARE the actual S3 object keys.
 */
export function sanitizeImageUrl(url: string): string {
  if (url.startsWith(CDN_HOST)) {
    return url.replace(CDN_HOST, S3_HOST);
  }
  return url;
}

export function useProductImagesByTechnique() {
  return useQuery<Record<string, string>>({
    queryKey: ['products-new', 'images-by-technique'],
    queryFn: async () => {
      const res = await getProductsNew({ page: 1, limit: 500 });
      const map: Record<string, string> = {};

      for (const p of res.data) {
        const techName = p.artisanalIdentity?.primaryTechnique?.name;
        if (!techName || map[techName]) continue; // first image per technique wins

        const media =
          p.media?.find((m) => m.isPrimary) || p.media?.[0];
        if (media?.mediaUrl) {
          map[techName] = sanitizeImageUrl(media.mediaUrl);
        }
      }
      return map;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/** Convenience: lowercase lookup so "Tejido Plano" matches editorial key "tejido plano" */
export function getTechniqueImage(
  map: Record<string, string> | undefined,
  techniqueName: string,
): string | null {
  if (!map || !techniqueName) return null;
  // Try exact match first, then case-insensitive
  if (map[techniqueName]) return map[techniqueName];
  const lower = techniqueName.toLowerCase();
  for (const [key, url] of Object.entries(map)) {
    if (key.toLowerCase() === lower) return url;
  }
  return null;
}
