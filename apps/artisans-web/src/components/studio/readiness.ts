import type { ProductResponse } from '@/services/products-new.types';

/**
 * Lógica pura de "¿listo para aprobar?" para los estudios de moderación.
 * Todo se computa de datos ya cargados en cliente — sin llamadas nuevas.
 */

export interface ReadinessItem {
  key: string;
  label: string;
  ok: boolean;
  hint?: string;
}

export interface ReadinessResult {
  items: ReadinessItem[];
  ready: boolean;
}

// ─── Producto ────────────────────────────────────────────────
export function computeProductReadiness(p: ProductResponse): ReadinessResult {
  const hasImage = (p.media ?? []).some((m) => m.mediaType === 'image');
  const hasCategory = !!p.categoryId;
  const hasDescription = !!p.shortDescription?.trim();
  const ai = p.artisanalIdentity;
  const hasIdentity = !!(ai?.primaryCraftId || ai?.primaryTechniqueId);
  const hasMaterials = (p.materials ?? []).length > 0;
  // Precio > $100 evita el "sospechosamente barato" (≤$100 = probable error de carga).
  const hasValidPrice = (p.variants ?? []).some((v) => Number(v.basePriceMinor) > 100);
  const ps = p.physicalSpecs;
  const hasShipping =
    !!ps &&
    Number(ps.realWeightKg) > 0 &&
    Number(ps.heightCm) > 0 &&
    Number(ps.widthCm) > 0 &&
    Number(ps.lengthOrDiameterCm) > 0;

  const items: ReadinessItem[] = [
    { key: 'imagenes', label: 'Imágenes', ok: hasImage, hint: hasImage ? undefined : 'Sube al menos una foto — bloquea la publicación.' },
    { key: 'categoria', label: 'Categoría', ok: hasCategory, hint: hasCategory ? undefined : 'Asigna una categoría al producto.' },
    { key: 'descripcion', label: 'Descripción', ok: hasDescription, hint: hasDescription ? undefined : 'Falta la descripción corta.' },
    { key: 'identidad', label: 'Identidad artesanal', ok: hasIdentity, hint: hasIdentity ? undefined : 'Falta oficio o técnica.' },
    { key: 'materiales', label: 'Materiales', ok: hasMaterials, hint: hasMaterials ? undefined : 'Agrega al menos un material.' },
    { key: 'precio', label: 'Precio válido', ok: hasValidPrice, hint: hasValidPrice ? undefined : 'Sin variante con precio > $100 — revísalo.' },
    { key: 'envio', label: 'Datos de envío', ok: hasShipping, hint: hasShipping ? undefined : 'Falta peso o dimensiones.' },
  ];

  return { items, ready: items.every((i) => i.ok) };
}

// ─── Tienda ──────────────────────────────────────────────────
/** Solo los campos que necesita la evaluación (ArtisanShop es un superset). */
export interface ShopReadinessInput {
  artisanProfileCompleted?: boolean | null;
  creationStatus?: string | null;
  bankDataStatus?: string | null;
  idContraparty?: string | null;
  marketplaceApprovalStatus?: string | null;
  marketplaceApproved?: boolean | null;
  publishStatus?: string | null;
  active?: boolean | null;
}

export function computeShopReadiness(
  s: ShopReadinessInput,
  approvedProductsCount: number,
): ReadinessResult {
  const profile = s.artisanProfileCompleted === true;
  const config = s.creationStatus === 'complete';
  // Defensivo: el enum define 'approved' pero otros sitios comparan 'complete'.
  const cobre =
    s.bankDataStatus === 'complete' ||
    s.bankDataStatus === 'approved' ||
    !!(s.idContraparty && String(s.idContraparty).trim() !== '');
  const hasProduct = approvedProductsCount > 0;
  const active = s.active === true;

  const items: ReadinessItem[] = [
    { key: 'perfil', label: 'Perfil artesanal completo', ok: profile, hint: profile ? undefined : 'El artesano no terminó su perfil.' },
    { key: 'config', label: 'Configuración de tienda completa', ok: config, hint: config ? undefined : 'Onboarding de tienda a medias.' },
    { key: 'cobre', label: 'Datos bancarios / Cobre', ok: cobre, hint: cobre ? undefined : 'Sin datos de cobro — no podrá recibir pagos.' },
    { key: 'producto', label: '≥1 producto aprobado', ok: hasProduct, hint: hasProduct ? undefined : 'Necesita al menos un producto aprobado.' },
    { key: 'activa', label: 'Tienda activa', ok: active, hint: active ? undefined : 'La tienda está inactiva.' },
  ];

  return { items, ready: items.every((i) => i.ok) };
}

export function isShopApproved(s: ShopReadinessInput): boolean {
  return s.marketplaceApprovalStatus === 'approved' || s.marketplaceApproved === true;
}

export function isShopPublished(s: ShopReadinessInput): boolean {
  return s.publishStatus === 'published';
}
