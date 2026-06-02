/**
 * ArtisanShop Types - Mapeo desde StoreResponse
 *
 * Este tipo representa el formato esperado por componentes que usan
 * datos de tiendas, mapeados desde la nueva arquitectura shop.stores
 */

// ============= Enums =============

export enum PrivacyLevel {
  PUBLIC = 'public',
  LIMITED = 'limited',
  PRIVATE = 'private',
}

export enum CreationStatus {
  DRAFT = 'draft',
  INCOMPLETE = 'incomplete',
  COMPLETE = 'complete',
}

export enum PublishStatus {
  PENDING_PUBLISH = 'pending_publish',
  PUBLISHED = 'published',
}

export enum BankDataStatus {
  NOT_SET = 'not_set',
  PENDING = 'pending',
  APPROVED = 'approved',
}

export enum MarketplaceApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// ============= JSONB Types =============

export interface ContactInfo {
  email?: string;
  phone?: string;
  [key: string]: any;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  [key: string]: any;
}

export interface SeoData {
  title?: string;
  description?: string;
  keywords?: string[];
  [key: string]: any;
}

export interface DataClassification {
  contact?: string;
  analytics?: string;
  strategies?: string;
  [key: string]: any;
}

export interface HeroConfig {
  slides?: any[];
  autoplay?: boolean;
  duration?: number;
  [key: string]: any;
}

export interface AboutContent {
  story?: string;
  title?: string;
  values?: string[]
;
  vision?: string;
  mission?: string;
  [key: string]: any;
}

export interface ContactConfig {
  email?: string;
  hours?: string;
  phone?: string;
  address?: string;
  whatsapp?: string;
  map_embed?: string;
  [key: string]: any;
}

export interface ArtisanProfile {
  [key: string]: any;
}

// ============= Main Entity =============

/**
 * ArtisanShop - Tipo mapeado desde StoreResponse
 *
 * Este tipo combina datos de:
 * - shop.stores (nuevo)
 * - shop.store_contacts
 * - shop.store_artisanal_profile
 * - public.artisan_shops (legacy - si existe legacyId)
 */
export interface ArtisanShop {
  id: string;
  userId: string;
  shopName: string;
  shopSlug: string;
  description: string | null;
  story: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  craftType: string | null;
  region: string | null;
  certifications: string[];
  contactInfo: ContactInfo;
  socialLinks: SocialLinks;
  active: boolean;
  featured: boolean;
  seoData: SeoData;
  createdAt: string;
  updatedAt: string;
  privacyLevel: string | null;
  dataClassification: DataClassification;
  publicProfile: object | null;
  creationStatus: string | null;
  creationStep: number | null;
  primaryColors: string[];
  secondaryColors: string[];
  brandClaim: string | null;
  heroConfig: HeroConfig;
  aboutContent: AboutContent;
  contactConfig: ContactConfig;
  activeThemeId: string | null;
  publishStatus: string | null;
  marketplaceApproved: boolean | null;
  marketplaceApprovedAt: string | null;
  marketplaceApprovedBy: string | null;
  idContraparty: string | null;
  artisanProfile: ArtisanProfile | null;
  artisanProfileCompleted: boolean | null;
  bankDataStatus: string | null;
  marketplaceApprovalStatus: string | null;
  department: string | null;
  municipality: string | null;
}
