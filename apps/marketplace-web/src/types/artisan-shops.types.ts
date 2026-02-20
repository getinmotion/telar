/**
 * Artisan Shops Types
 * Tipos para el módulo de tiendas artesanales del marketplace
 */

/**
 * Tienda artesanal individual
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
