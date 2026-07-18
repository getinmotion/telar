/**
 * Artisan Shops Types
 * Tipos para el módulo de tiendas artesanales del marketplace
 */
import type { ArtisanProfileDisplayData } from './artisanProfile.types';

/**
 * Bloque editable "Acerca de" del taller (proviene de artisan_shops.about_content jsonb).
 * Refleja la estructura que persiste el backend en NestJS.
 */
/** Valor de marca: puede venir como string simple o como {name, description} */
export type ArtisanShopValue = string | { name?: string; description?: string };

export interface ArtisanShopAboutContent {
  title?: string;
  story?: string;
  mission?: string;
  vision?: string;
  values?: ArtisanShopValue[];
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
  /** Contacto extendido del taller (artisan_shops.contact_config jsonb) */
  contactConfig?: {
    email?: string;
    hours?: string;
    suggestedHours?: string;
    phone?: string;
    address?: string;
    whatsapp?: string;
    map_embed?: string;
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
  artisanProfile?: ArtisanProfileDisplayData;
  /** FK a store_policies_config (para leer FAQ y política de devoluciones) */
  idPoliciesConfig?: string;
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

  // Agreement
  agreementId?: string;
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
