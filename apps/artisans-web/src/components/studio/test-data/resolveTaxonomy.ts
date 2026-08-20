import { getTechniquesByCraftId } from '@/services/crafts.actions';
import { normalizeCraftType, getCategoryForCraft } from '@/utils/craftTypeSystem';
import type { StudioTaxonomy } from '@/services/studioTaxonomy.actions';

/**
 * Resuelve la taxonomía real de una tienda (oficio → categoría → técnica →
 * materiales) para los inyectores de datos de prueba del backoffice.
 *
 * Prioriza los UUIDs que la tienda ya tiene en `artisanProfile` (vienen en el
 * payload de /artisan-shops) y, si no hay, normaliza el texto libre `craftType`
 * con utils/craftTypeSystem. Nunca inventa ids: `mapNewStateToDto` y la API
 * descartan en silencio lo que no sea UUID del catálogo.
 */

/** Lo mínimo que necesita el resolvedor: lo cumplen StudioShop y ArtisanShop. */
export interface ShopTaxonomySource {
  craftType?: string | null;
  artisanProfile?: {
    craftId?: unknown;
    craftIds?: unknown;
    techniqueIds?: unknown;
    materialIds?: unknown;
    categoryIds?: unknown;
  } | null;
}

export interface ResolvedIdentity {
  craftId?: string;
  craftName?: string;
  categoryId?: string;
  categoryName?: string;
  techniqueId?: string;
}

/**
 * Corta una consulta opcional que no responde. Sin esto, un endpoint lento deja
 * el inyector girando para siempre: todos estos datos son "mejor si están".
 */
export function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout tras ${ms}ms`)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

export const norm = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .trim();

export const byName = <T extends { name: string }>(list: T[], name?: string | null): T | undefined => {
  if (!name) return undefined;
  const target = norm(name);
  return (
    list.find((i) => norm(i.name) === target) ??
    list.find((i) => norm(i.name).includes(target) || target.includes(norm(i.name)))
  );
};

const asStr = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : undefined);
const asStrArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!x) : [];

/** Oficio → categoría → técnica, en ese orden de dependencia. */
export async function resolveShopIdentity(
  shop: ShopTaxonomySource,
  taxonomy: StudioTaxonomy,
): Promise<ResolvedIdentity> {
  const profile = shop.artisanProfile ?? {};

  // ── Oficio ────────────────────────────────────────────────────────────────
  const profileCraftId = asStr(profile.craftId) ?? asStrArray(profile.craftIds)[0];
  let craft = (profileCraftId && taxonomy.crafts.find((c) => c.id === profileCraftId)) || undefined;
  if (!craft) {
    const canonical = normalizeCraftType(shop.craftType);
    craft = byName(taxonomy.crafts, canonical) ?? byName(taxonomy.crafts, shop.craftType);
  }

  // ── Categoría ─────────────────────────────────────────────────────────────
  const roots = taxonomy.categories.filter((c) => !c.parentId);
  let category =
    (craft?.categoryId && taxonomy.categories.find((c) => c.id === craft!.categoryId)) || undefined;
  if (!category) {
    const profileCategoryId = asStrArray(profile.categoryIds)[0];
    category = profileCategoryId
      ? taxonomy.categories.find((c) => c.id === profileCategoryId)
      : undefined;
  }
  if (!category) {
    // craftTypeSystem mapea oficio → nombre de categoría de marketplace
    category = byName(roots, getCategoryForCraft(shop.craftType));
  }

  // Sin oficio identificado, al menos uno coherente con la categoría resuelta.
  if (!craft) {
    craft =
      (category && taxonomy.crafts.find((c) => c.categoryId === category!.id)) ?? taxonomy.crafts[0];
  }

  // ── Técnica (N:M con oficio: la ruta fiable es /techniques/craft/:id) ──────
  let techniqueId: string | undefined;
  const profileTechniqueId = asStrArray(profile.techniqueIds)[0];
  if (profileTechniqueId && taxonomy.techniques.some((t) => t.id === profileTechniqueId)) {
    techniqueId = profileTechniqueId;
  } else if (craft) {
    try {
      const techniques = await withTimeout(getTechniquesByCraftId(craft.id));
      techniqueId = techniques[0]?.id;
    } catch {
      // El endpoint puede fallar: se cae al listado ya cargado.
    }
    techniqueId ??= taxonomy.techniques.find((t) => t.craftIds?.includes(craft!.id))?.id;
  }

  return {
    craftId: craft?.id,
    craftName: craft?.name,
    categoryId: category?.id,
    categoryName: category?.name,
    techniqueId,
  };
}

/**
 * Materiales: la taxonomía no los relaciona con el oficio, así que se toman los
 * del perfil de la tienda y, si no hay, se casan por nombre con las palabras
 * clave de la receta de la categoría.
 */
export function pickMaterialIds(
  shop: ShopTaxonomySource,
  taxonomy: StudioTaxonomy,
  keywords: string[],
): string[] {
  const fromProfile = asStrArray(shop.artisanProfile?.materialIds).filter((id) =>
    taxonomy.materials.some((m) => m.id === id),
  );
  if (fromProfile.length > 0) return [...new Set(fromProfile)].slice(0, 3);

  const fromKeywords = keywords
    .map((kw) => byName(taxonomy.materials, kw)?.id)
    .filter((id): id is string => !!id);
  if (fromKeywords.length > 0) return [...new Set(fromKeywords)].slice(0, 3);

  return taxonomy.materials.slice(0, 2).map((m) => m.id);
}
