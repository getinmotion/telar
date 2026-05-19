import { telarApi } from '@/integrations/api/telarApi';

// ─── Taxonomy Aliases ─────────────────────────────────────────────────────────

export type TaxonomyAliasType = 'material' | 'craft' | 'technique' | 'style';

export interface TaxonomyAlias {
  id: string;
  canonicalId: string;
  canonicalType: TaxonomyAliasType;
  aliasName: string;
  createdBy?: string | null;
  createdAt: string;
}

export async function createTaxonomyAlias(data: {
  canonicalId: string;
  canonicalType: TaxonomyAliasType;
  aliasName: string;
  createdBy?: string;
}): Promise<TaxonomyAlias> {
  const res = await telarApi.post<TaxonomyAlias>('/taxonomy-aliases', data);
  return res.data;
}

export async function getTaxonomyAliases(type?: TaxonomyAliasType): Promise<TaxonomyAlias[]> {
  const query = type ? `?type=${type}` : '';
  const res = await telarApi.get<TaxonomyAlias[]>(`/taxonomy-aliases${query}`);
  return res.data;
}

export async function getAliasesByCanonical(canonicalId: string): Promise<TaxonomyAlias[]> {
  const res = await telarApi.get<TaxonomyAlias[]>(`/taxonomy-aliases/canonical/${canonicalId}`);
  return res.data;
}

export async function deleteTaxonomyAlias(id: string): Promise<void> {
  await telarApi.delete(`/taxonomy-aliases/${id}`);
}

// ─── Marketplace Assignments ──────────────────────────────────────────────────

export type MarketplaceKey = 'premium' | 'regional' | 'sponsor' | 'hotel' | 'design';

export interface MarketplaceAssignment {
  id: string;
  productId: string;
  marketplaceKey: MarketplaceKey;
  assignedBy?: string | null;
  assignedAt: string;
  removedAt?: string | null;
  removalReason?: string | null;
}

export async function assignToMarketplace(data: {
  productId: string;
  marketplaceKey: MarketplaceKey;
  assignedBy?: string;
}): Promise<MarketplaceAssignment> {
  const res = await telarApi.post<MarketplaceAssignment>('/marketplace-assignments', data);
  return res.data;
}

export async function removeFromMarketplace(id: string, removalReason?: string): Promise<MarketplaceAssignment> {
  const res = await telarApi.patch<MarketplaceAssignment>(`/marketplace-assignments/${id}/remove`, {
    removalReason,
  });
  return res.data;
}

export async function getMarketplaceAssignments(marketplace?: MarketplaceKey): Promise<MarketplaceAssignment[]> {
  const query = marketplace ? `?marketplace=${marketplace}` : '';
  const res = await telarApi.get<MarketplaceAssignment[]>(`/marketplace-assignments${query}`);
  return res.data;
}

export async function getProductAssignments(productId: string): Promise<MarketplaceAssignment[]> {
  const res = await telarApi.get<MarketplaceAssignment[]>(`/marketplace-assignments/product/${productId}`);
  return res.data;
}

// ─── Featured Collections ─────────────────────────────────────────────────────

export interface FeaturedCollection {
  id: string;
  title: string;
  description?: string | null;
  marketplaceKey: MarketplaceKey;
  productIds: string[];
  isActive: boolean;
  displayOrder: number;
  curatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getFeaturedCollections(marketplace?: MarketplaceKey): Promise<FeaturedCollection[]> {
  const query = marketplace ? `?marketplace=${marketplace}` : '';
  const res = await telarApi.get<FeaturedCollection[]>(`/featured-collections${query}`);
  return res.data;
}

export async function createFeaturedCollection(data: {
  title: string;
  description?: string;
  marketplaceKey: MarketplaceKey;
  productIds?: string[];
  displayOrder?: number;
  curatedBy?: string;
}): Promise<FeaturedCollection> {
  const res = await telarApi.post<FeaturedCollection>('/featured-collections', data);
  return res.data;
}

export async function updateFeaturedCollection(
  id: string,
  data: {
    title?: string;
    description?: string;
    productIds?: string[];
    isActive?: boolean;
    displayOrder?: number;
  },
): Promise<FeaturedCollection> {
  const res = await telarApi.patch<FeaturedCollection>(`/featured-collections/${id}`, data);
  return res.data;
}

export async function deleteFeaturedCollection(id: string): Promise<void> {
  await telarApi.delete(`/featured-collections/${id}`);
}

// ─── Store Health Scores ──────────────────────────────────────────────────────

export interface StoreHealthScore {
  storeId: string;
  scoreTotal: number;
  scoreBranding: number;
  scoreCatalog: number;
  scoreNarrative: number;
  scoreConsistency: number;
  lastComputedAt: string;
}

export async function getStoreHealthScore(storeId: string): Promise<StoreHealthScore | null> {
  try {
    const res = await telarApi.get<StoreHealthScore>(`/store-health-scores/${storeId}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function computeStoreHealthScore(
  storeId: string,
  storeData: Record<string, unknown>,
): Promise<StoreHealthScore> {
  const res = await telarApi.post<StoreHealthScore>(`/store-health-scores/${storeId}/compute`, storeData);
  return res.data;
}
