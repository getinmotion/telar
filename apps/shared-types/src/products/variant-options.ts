/**
 * Variant Options - Configuración fija de ejes de variación por categoría
 *
 * Los productos pueden variar por talla, color y/o material según su categoría
 * top-level (taxonomy.categories con parent_id = null). Los valores elegidos se
 * guardan en shop.product_variants.option_values (jsonb) con estas mismas claves.
 */

export type VariantAxisKey = 'talla' | 'color' | 'material';

export interface VariantAxisConfig {
  key: VariantAxisKey;
  /** Label en español para la UI */
  label: string;
  /** Valores sugeridos estáticos (la artesana puede agregar propios) */
  suggestedValues?: string[];
  /** true → ofrecer primero los materiales taxonómicos ya vinculados al producto */
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
      'Natural',
      'Blanco',
      'Negro',
      'Rojo',
      'Azul',
      'Verde',
      'Amarillo',
      'Terracota',
      'Multicolor',
    ],
  },
  material: {
    key: 'material',
    label: 'Material',
    valuesFromProductMaterials: true,
  },
};

/**
 * Ejes disponibles por slug de categoría TOP-LEVEL (taxonomy.categories.slug).
 * Resolver categoría hija → raíz antes de consultar este mapa.
 * Slugs verificados contra la BD (2026-07).
 */
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

/** Máximo de variantes por producto (tope de UI y de sugerencias IA) */
export const MAX_VARIANTS_PER_PRODUCT = 20;

/** Devuelve la configuración de ejes para una categoría top-level (por slug) */
export function getVariantAxesForCategory(
  topLevelSlug?: string | null,
): VariantAxisConfig[] {
  const keys =
    (topLevelSlug && VARIANT_AXES_BY_CATEGORY_SLUG[topLevelSlug]) ||
    DEFAULT_VARIANT_AXES;
  return keys.map((k) => VARIANT_AXES[k]);
}

const AXIS_ORDER: VariantAxisKey[] = ['talla', 'color', 'material'];

/**
 * Compone el nombre legible de una variante a partir de sus option_values.
 * Ej: {talla:"M", color:"Rojo"} → "Talla M · Rojo"
 */
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
