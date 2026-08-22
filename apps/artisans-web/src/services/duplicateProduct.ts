/**
 * Duplicate Product Mapper
 *
 * Función pura que convierte un ProductResponse (producto existente cargado
 * desde el backend) en un CreateProductsNewDto listo para insertar como copia
 * mediante POST /telar/server/products-new.
 *
 * Reglas de mapeo:
 * - Emite siempre: storeId, name (con prefijo "Copia de "), status='draft'
 * - Copia escalares del core preservando undefined
 * - Mapea capas 1:1 campo por campo, omitiendo productId; omite la clave si
 *   la capa completa es undefined
 * - Mapea colecciones 1:N preservando longitud y orden; omite id, productId,
 *   sku, createdAt, updatedAt, deletedAt según corresponda; omite la clave
 *   si el array es undefined o vacío
 * - Omite siempre en raíz: productId, legacyProductId, badges, id, slug,
 *   createdAt, updatedAt, deletedAt y cualquier campo de moderación
 * - No muta el argumento (transformación pura)
 *
 * Ver: .kiro/specs/duplicate-product-studio/design.md
 */

import type {
  CreateProductArtisanalIdentityDto,
  CreateProductLogisticsDto,
  CreateProductMaterialLinkDto,
  CreateProductMediaDto,
  CreateProductPhysicalSpecsDto,
  CreateProductProductionDto,
  CreateProductVariantDto,
  CreateProductsNewDto,
  ProductArtisanalIdentityResponse,
  ProductLogisticsResponse,
  ProductMaterialLinkResponse,
  ProductMediaResponse,
  ProductPhysicalSpecsResponse,
  ProductProductionResponse,
  ProductResponse,
  ProductVariantResponse,
  AvailabilityType,
  FragilityLevel,
  MediaType,
  PieceType,
  ProcessType,
  StyleType,
} from "./products-new.types";

/** Prefijo que se antepone al nombre del producto original al duplicar. */
export const COPY_PREFIX = "Copia de ";

/**
 * Coerce a value to a number. Postgres decimal columns return string values
 * (e.g. "1.00") but the create DTO validates @IsNumber, so we normalize.
 * Returns undefined for null/undefined/empty/NaN.
 */
const num = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/** Same as num but preserves undefined vs a real 0. */
const numOrNull = (v: unknown): number | null | undefined => {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

// ============= HELPERS PARA CAPAS 1:1 =============

function mapArtisanalIdentity(
  src: ProductArtisanalIdentityResponse,
): CreateProductArtisanalIdentityDto {
  return {
    primaryCraftId: src.primaryCraftId,
    primaryTechniqueId: src.primaryTechniqueId,
    secondaryTechniqueId: src.secondaryTechniqueId,
    curatorialCategoryId: src.curatorialCategoryId,
    pieceType: src.pieceType as PieceType | undefined,
    style: src.style as StyleType | undefined,
    styles: src.styles as StyleType[] | undefined,
    isCollaboration: src.isCollaboration,
    collaborationName: src.collaborationName,
    processType: src.processType as ProcessType | undefined,
    estimatedElaborationTime: src.estimatedElaborationTime,
  };
}

function mapPhysicalSpecs(
  src: ProductPhysicalSpecsResponse,
): CreateProductPhysicalSpecsDto {
  return {
    heightCm: num(src.heightCm),
    widthCm: num(src.widthCm),
    lengthOrDiameterCm: num(src.lengthOrDiameterCm),
    realWeightKg: num(src.realWeightKg),
  };
}

function mapLogistics(
  src: ProductLogisticsResponse,
): CreateProductLogisticsDto {
  return {
    packagingType: src.packagingType,
    packHeightCm: num(src.packHeightCm),
    packWidthCm: num(src.packWidthCm),
    packLengthCm: num(src.packLengthCm),
    packWeightKg: num(src.packWeightKg),
    fragility: src.fragility as FragilityLevel,
    requiresAssembly: src.requiresAssembly,
    specialProtectionNotes: src.specialProtectionNotes,
  };
}

function mapProduction(
  src: ProductProductionResponse,
): CreateProductProductionDto {
  return {
    availabilityType: src.availabilityType as AvailabilityType,
    productionTimeDays: src.productionTimeDays,
    monthlyCapacity: src.monthlyCapacity,
    requirementsToStart: src.requirementsToStart,
    processDescription: src.processDescription,
    processEvidenceUrls: src.processEvidenceUrls
      ? [...src.processEvidenceUrls]
      : undefined,
    tools: src.tools ? [...src.tools] : undefined,
  };
}

// ============= HELPERS PARA COLECCIONES 1:N =============

function mapMedia(src: ProductMediaResponse): CreateProductMediaDto {
  return {
    mediaUrl: src.mediaUrl,
    mediaType: src.mediaType as MediaType,
    isPrimary: src.isPrimary,
    displayOrder: src.displayOrder,
  };
}

function mapMaterial(
  src: ProductMaterialLinkResponse,
): CreateProductMaterialLinkDto {
  return {
    materialId: src.materialId,
    isPrimary: src.isPrimary,
    materialOrigin: src.materialOrigin,
  };
}

function mapVariant(src: ProductVariantResponse): CreateProductVariantDto {
  return {
    variantName: src.variantName ?? undefined,
    optionValues: src.optionValues ? { ...src.optionValues } : undefined,
    minStock: num(src.minStock),
    imageUrl: src.imageUrl ?? undefined,
    stockQuantity: num(src.stockQuantity),
    basePriceMinor:
      src.basePriceMinor != null ? String(src.basePriceMinor) : undefined,
    currency: src.currency,
    realWeightKg: numOrNull(src.realWeightKg),
    dimHeightCm: numOrNull(src.dimHeightCm),
    dimWidthCm: numOrNull(src.dimWidthCm),
    dimLengthCm: numOrNull(src.dimLengthCm),
    packHeightCm: numOrNull(src.packHeightCm),
    packWidthCm: numOrNull(src.packWidthCm),
    packLengthCm: numOrNull(src.packLengthCm),
    packWeightKg: numOrNull(src.packWeightKg),
    isActive: src.isActive,
  };
}

// ============= MAPPER PRINCIPAL =============

/**
 * Convierte un producto existente en un DTO de creación (upsert-insert) con
 * nombre prefijado "Copia de ", estado draft, y sin identificadores del
 * producto original ni claves de moderación/timestamps.
 *
 * Es una función pura: no muta `product` ni realiza efectos secundarios.
 */
export function buildDuplicatePayload(
  product: ProductResponse,
): CreateProductsNewDto {
  const dto: CreateProductsNewDto = {
    storeId: product.storeId,
    name: COPY_PREFIX + product.name,
    shortDescription: product.shortDescription,
    status: "draft",
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    history: product.history,
    careNotes: product.careNotes,
    usageSuggestions: product.usageSuggestions,
  };

  if (product.artisanalIdentity != null) {
    dto.artisanalIdentity = mapArtisanalIdentity(product.artisanalIdentity);
  }
  if (product.physicalSpecs != null) {
    dto.physicalSpecs = mapPhysicalSpecs(product.physicalSpecs);
  }
  if (product.logistics != null) {
    dto.logistics = mapLogistics(product.logistics);
  }
  if (product.production != null) {
    dto.production = mapProduction(product.production);
  }

  if (product.media != null && product.media.length > 0) {
    dto.media = product.media.map(mapMedia);
  }
  if (product.materials != null && product.materials.length > 0) {
    dto.materials = product.materials.map(mapMaterial);
  }
  if (product.variants != null && product.variants.length > 0) {
    dto.variants = product.variants.map(mapVariant);
  }

  return dto;
}
