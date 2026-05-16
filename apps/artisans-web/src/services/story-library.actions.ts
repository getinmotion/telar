import { telarApi } from '@/integrations/api/telarApi';

export interface Story {
  id: string;
  artisanId: string;
  title: string;
  type: 'process' | 'origin_story' | 'technique' | 'inspiration';
  content: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoryPayload {
  artisanId: string;
  title: string;
  type?: string;
  content: string;
  isPublic?: boolean;
}

export async function getStoriesByArtisan(artisanId: string): Promise<Story[]> {
  const response = await telarApi.get<Story[]>(`/story-library?artisan_id=${artisanId}`);
  return response.data;
}

export async function getStoriesByProduct(productId: string): Promise<Story[]> {
  const response = await telarApi.get<Story[]>(`/story-library/by-product/${productId}`);
  return response.data;
}

export async function createStory(payload: CreateStoryPayload): Promise<Story> {
  const response = await telarApi.post<Story>('/story-library', payload);
  return response.data;
}

export async function updateStory(id: string, payload: Partial<CreateStoryPayload>): Promise<Story> {
  const response = await telarApi.patch<Story>(`/story-library/${id}`, payload);
  return response.data;
}

export async function deleteStory(id: string): Promise<void> {
  await telarApi.delete(`/story-library/${id}`);
}

export async function cloneStory(id: string, artisanId: string): Promise<Story> {
  const response = await telarApi.post<Story>(`/story-library/${id}/clone`, { artisanId });
  return response.data;
}

export async function attachStoryToProduct(storyId: string, productId: string): Promise<void> {
  await telarApi.post(`/story-library/${storyId}/attach/${productId}`);
}

export async function detachStoryFromProduct(storyId: string, productId: string): Promise<void> {
  await telarApi.delete(`/story-library/${storyId}/attach/${productId}`);
}
