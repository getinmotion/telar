/**
 * Product Layers Types - Capas especializadas de productos
 * Tipos para las 8 capas de la arquitectura multicapa
 */

// ============= Product Artisanal Identity (1:1) =============

export interface ProductArtisanalIdentity {
  productId: string;
  primaryCraftId?: string;
  primaryTechniqueId?: string;
  secondaryTechniqueId?: string;
  curatorialCategoryId?: string;
  pieceType?: 'funcional' | 'decorativa' | 'mixta';
  style?: 'tradicional' | 'contemporaneo' | 'fusion';
  isCollaboration: boolean;
  processType?: 'manual' | 'mixto' | 'asistido';
  estimatedElaborationTime?: string;
}

// ============= Product Physical Specs (1:1) =============

export interface ProductPhysicalSpecs {
  productId: string;
  heightCm?: number;
  widthCm?: number;
  lengthOrDiameterCm?: number;
  realWeightKg?: number;
}

// ============= Product Logistics (1:1) =============

export interface ProductLogistics {
  productId: string;
  packagingType?: string;
  packHeightCm?: number;
  packWidthCm?: number;
  packLengthCm?: number;
  packWeightKg?: number;
  fragility: 'bajo' | 'medio' | 'alto';
  requiresAssembly: boolean;
  specialProtectionNotes?: string;
}

// ============= Product Production (1:1) =============

export interface ProductProduction {
  productId: string;
  availabilityType: 'en_stock' | 'bajo_pedido' | 'edicion_limitada';
  productionTimeDays?: number;
  monthlyCapacity?: number;
  requirementsToStart?: string;
}

// ============= Product Media (1:N) =============

export interface ProductMedia {
  id: string;
  productId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  isPrimary: boolean;
  displayOrder: number;
}

// ============= Product Badges (N:M) =============

export interface ProductBadge {
  id: string;
  productId: string;
  badgeId: string;
  awardedAt: string;
  awardedBy?: string;
  metadata: Record<string, any>;
  validUntil?: string;
}

// ============= Product Materials Link (N:M) =============

export interface ProductMaterialLink {
  productId: string;
  materialId: string;
  isPrimary: boolean;
  materialOrigin?: string;
}

// ============= Product Variants (1:N) =============

export interface ProductVariant {
  id: string;
  productId: string;
  sku?: string;
  stockQuantity: number;
  basePriceMinor: string; // BIGINT en centavos como string
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
