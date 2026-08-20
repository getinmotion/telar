import { toast } from 'sonner';
import type { NewWizardState } from '@/components/shop/new-product-wizard/hooks/useNewWizardState';
import { deriveAvailabilityType } from '@/components/shop/new-product-wizard/utils/availability';
import {
  getCareSuggestions,
  getUsageSuggestions,
} from '@/components/shop/new-product-wizard/utils/careUsageSuggestions';
import { uploadImage, UploadFolder } from '@/services/fileUpload.actions';
import type { StudioTaxonomy } from '@/services/studioTaxonomy.actions';
import type { StudioShop } from '@/hooks/useProductStudio';
import { recipeForCategory, TEMPLATE_COPY } from './catalog';
import { buildProductSvgFile, type InjectVariant } from './productSvg';
import { resolveShopIdentity, pickMaterialIds } from './resolveTaxonomy';

/**
 * Genera el estado del wizard para un producto de prueba de la tienda dada.
 *
 * Dos variantes: `realista` (todo derivado del oficio/categoría de la tienda) y
 * `proximamente` (copy que anuncia que la pieza se está creando). Ambas rellenan
 * lo que exigen las validaciones de los 6 pasos y dejan el panel "¿Listo para
 * aprobar?" sin faltantes.
 *
 * Ojo: mapNewStateToDto descarta en silencio los ids que no son UUID, así que la
 * taxonomía sale SIEMPRE de los catálogos reales — nunca se inventa.
 */

export type { InjectVariant };

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

const fill = (
  template: string,
  vars: { pieza: string; oficio: string; taller: string; lugar: string; calificativo: string },
): string =>
  template
    .replace(/\{pieza\}/g, vars.pieza)
    .replace(/\{oficio\}/g, vars.oficio)
    .replace(/\{taller\}/g, vars.taller)
    .replace(/\{lugar\}/g, vars.lugar)
    .replace(/\{calificativo\}/g, vars.calificativo);

interface BuildArgs {
  variant: InjectVariant;
  shop: StudioShop;
  taxonomy: StudioTaxonomy;
}

export async function buildTestProductState({
  variant,
  shop,
  taxonomy,
}: BuildArgs): Promise<Partial<NewWizardState>> {
  const isTemplate = variant === 'proximamente';

  // La categoría resuelta escoge la receta; la receta escoge los materiales.
  const resolved = await resolveShopIdentity(shop, taxonomy);
  const recipe = recipeForCategory(resolved.categoryName);
  const materialIds = pickMaterialIds(shop, taxonomy, recipe.materialKeywords);

  const lugar = [shop.municipality, shop.department ?? shop.region].filter(Boolean).join(', ') ||
    'Colombia';
  const vars = {
    pieza: pick(recipe.pieces),
    oficio: resolved.craftName ?? shop.craftType ?? 'artesanía',
    taller: shop.shopName,
    lugar,
    calificativo: pick(recipe.qualifiers),
  };

  const name = isTemplate ? TEMPLATE_COPY.name : `${vars.pieza} ${vars.calificativo}`;
  const productionType = isTemplate ? TEMPLATE_COPY.productionType : recipe.productionType;
  const purpose = isTemplate ? TEMPLATE_COPY.purpose : recipe.purpose;
  const dims = isTemplate ? TEMPLATE_COPY.dims : recipe.dims;
  const pack = isTemplate ? TEMPLATE_COPY.pack : recipe.pack;

  // ── Imagen: SVG generado y subido a S3 (URL real, aprobable) ──────────────
  let imageUrl: string | undefined;
  try {
    const file = buildProductSvgFile(variant, {
      pieceName: name,
      craftName: resolved.craftName,
      shopName: shop.shopName,
      motif: recipe.motif,
    });
    const upload = await uploadImage(file, UploadFolder.PRODUCTS, undefined, {
      suppressToast: true,
    });
    imageUrl = upload.url;
  } catch {
    toast.warning('No se pudo generar la foto de prueba; el resto de los datos sí se inyectó.');
  }

  return {
    ...(imageUrl ? { images: [imageUrl] } : {}),
    name,
    shortDescription: fill(
      isTemplate ? TEMPLATE_COPY.shortDescription : recipe.shortDescription,
      vars,
    ),
    artisanalHistory: fill(isTemplate ? TEMPLATE_COPY.history : recipe.history, vars),

    // Identidad (UUIDs reales de taxonomía). Sin subcategoryId: los productos
    // viven en las categorías padre.
    ...(resolved.categoryId ? { categoryId: resolved.categoryId } : {}),
    ...(resolved.craftId ? { craftId: resolved.craftId } : {}),
    ...(resolved.techniqueId ? { primaryTechniqueId: resolved.techniqueId } : {}),
    materials: materialIds,
    purpose,
    styles: isTemplate ? TEMPLATE_COPY.styles : recipe.styles,
    productionType,
    availabilityType: deriveAvailabilityType(productionType),

    // Origen (lo que el wizard del artesano toma del perfil de tienda)
    country: 'Colombia',
    ...((shop.department ?? shop.region) ? { department: (shop.department ?? shop.region)! } : {}),
    ...(shop.municipality ? { municipality: shop.municipality } : {}),
    workshopName: shop.shopName,
    shippingOrigin: lugar,

    // Proceso y tiempo
    processDescription: fill(
      isTemplate ? TEMPLATE_COPY.processDescription : recipe.processDescription,
      vars,
    ),
    elaborationTime: isTemplate ? TEMPLATE_COPY.elaborationTime : recipe.elaborationTime,
    monthlyCapacity: isTemplate ? TEMPLATE_COPY.monthlyCapacity : recipe.monthlyCapacity,
    tools: isTemplate ? [] : recipe.tools,
    careNotes: isTemplate
      ? TEMPLATE_COPY.careNotes
      : getCareSuggestions(resolved.categoryName, purpose).slice(0, 3).join('\n'),
    usageSuggestions: isTemplate
      ? TEMPLATE_COPY.usageSuggestions
      : getUsageSuggestions(resolved.categoryName, purpose).slice(0, 3).join('\n'),

    // Precio, inventario y logística
    price: isTemplate ? TEMPLATE_COPY.priceCop : recipe.priceCop,
    inventory: productionType === 'unica' ? 1 : isTemplate ? TEMPLATE_COPY.inventory : recipe.inventory,
    minimumStockAlert: 1,
    hasVariants: false,
    ...dims,
    ...pack,
    specialHandling: false,
  };
}
