/**
 * Types Index - Re-export de tipos compartidos
 *
 * Este archivo facilita la migración gradual desde tipos locales
 * hacia tipos compartidos del paquete @telar/shared-types
 */

// ============= Products =============
// Re-export de todos los tipos de productos
export type {
  ProductResponse,
  ProductCore,
  ProductArtisanalIdentity,
  ProductPhysicalSpecs,
  ProductLogistics,
  ProductProduction,
  ProductMedia,
  ProductBadge,
  ProductMaterialLink,
  ProductVariant,
  LegacyProduct,
} from '@telar/shared-types/products';

export { ProductStatusEnum as ProductStatus } from '@telar/shared-types/products';

// ============= Stores =============
// Re-export de todos los tipos de tiendas
export type {
  StoreResponse,
  Store,
  StoreContacts,
  StoreAward,
  StoreBadge,
  LegacyShopData,
  ArtisanShop, // Tipo mapeado desde StoreResponse con camelCase
} from '@telar/shared-types/stores';

// ============= Common =============
// Re-export de tipos comunes
export type {
  PaginationParams,
  PaginatedResponse,
  PaginationMeta,
  ApiResponse,
  ApiError,
  SuccessResponse,
} from '@telar/shared-types/common';

export { Currency, Status, ModerationStatus } from '@telar/shared-types/common';
