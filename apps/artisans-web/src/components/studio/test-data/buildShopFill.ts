import { uploadImage, UploadFolder } from '@/services/fileUpload.actions';
import type { StudioTaxonomy } from '@/services/studioTaxonomy.actions';
import {
  getStorePoliciesConfig,
  createStorePoliciesConfig,
  updateStorePoliciesConfig,
  type StorePoliciesConfigPayload,
} from '@/services/storePoliciesConfig.actions';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';
import type { ArtisanShop, UpdateArtisanShopPayload } from '@/types/artisanShop.types';
import { recipeForCategory } from './catalog';
import { resolveShopIdentity, pickMaterialIds, withTimeout } from './resolveTaxonomy';
import { SHOP_COPY, PROFILE_COPY, fillShopCopy, type ShopCopyVars } from './shopCopy';
import { buildShopLogoSvgFile, buildShopBannerSvgFile } from './shopSvg';

/**
 * Relleno de datos de prueba para una tienda YA CREADA (Store Studio).
 *
 * Regla dura: **solo llena lo que está vacío**. Nunca sobrescribe un valor que
 * el artesano (o el equipo) ya puso, y por eso los jsonb se envían fusionados
 * con lo existente — el PATCH reemplaza la columna completa.
 *
 * Tampoco inventa datos que afirmen algo verificable de una persona real: el
 * nombre del artesano, el WhatsApp y la ubicación se **copian del registro**
 * (`/user-profiles/by-user/:userId`) o de la propia tienda; si no existen ahí, se
 * dejan vacíos. Pertenencia étnica y fotos del taller nunca se rellenan.
 *
 * Deja marca: `artisanProfile.dummyData = { injectedAt, fields }`, que el Studio
 * muestra como "(datos dummy)". NO toca `artisanProfileCompleted` ni
 * `creationStatus`: el checklist de aprobación sigue reflejando la realidad.
 */

// ─── Vacío = sin poner ───────────────────────────────────────────────────────────
const isBlank = (v: unknown): boolean =>
  v === undefined ||
  v === null ||
  (typeof v === 'string' && v.trim() === '') ||
  (typeof v === 'number' && v === 0) ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length === 0);

/** Marca que deja el inyector dentro de artisanProfile. */
export interface DummyDataMark {
  injectedAt: string;
  fields: string[];
}

export const getDummyMark = (shop: { artisanProfile?: unknown } | null | undefined): DummyDataMark | null => {
  const mark = (shop?.artisanProfile as Record<string, unknown> | undefined)?.dummyData;
  if (!mark || typeof mark !== 'object') return null;
  const m = mark as Partial<DummyDataMark>;
  return { injectedAt: m.injectedAt ?? '', fields: Array.isArray(m.fields) ? m.fields : [] };
};

export interface ShopFillEntry {
  /** Etiqueta legible para el resumen ("Historia de la tienda"). */
  label: string;
  /** Vista previa recortada del valor que se va a escribir. */
  preview: string;
}

export interface ShopFillPlan {
  entries: ShopFillEntry[];
  /** Imágenes que se generarán al confirmar (aún no subidas). */
  pendingImages: ('logo' | 'portada')[];
  /** Patch sin imágenes ni políticas; `materializeShopFill` lo completa. */
  patch: UpdateArtisanShopPayload;
  /**
   * Las políticas NO son columna de la tienda: viven en /store-policies-config y
   * se enlazan con `idPoliciesConfig`. Se aplican al confirmar.
   */
  policies?: { id?: string; payload: StorePoliciesConfigPayload };
  vars: ShopCopyVars;
  /** Campos que ya tenían valor y se dejaron intactos. */
  skipped: number;
  /** Avisos para el resumen (p. ej. datos que no se pudieron leer). */
  warnings: string[];
}

const preview = (v: unknown): string => {
  const text = Array.isArray(v)
    ? v.map((x) => (typeof x === 'string' ? x : ((x as { name?: string })?.name ?? '…'))).join(', ')
    : String(v ?? '');
  return text.length > 90 ? `${text.slice(0, 90)}…` : text;
};

/**
 * Calcula qué falta y arma el patch (sin subir imágenes: eso ocurre al confirmar).
 */
export async function planShopFill(
  shop: ArtisanShop,
  taxonomy: StudioTaxonomy,
): Promise<ShopFillPlan> {
  const s = shop as ArtisanShop & Record<string, any>;
  const profile: Record<string, any> = { ...((s.artisanProfile as Record<string, any>) ?? {}) };

  const [resolved, account] = await Promise.all([
    resolveShopIdentity({ craftType: shop.craftType, artisanProfile: profile }, taxonomy),
    // Datos REALES del registro del artesano (nombre, WhatsApp, ciudad).
    withTimeout(getUserProfileByUserId(shop.userId)).catch(() => null),
  ]);
  const recipe = recipeForCategory(resolved.categoryName);

  const accountName =
    account?.fullName?.trim() ||
    [account?.firstName, account?.lastName].filter(Boolean).join(' ').trim() ||
    '';

  const department = shop.department || profile.department || shop.region || account?.department || '';
  const municipality = shop.municipality || profile.municipality || account?.city || '';
  const place = [municipality, department].filter(Boolean).join(', ') || 'Colombia';

  const vars: ShopCopyVars = {
    taller: shop.shopName,
    oficio: (resolved.craftName ?? shop.craftType ?? 'artesanía').toLowerCase(),
    lugar: place,
    categoria: (resolved.categoryName ?? 'artesanía').toLowerCase(),
  };
  const copy = (t: string) => fillShopCopy(t, vars);

  const patch: UpdateArtisanShopPayload = {};
  const entries: ShopFillEntry[] = [];
  const filledKeys: string[] = [];
  const warnings: string[] = [];
  let skipped = 0;

  /** Escribe `value` en el patch solo si el valor actual está vacío. */
  const set = <K extends keyof UpdateArtisanShopPayload>(
    key: K,
    label: string,
    current: unknown,
    value: NonNullable<UpdateArtisanShopPayload[K]>,
  ) => {
    if (!isBlank(current)) {
      skipped++;
      return;
    }
    patch[key] = value;
    entries.push({ label, preview: preview(value) });
    filledKeys.push(String(key));
  };

  // ── Tienda ────────────────────────────────────────────────────────────────
  set('description', 'Descripción de la tienda', shop.description, copy(SHOP_COPY.description));
  set('story', 'Historia de la tienda', shop.story, copy(SHOP_COPY.story));
  set('brandClaim', 'Claim de marca', s.brandClaim, copy(SHOP_COPY.brandClaim));
  if (resolved.craftName) set('craftType', 'Oficio (craftType)', shop.craftType, resolved.craftName);
  if (department) set('region', 'Región', shop.region, department);
  if (department) set('department', 'Departamento', shop.department, department);
  if (municipality) set('municipality', 'Municipio', shop.municipality, municipality);
  set('certifications', 'Sellos', shop.certifications, [...SHOP_COPY.certifications]);
  set('primaryColors', 'Colores primarios', s.primaryColors, ['#142239', '#ec6d13']);
  set('secondaryColors', 'Colores secundarios', s.secondaryColors, ['#f9f7f2']);

  // ── aboutContent (jsonb: se envía fusionado) ──────────────────────────────
  const about = { ...((s.aboutContent as Record<string, any>) ?? {}) };
  const aboutFilled: string[] = [];
  const setAbout = (key: string, label: string, value: unknown) => {
    if (!isBlank(about[key])) {
      skipped++;
      return;
    }
    about[key] = value;
    aboutFilled.push(label);
    filledKeys.push(`aboutContent.${key}`);
  };
  setAbout('title', 'título', copy(SHOP_COPY.aboutTitle));
  setAbout('story', 'relato', copy(SHOP_COPY.aboutStory));
  setAbout('mission', 'misión', copy(SHOP_COPY.aboutMission));
  setAbout('vision', 'visión', copy(SHOP_COPY.aboutVision));
  setAbout('values', 'valores', SHOP_COPY.aboutValues.map((v) => ({ ...v })));
  if (aboutFilled.length > 0) {
    patch.aboutContent = about;
    entries.push({ label: 'Sección "Sobre el taller"', preview: aboutFilled.join(', ') });
  }

  // ── contactConfig (teléfono/WhatsApp solo si están en el registro) ────────
  const contact = { ...((s.contactConfig as Record<string, any>) ?? {}) };
  const ownerEmail: string | undefined = s.user?.email ?? s.email ?? account?.user?.email ?? undefined;
  const accountWhatsapp = account?.whatsappE164 ?? undefined;
  const contactFilled: string[] = [];
  const setContact = (key: string, label: string, value: unknown) => {
    if (!isBlank(contact[key])) {
      skipped++;
      return;
    }
    if (isBlank(value)) return;
    contact[key] = value;
    contactFilled.push(label);
    filledKeys.push(`contactConfig.${key}`);
  };
  setContact('hours', 'horario', SHOP_COPY.hours);
  setContact('address', 'dirección', copy(SHOP_COPY.address));
  setContact('email', 'email de la cuenta', ownerEmail);
  setContact('whatsapp', 'WhatsApp del registro', accountWhatsapp);
  setContact('phone', 'teléfono del registro', accountWhatsapp);
  if (contactFilled.length > 0) {
    patch.contactConfig = contact;
    entries.push({ label: 'Contacto', preview: contactFilled.join(', ') });
  }

  // ── Políticas (recurso aparte: /store-policies-config) ────────────────────
  const policiesId: string | undefined = s.idPoliciesConfig ?? undefined;
  let current: { returnPolicy?: string | null; faq?: unknown } = {};
  let policiesUnreadable = false;
  if (policiesId) {
    try {
      current = await withTimeout(getStorePoliciesConfig(policiesId));
    } catch {
      // Si no se puede leer, no se toca: sobrescribir a ciegas rompería la regla.
      policiesUnreadable = true;
      warnings.push('No se pudieron leer las políticas actuales de la tienda: se dejan como están.');
    }
  }
  const policiesPayload: StorePoliciesConfigPayload = {};
  const policiesFilled: string[] = [];
  if (policiesUnreadable) {
    skipped += 2;
  } else if (isBlank(current.returnPolicy)) {
    policiesPayload.returnPolicy = SHOP_COPY.returnPolicy;
    policiesFilled.push('devoluciones');
    filledKeys.push('policies.returnPolicy');
  } else skipped++;
  if (!policiesUnreadable && isBlank(current.faq)) {
    policiesPayload.faq = SHOP_COPY.faq.map((f) => ({ ...f }));
    policiesFilled.push(`${SHOP_COPY.faq.length} preguntas frecuentes`);
    filledKeys.push('policies.faq');
  } else if (!policiesUnreadable) skipped++;
  const policies =
    policiesFilled.length > 0 ? { id: policiesId, payload: policiesPayload } : undefined;
  if (policies) {
    entries.push({ label: 'Políticas y FAQ', preview: policiesFilled.join(', ') });
  }

  // ── seoData ───────────────────────────────────────────────────────────────
  const seo = { ...((s.seoData as Record<string, any>) ?? {}) };
  if (isBlank(seo.title) || isBlank(seo.description)) {
    if (isBlank(seo.title)) seo.title = `${shop.shopName} — ${vars.oficio} artesanal en ${place}`;
    if (isBlank(seo.description)) seo.description = copy(SHOP_COPY.description);
    if (isBlank(seo.keywords)) seo.keywords = [vars.oficio, vars.categoria, place, 'artesanía'];
    patch.seoData = seo;
    entries.push({ label: 'SEO', preview: String(seo.title) });
    filledKeys.push('seoData');
  } else skipped++;

  // ── artisanProfile (jsonb: se envía fusionado) ────────────────────────────
  const profileFilled: string[] = [];
  const setProfile = (key: string, label: string, value: unknown) => {
    if (!isBlank(profile[key])) {
      skipped++;
      return;
    }
    if (isBlank(value)) return;
    profile[key] = value;
    profileFilled.push(label);
    filledKeys.push(`artisanProfile.${key}`);
  };

  // Identidad: el nombre sale del registro; si no hay, se usa el de la tienda
  // (nunca se inventa un nombre de persona).
  setProfile('artisanName', 'nombre del artesano', accountName || shop.shopName);
  setProfile('artisticName', 'nombre artístico', shop.shopName);
  setProfile('shortBio', 'bio', copy(PROFILE_COPY.shortBio));
  // Territorio: solo se copia de la tienda, nunca se inventa
  setProfile('country', 'país', 'Colombia');
  setProfile('department', 'departamento', department);
  setProfile('municipality', 'municipio', municipality);
  // Historia y oficio
  setProfile('learnedFrom', 'cómo aprendió', PROFILE_COPY.learnedFrom);
  setProfile('learnedFromDetail', 'detalle del aprendizaje', PROFILE_COPY.learnedFromDetail);
  setProfile('startAge', 'edad de inicio', PROFILE_COPY.startAge);
  setProfile('culturalMeaning', 'significado cultural', copy(PROFILE_COPY.culturalMeaning));
  setProfile('motivation', 'motivación', copy(PROFILE_COPY.motivation));
  setProfile('craftMessage', 'mensaje del oficio', copy(PROFILE_COPY.craftMessage));
  setProfile('regionalHistory', 'historia regional', copy(PROFILE_COPY.regionalHistory));
  setProfile('uniqueness', 'qué lo hace único', copy(PROFILE_COPY.uniqueness));
  setProfile('craftStyle', 'estilo', [...PROFILE_COPY.craftStyle]);
  // Producto y taller
  setProfile('productDescription', 'qué produce', copy(PROFILE_COPY.productDescription));
  setProfile('workshopDescription', 'descripción del taller', copy(PROFILE_COPY.workshopDescription));
  setProfile('creationProcess', 'proceso de creación', copy(PROFILE_COPY.creationProcess));
  setProfile('workshopTools', 'herramientas', [...recipe.tools]);
  // Historia: aprendió en familia → no hay maestro nombrado (coherente con learnedFrom)
  setProfile('noMaestro', 'sin maestro nombrado', true);
  // Taxonomía real (UUIDs del catálogo)
  if (resolved.craftId) {
    setProfile('craftId', 'oficio', resolved.craftId);
    setProfile('craftIds', 'oficios', [resolved.craftId]);
  }
  if (resolved.categoryId) setProfile('categoryIds', 'categorías', [resolved.categoryId]);
  if (resolved.techniqueId) {
    setProfile('primaryTechniqueId', 'técnica principal', resolved.techniqueId);
    setProfile('techniqueIds', 'técnicas', [resolved.techniqueId]);
    const techniqueName = taxonomy.techniques.find((t) => t.id === resolved.techniqueId)?.name;
    if (techniqueName) setProfile('techniques', 'técnicas (nombres)', [techniqueName]);
  }
  const materialIds = pickMaterialIds(
    { craftType: shop.craftType, artisanProfile: profile },
    taxonomy,
    recipe.materialKeywords,
  );
  if (materialIds.length > 0) {
    setProfile('materialIds', 'materiales', materialIds);
    const materialNames = materialIds
      .map((id) => taxonomy.materials.find((m) => m.id === id)?.name)
      .filter((n): n is string => !!n);
    if (materialNames.length > 0) setProfile('materials', 'materiales (nombres)', materialNames);
  }

  if (profileFilled.length > 0) {
    entries.push({ label: 'Perfil artesanal', preview: profileFilled.join(', ') });
  }
  // El perfil siempre viaja (lleva la marca de datos dummy), pero fusionado.
  patch.artisanProfile = profile as UpdateArtisanShopPayload['artisanProfile'];

  // ── Imágenes ──────────────────────────────────────────────────────────────
  const pendingImages: ('logo' | 'portada')[] = [];
  if (isBlank(shop.logoUrl)) {
    pendingImages.push('logo');
    filledKeys.push('logoUrl');
  } else skipped++;
  if (isBlank(shop.bannerUrl)) {
    pendingImages.push('portada');
    filledKeys.push('bannerUrl');
  } else skipped++;
  if (pendingImages.length > 0) {
    entries.push({
      label: 'Imágenes',
      preview: `se generarán ${pendingImages.join(' y ')} (SVG con el nombre de la tienda)`,
    });
  }

  // Marca de datos dummy (se acumula con lo que ya hubiera)
  const previousMark = getDummyMark(shop);
  (profile as Record<string, unknown>).dummyData = {
    injectedAt: new Date().toISOString(),
    fields: [...new Set([...(previousMark?.fields ?? []), ...filledKeys])],
  } satisfies DummyDataMark;

  if (!accountName) {
    warnings.push('El registro del artesano no tiene nombre: el nombre del perfil se llena con el de la tienda.');
  }

  return { entries, pendingImages, patch, policies, vars, skipped, warnings };
}

/**
 * Efectos del plan que solo deben ocurrir al confirmar: subir las imágenes
 * generadas (para no dejar archivos huérfanos en S3 si se cancela) y guardar las
 * políticas en su propio recurso. Devuelve el patch definitivo de la tienda.
 */
export async function materializeShopFill(
  shop: ArtisanShop,
  plan: ShopFillPlan,
): Promise<UpdateArtisanShopPayload> {
  const patch: UpdateArtisanShopPayload = { ...plan.patch };
  const args = {
    shopName: shop.shopName,
    craftName: plan.patch.craftType ?? shop.craftType,
    place: plan.vars.lugar,
  };

  for (const kind of plan.pendingImages) {
    try {
      const file = kind === 'logo' ? buildShopLogoSvgFile(args) : buildShopBannerSvgFile(args);
      const { url } = await uploadImage(file, UploadFolder.SHOPS, undefined, { suppressToast: true });
      if (kind === 'logo') patch.logoUrl = url;
      else patch.bannerUrl = url;
    } catch {
      // Si falla la subida se guarda el resto: la imagen se puede reintentar.
    }
  }

  if (plan.policies) {
    if (plan.policies.id) {
      await updateStorePoliciesConfig(plan.policies.id, plan.policies.payload);
    } else {
      const created = await createStorePoliciesConfig(plan.policies.payload);
      // Enlaza la config nueva con la tienda (la FK sí es columna de la tienda).
      (patch as UpdateArtisanShopPayload & { idPoliciesConfig?: string }).idPoliciesConfig =
        created.id;
    }
  }

  return patch;
}
