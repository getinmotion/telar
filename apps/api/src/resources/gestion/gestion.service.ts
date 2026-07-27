import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';

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
  craftType: string | null;
  agreementId: string | null;
  agreementName: string | null;
  createdAt: string;
  ageDays: number;
  active: boolean;

  riskScore: number;
  riskLevel: RiskLevel;
  reasons: RiskReason[];

  metrics: {
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
  };
}

export interface ClientesEnRiesgoResponse {
  generatedAt: string;
  /** Notas de confiabilidad (el historial de moderación se escribe desde el front). */
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

const LEVEL_THRESHOLD = { alto: 45, medio: 20 } as const;

// ─── F3 · Tiendas — Salud y onboarding ───────────────────────
export interface TiendasSaludResponse {
  generatedAt: string;
  caveats: string[];
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

// ─── F2b · Drill-down de issues de catálogo ──────────────────
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

/** Fragmento SQL (sobre alias pc/products_core) por código de issue. */
const CATALOGO_ISSUE_WHERE: Record<string, string> = {
  sin_imagenes: `NOT EXISTS (SELECT 1 FROM shop.product_media pm WHERE pm.product_id = pc.id)`,
  sin_categoria: `pc.category_id IS NULL`,
  sin_descripcion: `(pc.short_description IS NULL OR TRIM(pc.short_description) = '')`,
  sin_identidad: `NOT EXISTS (SELECT 1 FROM shop.product_artisanal_identity pai WHERE pai.product_id = pc.id AND pai.deleted_at IS NULL)`,
  sin_materiales: `NOT EXISTS (SELECT 1 FROM shop.product_materials_link pml WHERE pml.product_id = pc.id AND pml.deleted_at IS NULL)`,
  precio_sospechoso: `EXISTS (SELECT 1 FROM shop.product_variants pv WHERE pv.product_id = pc.id AND pv.deleted_at IS NULL AND pv.base_price_minor > 0 AND pv.base_price_minor <= 100)`,
  anomalia_volumen: `EXISTS (
    SELECT 1 FROM shop.product_physical_specs pps
    WHERE pps.product_id = pc.id AND pps.deleted_at IS NULL
      AND (
        pps.real_weight_kg > 50
        OR pps.real_weight_kg > GREATEST((pps.length_or_diameter_cm * pps.width_cm * pps.height_cm) / 400.0, 0.01) * 10
      )
  )`,
};

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
  async getClientesEnRiesgo(): Promise<ClientesEnRiesgoResponse> {
    const rows = await this.dataSource.query<any[]>(`
      SELECT
        s.id                          AS shop_id,
        s.shop_name                   AS shop_name,
        s.shop_slug                   AS shop_slug,
        s.region                      AS region,
        s.craft_type                  AS craft_type,
        s.created_at                  AS created_at,
        s.active                      AS active,
        s.creation_status             AS creation_status,
        s.creation_step               AS creation_step,
        s.artisan_profile_completed   AS artisan_profile_completed,
        s.bank_data_status            AS bank_data_status,
        s.id_contraparty              AS id_contraparty,
        s.marketplace_approval_status AS marketplace_approval_status,
        s.marketplace_approved_at     AS marketplace_approved_at,
        u.email                       AS user_email,
        agr.agreement_id              AS agreement_id,
        agr.agreement_name            AS agreement_name,
        COALESCE(pc.total, 0)              AS total_products,
        COALESCE(pc.approved, 0)           AS approved_products,
        COALESCE(pc.pending, 0)            AS pending_products,
        COALESCE(pc.rejected, 0)           AS rejected_products,
        COALESCE(pc.changes_requested, 0)  AS changes_requested_products,
        COALESCE(pc.draft, 0)              AS draft_products,
        pc.last_product_update             AS last_product_update,
        COALESCE(pmh.rejection_events, 0)  AS rejection_events,
        pmh.last_product_moderation_at     AS last_product_moderation_at,
        smh.last_shop_moderation_at        AS last_shop_moderation_at
      FROM shop.artisan_shops s
      LEFT JOIN auth.users u ON u.id = s.user_id
      LEFT JOIN LATERAL (
        SELECT p.agreement_id, a.name AS agreement_name
        FROM artesanos.artisan_profile p
        LEFT JOIN taxonomy.agreements a ON a.id = p.agreement_id
        WHERE p.user_id = s.user_id
        ORDER BY (p.agreement_id IS NOT NULL) DESC
        LIMIT 1
      ) agr ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*)                                                                  AS total,
          COUNT(*) FILTER (WHERE status IN ('approved', 'approved_with_edits'))     AS approved,
          COUNT(*) FILTER (WHERE status = 'pending_moderation')                     AS pending,
          COUNT(*) FILTER (WHERE status = 'rejected')                               AS rejected,
          COUNT(*) FILTER (WHERE status = 'changes_requested')                      AS changes_requested,
          COUNT(*) FILTER (WHERE status = 'draft')                                  AS draft,
          MAX(updated_at)                                                           AS last_product_update
        FROM shop.products_core
        WHERE store_id = s.id AND deleted_at IS NULL
      ) pc ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) FILTER (WHERE h.new_status = 'rejected') AS rejection_events,
          MAX(h.created_at)                                 AS last_product_moderation_at
        FROM shop.product_moderation_history h
        JOIN shop.products_core p ON p.id = h.product_id
        WHERE p.store_id = s.id
      ) pmh ON TRUE
      LEFT JOIN LATERAL (
        SELECT MAX(created_at) AS last_shop_moderation_at
        FROM shop.shop_moderation_history
        WHERE shop_id = s.id
      ) smh ON TRUE
    `);

    const now = Date.now();
    const shops: ClienteEnRiesgo[] = rows.map((r) =>
      this.scoreShop(r, now),
    );

    // Orden por urgencia: mayor score primero; a igual score, la tienda más
    // antigua (perder a un primer cliente pesa más).
    shops.sort((a, b) => {
      if (b.riskScore !== a.riskScore) return b.riskScore - a.riskScore;
      return b.ageDays - a.ageDays;
    });

    return {
      generatedAt: new Date(now).toISOString(),
      caveats: [
        'El nº de rechazos y el "último evento de moderación" se derivan del historial de moderación, que hoy se escribe desde la UI — úsalo como estimado, no como registro transaccional.',
        'El estado real del catálogo (products_core.status) sí es autoritativo.',
      ],
      summary: this.buildSummary(shops),
      shops,
    };
  }

  /**
   * GET /gestion/tiendas-salud
   * Salud del padrón de tiendas: embudo de onboarding con conteos REALES de
   * producto (mata los ceros falsos de useAdminShops), tiempo de aprobación en
   * marketplace, brechas accionables y cortes por convenio/región/oficio.
   */
  async getTiendasSalud(): Promise<TiendasSaludResponse> {
    const rows = await this.dataSource.query<any[]>(`
      SELECT
        s.id                          AS shop_id,
        s.created_at                  AS created_at,
        s.active                      AS active,
        s.creation_status             AS creation_status,
        s.artisan_profile_completed   AS artisan_profile_completed,
        s.bank_data_status            AS bank_data_status,
        s.id_contraparty              AS id_contraparty,
        s.marketplace_approval_status AS marketplace_approval_status,
        s.marketplace_approved_at     AS marketplace_approved_at,
        s.publish_status              AS publish_status,
        s.region                      AS region,
        s.craft_type                  AS craft_type,
        agr.agreement_id              AS agreement_id,
        agr.agreement_name            AS agreement_name,
        COALESCE(pc.approved, 0)      AS approved_products,
        COALESCE(pc.total, 0)         AS total_products
      FROM shop.artisan_shops s
      LEFT JOIN LATERAL (
        SELECT p.agreement_id, a.name AS agreement_name
        FROM artesanos.artisan_profile p
        LEFT JOIN taxonomy.agreements a ON a.id = p.agreement_id
        WHERE p.user_id = s.user_id
        ORDER BY (p.agreement_id IS NOT NULL) DESC
        LIMIT 1
      ) agr ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*)                                                              AS total,
          COUNT(*) FILTER (WHERE status IN ('approved', 'approved_with_edits')) AS approved
        FROM shop.products_core
        WHERE store_id = s.id AND deleted_at IS NULL
      ) pc ON TRUE
    `);

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

    for (const r of rows) {
      const active = isTrue(r.active);
      const configComplete = r.creation_status === 'complete';
      const profileComplete = isTrue(r.artisan_profile_completed);
      const cobreReady =
        r.bank_data_status === 'complete' ||
        (!!r.id_contraparty && String(r.id_contraparty).trim() !== '');
      const approved = r.marketplace_approval_status === 'approved';
      const published = r.publish_status === 'published';
      const approvedProducts = num(r.approved_products);

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

    return {
      generatedAt: new Date().toISOString(),
      caveats: [
        'Conteos de producto tomados de products_core.status (autoritativo) — reemplazan los ceros falsos de useAdminShops.',
        '“Días hasta aprobar” = días entre que la tienda se registra y queda aprobada en el marketplace; el promedio solo considera tiendas ya aprobadas.',
        'Aprobar (marketplaceApproved) y publicar (publishStatus) son pasos separados: una tienda solo es visible para compradores si además está publicada. “Listas para vender” exige ambos + ≥1 producto aprobado.',
      ],
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
  async getModerationBacklog(): Promise<ModerationBacklogResponse> {
    const [
      pendingProductRows,
      pendingShopRows,
      throughputRows,
      resolutionRow,
      decidedRow,
    ] = await Promise.all([
      // Productos pendientes ahora + cuándo entraron a pendiente + convenio.
      this.dataSource.query<any[]>(`
        SELECT
          pc.id,
          pc.created_at,
          pc.updated_at,
          agr.agreement_id,
          agr.agreement_name,
          ph.entered_pending_at
        FROM shop.products_core pc
        JOIN shop.artisan_shops s ON s.id = pc.store_id
        LEFT JOIN LATERAL (
          SELECT p.agreement_id, a.name AS agreement_name
          FROM artesanos.artisan_profile p
          LEFT JOIN taxonomy.agreements a ON a.id = p.agreement_id
          WHERE p.user_id = s.user_id
          ORDER BY (p.agreement_id IS NOT NULL) DESC
          LIMIT 1
        ) agr ON TRUE
        LEFT JOIN LATERAL (
          SELECT MAX(h.created_at) AS entered_pending_at
          FROM shop.product_moderation_history h
          WHERE h.product_id = pc.id AND h.new_status = 'pending_moderation'
        ) ph ON TRUE
        WHERE pc.status = 'pending_moderation' AND pc.deleted_at IS NULL
      `),
      // Tiendas pendientes de aprobación + convenio.
      this.dataSource.query<any[]>(`
        SELECT
          s.id,
          s.created_at,
          agr.agreement_id,
          agr.agreement_name
        FROM shop.artisan_shops s
        LEFT JOIN LATERAL (
          SELECT p.agreement_id, a.name AS agreement_name
          FROM artesanos.artisan_profile p
          LEFT JOIN taxonomy.agreements a ON a.id = p.agreement_id
          WHERE p.user_id = s.user_id
          ORDER BY (p.agreement_id IS NOT NULL) DESC
          LIMIT 1
        ) agr ON TRUE
        WHERE s.marketplace_approval_status = 'pending'
      `),
      // Throughput de decisiones por semana (productos, últimas 8 semanas).
      this.dataSource.query<any[]>(`
        SELECT
          DATE_TRUNC('week', created_at) AS week,
          COUNT(*) FILTER (WHERE new_status IN ('approved', 'approved_with_edits')) AS approved,
          COUNT(*) FILTER (WHERE new_status = 'rejected')                          AS rejected,
          COUNT(*) FILTER (WHERE new_status = 'changes_requested')                 AS changes_requested
        FROM shop.product_moderation_history
        WHERE created_at >= NOW() - INTERVAL '8 weeks'
          AND new_status IN ('approved', 'approved_with_edits', 'rejected', 'changes_requested')
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY week ASC
      `),
      // Tiempo prom. pendiente→decisión (productos, últimos 90 días, aprox).
      this.dataSource.query<any[]>(`
        SELECT AVG(EXTRACT(EPOCH FROM (d.created_at - p.created_at)) / 86400.0) AS avg_days
        FROM shop.product_moderation_history d
        JOIN LATERAL (
          SELECT p.created_at
          FROM shop.product_moderation_history p
          WHERE p.product_id = d.product_id
            AND p.new_status = 'pending_moderation'
            AND p.created_at <= d.created_at
          ORDER BY p.created_at DESC
          LIMIT 1
        ) p ON TRUE
        WHERE d.new_status IN ('approved', 'approved_with_edits', 'rejected', 'changes_requested')
          AND d.created_at >= NOW() - INTERVAL '90 days'
      `),
      // Decisiones tomadas en 7 / 30 días.
      this.dataSource.query<any[]>(`
        SELECT
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')  AS d7,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS d30
        FROM shop.product_moderation_history
        WHERE new_status IN ('approved', 'approved_with_edits', 'rejected', 'changes_requested')
      `),
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
      caveats: [
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
  ): Promise<CatalogoIssueProductsResponse> {
    const where = CATALOGO_ISSUE_WHERE[code];
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
    if (!where) {
      return { code, total: 0, limit: safeLimit, products: [] };
    }

    const rows = await this.dataSource.query<any[]>(
      `
      SELECT
        pc.id          AS product_id,
        pc.name        AS name,
        s.id           AS store_id,
        s.shop_name    AS store_name,
        COUNT(*) OVER() AS total
      FROM shop.products_core pc
      JOIN shop.artisan_shops s ON s.id = pc.store_id
      WHERE pc.deleted_at IS NULL AND (${where})
      ORDER BY pc.created_at DESC
      LIMIT $1
      `,
      [safeLimit],
    );

    return {
      code,
      total: rows.length > 0 ? Number(rows[0].total) : 0,
      limit: safeLimit,
      products: rows.map((r) => ({
        productId: r.product_id,
        name: r.name,
        storeId: r.store_id,
        storeName: r.store_name,
      })),
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
    const bankReady = r.bank_data_status === 'complete';
    const cobreReady = !!r.id_contraparty && String(r.id_contraparty).trim() !== '';
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
    if (!bankReady || !cobreReady) {
      const missing: string[] = [];
      if (!bankReady) missing.push('datos bancarios');
      if (!cobreReady) missing.push('Cobre');
      add(
        30,
        'sin_cobre',
        'No puede recibir pagos',
        'alta',
        `Falta: ${missing.join(' y ')}.`,
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

    return {
      shopId: r.shop_id,
      shopName: r.shop_name,
      shopSlug: r.shop_slug,
      userEmail: r.user_email ?? null,
      region: r.region ?? null,
      craftType: r.craft_type ?? null,
      agreementId: r.agreement_id ?? null,
      agreementName: r.agreement_name ?? null,
      createdAt: createdAt.toISOString(),
      ageDays,
      active,
      riskScore: score,
      riskLevel,
      reasons,
      metrics: {
        totalProducts,
        approvedProducts,
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
