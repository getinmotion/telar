/**
 * Product Response Types - Respuesta completa del backend
 * Combina productos_core + todas las capas cargadas
 */

import type {
  ProductArtisanalIdentity,
  ProductPhysicalSpecs,
  ProductLogistics,
  ProductProduction,
  ProductMedia,
  ProductBadge,
  ProductMaterialLink,
  ProductVariant,
} from './product-layers.types';

/**
 * Respuesta completa del backend /products-new
 * Incluye el núcleo + todas las relaciones cargadas (eager loading)
 */
export interface ProductResponse {
  // Núcleo (products_core)
  id: string;
  storeId: string;
  categoryId?: string;
  legacyProductId?: string;
  name: string;
  shortDescription: string;
  history?: string;
  careNotes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  // Capas 1:1 (opcional según disponibilidad)
  artisanalIdentity?: ProductArtisanalIdentity;
  physicalSpecs?: ProductPhysicalSpecs;
  logistics?: ProductLogistics;
  production?: ProductProduction;

  // Relaciones 1:N y N:M (arrays)
  media?: ProductMedia[];
  badges?: ProductBadge[];
  materials?: ProductMaterialLink[];
  variants?: ProductVariant[];
}
