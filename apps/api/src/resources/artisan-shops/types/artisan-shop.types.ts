/**
 * Tipos TypeScript para ArtisanShop
 * Estos tipos pueden compartirse con el frontend o usarse en toda la aplicación
 */

// ========================================
// ENUMS
// ========================================

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
  COMPLETE = 'complete',
}

export enum MarketplaceApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// ========================================
// TIPOS PARA CAMPOS JSONB
// ========================================

export interface ContactInfo {
  email?: string;
  phone?: string;
  whatsapp?: string;
  [key: string]: any;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
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

export interface PublicProfile {
  [key: string]: any;
}

export interface HeroSlide {
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
  [key: string]: any;
}

export interface HeroConfig {
  slides: HeroSlide[];
  autoplay?: boolean;
  duration?: number;
  [key: string]: any;
}

export interface AboutContent {
  story?: string;
  title?: string;
  values?: string[];
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
  photos?: string[];
  working?: string[];
  workshop?: string[];
  bio?: string;
  experience?: string;
  techniques?: string[];
  [key: string]: any;
}

// ========================================
// TIPO USUARIO SIMPLIFICADO (para relación)
// ========================================

export interface ArtisanShopUser {
  id: string;
  email: string;
  emailConfirmedAt?: Date | null;
}

// ========================================
// TIPO BRAND THEME SIMPLIFICADO (para relación)
// ========================================

export interface ArtisanShopBrandTheme {
  themeId: string;
  themeName: string;
}

// ========================================
// TIPO PRINCIPAL: ARTISAN SHOP
// ========================================

export interface ArtisanShop {
  // Campos básicos
  id: string;
  userId: string;
  shopName: string;
  shopSlug: string;
  description: string | null;
  story: string | null;

  // URLs de imágenes
  logoUrl: string | null;
  bannerUrl: string | null;

  // Información de artesanía
  craftType: string | null;
  region: string | null;

  // Arrays y objetos
  certifications: string[];
  contactInfo: ContactInfo;
  socialLinks: SocialLinks;

  // Configuraciones booleanas
  active: boolean;
  featured: boolean;
  servientregaCoverage: boolean;

  // SEO y datos
  seoData: SeoData;

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;

  // Privacidad y clasificación
  privacyLevel: PrivacyLevel | string | null;
  dataClassification: DataClassification;
  publicProfile: PublicProfile | null;

  // Estado de creación
  creationStatus: CreationStatus | string | null;
  creationStep: number | null;

  // Branding
  primaryColors: string[];
  secondaryColors: string[];
  brandClaim: string | null;

  // Configuraciones de secciones
  heroConfig: HeroConfig;
  aboutContent: AboutContent;
  contactConfig: ContactConfig;

  // Tema
  activeThemeId: string | null;

  // Estado de publicación y marketplace
  publishStatus: PublishStatus | string | null;
  marketplaceApproved: boolean | null;
  marketplaceApprovedAt: Date | string | null;
  marketplaceApprovedBy: string | null;

  // Datos de pago
  idContraparty: string | null;

  // Perfil del artesano
  artisanProfile: ArtisanProfile | null;
  artisanProfileCompleted: boolean | null;

  // Datos bancarios
  bankDataStatus: BankDataStatus | string | null;

  // Estado de aprobación en marketplace
  marketplaceApprovalStatus: MarketplaceApprovalStatus | string | null;

  // Ubicación
  department: string | null;
  municipality: string | null;

  // Relaciones (opcionales en responses de API)
  user?: ArtisanShopUser;
  activeTheme?: ArtisanShopBrandTheme | null;
  products?: any[]; // Si necesitas tipar los productos, importa el tipo
}

// ========================================
// TIPO SIMPLIFICADO (sin relaciones)
// ========================================

export type ArtisanShopBasic = Omit<
  ArtisanShop,
  'user' | 'activeTheme' | 'products'
>;

// ========================================
// TIPO PARA CREAR ARTISAN SHOP (DTO)
// ========================================

export interface CreateArtisanShopDto {
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
  servientregaCoverage?: boolean;
  seoData?: SeoData;
  privacyLevel?: PrivacyLevel | string;
  dataClassification?: DataClassification;
  publicProfile?: PublicProfile;
  creationStatus?: CreationStatus | string;
  creationStep?: number;
  primaryColors?: string[];
  secondaryColors?: string[];
  brandClaim?: string;
  heroConfig?: HeroConfig;
  aboutContent?: AboutContent;
  contactConfig?: ContactConfig;
  activeThemeId?: string;
  publishStatus?: PublishStatus | string;
  marketplaceApproved?: boolean;
  artisanProfile?: ArtisanProfile;
  artisanProfileCompleted?: boolean;
  bankDataStatus?: BankDataStatus | string;
  marketplaceApprovalStatus?: MarketplaceApprovalStatus | string;
  department?: string;
  municipality?: string;
}

// ========================================
// TIPO PARA ACTUALIZAR ARTISAN SHOP (DTO)
// ========================================

export type UpdateArtisanShopDto = Partial<CreateArtisanShopDto>;

// ========================================
// TIPO PARA QUERIES/FILTROS
// ========================================

export interface ArtisanShopsQueryDto {
  page?: number;
  limit?: number;
  active?: boolean;
  publishStatus?: PublishStatus | string;
  marketplaceApproved?: boolean;
  featured?: boolean;
  hasApprovedProducts?: boolean;
  shopSlug?: string;
  region?: string;
  craftType?: string;
  sortBy?: 'created_at' | 'shop_name';
  order?: 'ASC' | 'DESC';
}

// ========================================
// TIPO PARA RESPONSE PAGINADO
// ========================================

export interface ArtisanShopsPaginatedResponse {
  data: ArtisanShop[];
  total: number;
  page: number;
  limit: number;
}
