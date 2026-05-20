import { telarApi } from '@/integrations/api/telarApi';

export interface ArtisanMaestroItem {
  id: string;
  artisanId: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export const getArtisanMaestros = async (artisanId: string): Promise<ArtisanMaestroItem[]> => {
  const { data } = await telarApi.get<ArtisanMaestroItem[]>(`/artisan-maestros/artisan/${artisanId}`);
  return data ?? [];
};

export const addArtisanMaestro = async (
  artisanId: string,
  name: string,
  description?: string,
): Promise<ArtisanMaestroItem> => {
  const { data } = await telarApi.post<ArtisanMaestroItem>('/artisan-maestros', {
    artisanId,
    name,
    description,
  });
  return data;
};

export const removeArtisanMaestro = async (id: string): Promise<void> => {
  await telarApi.delete(`/artisan-maestros/${id}`);
};
