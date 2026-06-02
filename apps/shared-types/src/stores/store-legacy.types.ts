/**
 * Store Legacy Types - Tabla legacy public.artisan_shops
 * Tipos para la tabla monolítica antigua
 *
 * ⚠️ DEPRECATED para nuevos desarrollos
 * Usar StoreResponse para acceder a la nueva arquitectura shop.stores
 */

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

  // Arrays y objetos JSONB
  certifications: any[];
  contactInfo: Record<string, any>;
  socialLinks: Record<string, any>;

  // Estados booleanos
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
