import { telarApi } from '@/integrations/api/telarApi';

export interface ArtisanMaterialItem {
  id: string;
  artisanId: string;
  materialId: string;
  isPrimary: boolean;
  createdAt: string;
  material: {
    id: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    suggestedBy?: string | null;
  };
}

export const getArtisanMaterials = async (artisanId: string): Promise<ArtisanMaterialItem[]> => {
  const { data } = await telarApi.get<ArtisanMaterialItem[]>(`/artisan-materials/artisan/${artisanId}`);
  return data ?? [];
};

export const addArtisanMaterial = async (
  artisanId: string,
  materialId: string,
): Promise<ArtisanMaterialItem> => {
  const { data } = await telarApi.post<ArtisanMaterialItem>('/artisan-materials', {
    artisanId,
    materialId,
  });
  return data;
};

export const removeArtisanMaterial = async (id: string): Promise<void> => {
  await telarApi.delete(`/artisan-materials/${id}`);
};
