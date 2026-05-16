import { telarApi } from '@/integrations/api/telarApi';

export type TaxonomyType = 'crafts' | 'techniques' | 'materials' | 'styles' | 'herramientas';

export interface TaxonomyItem {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  suggestedBy?: string | null;
  createdAt?: string;
}

const ENDPOINT: Record<TaxonomyType, string> = {
  crafts: '/crafts',
  techniques: '/techniques',
  materials: '/materials',
  styles: '/taxonomy/styles',
  herramientas: '/taxonomy/herramientas',
};

export async function searchTaxonomy(
  type: TaxonomyType,
  search?: string,
  status = 'approved',
): Promise<TaxonomyItem[]> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await telarApi.get<TaxonomyItem[]>(`${ENDPOINT[type]}${query}`);
  return response.data;
}

export async function suggestTaxonomyItem(
  type: TaxonomyType,
  name: string,
  suggestedBy?: string,
): Promise<TaxonomyItem> {
  const response = await telarApi.post<TaxonomyItem>(ENDPOINT[type], {
    name,
    status: 'pending',
    suggestedBy,
  });
  return response.data;
}

export async function updateTaxonomyStatus(
  type: TaxonomyType,
  id: string,
  status: 'approved' | 'rejected',
  mergeIntoId?: string,
): Promise<TaxonomyItem | { message: string }> {
  const endpoint = `${ENDPOINT[type]}/${id}/status`;
  const response = await telarApi.patch<TaxonomyItem | { message: string }>(endpoint, {
    status,
    mergeIntoId,
  });
  return response.data;
}

export async function getPendingTaxonomies(): Promise<Record<TaxonomyType, TaxonomyItem[]>> {
  const types: TaxonomyType[] = ['crafts', 'techniques', 'materials', 'styles', 'herramientas'];
  const results = await Promise.all(
    types.map((t) => searchTaxonomy(t, undefined, 'pending').catch(() => [] as TaxonomyItem[])),
  );
  return Object.fromEntries(types.map((t, i) => [t, results[i]])) as Record<TaxonomyType, TaxonomyItem[]>;
}
