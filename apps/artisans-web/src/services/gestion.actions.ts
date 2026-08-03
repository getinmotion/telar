import { telarApi } from '@/integrations/api/telarApi';

// ─── Types (espejo de apps/api gestion.service.ts) ────────────

export type RiskSeverity = 'alta' | 'media' | 'baja';
export type RiskLevel = 'alto' | 'medio' | 'bajo' | 'sano';

// ─── Filtros globales del tablero ─────────────────────────────
// Los aceptan TODOS los endpoints con la misma forma, para que el mismo corte
// dé el mismo número en cualquier pantalla.

export type ShopStatusFilter = 'creada' | 'activa' | 'en_riesgo';

export interface GestionFilters {
  agreementId?: string;
  region?: string;
  department?: string;
  municipality?: string;
  shopStatus?: ShopStatusFilter;
  /** YYYY-MM-DD. Filtra unidades productivas por FECHA DE CREACIÓN (cohorte). */
  from?: string;
  to?: string;
}

export interface AppliedFilters {
  agreementId: string | null;
  region: string | null;
  department: string | null;
  municipality: string | null;
  shopStatus: ShopStatusFilter | null;
  from: string | null;
  to: string | null;
  matchedShops: number;
}

/** Definición canónica, viene del backend para que el tooltip no divirja del SQL. */
export interface Definition {
  code: string;
  label: string;
  formula: string;
  caveat: string | null;
}

/** Quita las claves vacías para no ensuciar la URL ni la query string. */
function cleanFilters(f: GestionFilters = {}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(f)) {
    if (v != null && String(v).trim() !== '') out[k] = String(v);
  }
  return out;
}

export interface RiskReason {
  code: string;
  label: string;
  severity: RiskSeverity;
  detail?: string;
}

export interface ClienteEnRiesgoMetrics {
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
  /** Candidatos normalizados de `region` cuando no lo hay. */
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
  derivedState: ShopStatusFilter;
  isActiveShop: boolean;
  isAtRisk: boolean;
  riskSinPublicados: boolean;
  riskSinActividad: boolean;
  publiclyVisible: boolean;
  lastActivityAt: string | null;
  metrics: ClienteEnRiesgoMetrics;
}

export interface ClientesEnRiesgoResponse {
  generatedAt: string;
  filters: AppliedFilters;
  definitions: Definition[];
  caveats: string[];
  /** UP que no se pueden ubicar en el mapa. */
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

// ─── Tiendas — Salud y onboarding (F3) ────────────────────────

// ─── Bloque 1 · Tarjetas de estado del convenio ───────────────

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
  pctChange: number | null;
}

export interface MetricCard {
  code: MetricCode;
  label: string;
  value: number;
  /** Subconjunto aclaratorio de `value`. Nunca se le suma. */
  secondary: { label: string; value: number } | null;
  breakdown: { code: string; label: string; value: number }[] | null;
  /** null ⇒ no derivable honestamente; mira deltaUnavailableReason. */
  delta: MetricDelta | null;
  deltaUnavailableReason: string | null;
  definitionCode: string;
}

export interface TiendasSaludResponse {
  generatedAt: string;
  filters: AppliedFilters;
  definitions: Definition[];
  caveats: string[];
  cards: MetricCard[];
  facets: {
    agreements: { id: string | null; name: string; count: number }[];
    departments: { value: string; count: number }[];
    regions: { value: string; count: number }[];
  };
  totalShops: number;
  healthScore: number;
  operationalShops: number;
  funnel: { code: string; label: string; count: number }[];
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

// ─── Backlog de moderación (F4) ───────────────────────────────

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
    ageBuckets: { bucket: string; count: number }[];
  };
  resolution: {
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

// ─── Bloque 3 · Composición del catálogo ──────────────────────

export interface CatalogoComposicionResponse {
  generatedAt: string;
  filters: AppliedFilters;
  definitions: Definition[];
  caveats: string[];
  universe: 'aprobados';
  byStatus: { status: string; label: string; count: number; pct: number }[];
  byCategory: { id: string | null; name: string; count: number; pct: number }[];
  byCraft: { id: string | null; name: string; count: number; pct: number }[];
  price: {
    currency: 'COP';
    /** Importes en CENTAVOS de COP. Divide por 100 para pesos. */
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
    distribution: {
      bucket: string;
      fromMinor: number;
      toMinor: number | null;
      count: number;
      pct: number;
    }[];
    excludedNoPrice: number;
  };
}

// ─── Bloque 4 · Panel de sanidad de datos ─────────────────────

export type SanidadLevel = 'up' | 'producto';

export interface SanidadLine {
  code: string;
  label: string;
  level: SanidadLevel;
  severity: RiskSeverity;
  hint: string;
  count: number;
  denominator: number;
  denominatorLabel: string;
  /** Porcentaje sobre SU denominador. No comparable entre niveles. */
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

export type SanidadItem = SanidadUpItem | SanidadProductItem;

export interface SanidadResponse {
  generatedAt: string;
  filters: AppliedFilters;
  definitions: Definition[];
  caveats: string[];
  summary: SanidadLine[];
  /** null ⇔ modo resumen. */
  detail: {
    issue: string;
    label: string;
    level: SanidadLevel;
    total: number;
    page: number;
    limit: number;
    items: SanidadItem[];
  } | null;
}

// ─── API Calls ────────────────────────────────────────────────

export async function getClientesEnRiesgo(
  filters: GestionFilters = {},
): Promise<ClientesEnRiesgoResponse> {
  const response = await telarApi.get<ClientesEnRiesgoResponse>(
    '/gestion/clientes-en-riesgo',
    { params: cleanFilters(filters) },
  );
  return response.data;
}

export async function getTiendasSalud(
  filters: GestionFilters = {},
): Promise<TiendasSaludResponse> {
  const response = await telarApi.get<TiendasSaludResponse>(
    '/gestion/tiendas-salud',
    { params: cleanFilters(filters) },
  );
  return response.data;
}

export async function getModerationBacklog(
  filters: GestionFilters = {},
): Promise<ModerationBacklogResponse> {
  const response = await telarApi.get<ModerationBacklogResponse>(
    '/gestion/moderation-backlog',
    { params: cleanFilters(filters) },
  );
  return response.data;
}

export async function getCatalogoComposicion(
  filters: GestionFilters = {},
): Promise<CatalogoComposicionResponse> {
  const response = await telarApi.get<CatalogoComposicionResponse>(
    '/gestion/catalogo-composicion',
    { params: cleanFilters(filters) },
  );
  return response.data;
}

/**
 * Panel de sanidad. Sin `issue` devuelve solo el resumen; con `issue` añade el
 * listado nominal paginado para el drill-down y el CSV.
 */
export async function getSanidadDatos(
  filters: GestionFilters = {},
  opts: { issue?: string; page?: number; limit?: number } = {},
): Promise<SanidadResponse> {
  const response = await telarApi.get<SanidadResponse>('/gestion/sanidad-datos', {
    params: {
      ...cleanFilters(filters),
      ...(opts.issue ? { issue: opts.issue } : {}),
      ...(opts.page ? { page: opts.page } : {}),
      ...(opts.limit ? { limit: opts.limit } : {}),
    },
  });
  return response.data;
}

export interface CatalogoIssueProduct {
  productId: string;
  name: string;
  storeId: string;
  storeName: string;
}

export interface CatalogoIssueProductsResponse {
  code: string;
  total: number;
  limit: number;
  products: CatalogoIssueProduct[];
}

export async function getCatalogoIssueProducts(
  code: string,
  limit = 50,
  filters: GestionFilters = {},
): Promise<CatalogoIssueProductsResponse> {
  const response = await telarApi.get<CatalogoIssueProductsResponse>(
    '/gestion/catalogo-issue-products',
    { params: { ...cleanFilters(filters), code, limit } },
  );
  return response.data;
}
