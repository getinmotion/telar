/**
 * Products Module - Barrel Export
 * Re-exporta todos los tipos relacionados con productos
 */

// Core types
export type { ProductCore, ProductStatus } from './product-core.types';
export { ProductStatus as ProductStatusEnum } from './product-core.types';

// Layer types
export type {
  ProductArtisanalIdentity,
  ProductPhysicalSpecs,
  ProductLogistics,
  ProductProduction,
  ProductMedia,
  ProductBadge,
  ProductMaterialLink,
  ProductVariant,
} from './product-layers.types';

// Variant options (ejes de variación por categoría)
export type { VariantAxisKey, VariantAxisConfig } from './variant-options';
export {
  VARIANT_AXES,
  VARIANT_AXES_BY_CATEGORY_SLUG,
  DEFAULT_VARIANT_AXES,
  MAX_VARIANTS_PER_PRODUCT,
  getVariantAxesForCategory,
  composeVariantName,
} from './variant-options';

// Response types
export type { ProductResponse } from './product-response.types';

// Legacy types
export type { LegacyProduct } from './product-legacy.types';
