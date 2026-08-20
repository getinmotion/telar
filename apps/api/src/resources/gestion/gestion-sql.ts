import { GestionFiltersDto } from './dto/gestion-filters.dto';
import {
  APPROVED_STATUS_SQL,
  FICHA_COMPLETA,
  INACTIVITY_DAYS,
  MIN_APPROVED_FOR_ACTIVE,
  TIENE_PRECIO,
} from './gestion-definiciones';

/**
 * Capa de filtros compartida del módulo Gestión.
 *
 * REGLA DURA: el orden de los parámetros globales es FIJO E INMUTABLE. Los siete
 * filtros se enlazan siempre en el mismo orden en toda query del módulo, y los
 * parámetros propios de cada consulta empiezan en $8. Así no hay que llevar la
 * cuenta de índices, que es exactamente donde se cuelan los bugs de
 * desalineación (y, con ellos, los de inyección).
 *
 * Cero interpolación de valores de usuario: lo único que se concatena en el SQL
 * son constantes declaradas por el desarrollador (predicados del registro de
 * issues, umbrales numéricos, columnas de ORDER BY de un mapa cerrado).
 *
 * PRIVACIDAD: `up` calcula booleanos (`has_id_number`, `has_rut`,
 * `has_whatsapp`, `has_address`, `has_counterparty`) dentro de los LATERAL. El
 * valor de la cédula, el RUT, el teléfono o el identificador de contraparte
 * NUNCA cruza el socket hacia Node, así que no puede acabar en un log ni en un
 * stack trace. `up_sel` sí lleva `user_id` y `user_email` como claves internas:
 * PROHIBIDO `SELECT *` en las proyecciones externas.
 */

/** Valor de `agreementId` que significa "unidades productivas sin convenio". */
export const NO_AGREEMENT = 'none';

/** Orden CANÓNICO. Nunca reordenar. */
export function globalParams(f: GestionFiltersDto): unknown[] {
  return [
    f.agreementId ?? null, // $1
    f.region ?? null, // $2
    f.department ?? null, // $3
    f.municipality ?? null, // $4
    f.from ? `${f.from.slice(0, 10)}T00:00:00.000Z` : null, // $5
    f.to ? `${f.to.slice(0, 10)}T23:59:59.999Z` : null, // $6
    f.shopStatus ?? null, // $7
  ];
}

/** Nº de parámetros globales. Los específicos de cada query empiezan en $8. */
export const GLOBAL_PARAM_COUNT = 7;

/**
 * Parámetros para el universo de FACETAS: mismos filtros pero sin convenio ni
 * geografía ($1..$4 a null).
 *
 * Las facetas pueblan los propios selectores, así que no pueden calcularse sobre
 * el resultado ya filtrado: si lo hicieran, al elegir un departamento la lista
 * se quedaría con ese único departamento y el filtro sería de un solo uso — no
 * habría manera de cambiar de valor sin limpiar todo. El cohorte de fechas y el
 * estado derivado SÍ se mantienen: acotan la vista entera, no una dimensión.
 */
export function facetParams(f: GestionFiltersDto): unknown[] {
  const p = globalParams(f);
  return [null, null, null, null, p[4], p[5], p[6]];
}

/**
 * CTE base del módulo. Una fila por unidad productiva, con todo lo que
 * cualquier endpoint pueda necesitar y con el estado derivado ya resuelto.
 *
 * Cadena: up → up_state → up_f → up_sel.
 * **Toda query aguas abajo lee `up_sel` y solo `up_sel`.** Los agregados de
 * producto hacen `JOIN shop.products_core p ON p.store_id = u.shop_id`, con lo
 * que el filtro de tienda (incluido el derivado) cae en cascada sobre los
 * productos sin repetir una sola línea de lógica.
 *
 * Uso: `${UP_BASE_CTE} SELECT … FROM up_sel u`.
 * Para añadir un CTE propio: `${UP_BASE_CTE}, mio AS (…) SELECT …`.
 */
export const UP_BASE_CTE = `
WITH up AS (
  SELECT
    s.id                                        AS shop_id,
    s.user_id                                   AS user_id,
    s.shop_name                                 AS shop_name,
    s.shop_slug                                 AS shop_slug,
    s.region                                    AS region,
    s.department                                AS department,
    s.municipality                              AS municipality,
    s.craft_type                                AS craft_type,
    s.created_at                                AS created_at,
    s.active                                    AS active,
    s.creation_status                           AS creation_status,
    s.creation_step                             AS creation_step,
    COALESCE(s.artisan_profile_completed, FALSE) AS artisan_profile_completed,
    s.bank_data_status                          AS bank_data_status,
    (s.id_contraparty IS NOT NULL AND TRIM(s.id_contraparty) <> '') AS has_counterparty,
    s.marketplace_approval_status               AS marketplace_approval_status,
    s.marketplace_approved_at                   AS marketplace_approved_at,
    s.publish_status                            AS publish_status,
    (
          s.publish_status = 'published'
      AND (s.marketplace_approval_status = 'approved' OR s.marketplace_approved IS TRUE)
    )                                           AS publicly_visible,
    (s.department IS NOT NULL AND TRIM(s.department) <> ''
     AND s.municipality IS NOT NULL AND TRIM(s.municipality) <> '') AS has_origin,
    usr.email                                   AS user_email,
    (usr.email IS NOT NULL AND TRIM(usr.email) <> '') AS has_email,
    usr.last_sign_in_at                         AS last_sign_in_at,
    agr.agreement_id                            AS agreement_id,
    agr.agreement_name                          AS agreement_name,
    COALESCE(prof.has_id_number, FALSE)         AS has_id_number,
    COALESCE(prof.has_rut, FALSE)               AS has_rut,
    COALESCE(prof.rut_pendiente, FALSE)         AS rut_pendiente,
    COALESCE(prof.has_whatsapp, FALSE)          AS has_whatsapp,
    COALESCE(addr.has_address, FALSE)           AS has_address,
    COALESCE(cat.total, 0)                      AS total_products,
    COALESCE(cat.approved, 0)                   AS approved_products,
    COALESCE(cat.pending, 0)                    AS pending_products,
    COALESCE(cat.rejected, 0)                   AS rejected_products,
    COALESCE(cat.changes_requested, 0)          AS changes_requested_products,
    COALESCE(cat.draft, 0)                      AS draft_products,
    COALESCE(cat.sheet_complete, 0)             AS sheet_complete_products,
    COALESCE(cat.priced, 0)                     AS priced_products,
    COALESCE(cat.sellable, 0)                   AS sellable_products,
    cat.last_product_update                     AS last_product_update,
    cat.last_catalog_write_at                   AS last_catalog_write_at,
    COALESCE(pass.passports_issued, 0)          AS passports_issued,
    COALESCE(pmh.rejection_events, 0)           AS rejection_events,
    pmh.last_product_moderation_at              AS last_product_moderation_at,
    smh.last_shop_moderation_at                 AS last_shop_moderation_at
  FROM shop.artisan_shops s
  LEFT JOIN auth.users usr ON usr.id = s.user_id
  LEFT JOIN LATERAL (
    SELECT pr.agreement_id, a.name AS agreement_name
    FROM artesanos.artisan_profile pr
    LEFT JOIN taxonomy.agreements a ON a.id = pr.agreement_id
    WHERE pr.user_id = s.user_id
    ORDER BY (pr.agreement_id IS NOT NULL) DESC, pr.created_at DESC
    LIMIT 1
  ) agr ON TRUE
  LEFT JOIN LATERAL (
    -- Solo booleanos: ningún valor de identidad sale de la base de datos.
    SELECT
      (pr.id_number     IS NOT NULL AND TRIM(pr.id_number) <> '')     AS has_id_number,
      (pr.rut           IS NOT NULL AND TRIM(pr.rut) <> '')           AS has_rut,
      COALESCE(pr.rut_pendiente, FALSE)                               AS rut_pendiente,
      (pr.whatsapp_e164 IS NOT NULL AND TRIM(pr.whatsapp_e164) <> '') AS has_whatsapp
    FROM artesanos.artisan_profile pr
    WHERE pr.user_id = s.user_id
    ORDER BY (pr.agreement_id IS NOT NULL) DESC, pr.created_at DESC
    LIMIT 1
  ) prof ON TRUE
  LEFT JOIN LATERAL (
    SELECT COUNT(*) FILTER (
      WHERE ad.street_address IS NOT NULL AND TRIM(ad.street_address) <> ''
    ) > 0 AS has_address
    FROM shop.addresses ad
    WHERE ad.user_id = s.user_id
  ) addr ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*)                                                            AS total,
      COUNT(*) FILTER (WHERE p.status IN ${APPROVED_STATUS_SQL})          AS approved,
      COUNT(*) FILTER (WHERE p.status = 'pending_moderation')             AS pending,
      COUNT(*) FILTER (WHERE p.status = 'rejected')                       AS rejected,
      COUNT(*) FILTER (WHERE p.status = 'changes_requested')              AS changes_requested,
      COUNT(*) FILTER (WHERE p.status = 'draft')                          AS draft,
      COUNT(*) FILTER (WHERE ${FICHA_COMPLETA})                           AS sheet_complete,
      COUNT(*) FILTER (WHERE ${TIENE_PRECIO})                             AS priced,
      COUNT(*) FILTER (WHERE p.status IN ${APPROVED_STATUS_SQL}
                         AND ${FICHA_COMPLETA} AND ${TIENE_PRECIO})       AS sellable,
      MAX(p.updated_at)                                                   AS last_product_update,
      GREATEST(
        MAX(COALESCE(p.updated_at, p.created_at)),
        MAX(vm.v_updated)
      )                                                                   AS last_catalog_write_at
    FROM shop.products_core p
    LEFT JOIN LATERAL (
      SELECT MAX(v.updated_at) AS v_updated
      FROM shop.product_variants v
      WHERE v.product_id = p.id AND v.deleted_at IS NULL
    ) vm ON TRUE
    WHERE p.store_id = s.id AND p.deleted_at IS NULL
  ) cat ON TRUE
  LEFT JOIN LATERAL (
    -- El pasaporte se une SIEMPRE vía product_id: product_identity.store_id
    -- apunta a store.stores, no a shop.artisan_shops.
    SELECT COUNT(*) AS passports_issued
    FROM digital_identity.product_identity pi
    JOIN shop.products_core p2 ON p2.id = pi.product_id AND p2.deleted_at IS NULL
    WHERE p2.store_id = s.id AND pi.is_active
  ) pass ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) FILTER (WHERE h.new_status = 'rejected') AS rejection_events,
      MAX(h.created_at)                                 AS last_product_moderation_at
    FROM shop.product_moderation_history h
    JOIN shop.products_core p3 ON p3.id = h.product_id
    WHERE p3.store_id = s.id
  ) pmh ON TRUE
  LEFT JOIN LATERAL (
    SELECT MAX(created_at) AS last_shop_moderation_at
    FROM shop.shop_moderation_history
    WHERE shop_id = s.id
  ) smh ON TRUE
  -- $1 llega como TEXTO, no como uuid, para poder expresar "sin convenio":
  -- 'none' es el único valor no-uuid que el DTO deja pasar y significa
  -- agreement_id IS NULL. Con $1::uuid no había forma de pedir ese corte y la
  -- opción "Sin convenio" del selector no filtraba nada.
  WHERE ($1::text        IS NULL
         OR ($1 = '${NO_AGREEMENT}' AND agr.agreement_id IS NULL)
         OR agr.agreement_id::text = $1)
    AND ($2::text        IS NULL OR TRIM(s.region)       = TRIM($2))
    AND ($3::text        IS NULL OR TRIM(s.department)   = TRIM($3))
    AND ($4::text        IS NULL OR TRIM(s.municipality) = TRIM($4))
    AND ($5::timestamptz IS NULL OR s.created_at >= $5)
    AND ($6::timestamptz IS NULL OR s.created_at <= $6)
),
up_state AS (
  SELECT
    up.*,
    -- "Publicado" exige el gate de la tienda: aprobar no publica.
    CASE WHEN up.publicly_visible THEN up.approved_products ELSE 0 END AS published_products,
    CASE WHEN up.publicly_visible THEN up.sellable_products  ELSE 0 END AS active_products,
    -- Actividad: login del artesano o escritura sobre su catálogo. Se excluye a
    -- propósito artisan_shops.updated_at, que se mueve cuando un moderador toca
    -- la tienda y haría parecer activa a una abandonada.
    GREATEST(up.last_sign_in_at, up.last_catalog_write_at) AS last_activity_at,
    (up.approved_products >= ${MIN_APPROVED_FOR_ACTIVE})   AS is_active_shop
  FROM up
),
up_f AS (
  SELECT
    us.*,
    (us.published_products = 0) AS risk_sin_publicados,
    (COALESCE(us.last_activity_at, us.created_at)
       < NOW() - INTERVAL '${INACTIVITY_DAYS} days') AS risk_sin_actividad,
    (
      us.published_products = 0
      OR COALESCE(us.last_activity_at, us.created_at)
           < NOW() - INTERVAL '${INACTIVITY_DAYS} days'
    ) AS is_at_risk
  FROM up_state us
),
up_sel AS (
  SELECT
    uf.*,
    -- ETIQUETA única por fila, para el pin del mapa y la fila de tabla, donde
    -- solo cabe un estado. Escalera: el estado accionable manda.
    CASE WHEN uf.is_at_risk     THEN 'en_riesgo'
         WHEN uf.is_active_shop THEN 'activa'
         ELSE 'creada' END AS derived_state
  FROM up_f uf
  -- El FILTRO usa los PREDICADOS, no la etiqueta. "Activa" y "en riesgo" no son
  -- excluyentes (una UP con 3 aprobados y sin actividad reciente es ambas), así
  -- que filtrar por la etiqueta excluyente devolvería un puñado de filas y no
  -- cuadraría con la tarjeta correspondiente: medido contra la BD, la etiqueta
  -- da 1 "activa" y el predicado da 66. El usuario que filtra por "activa"
  -- quiere las 66.
  WHERE (
    $7::text IS NULL
    OR ($7 = 'activa'    AND uf.is_active_shop)
    OR ($7 = 'en_riesgo' AND uf.is_at_risk)
    OR ($7 = 'creada'    AND NOT uf.is_active_shop AND NOT uf.is_at_risk)
  )
)`;

/**
 * Normalización idéntica a la del geocoder estático del front
 * (`normalizeLocation` en ArtisansMap / colombiaCoords): mayúsculas, sin
 * diacríticos, sin espacios sobrantes. Se hace en Node y no en SQL para no
 * depender de la extensión `unaccent` y para que la clave sea bit a bit la misma
 * que la del dataset del cliente.
 */
export function normalizeLocation(x: string): string {
  return x
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

export interface ResolvedGeo {
  /** Clave "DEPARTAMENTO|MUNICIPIO" cuando ambos campos existen. */
  geoKey: string | null;
  /**
   * Tokens normalizados extraídos de `region` cuando no hay departamento y
   * municipio estructurados. El front los prueba contra su catálogo de
   * coordenadas (como departamento, como municipio y como par) — así el dataset
   * vive en un solo sitio y aquí no se duplica.
   */
  geoTokens: string[];
  geoSource: 'estructurado' | 'region' | null;
}

/**
 * Resuelve la geolocalización con cascada, porque el dato estructurado está
 * casi vacío. Medido contra la BD (2026-07-31, 172 UP):
 *   department presente  →  24
 *   municipality presente →  30
 *   region presente       → 129  (86 con coma, parseables como "MUNICIPIO, DEPARTAMENTO")
 *   sin nada              →  43
 *
 * Usar solo el campo estructurado dejaría el mapa con 24 puntos de 172. Con el
 * fallback por `region` se llega a ~110. Los 43 restantes no son ubicables y se
 * reportan como tales en vez de desaparecer sin avisar.
 */
export function resolveGeo(
  department?: string | null,
  municipality?: string | null,
  region?: string | null,
): ResolvedGeo {
  const d = department?.trim();
  const m = municipality?.trim();
  if (d && m) {
    return {
      geoKey: `${normalizeLocation(d)}|${normalizeLocation(m)}`,
      geoTokens: [],
      geoSource: 'estructurado',
    };
  }

  const raw = region?.trim();
  if (!raw) return { geoKey: null, geoTokens: [], geoSource: null };

  // "CHIMICHAGUA, CESAR, Colombia" → ['CHIMICHAGUA', 'CESAR']
  const tokens = raw
    .split(',')
    .map((t) => normalizeLocation(t))
    .filter((t) => t.length > 1 && t !== 'COLOMBIA');

  // Si el departamento estructurado existe pero falta el municipio (o al revés),
  // ese token también es candidato válido.
  if (d) tokens.unshift(normalizeLocation(d));
  if (m) tokens.unshift(normalizeLocation(m));

  const unique = Array.from(new Set(tokens));
  return {
    geoKey: null,
    geoTokens: unique,
    geoSource: unique.length > 0 ? 'region' : null,
  };
}

/** Los filtros tal como se aplicaron, para que la UI pueda rotularlos. */
export interface AppliedFilters {
  agreementId: string | null;
  region: string | null;
  department: string | null;
  municipality: string | null;
  shopStatus: string | null;
  from: string | null;
  to: string | null;
  /** Unidades productivas que quedaron dentro del universo tras filtrar. */
  matchedShops: number;
}

export function appliedFilters(
  f: GestionFiltersDto,
  matchedShops: number,
): AppliedFilters {
  return {
    agreementId: f.agreementId ?? null,
    region: f.region ?? null,
    department: f.department ?? null,
    municipality: f.municipality ?? null,
    shopStatus: f.shopStatus ?? null,
    from: f.from ?? null,
    to: f.to ?? null,
    matchedShops,
  };
}
