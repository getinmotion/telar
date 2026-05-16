import { telarApi } from '@/integrations/api/telarApi';

export interface ArtisanIdentityData {
  id: string;
  techniquePrimaryId: string | null;
  techniqueSecondaryId: string | null;
  craftMessage?: string;
  motivation?: string;
  uniqueness?: string;
  averageTime?: string;
  techniquePrimary?: { id: string; craftId: string; name: string };
  techniqueSecondary?: { id: string; craftId: string; name: string };
}

/**
 * Obtiene la artisan identity del usuario autenticado.
 * Retorna null si el usuario no tiene identity asignada.
 *
 * Endpoint: GET /artisan-identity/user/:userId
 */
export async function getArtisanIdentityByUserId(
  userId: string,
): Promise<ArtisanIdentityData | null> {
  try {
    const response = await telarApi.get<ArtisanIdentityData>(
      `/artisan-identity/user/${userId}`,
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    return null;
  }
}

/**
 * Guarda las técnicas primaria y/o secundaria del artesano.
 * Si el artesano no tiene identity aún, el backend lo ignora sin error.
 *
 * Endpoint: PATCH /artisan-identity/user/:userId
 */
export async function updateArtisanIdentityTechniques(
  userId: string,
  payload: { techniquePrimaryId?: string | null; techniqueSecondaryId?: string | null },
): Promise<void> {
  await telarApi.patch(`/artisan-identity/user/${userId}`, payload);
}
