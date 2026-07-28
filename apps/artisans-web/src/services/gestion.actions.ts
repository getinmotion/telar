import { telarApi } from '@/integrations/api/telarApi';

// ─── Types (espejo de apps/api gestion.service.ts) ────────────

export type RiskSeverity = 'alta' | 'media' | 'baja';
export type RiskLevel = 'alto' | 'medio' | 'bajo' | 'sano';

export interface RiskReason {
  code: string;
  label: string;
  severity: RiskSeverity;
  detail?: string;
}

export interface ClienteEnRiesgoMetrics {
  totalProducts: number;
  approvedProducts: number;
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
  craftType: string | null;
  agreementId: string | null;
  agreementName: string | null;
  createdAt: string;
  ageDays: number;
  active: boolean;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: RiskReason[];
  metrics: ClienteEnRiesgoMetrics;
}

export interface ClientesEnRiesgoResponse {
  generatedAt: string;
  caveats: string[];
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

export interface TiendasSaludResponse {
  generatedAt: string;
  caveats: string[];
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

// ─── API Calls ────────────────────────────────────────────────

export async function getClientesEnRiesgo(): Promise<ClientesEnRiesgoResponse> {
  const response = await telarApi.get<ClientesEnRiesgoResponse>(
    '/gestion/clientes-en-riesgo',
  );
  return response.data;
}

export async function getTiendasSalud(): Promise<TiendasSaludResponse> {
  const response = await telarApi.get<TiendasSaludResponse>(
    '/gestion/tiendas-salud',
  );
  return response.data;
}

export async function getModerationBacklog(): Promise<ModerationBacklogResponse> {
  const response = await telarApi.get<ModerationBacklogResponse>(
    '/gestion/moderation-backlog',
  );
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
): Promise<CatalogoIssueProductsResponse> {
  const response = await telarApi.get<CatalogoIssueProductsResponse>(
    '/gestion/catalogo-issue-products',
    { params: { code, limit } },
  );
  return response.data;
}
