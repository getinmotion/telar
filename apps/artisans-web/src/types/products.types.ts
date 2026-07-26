/**
 * Products Types — Copia local de @telar/shared-types/products
 *
 * Contiene todos los tipos, enums, constantes y funciones de productos
 * para evitar la dependencia de subpath exports en Rollup/Vite.
 */

// ─── Taxonomy types (inlined) ──────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Craft {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Technique {
  id: string;
  craftId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Material {
  id: string;
  name: string;
  category?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Product Core ──────────────────────────────────────────────────────────────

export interface ProductCore {
  id: string;
  storeId: string;
  categoryId: string | null;
  legacyProductId?: string;
  name: string;
  shortDescription: string;
  history: string | null;
  careNotes: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export enum ProductStatus {
  DRAFT = 'draft',
  PENDING_MODERATION = 'pending_moderation',
  CHANGES_REQUESTED = 'changes_requested',
  APPROVED = 'approved',
  APPROVED_WITH_EDITS = 'approved_with_edits',
  REJECTED = 'rejected',
}

// Alias used by src/types/index.ts
export { ProductStatus as ProductStatusEnum };

// ─── Product Layers ────────────────────────────────────────────────────────────

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
  primaryCraft?: Craft;
  primaryTechnique?: Technique;
  secondaryTechnique?: Technique;
  curatorialCategory?: Category;
}

export interface ProductPhysicalSpecs {
  productId: string;
  heightCm?: number;
  widthCm?: number;
  lengthOrDiameterCm?: number;
  realWeightKg?: number;
}

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

export interface ProductProduction {
  productId: string;
  availabilityType: 'en_stock' | 'bajo_pedido' | 'edicion_limitada' | 'pieza_unica';
  productionTimeDays?: number;
  monthlyCapacity?: number;
  requirementsToStart?: string;
}

export interface ProductMedia {
  id: string;
  productId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductBadge {
  id: string;
  productId: string;
  badgeId: string;
  awardedAt: string;
  awardedBy?: string;
  metadata: Record<string, any>;
  validUntil?: string;
}

export interface ProductMaterialLink {
  productId: string;
  materialId: string;
  isPrimary: boolean;
  materialOrigin?: string;
  material?: Material;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku?: string;
  variantName?: string | null;
  optionValues: Record<string, string>;
  minStock: number;
  imageUrl?: string | null;
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

// ─── Product Response ──────────────────────────────────────────────────────────

export interface ProductResponse {
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
  artisanShop?: any;
  category?: Category;
  artisanalIdentity?: ProductArtisanalIdentity;
  physicalSpecs?: ProductPhysicalSpecs;
  logistics?: ProductLogistics;
  production?: ProductProduction;
  media?: ProductMedia[];
  badges?: ProductBadge[];
  materials?: ProductMaterialLink[];
  variants?: ProductVariant[];
}

// ─── Legacy Product ────────────────────────────────────────────────────────────

export interface LegacyProduct {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  inventory: number;
  sku?: string;
  images: any;
  category?: string;
  subcategory?: string;
  tags: any;
  weight?: number;
  dimensions?: any;
  materials: any;
  techniques: any;
  production_time?: string;
  customizable: boolean;
  active: boolean;
  featured: boolean;
  moderation_status?: string;
  seo_data: any;
  shipping_data_complete?: boolean;
  ready_for_checkout?: boolean;
  allows_local_pickup?: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Variant Options ───────────────────────────────────────────────────────────

export type VariantAxisKey = 'talla' | 'color' | 'material';

export interface VariantAxisConfig {
  key: VariantAxisKey;
  label: string;
  suggestedValues?: string[];
  valuesFromProductMaterials?: boolean;
}

export const VARIANT_AXES: Record<VariantAxisKey, VariantAxisConfig> = {
  talla: {
    key: 'talla',
    label: 'Talla',
    suggestedValues: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'],
  },
  color: {
    key: 'color',
    label: 'Color',
    suggestedValues: [
      'Natural', 'Blanco', 'Negro', 'Rojo', 'Azul',
      'Verde', 'Amarillo', 'Terracota', 'Multicolor',
    ],
  },
  material: {
    key: 'material',
    label: 'Material',
    valuesFromProductMaterials: true,
  },
};

export const VARIANT_AXES_BY_CATEGORY_SLUG: Record<string, VariantAxisKey[]> = {
  'textiles-y-moda': ['talla', 'color', 'material'],
  'bolsos-y-carteras': ['color', 'material'],
  'joyeria-y-accesorios': ['color', 'material'],
  'decoracion-del-hogar': ['color', 'material'],
  muebles: ['color', 'material'],
  'vajillas-y-cocina': ['color', 'material'],
  'arte-y-esculturas': ['color', 'material'],
  'juguetes-e-instrumentos-musicales': ['color', 'material'],
  'belleza-y-cuidado-personal': ['color', 'material'],
};

export const DEFAULT_VARIANT_AXES: VariantAxisKey[] = ['color', 'material'];

export const MAX_VARIANTS_PER_PRODUCT = 20;

export function getVariantAxesForCategory(
  topLevelSlug?: string | null,
): VariantAxisConfig[] {
  const keys =
    (topLevelSlug && VARIANT_AXES_BY_CATEGORY_SLUG[topLevelSlug]) ||
    DEFAULT_VARIANT_AXES;
  return keys.map((k) => VARIANT_AXES[k]);
}

const AXIS_ORDER: VariantAxisKey[] = ['talla', 'color', 'material'];

export function composeVariantName(
  optionValues: Record<string, string>,
): string {
  const parts: string[] = [];
  const knownKeys = AXIS_ORDER.filter((k) => optionValues[k]);
  const otherKeys = Object.keys(optionValues).filter(
    (k) => !AXIS_ORDER.includes(k as VariantAxisKey) && optionValues[k],
  );
  for (const key of [...knownKeys, ...otherKeys]) {
    const value = optionValues[key];
    parts.push(key === 'talla' ? `Talla ${value}` : value);
  }
  return parts.join(' · ');
}
