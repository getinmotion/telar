/**
 * Product Legacy Types - Tabla legacy shop.products (monolítica)
 * Mantener para compatibilidad con código existente
 *
 * ⚠️ DEPRECATED para nuevos desarrollos
 * Usar ProductResponse para acceder a la nueva arquitectura multicapa
 */

export interface LegacyProduct {
  // Identificación
  id: string;
  shop_id: string;

  // Información básica
  name: string;
  description?: string;
  short_description?: string;

  // Precio e inventario
  price: number;
  compare_price?: number;
  inventory: number;
  sku?: string;

  // Multimedia
  images: any; // JSONB array

  // Categorización
  category?: string;
  subcategory?: string;
  tags: any; // JSONB array

  // Especificaciones físicas
  weight?: number;
  dimensions?: any; // JSONB object

  // Artesanía
  materials: any; // JSONB array
  techniques: any; // JSONB array
  production_time?: string;

  // Estados y configuración
  customizable: boolean;
  active: boolean;
  featured: boolean;
  moderation_status?: string;

  // Metadatos
  seo_data: any; // JSONB object
  shipping_data_complete?: boolean;
  ready_for_checkout?: boolean;
  allows_local_pickup?: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}
