/**
 * Store Types - Nueva arquitectura normalizada
 *
 * Estos tipos mapean la nueva estructura shop.stores del backend NestJS
 * que reemplaza gradualmente la tabla legacy public.artisan_shops.
 *
 * Arquitectura:
 * - shop.stores (principal)
 * - shop.store_contacts (1:1)
 * - shop.store_awards (1:N)
 * - shop.store_badges (1:N)
 * - public.artisan_shops (LEGACY - accesible via legacyId)
 */

// ============= Core Store Types =============

export interface Store {
  id: string;
  userId: string;
  name: string;
  slug: string;
  story?: string;
  legacyId?: string; // UUID que apunta a public.artisan_shops
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

// ============= Related Entities =============

export interface StoreContacts {
  email?: string;
  phone?: string;
  whatsapp?: string;
  addressLine?: string;
  department?: string;
  municipality?: string;
}

export interface StoreAward {
  id: string;
  title: string;
  year?: number;
  issuer?: string;
}

export interface StoreBadge {
  id: string;
  badgeId: string;
  awardedAt: string;
  validUntil?: string;
}

// ============= Legacy Data Structure =============

export interface LegacyShopData {
  // Identificación
  id: string;
  userId: string;
  shopName: string;
  shopSlug: string;

  // Información básica
  description?: string;
  story?: string;
  logoUrl?: string;
  bannerUrl?: string;
  craftType?: string;
  region?: string;

  // Arrays y objetos
  certifications: any[];
  contactInfo: Record<string, any>;
  socialLinks: Record<string, any>;

  // Estados
  active: boolean;
  featured: boolean;
  marketplaceApproved: boolean;
  publishStatus: string;

  // SEO y clasificación
  seoData: Record<string, any>;
  privacyLevel?: string;
  dataClassification: Record<string, any>;
  publicProfile?: Record<string, any>;

  // Creación y progreso
  creationStatus?: string;
  creationStep?: number;

  // Branding
  primaryColors: any[];
  secondaryColors: any[];
  brandClaim?: string;

  // Configuraciones JSONB
  heroConfig: Record<string, any>;
  aboutContent: Record<string, any>;
  contactConfig: Record<string, any>;

  // Theme y aprobación
  activeThemeId?: string;
  marketplaceApprovedAt?: string;
  marketplaceApprovedBy?: string;

  // Banking y perfil
  idContraparty?: string;
  artisanProfile?: Record<string, any>;
  artisanProfileCompleted?: boolean;
  bankDataStatus?: string;
  marketplaceApprovalStatus?: string;

  // Ubicación
  department?: string;
  municipality?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============= Combined Response =============

/**
 * Respuesta combinada del backend que incluye:
 * - Datos de shop.stores (nuevos)
 * - Relaciones normalizadas (contacts, awards, badges)
 * - Datos legacy de public.artisan_shops (si existe legacyId)
 */
export interface StoreResponse {
  // Datos principales de shop.stores
  id: string;
  userId: string;
  name: string;
  slug: string;
  story?: string;
  legacyId?: string;
  createdAt: string;
  updatedAt?: string;

  // Relaciones normalizadas
  contacts?: StoreContacts;
  awards?: StoreAward[];
  badges?: StoreBadge[];

  // Datos legacy (puede venir como 'legacy' o 'legacyShop' según backend)
  legacy?: LegacyShopData;
  legacyShop?: LegacyShopData;
}
