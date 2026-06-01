import { telarApi } from '@/integrations/api/telarApi';

// ─── Types ───────────────────────────────────────────────────

export interface NameCount {
  name: string;
  count: number;
}

export interface CompletenessLayer {
  layer: string;
  complete: number;
  empty: number;
  percentage: number;
}

export interface StoreQualityRow {
  storeName: string;
  storeId: string;
  totalProducts: number;
  withImages: number;
  withMaterials: number;
  pctImages: number;
  pctMaterials: number;
}

export interface VolumetricAnomaly {
  id: string;
  productName: string;
  storeName: string;
  dims: string;
  realWeightKg: number;
  volWeightKg: number;
  correctedWeightKg: number;
  packWeightKg: number;
}

export interface CatalogQuality {
  withoutImages: number;
  withoutDescription: number;
  withoutArtisanalIdentity: number;
  withoutMaterials: number;
  withoutCategory: number;
  rejectionReasons: { reason: string; count: number }[];
}

export interface ProductAnalyticsData {
  topMetrics: {
    totalProducts: number;
    totalStores: number;
    totalVariants: number;
    totalImages: number;
    totalMaterialLinks: number;
  };
  taxonomyDistribution: {
    crafts: NameCount[];
    noCraft: number;
    techniques: NameCount[];
    curatorialCategories: NameCount[];
    noCuratorialCategory: number;
    materials: NameCount[];
    pieceTypes: NameCount[];
    styles: NameCount[];
    processTypes: NameCount[];
  };
  physicalStats: {
    specs: Record<string, string | number>;
    logistics: Record<string, string | number>;
    fragilityDistribution: NameCount[];
    packagingDistribution: NameCount[];
    outlierCount: number;
    defaultDimensionsCount: number;
  };
  completeness: {
    totalProducts: number;
    layers: CompletenessLayer[];
    avgCompleteness: number;
  };
  storeQuality: StoreQualityRow[];
  priceDistribution: {
    stats: Record<string, string | number>;
    suspiciousCheapCount: number;
    ranges: NameCount[];
  };
  volumetricAnalysis: {
    totalAnalyzed: number;
    anomaliesDetected: number;
    anomalyPercentage: number;
    anomalyProducts: VolumetricAnomaly[];
  };
  catalogQuality: CatalogQuality;
}

// ─── API Call ─────────────────────────────────────────────────

export async function getProductAnalytics(): Promise<ProductAnalyticsData> {
  const response = await telarApi.get<ProductAnalyticsData>('/products-new/analytics');
  return response.data;
}
