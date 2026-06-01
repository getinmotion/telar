/**
 * TypeScript interfaces for Artisan Shops (NestJS Backend)
 *
 * ⚠️ NOTA DE MIGRACIÓN:
 * Estos tipos representan la tabla legacy public.artisan_shops.
 *
 * Para operaciones GET (lectura), el servicio artisanShops.actions ahora usa
 * internamente la nueva arquitectura shop.stores (ver @/types/store.types),
 * pero mapea las respuestas a estos tipos legacy para mantener compatibilidad.
 *
 * Operaciones POST/PATCH/DELETE siguen usando artisan_shops directamente
 * hasta completar la migración completa.
 *
 * Para nuevos desarrollos, considerar usar @/types/store.types
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
  [key: string]: unknown;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  [key: string]: unknown;
}

export interface SeoData {
  title?: string;
  description?: string;
  keywords?: string[];
  [key: string]: unknown;
}

export interface DataClassification {
  contact?: string;
  analytics?: string;
  strategies?: string;
  [key: string]: unknown;
}

export interface HeroConfig {
  slides?: any[];
  autoplay?: boolean;
  duration?: number;
  [key: string]: unknown;
}

export interface AboutContent {
  story?: string;
  title?: string;
  values?: string[];
  vision?: string;
  mission?: string;
  [key: string]: unknown;
}

export interface ContactConfig {
  email?: string;
  hours?: string;
  phone?: string;
  address?: string;
  whatsapp?: string;
  map_embed?: string;
  [key: string]: unknown;
}

export interface PoliciesConfig {
  returnPolicy?: string;
  faq?: { q: string; a: string }[];
  [key: string]: unknown;
}

export interface ArtisanProfile {
  [key: string]: unknown;
}

// ============= Main Entity =============

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
  policiesConfig: PoliciesConfig;
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
  presentationVideo: Record<string, any> | null;
  bioConfig: Record<string, any> | null;
}

// ============= Request Payloads =============

export interface CreateArtisanShopPayload {
  userId: string;
  shopName: string;
  shopSlug: string;
  description?: string;
  story?: string;
  logoUrl?: string;
  bannerUrl?: string;
  craftType?: string;
  region?: string;
  certifications?: string[];
  contactInfo?: ContactInfo;
  socialLinks?: SocialLinks;
  active?: boolean;
  featured?: boolean;
  seoData?: SeoData;
  privacyLevel?: string;
  dataClassification?: DataClassification;
  creationStatus?: string;
  creationStep?: number;
  primaryColors?: string[];
  secondaryColors?: string[];
  brandClaim?: string;
  heroConfig?: HeroConfig;
  aboutContent?: AboutContent;
  contactConfig?: ContactConfig;
  policiesConfig?: PoliciesConfig;
  activeThemeId?: string;
  publishStatus?: string;
  idContraparty?: string;
  artisanProfile?: ArtisanProfile;
  bankDataStatus?: string;
  marketplaceApprovalStatus?: string;
  department?: string;
  municipality?: string;
  presentationVideo?: Record<string, any>;
  bioConfig?: Record<string, any>;
}

export interface UpdateArtisanShopPayload {
  shopName?: string;
  shopSlug?: string;
  description?: string;
  story?: string;
  logoUrl?: string;
  bannerUrl?: string;
  craftType?: string;
  region?: string;
  certifications?: string[];
  contactInfo?: ContactInfo;
  socialLinks?: SocialLinks;
  active?: boolean;
  featured?: boolean;
  seoData?: SeoData;
  privacyLevel?: string;
  dataClassification?: DataClassification;
  publicProfile?: object;
  creationStatus?: string;
  creationStep?: number;
  primaryColors?: string[];
  secondaryColors?: string[];
  brandClaim?: string;
  heroConfig?: HeroConfig;
  aboutContent?: AboutContent;
  contactConfig?: ContactConfig;
  policiesConfig?: PoliciesConfig;
  activeThemeId?: string;
  publishStatus?: string;
  marketplaceApproved?: boolean;
  marketplaceApprovedAt?: string;
  marketplaceApprovedBy?: string;
  idContraparty?: string;
  artisanProfile?: ArtisanProfile;
  artisanProfileCompleted?: boolean;
  bankDataStatus?: string;
  marketplaceApprovalStatus?: string;
  department?: string;
  municipality?: string;
  presentationVideo?: Record<string, any>;
  bioConfig?: Record<string, any>;
}

// ============= Response Types =============


export interface ArtisanShopErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: {
    response: {
      message: string | string[];
      error: string;
      statusCode: number;
    };
    status: number;
    options: Record<string, any>;
    message: string;
    name: string;
  };
}
