/**
 * URLs Configuration
 * Centralizes all cross-app links so the destination is always explicit.
 *
 * Override via env vars in .env.local (useful for network testing with a real IP):
 *   VITE_MARKETPLACE_BASE_URL=http://192.168.1.x:8081
 *   VITE_APP_STORE_BASE_URL=http://192.168.1.x:8080
 */

export const MARKETPLACE_BASE_URL: string =
  (import.meta.env.VITE_MARKETPLACE_BASE_URL as string) ??
  (import.meta.env.PROD ? 'https://telar.co' : 'http://localhost:8081');

export const APP_STORE_BASE_URL: string =
  (import.meta.env.VITE_APP_STORE_BASE_URL as string) ??
  (import.meta.env.PROD ? 'https://app.telar.co' : 'http://localhost:8080');

// Hostname strings for display-only UI (e.g. "telar.co/tienda/mi-tienda")
export const MARKETPLACE_DOMAIN = new URL(MARKETPLACE_BASE_URL).hostname;
export const APP_STORE_DOMAIN = new URL(APP_STORE_BASE_URL).hostname;

// ─── Semantic store URL builders ─────────────────────────────────────────────

/** Opens the artisan's listing inside the TELAR marketplace. */
export const buildMarketplaceStoreUrl = (slug: string) =>
  `${MARKETPLACE_BASE_URL}/tienda/${slug}`;

/** Opens the artisan's own branded e-commerce store. */
export const buildAppStoreUrl = (slug: string) =>
  `${APP_STORE_BASE_URL}/tienda/${slug}`;

// ─── Generic helpers (kept for any path that isn't a /tienda/ route) ─────────

export const getLandingUrl = (path = '') => `${MARKETPLACE_BASE_URL}${path}`;
export const getAppUrl = (path = '') => `${APP_STORE_BASE_URL}${path}`;
