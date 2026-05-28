/**
 * Artisan Shops Types
 * Tipos para el módulo de tiendas artesanales del marketplace
 */

/**
 * Bloque editable "Acerca de" del taller (proviene de artisan_shops.about_content jsonb).
 * Refleja la estructura que persiste el backend en NestJS.
 */
export interface ArtisanShopAboutContent {
  title?: string;
  story?: string;
  mission?: string;
  vision?: string;
  values?: string[];
}

/**
 * Tienda artesanal individual.
 *
 * Mantenido alineado con la entidad ArtisanShop del API NestJS
 * (apps/api/src/resources/artisan-shops/entities/artisan-shop.entity.ts).
 * Solo se incluyen los campos públicos que el marketplace puede consumir.
 */
export interface ArtisanShop {
  id: string;
  userId: string;
  shopName: string;
  shopSlug: string;
  description?: string;
  story?: string;
  logoUrl?: string;
  bannerUrl?: string;
  craftType?: string;
  region?: string;
  department?: string;
  municipality?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
  };
  /** Redes sociales (artisan_shops.social_links jsonb) */
  socialLinks?: Record<string, string>;
  /** Eslogan/claim de la marca (artisan_shops.brand_claim) */
  brandClaim?: string;
  /** Certificaciones (artisan_shops.certifications jsonb) */
  certifications?: string[];
  /** Bloque editorial completo (artisan_shops.about_content jsonb) */
  aboutContent?: ArtisanShopAboutContent;
  /** Perfil libre del artesano (artisan_shops.artisan_profile jsonb) */
  artisanProfile?: Record<string, unknown>;
  active: boolean;
  featured: boolean;
  publishStatus: 'draft' | 'published' | 'archived';
  marketplaceApproved: boolean;
  servientregaCoverage?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Filtros para la búsqueda de tiendas
 * Query params para GET /artisan-shops
 */
export interface ArtisanShopsFilters {
  // Paginación
  page?: number;
  limit?: number;

  // Filtros booleanos
  active?: boolean;
  publishStatus?: 'draft' | 'published' | 'archived';
  marketplaceApproved?: boolean;
  featured?: boolean;
  hasApprovedProducts?: boolean;

  // Filtros de texto
  shopSlug?: string;
  region?: string;
  craftType?: string;
  department?: string;
  municipality?: string;

  // Búsqueda
  q?: string;

  // Ordenamiento
  sortBy?: 'created_at' | 'shop_name' | 'updated_at';
  order?: 'ASC' | 'DESC';
}

/**
 * Response paginado de tiendas
 * Response de GET /artisan-shops
 */
export interface ArtisanShopsResponse {
  data: ArtisanShop[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Request para crear una tienda (admin/artisan)
 */
export interface CreateArtisanShopRequest {
  shopName: string;
  shopSlug: string;
  description?: string;
  story?: string;
  logoUrl?: string;
  bannerUrl?: string;
  craftType?: string;
  region?: string;
  department?: string;
  municipality?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
  };
  featured?: boolean;
  publishStatus?: 'draft' | 'published' | 'archived';
}

/**
 * Request para actualizar una tienda
 */
export interface UpdateArtisanShopRequest extends Partial<CreateArtisanShopRequest> {}
