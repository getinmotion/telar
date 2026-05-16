import { telarApi } from '@/integrations/api/telarApi';

export interface TaxonomyBadge {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  targetType: 'shop' | 'product';
  assignmentType: 'curated' | 'automated';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function getBadges(): Promise<TaxonomyBadge[]> {
  const response = await telarApi.get<TaxonomyBadge[]>('/badges');
  return response.data;
}

export async function createBadge(
  data: Omit<TaxonomyBadge, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<TaxonomyBadge> {
  const response = await telarApi.post<TaxonomyBadge>('/badges', data);
  return response.data;
}

export async function updateBadge(
  id: string,
  data: Partial<Omit<TaxonomyBadge, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<TaxonomyBadge> {
  const response = await telarApi.patch<TaxonomyBadge>(`/badges/${id}`, data);
  return response.data;
}

export async function deleteBadge(id: string): Promise<void> {
  await telarApi.delete(`/badges/${id}`);
}
