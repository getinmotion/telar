import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GestionFiltersDto } from './dto/gestion-filters.dto';
import {
  AppliedFilters,
  NO_AGREEMENT,
  UP_BASE_CTE,
  appliedFilters,
  facetParams,
  globalParams,
  resolveGeo,
} from './gestion-sql';
import {
  CAVEATS_COMUNES,
  DEFINICIONES,
  Definition,
  INACTIVITY_DAYS,
  MIN_APPROVED_FOR_ACTIVE,
} from './gestion-definiciones';
import {
  DENOMINATOR_LABEL,
  SANIDAD_BY_CODE,
  SANIDAD_CODES,
  SANIDAD_ISSUES,
  SanidadLevel,
  SanidadSeverity,
} from './gestion-sanidad.catalog';

/**
 * Módulo GESTIÓN — capa de lectura/agregación para el centro de salud operativa
 * del back office. NO modera, NO cambia esquema: solo agrega sobre tablas que ya
 * existen (Opción B aprobada).
 *
 * F1 · Clientes en riesgo: por cada tienda cruza su configuración
 * (`shop.artisan_shops`), su catálogo real (`shop.products_core.status`) y su
 * historial de moderación (`shop.product_moderation_history` /
 * `shop.shop_moderation_history`), y calcula un score de riesgo con las razones
 * concretas que lo generan → worklist accionable "a quién llamar hoy".
 */

// products_core.status autoritativo (ver migración UpdateProductCoreStatusConstraint)
const APPROVED_STATUSES = ['approved', 'approved_with_edits'];

export type RiskSeverity = 'alta' | 'media' | 'baja';
export type RiskLevel = 'alto' | 'medio' | 'bajo' | 'sano';

export interface RiskReason {
  code: string;
  label: string;
  severity: RiskSeverity;
  detail?: string;
}

export interface ClienteEnRiesgo {
  shopId: string;
  shopName: string;
  shopSlug: string;
  userEmail: string | null;
  region: string | null;
  department: string | null;
  municipality: string | null;
  /** "DEPARTAMENTO|MUNICIPIO" cuando el dato estructurado existe. */
  geoKey: string | null;
  /** Candidatos normalizados de `region` cuando no lo hay. Ver resolveGeo(). */
  geoTokens: string[];
  geoSource: 'estructurado' | 'region' | null;
  craftType: string | null;
  agreementId: string | null;
  agreementName: string | null;
  createdAt: string;
  ageDays: number;
  active: boolean;

  riskScore: number;
  riskLevel: RiskLevel;
  reasons: RiskReason[];

  /** Estado del convenio (escalera en_riesgo > activa > creada). */
  derivedState: 'creada' | 'activa' | 'en_riesgo';
  /** Predicados del brief, no excluyentes entre sí. */
  isActiveShop: boolean;
  isAtRisk: boolean;
  riskSinPublicados: boolean;
  riskSinActividad: boolean;
  publiclyVisible: boolean;
  lastActivityAt: string | null;

  metrics: {
    totalProducts: number;
    approvedProducts: number;
    publishedProducts: number;
    passportsIssued: number;
    pendingProducts: number;
    rejectedProducts: number;
    changesRequestedProducts: number;
    draftProducts: number;
    rejectionEvents: number;
    lastModerationAt: string | null;
    lastProductUpdate: string | null;
    configComplete: boolean;
    profileComplete: boolean;
    bankReady: boolean;
    cobreReady: boolean;
    marketplaceApprovalStatus: string | null;
    marketplaceApprovedAt: string | null;
  };
}

export interface ClientesEnRiesgoResponse {
  generatedAt: string;
  filters: AppliedFilters;
  definitions: Definition[];
  /** Notas de confiabilidad (el historial de moderación se escribe desde el front). */
  caveats: string[];
  /** UP que el front no puede ubicar en el mapa (sin geoKey ni tokens). */
  unmappable: number;
  summary: {
    totalShops: number;
    atRisk: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    healthy: number;
    byReason: { code: string; label: string; count: number }[];
    byAgreement: {
      agreementId: string | null;
      agreementName: string | null;
      total: number;
      atRisk: number;
    }[];
  };
  shops: ClienteEnRiesgo[];
}

const LEVEL_THRESHOLD = { alto: 45, medio: 20 } as const;

// ─── Tarjetas de estado del convenio (Bloque 1 del brief) ────
export type MetricCode =
  | 'up_creadas'
  | 'up_activas'
  | 'up_en_riesgo'
  | 'productos_publicados'
  | 'productos_en_moderacion'
  | 'catalogos_completos'
  | 'pasaportes_emitidos';

export interface MetricDelta {
  current7d: number;
  previous7d: number;
  diff: number;
  /** null cuando la semana previa fue 0 (evita un porcentaje infinito). */
  pctChange: number | null;
}

export interface MetricCard {
  code: MetricCode;
  label: string;
  value: number;
  /** Subconjunto aclaratorio de `value`. NUNCA una cifra que se le sume. */
  secondary: { label: string; value: number } | null;
  /** Desglose informativo (p. ej. razones de riesgo). */
  breakdown: { code: string; label: string; value: number }[] | null;
  /** null ⇒ no derivable honestamente con los datos que hay. */
  delta: MetricDelta | null;
  deltaUnavailableReason: string | null;
  definitionCode: string;
}

// ─── F3 · Tiendas — Salud y onboarding ───────────────────────
export interface TiendasSaludResponse {
  generatedAt: string;
  filters: AppliedFilters;
  definitions: Definition[];
  caveats: string[];
  /** Bloque 1 del brief. Las tarjetas se solapan a propósito: no son una torta. */
  cards: MetricCard[];
  /** Valores reales de los filtros de texto libre, para poblar los selectores. */
  facets: {
    agreements: { id: string | null; name: string; count: number }[];
    departments: { value: string; count: number }[];
    regions: { value: string; count: number }[];
  };
  totalShops: number;
  /** % de tiendas plenamente operativas (activa+config+perfil+cobre+aprobada+≥1 producto). */
  healthScore: number;
  operationalShops: number;
  /** Embudo de onboarding: etapas descendentes con nº de tiendas que la alcanzan. */
  funnel: { code: string; label: string; count: number }[];
  /** Brechas accionables a nivel agregado (a cuántas tiendas afecta). */
  gaps: { code: string; label: string; hint: string; severity: RiskSeverity; count: number }[];
  approvalTime: {
    approvedCount: number;
    avgDays: number | null;
    medianDays: number | null;
  };
  productDistribution: { bucket: string; count: number }[];
  byAgreement: {
    agreementId: string | null;
    agreementName: string | null;
    total: number;
    marketplaceApproved: number;
    withApprovedProducts: number;
  }[];
  byRegion: { name: string; count: number }[];
  byCraftType: { name: string; count: number }[];
}

// ─── F4 · Backlog de moderación ──────────────────────────────
export interface ModerationBacklogResponse {
  generatedAt: string;
  filters: AppliedFilters;
  definitions: Definition[];
  caveats: string[];
  backlog: {
    pendingProducts: number;
    pendingShops: number;
    total: number;
    oldestPendingDays: number | null;
    avgPendingAgeDays: number | null;
    /** Pendientes por antigüedad (SLA informal). */
    ageBuckets: { bucket: string; count: number }[];
  };
  resolution: {
    /** Días prom. pendiente→decisión (productos, últimos 90d, aproximado). */
    avgResolutionDays: number | null;
    decidedLast7d: number;
    decidedLast30d: number;
  };
  throughputByWeek: {
    week: string;
    approved: number;
    rejected: number;
    changesRequested: number;
  }[];
  byAgreement: {
    agreementId: string | null;
    agreementName: string | null;
    pendingProducts: number;
    pendingShops: number;
    oldestPendingDays: number | null;
  }[];
}

// ─── Bloque 3 · Composición del catálogo ─────────────────────
export interface CatalogoComposicionResponse {
  generatedAt: string;
  filters: AppliedFilters;
  definitions: Definition[];
  caveats: string[];
  /** Universo de los cortes de composición y de la estadística de precio. */
  universe: 'aprobados';
  /** Sobre TODOS los productos no eliminados, para que los estados sumen. */
  byStatus: { status: string; label: string; count: number; pct: number }[];
  byCategory: { id: string | null; name: string; count: number; pct: number }[];
  byCraft: { id: string | null; name: string; count: number; pct: number }[];
  price: {
    currency: 'COP';
    /** Importes en centavos de COP. 50.000 COP = 5.000.000. */
    overall: {
      observations: number;
      avgMinor: number | null;
      minMinor: number | null;
      maxMinor: number | null;
      medianMinor: number | null;
    };
    byCategory: {
      id: string | null;
      name: string;
      observations: number;
      avgMinor: number;
      minMinor: number;
      maxMinor: number;
    }[];
    distribution: { bucket: string; fromMinor: number; toMinor: number | null; count: number; pct: number }[];
    /** Productos aprobados sin ninguna variante con precio > 0. */
    excludedNoPrice: number;
  };
}

/** Rangos de precio en centavos de COP. Constante del módulo, nunca input. */
const PRICE_BUCKETS_MINOR: { label: string; from: number; to: number | null }[] = [
  { label: 'Hasta $50.000', from: 0, to: 5_000_000 },
  { label: '$50.001 – $150.000', from: 5_000_001, to: 15_000_000 },
  { label: '$150.001 – $300.000', from: 15_000_001, to: 30_000_000 },
  { label: '$300.001 – $600.000', from: 30_000_001, to: 60_000_000 },
  { label: 'Más de $600.000', from: 60_000_001, to: null },
];

/**
 * Una observación de precio por producto aprobado: el menor precio entre sus
 * variantes vivas y activas (el precio "desde" que ya muestra el marketplace).
 * Se usa como CTE `px` encadenado a UP_BASE_CTE.
 */
const PX_CTE = `
  SELECT p.id, p.category_id, MIN(v.base_price_minor)::bigint AS price_minor
  FROM shop.products_core p
  JOIN up_sel u ON u.shop_id = p.store_id
  JOIN shop.product_variants v
    ON v.product_id = p.id AND v.deleted_at IS NULL AND v.is_active
   AND v.base_price_minor IS NOT NULL AND v.base_price_minor > 0
  WHERE p.deleted_at IS NULL AND p.status IN ('approved','approved_with_edits')
  GROUP BY p.id, p.category_id`;

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  pending_moderation: 'En moderación',
  approved: 'Aprobado',
  approved_with_edits: 'Aprobado con ediciones',
  changes_requested: 'Cambios solicitados',
  rejected: 'Rechazado',
  archived: 'Archivado',
};

// ─── Bloque 4 · Panel de sanidad de datos ────────────────────
export interface SanidadLine {
  code: string;
  label: string;
  level: SanidadLevel;
  severity: SanidadSeverity;
  hint: string;
  count: number;
  denominator: number;
  denominatorLabel: string;
  /** Porcentaje sobre SU denominador, con un decimal. */
  pct: number;
  reliability: string | null;
}

export interface SanidadUpItem {
  kind: 'up';
  shopId: string;
  shopName: string;
  shopSlug: string;
  region: string | null;
  department: string | null;
  municipality: string | null;
  agreementName: string | null;
  derivedState: string;
  missing: { code: string; label: string }[];
}

export interface SanidadProductItem {
  kind: 'producto';
  productId: string;
  productName: string;
  status: string;
  shopId: string;
  shopName: string;
  department: string | null;
  municipality: string | null;
}

export interface SanidadResponse {
  generatedAt: string;
  filters: AppliedFilters;
  definitions: Definition[];
  caveats: string[];
  summary: SanidadLine[];
  /** null ⇔ modo resumen (no se pidió ningún issue concreto). */
  detail: {
    issue: string;
    label: string;
    level: SanidadLevel;
    total: number;
    page: number;
    limit: number;
    items: (SanidadUpItem | SanidadProductItem)[];
  } | null;
}

// ─── F2b · Drill-down de issues de catálogo (compatibilidad) ──
export interface CatalogoIssueProductsResponse {
  code: string;
  total: number;
  limit: number;
  products: {
    productId: string;
    name: string;
    storeId: string;
    storeName: string;
  }[];
}

@Injectable()
export class GestionService {
  constructor(
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
  ) {}

  /**
   * GET /gestion/clientes-en-riesgo
   * Una fila por tienda con score de riesgo + razones. Ordenado por urgencia
   * (score desc, antigüedad desc — priorizamos no perder a los primeros clientes).
   */
  async getClientesEnRiesgo(
    filters: GestionFiltersDto = {},
  ): Promise<ClientesEnRiesgoResponse> {
    // Proyección explícita: `up_sel` lleva user_id, así que nada de SELECT *.
    const rows = await this.dataSource.query<any[]>(
      `${UP_BASE_CTE}
      SELECT
        u.shop_id, u.shop_name, u.shop_slug,
        u.region, u.department, u.municipality, u.craft_type,
        u.created_at, u.active, u.creation_status, u.creation_step,
        u.artisan_profile_completed, u.bank_data_status, u.has_counterparty,
        u.marketplace_approval_status, u.marketplace_approved_at,
        u.publicly_visible, u.user_email,
        u.agreement_id, u.agreement_name,
        u.total_products, u.approved_products, u.published_products,
        u.pending_products, u.rejected_products, u.changes_requested_products,
        u.draft_products, u.passports_issued,
        u.last_product_update, u.last_activity_at,
        u.rejection_events, u.last_product_moderation_at, u.last_shop_moderation_at,
        u.derived_state, u.is_active_shop, u.is_at_risk,
        u.risk_sin_publicados, u.risk_sin_actividad
      FROM up_sel u`,
      globalParams(filters),
    );

    const now = Date.now();
    const shops: ClienteEnRiesgo[] = rows.map((r) => this.scoreShop(r, now));

    // Orden por urgencia: mayor score primero; a igual score, la tienda más
    // antigua (perder a un primer cliente pesa más).
    shops.sort((a, b) => {
      if (b.riskScore !== a.riskScore) return b.riskScore - a.riskScore;
      return b.ageDays - a.ageDays;
    });

    const unmappable = shops.filter(
      (s) => !s.geoKey && s.geoTokens.length === 0,
    ).length;

    return {
      generatedAt: new Date(now).toISOString(),
      filters: appliedFilters(filters, shops.length),
      definitions: DEFINICIONES,
      caveats: [
        ...CAVEATS_COMUNES,
        'El nº de rechazos y el "último evento de moderación" se derivan del historial de moderación, que hoy se escribe desde la UI — úsalo como estimado, no como registro transaccional.',
        'El estado real del catálogo (products_core.status) sí es autoritativo.',
        'No existen coordenadas en la base de datos. El mapa se geolocaliza en el cliente a partir del departamento y el municipio, con respaldo en el texto libre de región; las unidades sin ninguno de los tres no se pueden ubicar (ver "unmappable").',
      ],
      unmappable,
      summary: this.buildSummary(shops),
      shops,
    };
  }

  /**
   * Valores que pueblan los selectores de los filtros globales.
   *
   * Cada faceta se calcula con SU PROPIA dimensión levantada: la lista de
   * convenios ignora el convenio elegido, la de departamentos ignora el
   * departamento, y así. Antes las tres salían del resultado ya filtrado, con lo
   * que al elegir un departamento la lista se quedaba con ese único valor: el
   * filtro era de un solo uso y no había forma de cambiar de corte sin limpiar
   * todo. Las dimensiones restantes sí se aplican, así que el conteo que se ve al
   * lado de cada opción es el que esa opción devolvería de verdad.
   */
  private async buildFacets(
    filters: GestionFiltersDto,
  ): Promise<TiendasSaludResponse['facets']> {
    const rows = await this.dataSource.query<any[]>(
      `${UP_BASE_CTE}
      SELECT u.agreement_id, u.agreement_name, u.region, u.department, u.municipality
      FROM up_sel u`,
      facetParams(filters),
    );

    const txt = (v: unknown) => (v == null ? '' : String(v).trim());
    // Igualdad exacta contra texto libre: la misma que aplica el SQL.
    const eq = (v: unknown, selected?: string) =>
      !selected || txt(v) === selected.trim();
    const eqAgreement = (r: any) =>
      !filters.agreementId ||
      (filters.agreementId === NO_AGREEMENT
        ? r.agreement_id == null
        : r.agreement_id === filters.agreementId);

    const agreements = new Map<
      string,
      { id: string | null; name: string; count: number }
    >();
    const departments = new Map<string, number>();
    const regions = new Map<string, number>();

    for (const r of rows) {
      const okRegion = eq(r.region, filters.region);
      const okDept = eq(r.department, filters.department);
      const okMuni = eq(r.municipality, filters.municipality);

      if (okRegion && okDept && okMuni) {
        const key = r.agreement_id ?? NO_AGREEMENT;
        const entry = agreements.get(key);
        if (entry) entry.count += 1;
        else
          agreements.set(key, {
            id: r.agreement_id ?? null,
            name: r.agreement_name ?? 'Sin convenio',
            count: 1,
          });
      }

      const dept = txt(r.department);
      if (dept && eqAgreement(r) && okRegion && okMuni) {
        departments.set(dept, (departments.get(dept) ?? 0) + 1);
      }

      const region = txt(r.region);
      if (region && eqAgreement(r) && okDept && okMuni) {
        regions.set(region, (regions.get(region) ?? 0) + 1);
      }
    }

    const byCount = <T extends { count: number }>(arr: T[]) =>
      arr.sort((a, b) => b.count - a.count);

    return {
      agreements: byCount(Array.from(agreements.values())),
      departments: byCount(
        Array.from(departments.entries()).map(([value, count]) => ({
          value,
          count,
        })),
      ),
      regions: byCount(
        Array.from(regions.entries()).map(([value, count]) => ({
          value,
          count,
        })),
      ),
    };
  }

  /**
   * GET /gestion/tiendas-salud
   * Salud del padrón de tiendas: embudo de onboarding con conteos REALES de
   * producto (mata los ceros falsos de useAdminShops), tiempo de aprobación en
   * marketplace, brechas accionables y cortes por convenio/región/oficio.
   */
  async getTiendasSalud(
    filters: GestionFiltersDto = {},
  ): Promise<TiendasSaludResponse> {
    const params = globalParams(filters);

    const [rows, deltaRow, facets] = await Promise.all([
      this.dataSource.query<any[]>(
        `${UP_BASE_CTE}
        SELECT
          u.shop_id, u.created_at, u.active, u.creation_status,
          u.artisan_profile_completed, u.bank_data_status, u.has_counterparty,
          u.marketplace_approval_status, u.marketplace_approved_at,
          u.publish_status, u.publicly_visible,
          u.region, u.department, u.craft_type,
          u.agreement_id, u.agreement_name,
          u.total_products, u.approved_products, u.published_products,
          u.pending_products, u.sheet_complete_products, u.priced_products,
          u.passports_issued,
          u.is_active_shop, u.is_at_risk,
          u.risk_sin_publicados, u.risk_sin_actividad
        FROM up_sel u`,
        params,
      ),
      this.getWeeklyDeltas(filters),
      this.buildFacets(filters),
    ]);

    const num = (v: any) => Number(v) || 0;
    const isTrue = (v: any) => v === true || v === 'true';

    const total = rows.length;
    let operational = 0;
    let sinConfig = 0;
    let sinPerfil = 0;
    let sinCobre = 0;
    let sinAprobar = 0;
    let sinPublicar = 0;
    let sinProducto = 0;
    let inactivas = 0;

    // Embudo de onboarding.
    let fConfig = 0, fPerfil = 0, fCobre = 0, fAprobada = 0, fPublicada = 0, fConProducto = 0;

    const approvalDays: number[] = [];
    const buckets = { b0: 0, b1_4: 0, b5_9: 0, b10: 0 };

    const agreementMap = new Map<
      string,
      TiendasSaludResponse['byAgreement'][number]
    >();
    const regionMap = new Map<string, number>();
    const craftMap = new Map<string, number>();

    // Acumuladores del Bloque 1.
    let cActivas = 0;
    let cActivasVisibles = 0;
    let cEnRiesgo = 0;
    let cRiesgoSinPublicados = 0;
    let cRiesgoSinActividad = 0;
    let cCatalogosCompletos = 0;
    let sProductosPublicados = 0;
    let sProductosAprobados = 0;
    let sProductosEnModeracion = 0;
    let sFichaCompleta = 0;
    let sPasaportes = 0;
    let cUpConPasaporte = 0;

    for (const r of rows) {
      const active = isTrue(r.active);
      const configComplete = r.creation_status === 'complete';
      const profileComplete = isTrue(r.artisan_profile_completed);
      // Cobre es la señal autoritativa; ver nota en gestion-definiciones.
      const cobreReady = isTrue(r.has_counterparty);
      const approved = r.marketplace_approval_status === 'approved';
      const published = r.publish_status === 'published';
      const approvedProducts = num(r.approved_products);

      // ── Bloque 1 ──────────────────────────────────────────────
      const totalProductsRow = num(r.total_products);
      const sheetCompleteRow = num(r.sheet_complete_products);
      const pricedRow = num(r.priced_products);
      const passportsRow = num(r.passports_issued);

      if (isTrue(r.is_active_shop)) {
        cActivas += 1;
        if (isTrue(r.publicly_visible)) cActivasVisibles += 1;
      }
      if (isTrue(r.is_at_risk)) cEnRiesgo += 1;
      if (isTrue(r.risk_sin_publicados)) cRiesgoSinPublicados += 1;
      if (isTrue(r.risk_sin_actividad)) cRiesgoSinActividad += 1;
      if (
        totalProductsRow > 0 &&
        sheetCompleteRow === totalProductsRow &&
        pricedRow === totalProductsRow
      ) {
        cCatalogosCompletos += 1;
      }
      sProductosPublicados += num(r.published_products);
      sProductosAprobados += approvedProducts;
      sProductosEnModeracion += num(r.pending_products);
      sFichaCompleta += sheetCompleteRow;
      sPasaportes += passportsRow;
      if (passportsRow > 0) cUpConPasaporte += 1;

      if (!active) inactivas += 1;
      if (!configComplete) sinConfig += 1;
      if (!profileComplete) sinPerfil += 1;
      if (!cobreReady) sinCobre += 1;
      if (!approved) sinAprobar += 1;
      if (approved && !published) sinPublicar += 1;
      if (approvedProducts === 0) sinProducto += 1;

      if (configComplete) fConfig += 1;
      if (configComplete && profileComplete) fPerfil += 1;
      if (configComplete && profileComplete && cobreReady) fCobre += 1;
      if (configComplete && profileComplete && cobreReady && approved) fAprobada += 1;
      if (configComplete && profileComplete && cobreReady && approved && published) fPublicada += 1;
      if (configComplete && profileComplete && cobreReady && approved && published && approvedProducts > 0)
        fConProducto += 1;

      if (active && configComplete && profileComplete && cobreReady && approved && published && approvedProducts > 0)
        operational += 1;

      // Tiempo de aprobación (días entre creación y aprobación en marketplace).
      if (approved && r.marketplace_approved_at && r.created_at) {
        const days =
          (new Date(r.marketplace_approved_at).getTime() -
            new Date(r.created_at).getTime()) /
          86_400_000;
        if (Number.isFinite(days) && days >= 0) approvalDays.push(days);
      }

      // Buckets de productos aprobados.
      if (approvedProducts === 0) buckets.b0 += 1;
      else if (approvedProducts <= 4) buckets.b1_4 += 1;
      else if (approvedProducts <= 9) buckets.b5_9 += 1;
      else buckets.b10 += 1;

      // Cortes.
      const aKey = r.agreement_id ?? '__none__';
      let aEntry = agreementMap.get(aKey);
      if (!aEntry) {
        aEntry = {
          agreementId: r.agreement_id ?? null,
          agreementName: r.agreement_name ?? (r.agreement_id ? null : 'Sin convenio'),
          total: 0,
          marketplaceApproved: 0,
          withApprovedProducts: 0,
        };
        agreementMap.set(aKey, aEntry);
      }
      aEntry.total += 1;
      if (approved) aEntry.marketplaceApproved += 1;
      if (approvedProducts > 0) aEntry.withApprovedProducts += 1;

      const region = r.region || 'Sin región';
      regionMap.set(region, (regionMap.get(region) ?? 0) + 1);
      const craft = r.craft_type || 'Sin oficio';
      craftMap.set(craft, (craftMap.get(craft) ?? 0) + 1);
    }

    const healthScore = total > 0 ? Math.round((operational / total) * 100) : 0;

    const funnel: TiendasSaludResponse['funnel'] = [
      { code: 'registradas', label: 'Registradas', count: total },
      { code: 'config', label: 'Config. completa', count: fConfig },
      { code: 'perfil', label: 'Perfil completo', count: fPerfil },
      { code: 'cobre', label: 'Puede cobrar', count: fCobre },
      { code: 'aprobada', label: 'Aprobada en marketplace', count: fAprobada },
      { code: 'publicada', label: 'Publicada (visible)', count: fPublicada },
      { code: 'con_producto', label: 'Con ≥1 producto vivo', count: fConProducto },
    ];

    const allGaps: TiendasSaludResponse['gaps'] = [
      { code: 'sin_cobre', label: 'No pueden cobrar', hint: 'Sin datos bancarios / Cobre — churn asegurado.', severity: 'alta', count: sinCobre },
      { code: 'sin_producto', label: 'Sin producto aprobado', hint: 'Registradas pero sin catálogo vivo.', severity: 'alta', count: sinProducto },
      { code: 'sin_aprobar', label: 'Sin aprobar en marketplace', hint: 'Aún no pasaron la aprobación del moderador.', severity: 'media', count: sinAprobar },
      { code: 'sin_publicar', label: 'Aprobadas pero sin publicar', hint: 'Aprobadas pero publish_status ≠ published → invisibles para compradores.', severity: 'alta', count: sinPublicar },
      { code: 'sin_config', label: 'Configuración incompleta', hint: 'Onboarding de tienda a medias.', severity: 'media', count: sinConfig },
      { code: 'sin_perfil', label: 'Perfil artesanal incompleto', hint: 'Falta la historia del artesano.', severity: 'media', count: sinPerfil },
      { code: 'inactivas', label: 'Tiendas inactivas', hint: 'Deshabilitadas o abandonadas.', severity: 'media', count: inactivas },
    ];
    const gaps = allGaps.filter((g) => g.count > 0);

    const avgDays =
      approvalDays.length > 0
        ? Math.round(approvalDays.reduce((s, d) => s + d, 0) / approvalDays.length)
        : null;
    const medianDays = this.median(approvalDays);

    const productDistribution = [
      { bucket: '0 aprobados', count: buckets.b0 },
      { bucket: '1–4', count: buckets.b1_4 },
      { bucket: '5–9', count: buckets.b5_9 },
      { bucket: '10+', count: buckets.b10 },
    ];

    const byAgreement = Array.from(agreementMap.values()).sort(
      (a, b) => b.total - a.total,
    );
    const toSortedNameCount = (m: Map<string, number>) =>
      Array.from(m.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    // ── Bloque 1: tarjetas de estado ─────────────────────────────
    // Solo dos métricas admiten variación semanal honesta: las que están
    // respaldadas por una fecha de inserción real (alta de UP y emisión de
    // pasaporte). Las demás describen un ESTADO PRESENTE cuyo cruce de umbral no
    // está fechado en ninguna tabla; derivarlas del historial de moderación no
    // vale porque ese historial se escribe desde la UI.
    const SIN_DELTA_ESTADO =
      'Es un estado presente, no un evento: no hay fecha de cuándo se alcanzó, así que la variación semanal no sería defendible.';
    const SIN_DELTA_HISTORIAL =
      'Solo estaría fechado en el historial de moderación, que se escribe desde la interfaz y no es un registro transaccional.';

    const cards: MetricCard[] = [
      {
        code: 'up_creadas',
        label: 'Unidades productivas creadas',
        value: total,
        secondary: { label: 'activas en plataforma', value: total - inactivas },
        breakdown: null,
        delta: deltaRow.upCreadas,
        deltaUnavailableReason: null,
        definitionCode: 'tienda_activa',
      },
      {
        code: 'up_activas',
        label: 'Unidades productivas activas',
        value: cActivas,
        secondary: { label: 'visibles al público', value: cActivasVisibles },
        breakdown: null,
        delta: null,
        deltaUnavailableReason: SIN_DELTA_ESTADO,
        definitionCode: 'tienda_activa',
      },
      {
        code: 'up_en_riesgo',
        label: 'Unidades productivas en riesgo',
        value: cEnRiesgo,
        secondary: null,
        breakdown: [
          {
            code: 'sin_publicados',
            label: 'Sin productos publicados',
            value: cRiesgoSinPublicados,
          },
          {
            code: 'sin_actividad',
            label: `Sin actividad en ${INACTIVITY_DAYS} días`,
            value: cRiesgoSinActividad,
          },
        ],
        delta: null,
        deltaUnavailableReason: SIN_DELTA_ESTADO,
        definitionCode: 'tienda_en_riesgo',
      },
      {
        code: 'productos_publicados',
        label: 'Productos publicados',
        value: sProductosPublicados,
        secondary: {
          label: 'aprobados por moderación',
          value: sProductosAprobados,
        },
        breakdown: null,
        delta: null,
        deltaUnavailableReason: SIN_DELTA_ESTADO,
        definitionCode: 'producto_activo',
      },
      {
        code: 'productos_en_moderacion',
        label: 'Productos en moderación',
        value: sProductosEnModeracion,
        secondary: null,
        breakdown: null,
        delta: null,
        deltaUnavailableReason: SIN_DELTA_HISTORIAL,
        definitionCode: 'producto_activo',
      },
      {
        code: 'catalogos_completos',
        label: 'Catálogos completos',
        value: cCatalogosCompletos,
        secondary: {
          label: 'productos con ficha completa',
          value: sFichaCompleta,
        },
        breakdown: null,
        delta: null,
        deltaUnavailableReason: SIN_DELTA_ESTADO,
        definitionCode: 'catalogo_completo',
      },
      {
        code: 'pasaportes_emitidos',
        label: 'Pasaportes de Origen emitidos',
        value: sPasaportes,
        secondary: {
          label: 'unidades productivas con al menos uno',
          value: cUpConPasaporte,
        },
        breakdown: null,
        delta: deltaRow.pasaportes,
        deltaUnavailableReason: null,
        definitionCode: 'pasaporte_origen',
      },
    ];

    return {
      generatedAt: new Date().toISOString(),
      filters: appliedFilters(filters, total),
      definitions: DEFINICIONES,
      caveats: [
        ...CAVEATS_COMUNES,
        'Conteos de producto tomados de products_core.status (autoritativo) — reemplazan los ceros falsos de useAdminShops.',
        '“Días hasta aprobar” = días entre que la tienda se registra y queda aprobada en el marketplace; el promedio solo considera tiendas ya aprobadas.',
        'Aprobar (marketplaceApproved) y publicar (publishStatus) son pasos separados: una tienda solo es visible para compradores si además está publicada. “Listas para vender” exige ambos + ≥1 producto aprobado.',
        `Solo dos tarjetas admiten variación semanal honesta (unidades creadas y pasaportes emitidos), porque son las únicas respaldadas por una fecha de inserción. Las demás se entregan sin variación y explican por qué.`,
        `“Activas” y “en riesgo” se cuentan por separado y pueden solaparse: una UP con ${MIN_APPROVED_FOR_ACTIVE} productos aprobados y sin actividad reciente cuenta en ambas. No suman al total.`,
      ],
      cards,
      facets,
      totalShops: total,
      healthScore,
      operationalShops: operational,
      funnel,
      gaps,
      approvalTime: {
        approvedCount: approvalDays.length,
        avgDays,
        medianDays,
      },
      productDistribution,
      byAgreement,
      byRegion: toSortedNameCount(regionMap),
      byCraftType: toSortedNameCount(craftMap),
    };
  }

  /**
   * GET /gestion/moderation-backlog
   * Cola de moderación cross-dominio: pendientes actuales (productos + tiendas)
   * con antigüedad, tiempo aprox. de resolución, throughput semanal y cortes por
   * convenio. Deriva del historial de moderación → techo de confiabilidad (se
   * escribe desde la UI); el conteo de pendientes sí es autoritativo.
   */
  async getModerationBacklog(
    filters: GestionFiltersDto = {},
  ): Promise<ModerationBacklogResponse> {
    const params = globalParams(filters);
    const [
      pendingProductRows,
      pendingShopRows,
      throughputRows,
      resolutionRow,
      decidedRow,
    ] = await Promise.all([
      // Productos pendientes ahora + cuándo entraron a pendiente + convenio.
      this.dataSource.query<any[]>(
        `${UP_BASE_CTE}
        SELECT
          pc.id,
          pc.created_at,
          pc.updated_at,
          u.agreement_id,
          u.agreement_name,
          ph.entered_pending_at
        FROM shop.products_core pc
        JOIN up_sel u ON u.shop_id = pc.store_id
        LEFT JOIN LATERAL (
          SELECT MAX(h.created_at) AS entered_pending_at
          FROM shop.product_moderation_history h
          WHERE h.product_id = pc.id AND h.new_status = 'pending_moderation'
        ) ph ON TRUE
        WHERE pc.status = 'pending_moderation' AND pc.deleted_at IS NULL`,
        params,
      ),
      // Tiendas pendientes de aprobación + convenio.
      this.dataSource.query<any[]>(
        `${UP_BASE_CTE}
        SELECT u.shop_id AS id, u.created_at, u.agreement_id, u.agreement_name
        FROM up_sel u
        WHERE u.marketplace_approval_status = 'pending'`,
        params,
      ),
      // Throughput de decisiones por semana (productos, últimas 8 semanas).
      this.dataSource.query<any[]>(
        `${UP_BASE_CTE}
        SELECT
          DATE_TRUNC('week', h.created_at) AS week,
          COUNT(*) FILTER (WHERE h.new_status IN ('approved', 'approved_with_edits')) AS approved,
          COUNT(*) FILTER (WHERE h.new_status = 'rejected')                          AS rejected,
          COUNT(*) FILTER (WHERE h.new_status = 'changes_requested')                 AS changes_requested
        FROM shop.product_moderation_history h
        JOIN shop.products_core pc ON pc.id = h.product_id
        JOIN up_sel u ON u.shop_id = pc.store_id
        WHERE h.created_at >= NOW() - INTERVAL '8 weeks'
          AND h.new_status IN ('approved', 'approved_with_edits', 'rejected', 'changes_requested')
        GROUP BY DATE_TRUNC('week', h.created_at)
        ORDER BY week ASC`,
        params,
      ),
      // Tiempo prom. pendiente→decisión (productos, últimos 90 días, aprox).
      this.dataSource.query<any[]>(
        `${UP_BASE_CTE}
        SELECT AVG(EXTRACT(EPOCH FROM (d.created_at - pr.created_at)) / 86400.0) AS avg_days
        FROM shop.product_moderation_history d
        JOIN shop.products_core pc ON pc.id = d.product_id
        JOIN up_sel u ON u.shop_id = pc.store_id
        JOIN LATERAL (
          SELECT pr.created_at
          FROM shop.product_moderation_history pr
          WHERE pr.product_id = d.product_id
            AND pr.new_status = 'pending_moderation'
            AND pr.created_at <= d.created_at
          ORDER BY pr.created_at DESC
          LIMIT 1
        ) pr ON TRUE
        WHERE d.new_status IN ('approved', 'approved_with_edits', 'rejected', 'changes_requested')
          AND d.created_at >= NOW() - INTERVAL '90 days'`,
        params,
      ),
      // Decisiones tomadas en 7 / 30 días.
      this.dataSource.query<any[]>(
        `${UP_BASE_CTE}
        SELECT
          COUNT(*) FILTER (WHERE h.created_at >= NOW() - INTERVAL '7 days')  AS d7,
          COUNT(*) FILTER (WHERE h.created_at >= NOW() - INTERVAL '30 days') AS d30
        FROM shop.product_moderation_history h
        JOIN shop.products_core pc ON pc.id = h.product_id
        JOIN up_sel u ON u.shop_id = pc.store_id
        WHERE h.new_status IN ('approved', 'approved_with_edits', 'rejected', 'changes_requested')`,
        params,
      ),
    ]);

    const now = Date.now();
    const ageInDays = (iso: any): number =>
      iso ? Math.max(0, (now - new Date(iso).getTime()) / 86_400_000) : 0;

    // Antigüedad de cada pendiente.
    const productAges = pendingProductRows.map((r) =>
      ageInDays(r.entered_pending_at ?? r.updated_at ?? r.created_at),
    );
    const shopAges = pendingShopRows.map((r) => ageInDays(r.created_at));
    const allAges = [...productAges, ...shopAges];

    const oldestPendingDays = allAges.length ? Math.round(Math.max(...allAges)) : null;
    const avgPendingAgeDays = allAges.length
      ? Math.round(allAges.reduce((s, d) => s + d, 0) / allAges.length)
      : null;

    const bucketOf = (d: number): string => {
      if (d < 2) return '< 2 días';
      if (d < 7) return '2–7 días';
      if (d < 30) return '7–30 días';
      return '> 30 días';
    };
    const bucketOrder = ['< 2 días', '2–7 días', '7–30 días', '> 30 días'];
    const bucketCounts = new Map<string, number>();
    for (const d of allAges) {
      const b = bucketOf(d);
      bucketCounts.set(b, (bucketCounts.get(b) ?? 0) + 1);
    }
    const ageBuckets = bucketOrder
      .map((bucket) => ({ bucket, count: bucketCounts.get(bucket) ?? 0 }))
      .filter((b) => b.count > 0);

    // Cortes por convenio.
    const agreementMap = new Map<
      string,
      ModerationBacklogResponse['byAgreement'][number]
    >();
    const touchAgreement = (r: any) => {
      const key = r.agreement_id ?? '__none__';
      let entry = agreementMap.get(key);
      if (!entry) {
        entry = {
          agreementId: r.agreement_id ?? null,
          agreementName: r.agreement_name ?? (r.agreement_id ? null : 'Sin convenio'),
          pendingProducts: 0,
          pendingShops: 0,
          oldestPendingDays: null,
        };
        agreementMap.set(key, entry);
      }
      return entry;
    };
    pendingProductRows.forEach((r) => {
      const e = touchAgreement(r);
      e.pendingProducts += 1;
      const age = Math.round(ageInDays(r.entered_pending_at ?? r.updated_at ?? r.created_at));
      e.oldestPendingDays = Math.max(e.oldestPendingDays ?? 0, age);
    });
    pendingShopRows.forEach((r) => {
      const e = touchAgreement(r);
      e.pendingShops += 1;
      const age = Math.round(ageInDays(r.created_at));
      e.oldestPendingDays = Math.max(e.oldestPendingDays ?? 0, age);
    });
    const byAgreement = Array.from(agreementMap.values()).sort(
      (a, b) =>
        b.pendingProducts + b.pendingShops - (a.pendingProducts + a.pendingShops),
    );

    const avgResolutionDays =
      resolutionRow[0]?.avg_days != null
        ? Math.round(Number(resolutionRow[0].avg_days))
        : null;

    return {
      generatedAt: new Date(now).toISOString(),
      filters: appliedFilters(filters, pendingShopRows.length),
      definitions: DEFINICIONES,
      caveats: [
        ...CAVEATS_COMUNES,
        'El conteo de pendientes (products_core.status / marketplace_approval_status) es autoritativo.',
        'La antigüedad, el tiempo de resolución y el throughput derivan del historial de moderación, que se escribe desde la UI — trátalos como estimados.',
      ],
      backlog: {
        pendingProducts: pendingProductRows.length,
        pendingShops: pendingShopRows.length,
        total: pendingProductRows.length + pendingShopRows.length,
        oldestPendingDays,
        avgPendingAgeDays,
        ageBuckets,
      },
      resolution: {
        avgResolutionDays,
        decidedLast7d: Number(decidedRow[0]?.d7) || 0,
        decidedLast30d: Number(decidedRow[0]?.d30) || 0,
      },
      throughputByWeek: throughputRows.map((r) => ({
        week: r.week,
        approved: Number(r.approved) || 0,
        rejected: Number(r.rejected) || 0,
        changesRequested: Number(r.changes_requested) || 0,
      })),
      byAgreement,
    };
  }

  /**
   * GET /gestion/catalogo-issue-products
   * Productos afectados por un issue de catálogo (drill-down desde la cola de
   * detección de Productos), con storeId para deep-link a Product Studio.
   */
  async getCatalogoIssueProducts(
    code: string,
    limit = 50,
    filters: GestionFiltersDto = {},
  ): Promise<CatalogoIssueProductsResponse> {
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const issue = SANIDAD_BY_CODE[code];
    if (!issue || issue.level !== 'producto') {
      return { code, total: 0, limit: safeLimit, products: [] };
    }

    const { rows, total } = await this.queryProductIssue(
      issue.predicate,
      filters,
      safeLimit,
      0,
    );

    return {
      code,
      total,
      limit: safeLimit,
      products: rows.map((r) => ({
        productId: r.product_id,
        name: r.product_name,
        storeId: r.shop_id,
        storeName: r.shop_name,
      })),
    };
  }

  /**
   * GET /gestion/catalogo-composicion
   *
   * Bloque 3 del brief: qué hay en el catálogo del programa y cómo está
   * estructurada su oferta. Vive aquí y no en /products-new/analytics porque ese
   * endpoint resuelve ~30 subconsultas contra tablas satélite sin join a tienda:
   * hacerlo filtrable exigiría reescribirlas todas. Aquí el filtrado sale gratis
   * del CTE compartido, y así el mismo corte da el mismo número que las demás
   * pantallas.
   *
   * NOTA DE PRESENTACIÓN: es estructura de oferta, no desempeño comercial. No se
   * infiere ni se proyecta ingreso a partir de estos precios.
   */
  async getCatalogoComposicion(
    filters: GestionFiltersDto = {},
  ): Promise<CatalogoComposicionResponse> {
    const params = globalParams(filters);
    const num = (v: any) => Number(v) || 0;

    const [statusRows, categoryRows, craftRows, priceRow, priceCatRows, bucketRows] =
      await Promise.all([
        this.dataSource.query<any[]>(
          `${UP_BASE_CTE}
          SELECT p.status, COUNT(*)::int AS count
          FROM shop.products_core p
          JOIN up_sel u ON u.shop_id = p.store_id
          WHERE p.deleted_at IS NULL
          GROUP BY p.status`,
          params,
        ),
        this.dataSource.query<any[]>(
          `${UP_BASE_CTE}
          SELECT p.category_id AS id, COALESCE(c.name, 'Sin categoría') AS name,
                 COUNT(*)::int AS count
          FROM shop.products_core p
          JOIN up_sel u ON u.shop_id = p.store_id
          LEFT JOIN taxonomy.categories c ON c.id = p.category_id
          WHERE p.deleted_at IS NULL AND p.status IN ('approved','approved_with_edits')
          GROUP BY p.category_id, c.name
          ORDER BY count DESC`,
          params,
        ),
        this.dataSource.query<any[]>(
          `${UP_BASE_CTE}
          SELECT ai.primary_craft_id AS id, COALESCE(cr.name, 'Sin oficio') AS name,
                 COUNT(*)::int AS count
          FROM shop.products_core p
          JOIN up_sel u ON u.shop_id = p.store_id
          LEFT JOIN shop.product_artisanal_identity ai
                 ON ai.product_id = p.id AND ai.deleted_at IS NULL
          LEFT JOIN taxonomy.crafts cr ON cr.id = ai.primary_craft_id
          WHERE p.deleted_at IS NULL AND p.status IN ('approved','approved_with_edits')
          GROUP BY ai.primary_craft_id, cr.name
          ORDER BY count DESC`,
          params,
        ),
        // Una observación por producto: el precio "desde" (menor variante viva),
        // para que un producto con 8 SKUs no sesgue el promedio.
        this.dataSource.query<any[]>(
          `${UP_BASE_CTE}, px AS (${PX_CTE})
          SELECT
            COUNT(*)::int AS observations,
            ROUND(AVG(price_minor))::bigint AS avg_minor,
            MIN(price_minor)::bigint AS min_minor,
            MAX(price_minor)::bigint AS max_minor,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price_minor)::bigint AS median_minor
          FROM px`,
          params,
        ),
        this.dataSource.query<any[]>(
          `${UP_BASE_CTE}, px AS (${PX_CTE})
          SELECT px.category_id AS id, COALESCE(c.name, 'Sin categoría') AS name,
                 COUNT(*)::int AS observations,
                 ROUND(AVG(px.price_minor))::bigint AS avg_minor,
                 MIN(px.price_minor)::bigint AS min_minor,
                 MAX(px.price_minor)::bigint AS max_minor
          FROM px
          LEFT JOIN taxonomy.categories c ON c.id = px.category_id
          GROUP BY px.category_id, c.name
          ORDER BY observations DESC`,
          params,
        ),
        this.dataSource.query<any[]>(
          `${UP_BASE_CTE}, px AS (${PX_CTE})
          SELECT
            ${PRICE_BUCKETS_MINOR.map(
              (b, i) =>
                `COUNT(*) FILTER (WHERE price_minor >= ${b.from}${
                  b.to === null ? '' : ` AND price_minor <= ${b.to}`
                })::int AS "b${i}"`,
            ).join(',\n            ')}
          FROM px`,
          params,
        ),
      ]);

    // Aprobados sin ninguna variante con precio: quedan fuera de la estadística
    // y se reportan, en vez de desaparecer sin avisar.
    const totalApproved = statusRows
      .filter((r) => ['approved', 'approved_with_edits'].includes(r.status))
      .reduce((s, r) => s + num(r.count), 0);
    const observations = num(priceRow[0]?.observations);

    const totalProducts = statusRows.reduce((s, r) => s + num(r.count), 0);
    const pctOf = (n: number, d: number) =>
      d > 0 ? Math.round((n / d) * 1000) / 10 : 0;

    const bucket = bucketRows[0] ?? {};

    return {
      generatedAt: new Date().toISOString(),
      filters: appliedFilters(filters, 0),
      definitions: DEFINICIONES,
      caveats: [
        ...CAVEATS_COMUNES,
        'Es un dato de composición de catálogo, no de venta: describe la estructura de la oferta. No se infiere ni se proyecta ingreso a partir de esta información.',
        'La composición por categoría y oficio y la estadística de precio se calculan sobre productos aprobados; los borradores distorsionarían el promedio. La distribución por estado sí cubre todos los productos no eliminados.',
        'Cada producto aporta una sola observación de precio: el menor precio entre sus variantes vivas y activas (precio “desde”). Los importes están en centavos de peso colombiano.',
      ],
      universe: 'aprobados',
      byStatus: statusRows
        .map((r) => ({
          status: r.status,
          label: STATUS_LABELS[r.status] ?? r.status,
          count: num(r.count),
          pct: pctOf(num(r.count), totalProducts),
        }))
        .sort((a, b) => b.count - a.count),
      byCategory: categoryRows.map((r) => ({
        id: r.id ?? null,
        name: r.name,
        count: num(r.count),
        pct: pctOf(num(r.count), totalApproved),
      })),
      byCraft: craftRows.map((r) => ({
        id: r.id ?? null,
        name: r.name,
        count: num(r.count),
        pct: pctOf(num(r.count), totalApproved),
      })),
      price: {
        currency: 'COP',
        overall: {
          observations,
          avgMinor: priceRow[0]?.avg_minor != null ? num(priceRow[0].avg_minor) : null,
          minMinor: priceRow[0]?.min_minor != null ? num(priceRow[0].min_minor) : null,
          maxMinor: priceRow[0]?.max_minor != null ? num(priceRow[0].max_minor) : null,
          medianMinor:
            priceRow[0]?.median_minor != null ? num(priceRow[0].median_minor) : null,
        },
        byCategory: priceCatRows.map((r) => ({
          id: r.id ?? null,
          name: r.name,
          observations: num(r.observations),
          avgMinor: num(r.avg_minor),
          minMinor: num(r.min_minor),
          maxMinor: num(r.max_minor),
        })),
        distribution: PRICE_BUCKETS_MINOR.map((b, i) => ({
          bucket: b.label,
          fromMinor: b.from,
          toMinor: b.to,
          count: num(bucket[`b${i}`]),
          pct: pctOf(num(bucket[`b${i}`]), observations),
        })),
        excludedNoPrice: Math.max(0, totalApproved - observations),
      },
    };
  }

  /**
   * GET /gestion/sanidad-datos
   *
   * Bloque 4 del brief. Un endpoint con dos modos: sin `issue` devuelve el
   * resumen de todas las líneas; con `issue` devuelve además el listado nominal
   * paginado para el drill-down y el CSV.
   *
   * El resumen viaja SIEMPRE, también en modo detalle: un CSV exportado sin su
   * denominador se malinterpreta en una reunión de convenio. A esta escala
   * (~172 UP, ~600 productos) recalcularlo es ruido.
   */
  async getSanidadDatos(
    filters: GestionFiltersDto = {},
    issueCode?: string,
    page = 1,
    limit = 50,
  ): Promise<SanidadResponse> {
    if (issueCode && !SANIDAD_BY_CODE[issueCode]) {
      // Devolver vacío haría indistinguible "no hay problemas" de "escribiste
      // mal el código", que es justo el bug del endpoint anterior.
      throw new BadRequestException(
        `Issue desconocido: "${issueCode}". Válidos: ${SANIDAD_CODES.join(', ')}.`,
      );
    }

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 500);
    const params = globalParams(filters);

    const upIssues = SANIDAD_ISSUES.filter((i) => i.level === 'up');
    const prodIssues = SANIDAD_ISSUES.filter((i) => i.level === 'producto');

    const [upRow, prodRow] = await Promise.all([
      this.dataSource.query<any[]>(
        `${UP_BASE_CTE}
        SELECT
          COUNT(*)::int AS denom,
          ${upIssues
            .map(
              (i) =>
                `COUNT(*) FILTER (WHERE ${i.predicate})::int AS "${i.code}"`,
            )
            .join(',\n          ')}
        FROM up_sel u`,
        params,
      ),
      this.dataSource.query<any[]>(
        `${UP_BASE_CTE}
        SELECT
          COUNT(*)::int AS denom_all,
          COUNT(*) FILTER (WHERE p.status IN ('approved','approved_with_edits'))::int AS denom_approved,
          ${prodIssues
            .map(
              (i) =>
                `COUNT(*) FILTER (WHERE ${i.predicate})::int AS "${i.code}"`,
            )
            .join(',\n          ')}
        FROM shop.products_core p
        JOIN up_sel u ON u.shop_id = p.store_id
        WHERE p.deleted_at IS NULL`,
        params,
      ),
    ]);

    const up = upRow[0] ?? {};
    const prod = prodRow[0] ?? {};
    const denomFor = (d: string): number => {
      if (d === 'up') return Number(up.denom) || 0;
      if (d === 'productos_aprobados') return Number(prod.denom_approved) || 0;
      return Number(prod.denom_all) || 0;
    };

    const summary: SanidadLine[] = SANIDAD_ISSUES.map((i) => {
      const src = i.level === 'up' ? up : prod;
      const count = Number(src[i.code]) || 0;
      const denominator = denomFor(i.denominator);
      return {
        code: i.code,
        label: i.label,
        level: i.level,
        severity: i.severity,
        hint: i.hint,
        count,
        denominator,
        denominatorLabel: DENOMINATOR_LABEL[i.denominator],
        pct:
          denominator > 0
            ? Math.round((count / denominator) * 1000) / 10
            : 0,
        reliability: i.reliability ?? null,
      };
    })
      // Primero lo que más duele: severidad, y dentro de ella, volumen.
      .sort((a, b) => {
        const rank = { alta: 0, media: 1, baja: 2 } as const;
        if (rank[a.severity] !== rank[b.severity])
          return rank[a.severity] - rank[b.severity];
        return b.count - a.count;
      });

    const detail = issueCode
      ? await this.getSanidadDetail(issueCode, filters, safePage, safeLimit)
      : null;

    return {
      generatedAt: new Date().toISOString(),
      filters: appliedFilters(filters, Number(up.denom) || 0),
      definitions: DEFINICIONES,
      caveats: [
        ...CAVEATS_COMUNES,
        'Cada línea tiene su propio denominador (unidades productivas, productos no eliminados o productos aprobados). Los porcentajes no son comparables entre líneas de distinto nivel.',
        'Este panel muestra si el dato existe y si está verificado. Nunca el número de cuenta, la entidad, el documento de identidad ni ningún valor personal.',
      ],
      summary,
      detail,
    };
  }

  /** Listado nominal de una línea de sanidad. Paginado siempre. */
  private async getSanidadDetail(
    code: string,
    filters: GestionFiltersDto,
    page: number,
    limit: number,
  ): Promise<SanidadResponse['detail']> {
    const issue = SANIDAD_BY_CODE[code];
    const offset = (page - 1) * limit;

    if (issue.level === 'up') {
      const subs = issue.subReasons ?? [];
      const rows = await this.dataSource.query<any[]>(
        `${UP_BASE_CTE}
        SELECT
          u.shop_id, u.shop_name, u.shop_slug,
          u.region, u.department, u.municipality,
          u.agreement_name, u.derived_state,
          ${subs.length > 0 ? subs.map((s) => `(${s.expr}) AS "sub_${s.code}"`).join(',\n          ') + ',' : ''}
          COUNT(*) OVER()::int AS total
        FROM up_sel u
        WHERE ${issue.predicate}
        ORDER BY u.shop_name ASC
        LIMIT $8 OFFSET $9`,
        [...globalParams(filters), limit, offset],
      );

      const items: SanidadUpItem[] = rows.map((r) => ({
        kind: 'up',
        shopId: r.shop_id,
        shopName: r.shop_name,
        shopSlug: r.shop_slug,
        region: r.region ?? null,
        department: r.department ?? null,
        municipality: r.municipality ?? null,
        agreementName: r.agreement_name ?? null,
        derivedState: r.derived_state,
        missing: subs
          .filter((s) => r[`sub_${s.code}`] === true || r[`sub_${s.code}`] === 'true')
          .map((s) => ({ code: s.code, label: s.label })),
      }));

      return {
        issue: code,
        label: issue.label,
        level: 'up',
        total: rows.length > 0 ? Number(rows[0].total) : 0,
        page,
        limit,
        items,
      };
    }

    const { rows, total } = await this.queryProductIssue(
      issue.predicate,
      filters,
      limit,
      offset,
    );

    const items: SanidadProductItem[] = rows.map((r) => ({
      kind: 'producto',
      productId: r.product_id,
      productName: r.product_name,
      status: r.status,
      shopId: r.shop_id,
      shopName: r.shop_name,
      department: r.department ?? null,
      municipality: r.municipality ?? null,
    }));

    return {
      issue: code,
      label: issue.label,
      level: 'producto',
      total,
      page,
      limit,
      items,
    };
  }

  /** Query compartida del listado nominal de productos por predicado. */
  private async queryProductIssue(
    predicate: string,
    filters: GestionFiltersDto,
    limit: number,
    offset: number,
  ): Promise<{ rows: any[]; total: number }> {
    const rows = await this.dataSource.query<any[]>(
      `${UP_BASE_CTE}
      SELECT
        p.id          AS product_id,
        p.name        AS product_name,
        p.status      AS status,
        u.shop_id     AS shop_id,
        u.shop_name   AS shop_name,
        u.department  AS department,
        u.municipality AS municipality,
        COUNT(*) OVER()::int AS total
      FROM shop.products_core p
      JOIN up_sel u ON u.shop_id = p.store_id
      WHERE p.deleted_at IS NULL AND (${predicate})
      ORDER BY u.shop_name ASC, p.created_at DESC
      LIMIT $8 OFFSET $9`,
      [...globalParams(filters), limit, offset],
    );
    return { rows, total: rows.length > 0 ? Number(rows[0].total) : 0 };
  }

  /**
   * Variación semanal, SOLO para las dos métricas que están respaldadas por una
   * fecha de inserción real: el alta de la unidad productiva
   * (`artisan_shops.created_at`) y la emisión del Pasaporte de Origen
   * (`product_identity.created_at`). Ambas son eventos, no estados.
   *
   * Se comparan [ahora-7d, ahora) contra [ahora-14d, ahora-7d), siempre dentro
   * del universo ya filtrado. Si el rango seleccionado termina antes de la
   * ventana de comparación, se devuelve null en vez de un cero engañoso.
   */
  private async getWeeklyDeltas(filters: GestionFiltersDto): Promise<{
    upCreadas: MetricDelta | null;
    pasaportes: MetricDelta | null;
  }> {
    if (filters.to) {
      const to = new Date(`${filters.to.slice(0, 10)}T23:59:59.999Z`).getTime();
      if (Number.isFinite(to) && to < Date.now() - 7 * 86_400_000) {
        return { upCreadas: null, pasaportes: null };
      }
    }

    const rows = await this.dataSource.query<any[]>(
      `${UP_BASE_CTE}
      SELECT
        COUNT(*) FILTER (WHERE u.created_at >= NOW() - INTERVAL '7 days')::int  AS up_cur,
        COUNT(*) FILTER (WHERE u.created_at >= NOW() - INTERVAL '14 days'
                           AND u.created_at <  NOW() - INTERVAL '7 days')::int  AS up_prev,
        COALESCE(SUM(pw.cur), 0)::int  AS pass_cur,
        COALESCE(SUM(pw.prev), 0)::int AS pass_prev
      FROM up_sel u
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) FILTER (WHERE pi.created_at >= NOW() - INTERVAL '7 days')  AS cur,
          COUNT(*) FILTER (WHERE pi.created_at >= NOW() - INTERVAL '14 days'
                             AND pi.created_at <  NOW() - INTERVAL '7 days')  AS prev
        FROM digital_identity.product_identity pi
        JOIN shop.products_core p ON p.id = pi.product_id AND p.deleted_at IS NULL
        WHERE p.store_id = u.shop_id AND pi.is_active
      ) pw ON TRUE`,
      globalParams(filters),
    );

    const r = rows[0] ?? {};
    const mk = (cur: any, prev: any): MetricDelta => {
      const c = Number(cur) || 0;
      const p = Number(prev) || 0;
      return {
        current7d: c,
        previous7d: p,
        diff: c - p,
        pctChange: p > 0 ? Math.round(((c - p) / p) * 100) : null,
      };
    };

    return {
      upCreadas: mk(r.up_cur, r.up_prev),
      pasaportes: mk(r.pass_cur, r.pass_prev),
    };
  }

  private median(values: number[]): number | null {
    if (values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const m =
      sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
    return Math.round(m);
  }

  // ─── Scoring ────────────────────────────────────────────────
  private scoreShop(r: any, now: number): ClienteEnRiesgo {
    const num = (v: any) => Number(v) || 0;

    const totalProducts = num(r.total_products);
    const approvedProducts = num(r.approved_products);
    const pendingProducts = num(r.pending_products);
    const rejectedProducts = num(r.rejected_products);
    const changesRequestedProducts = num(r.changes_requested_products);
    const draftProducts = num(r.draft_products);
    const rejectionEvents = num(r.rejection_events);

    const active = r.active === true || r.active === 'true';
    const configComplete = r.creation_status === 'complete';
    const profileComplete =
      r.artisan_profile_completed === true ||
      r.artisan_profile_completed === 'true';
    // La señal autoritativa es Cobre (id_contraparty): existe porque el PSP
    // aceptó los datos. `bank_data_status` casi no se escribe (2 de 172 UP), así
    // que exigirlo daría un falso positivo en prácticamente todo el padrón.
    const cobreReady = r.has_counterparty === true || r.has_counterparty === 'true';
    const bankReady = r.bank_data_status === 'complete';
    const marketplaceApprovalStatus: string | null =
      r.marketplace_approval_status ?? null;

    const createdAt = new Date(r.created_at);
    const ageDays = Math.max(
      0,
      Math.floor((now - createdAt.getTime()) / 86_400_000),
    );

    const reasons: RiskReason[] = [];
    let score = 0;
    const add = (
      pts: number,
      code: string,
      label: string,
      severity: RiskSeverity,
      detail?: string,
    ) => {
      score += pts;
      reasons.push({ code, label, severity, detail });
    };

    // Tienda inactiva/deshabilitada — señal fuerte.
    if (!active) {
      add(20, 'inactiva', 'Tienda inactiva', 'alta');
    }

    // No puede cobrar → el mayor predictor de churn.
    if (!cobreReady) {
      add(
        30,
        'sin_cobre',
        'No puede recibir pagos',
        'alta',
        'Sin contraparte verificada en la pasarela de pagos.',
      );
    }

    // Sin catálogo vivo.
    if (approvedProducts === 0) {
      if (totalProducts === 0) {
        add(
          25,
          'sin_productos',
          'Sin productos cargados',
          'alta',
          'Nunca publicó un producto.',
        );
      } else {
        add(
          18,
          'sin_aprobados',
          'Sin productos aprobados',
          'alta',
          `${totalProducts} producto(s) cargado(s), ninguno aprobado.`,
        );
      }
    }

    // Configuración de tienda abandonada.
    if (!configComplete) {
      add(
        15,
        'config_incompleta',
        'Configuración incompleta',
        'media',
        `Estado "${r.creation_status ?? 'desconocido'}", paso ${r.creation_step ?? 0}.`,
      );
    }

    // Perfil artesanal sin terminar.
    if (!profileComplete) {
      add(15, 'perfil_incompleto', 'Perfil artesanal incompleto', 'media');
    }

    // Tienda rechazada / aprobación estancada en marketplace.
    if (marketplaceApprovalStatus === 'rejected') {
      add(
        20,
        'tienda_rechazada',
        'Tienda rechazada en marketplace',
        'alta',
      );
    } else if (marketplaceApprovalStatus === 'pending' && ageDays > 14) {
      add(
        8,
        'aprobacion_estancada',
        'Aprobación de tienda pendiente',
        'media',
        `Sin aprobar hace ${ageDays} días.`,
      );
    }

    // Fricción de catálogo: cambios pedidos sin resolver (pelota en el artesano).
    if (changesRequestedProducts > 0) {
      add(
        12,
        'cambios_sin_resolver',
        'Cambios solicitados sin resolver',
        'media',
        `${changesRequestedProducts} producto(s) con cambios pendientes.`,
      );
    }

    // Frustración acumulada por rechazos.
    if (rejectionEvents >= 3) {
      add(
        12,
        'muchos_rechazos',
        'Rechazos acumulados',
        'media',
        `${rejectionEvents} rechazos de producto en el historial.`,
      );
    }

    // Cola: productos esperando moderación (el cliente nos espera a nosotros).
    if (pendingProducts > 0) {
      add(
        8,
        'esperando_moderacion',
        'Productos esperando moderación',
        'baja',
        `${pendingProducts} producto(s) en cola.`,
      );
    }

    score = Math.min(100, score);
    const riskLevel: RiskLevel =
      score === 0
        ? 'sano'
        : score >= LEVEL_THRESHOLD.alto
          ? 'alto'
          : score >= LEVEL_THRESHOLD.medio
            ? 'medio'
            : 'bajo';

    // Razones de mayor severidad primero para la UI.
    const sevRank: Record<RiskSeverity, number> = { alta: 0, media: 1, baja: 2 };
    reasons.sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);

    const geo = resolveGeo(r.department, r.municipality, r.region);

    return {
      shopId: r.shop_id,
      shopName: r.shop_name,
      shopSlug: r.shop_slug,
      userEmail: r.user_email ?? null,
      region: r.region ?? null,
      department: r.department ?? null,
      municipality: r.municipality ?? null,
      geoKey: geo.geoKey,
      geoTokens: geo.geoTokens,
      geoSource: geo.geoSource,
      craftType: r.craft_type ?? null,
      agreementId: r.agreement_id ?? null,
      agreementName: r.agreement_name ?? null,
      createdAt: createdAt.toISOString(),
      ageDays,
      active,
      riskScore: score,
      riskLevel,
      reasons,
      derivedState: (r.derived_state ?? 'creada') as ClienteEnRiesgo['derivedState'],
      isActiveShop: r.is_active_shop === true || r.is_active_shop === 'true',
      isAtRisk: r.is_at_risk === true || r.is_at_risk === 'true',
      riskSinPublicados:
        r.risk_sin_publicados === true || r.risk_sin_publicados === 'true',
      riskSinActividad:
        r.risk_sin_actividad === true || r.risk_sin_actividad === 'true',
      publiclyVisible:
        r.publicly_visible === true || r.publicly_visible === 'true',
      lastActivityAt: r.last_activity_at
        ? new Date(r.last_activity_at).toISOString()
        : null,
      metrics: {
        totalProducts,
        approvedProducts,
        publishedProducts: num(r.published_products),
        passportsIssued: num(r.passports_issued),
        pendingProducts,
        rejectedProducts,
        changesRequestedProducts,
        draftProducts,
        rejectionEvents,
        lastModerationAt: this.latestIso(
          r.last_product_moderation_at,
          r.last_shop_moderation_at,
        ),
        lastProductUpdate: r.last_product_update
          ? new Date(r.last_product_update).toISOString()
          : null,
        configComplete,
        profileComplete,
        bankReady,
        cobreReady,
        marketplaceApprovalStatus,
        marketplaceApprovedAt: r.marketplace_approved_at
          ? new Date(r.marketplace_approved_at).toISOString()
          : null,
      },
    };
  }

  private latestIso(a: any, b: any): string | null {
    const da = a ? new Date(a).getTime() : null;
    const db = b ? new Date(b).getTime() : null;
    const max = Math.max(da ?? -Infinity, db ?? -Infinity);
    return Number.isFinite(max) ? new Date(max).toISOString() : null;
  }

  // ─── Summary ────────────────────────────────────────────────
  private buildSummary(
    shops: ClienteEnRiesgo[],
  ): ClientesEnRiesgoResponse['summary'] {
    const atRiskShops = shops.filter((s) => s.riskLevel !== 'sano');

    const reasonMap = new Map<string, { label: string; count: number }>();
    for (const s of atRiskShops) {
      for (const reason of s.reasons) {
        const entry = reasonMap.get(reason.code);
        if (entry) entry.count += 1;
        else reasonMap.set(reason.code, { label: reason.label, count: 1 });
      }
    }
    const byReason = Array.from(reasonMap.entries())
      .map(([code, v]) => ({ code, label: v.label, count: v.count }))
      .sort((a, b) => b.count - a.count);

    const agreementMap = new Map<
      string,
      { agreementId: string | null; agreementName: string | null; total: number; atRisk: number }
    >();
    for (const s of shops) {
      const key = s.agreementId ?? '__none__';
      let entry = agreementMap.get(key);
      if (!entry) {
        entry = {
          agreementId: s.agreementId,
          agreementName: s.agreementName ?? (s.agreementId ? null : 'Sin convenio'),
          total: 0,
          atRisk: 0,
        };
        agreementMap.set(key, entry);
      }
      entry.total += 1;
      if (s.riskLevel !== 'sano') entry.atRisk += 1;
    }
    const byAgreement = Array.from(agreementMap.values()).sort(
      (a, b) => b.atRisk - a.atRisk,
    );

    return {
      totalShops: shops.length,
      atRisk: atRiskShops.length,
      highRisk: shops.filter((s) => s.riskLevel === 'alto').length,
      mediumRisk: shops.filter((s) => s.riskLevel === 'medio').length,
      lowRisk: shops.filter((s) => s.riskLevel === 'bajo').length,
      healthy: shops.filter((s) => s.riskLevel === 'sano').length,
      byReason,
      byAgreement,
    };
  }
}
