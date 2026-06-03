/**
 * Achievements Catalog Types
 * Tipos para el catálogo de logros del sistema
 */

export interface AchievementsCatalog {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockCriteria: object;
  category: string | null;
  tier: string;
  createdAt: Date;
}

export interface GetAchievementsCatalogResponse {
  success: boolean;
  data: AchievementsCatalog[];
}

export interface GetAchievementCatalogByIdResponse {
  success: boolean;
  data: AchievementsCatalog;
}

export interface CreateAchievementsCatalogPayload {
  id: string;
  title: string;
  description: string;
  icon?: string;
  unlockCriteria?: object;
  category?: string;
  tier?: string;
}

export interface UpdateAchievementsCatalogPayload {
  title?: string;
  description?: string;
  icon?: string;
  unlockCriteria?: object;
  category?: string;
  tier?: string;
}
