/**
 * Types for Products-New API
 *
 * Estos tipos coinciden con los DTOs del backend en:
 * apps/api/src/resources/products-new/dto/
 */

// ============= ENUMS =============

export type ProductStatus =
  | 'draft'
  | 'pending_moderation'
  | 'changes_requested'
  | 'approved'
  | 'approved_with_edits'
  | 'rejected';

export type PieceType = 'funcional' | 'decorativa' | 'mixta';

export type StyleType = 'tradicional' | 'contemporaneo' | 'fusion';

export type ProcessType = 'manual' | 'mixto' | 'asistido';

export type AvailabilityType = 'en_stock' | 'bajo_pedido' | 'edicion_limitada';

export type FragilityLevel = 'bajo' | 'medio' | 'alto';

export type MediaType = 'image' | 'video';

// ============= DTO INTERFACES =============

/**
 * DTO principal para crear o actualizar un producto
 * Si productId está presente, es UPDATE; si no, es CREATE
 */
export interface CreateProductsNewDto {
  // ProductCore
  productId?: string;
  storeId: string;
  categoryId?: string;
  legacyProductId?: string;
  name: string;
  shortDescription: string;
  history?: string;
  careNotes?: string;
  status?: ProductStatus;

  // Capas relacionadas (OneToOne)
  artisanalIdentity?: CreateProductArtisanalIdentityDto;
  physicalSpecs?: CreateProductPhysicalSpecsDto;
  logistics?: CreateProductLogisticsDto;
  production?: CreateProductProductionDto;

  // Capas relacionadas (OneToMany)
  media?: CreateProductMediaDto[];
  badges?: CreateProductBadgeDto[];
  materials?: CreateProductMaterialLinkDto[];
  variants?: CreateProductVariantDto[];
}

/**
 * Capa: Identidad Artesanal (1:1)
 * Información sobre el oficio, técnicas, y proceso artesanal
 */
export interface CreateProductArtisanalIdentityDto {
  primaryCraftId?: string;
  primaryTechniqueId?: string;
  secondaryTechniqueId?: string;
  curatorialCategoryId?: string;
  pieceType?: PieceType;
  style?: StyleType;
  isCollaboration?: boolean;
  processType?: ProcessType;
  estimatedElaborationTime?: string;
}

/**
 * Capa: Especificaciones Físicas (1:1)
 * Dimensiones y peso del producto
 */
export interface CreateProductPhysicalSpecsDto {
  heightCm?: number;
  widthCm?: number;
  lengthOrDiameterCm?: number;
  realWeightKg?: number;
}

/**
 * Capa: Logística (1:1)
 * Información de empaque y manejo
 */
export interface CreateProductLogisticsDto {
  packagingType?: string;
  packHeightCm?: number;
  packWidthCm?: number;
  packLengthCm?: number;
  packWeightKg?: number;
  fragility?: FragilityLevel;
  requiresAssembly?: boolean;
  specialProtectionNotes?: string;
}

/**
 * Capa: Producción (1:1)
 * Información sobre disponibilidad y capacidad de producción
 */
export interface CreateProductProductionDto {
  availabilityType: AvailabilityType;
  productionTimeDays?: number;
  monthlyCapacity?: number;
  requirementsToStart?: string;
}

/**
 * Capa: Media (1:N)
 * Imágenes y videos del producto
 */
export interface CreateProductMediaDto {
  mediaUrl: string;
  mediaType: MediaType;
  isPrimary?: boolean;
  displayOrder?: number;
}

/**
 * Capa: Insignias (1:N)
 * Certificaciones y reconocimientos del producto
 */
export interface CreateProductBadgeDto {
  badgeId: string;
  awardedBy?: string;
  metadata?: Record<string, any>;
  validUntil?: string;
}

/**
 * Capa: Materiales (1:N)
 * Link a materiales de la taxonomía
 */
export interface CreateProductMaterialLinkDto {
  materialId: string;
  isPrimary?: boolean;
  materialOrigin?: string;
}

/**
 * Capa: Variantes (1:N)
 * SKUs, precios, y stocks del producto
 */
export interface CreateProductVariantDto {
  sku?: string;
  stockQuantity: number;
  basePriceMinor: string; // BIGINT como string (en centavos)
  currency?: string;
  realWeightKg?: number;
  dimHeightCm?: number;
  dimWidthCm?: number;
  dimLengthCm?: number;
  packHeightCm?: number;
  packWidthCm?: number;
  packLengthCm?: number;
  packWeightKg?: number;
  isActive?: boolean;
}

// ============= RESPONSE INTERFACES =============

/**
 * Respuesta del backend al crear/actualizar un producto
 * Incluye el ProductCore con todas sus relaciones cargadas
 */
export interface ProductResponse {
  id: string;
  storeId: string;
  categoryId?: string;
  name: string;
  shortDescription: string;
  history?: string;
  careNotes?: string;
  status: string;
  legacyProductId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  // Capas relacionadas
  artisanalIdentity?: ProductArtisanalIdentityResponse;
  physicalSpecs?: ProductPhysicalSpecsResponse;
  logistics?: ProductLogisticsResponse;
  production?: ProductProductionResponse;
  media?: ProductMediaResponse[];
  badges?: ProductBadgeResponse[];
  materials?: ProductMaterialLinkResponse[];
  variants?: ProductVariantResponse[];
}

export interface ProductArtisanalIdentityResponse {
  productId: string;
  primaryCraftId?: string;
  primaryTechniqueId?: string;
  secondaryTechniqueId?: string;
  curatorialCategoryId?: string;
  pieceType?: string;
  style?: string;
  isCollaboration: boolean;
  processType?: string;
  estimatedElaborationTime?: string;
}

export interface ProductPhysicalSpecsResponse {
  productId: string;
  heightCm?: number;
  widthCm?: number;
  lengthOrDiameterCm?: number;
  realWeightKg?: number;
}

export interface ProductLogisticsResponse {
  productId: string;
  packagingType?: string;
  packHeightCm?: number;
  packWidthCm?: number;
  packLengthCm?: number;
  packWeightKg?: number;
  fragility: string;
  requiresAssembly: boolean;
  specialProtectionNotes?: string;
}

export interface ProductProductionResponse {
  productId: string;
  availabilityType: string;
  productionTimeDays?: number;
  monthlyCapacity?: number;
  requirementsToStart?: string;
}

export interface ProductMediaResponse {
  id: string;
  productId: string;
  mediaUrl: string;
  mediaType: string;
  isPrimary: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductBadgeResponse {
  id: string;
  productId: string;
  badgeId: string;
  awardedAt: string;
  awardedBy?: string;
  metadata: Record<string, any>;
  validUntil?: string;
}

export interface ProductMaterialLinkResponse {
  productId: string;
  materialId: string;
  isPrimary: boolean;
  materialOrigin?: string;
}

export interface ProductVariantResponse {
  id: string;
  productId: string;
  sku?: string;
  stockQuantity: number;
  basePriceMinor: string;
  currency: string;
  realWeightKg?: number;
  dimHeightCm?: number;
  dimWidthCm?: number;
  dimLengthCm?: number;
  packHeightCm?: number;
  packWidthCm?: number;
  packLengthCm?: number;
  packWeightKg?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
