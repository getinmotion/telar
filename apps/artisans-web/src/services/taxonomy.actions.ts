import { telarApi } from '@/integrations/api/telarApi';

export type TaxonomyType = 'crafts' | 'techniques' | 'materials' | 'styles' | 'herramientas';

export interface TaxonomyItem {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  suggestedBy?: string | null;
  createdAt?: string;
}

export interface TaxonomyItemAdmin extends TaxonomyItem {
  description?: string | null;
  categoryId?: string | null;
  craftId?: string | null;
  skuCode?: string | null;
  isOrganic?: boolean;
  isSustainable?: boolean;
  isActive?: boolean;
  updatedAt?: string;
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

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

export async function getAllTaxonomyItems(
  type: TaxonomyType,
  opts?: { search?: string; status?: string; craftId?: string },
): Promise<TaxonomyItemAdmin[]> {
  const params = new URLSearchParams();
  if (opts?.search) params.set('search', opts.search);
  if (opts?.status && opts.status !== 'all') params.set('status', opts.status);
  if (opts?.craftId) params.set('craftId', opts.craftId);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await telarApi.get<TaxonomyItemAdmin[]>(`${ENDPOINT[type]}${query}`);
  return response.data;
}

export async function createTaxonomyItem(
  type: TaxonomyType,
  data: {
    name: string;
    description?: string;
    status?: string;
    categoryId?: string;
    craftId?: string;
    skuCode?: string;
    isOrganic?: boolean;
    isSustainable?: boolean;
  },
): Promise<TaxonomyItemAdmin> {
  const payload = { status: 'approved', ...data };
  const response = await telarApi.post<TaxonomyItemAdmin>(ENDPOINT[type], payload);
  return response.data;
}

export async function updateTaxonomyItem(
  type: TaxonomyType,
  id: string,
  data: Partial<TaxonomyItemAdmin>,
): Promise<TaxonomyItemAdmin> {
  const response = await telarApi.patch<TaxonomyItemAdmin>(`${ENDPOINT[type]}/${id}`, data);
  return response.data;
}

export async function deleteTaxonomyItem(type: TaxonomyType, id: string): Promise<void> {
  await telarApi.delete(`${ENDPOINT[type]}/${id}`);
}

export async function getTaxonomySummary(): Promise<
  Record<TaxonomyType, { total: number; approved: number; pending: number; rejected: number }>
> {
  const types: TaxonomyType[] = ['crafts', 'techniques', 'materials', 'styles', 'herramientas'];
  const results = await Promise.all(
    types.map((t) => getAllTaxonomyItems(t).catch(() => [] as TaxonomyItemAdmin[])),
  );
  return Object.fromEntries(
    types.map((t, i) => {
      const items = results[i];
      return [
        t,
        {
          total: items.length,
          approved: items.filter((x) => x.status === 'approved').length,
          pending: items.filter((x) => x.status === 'pending').length,
          rejected: items.filter((x) => x.status === 'rejected').length,
        },
      ];
    }),
  ) as Record<TaxonomyType, { total: number; approved: number; pending: number; rejected: number }>;
}
