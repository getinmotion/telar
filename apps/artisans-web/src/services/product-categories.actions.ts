import { telarApi } from '@/integrations/api/telarApi';

export interface ProductCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAllProductCategories(): Promise<ProductCategory[]> {
  const response = await telarApi.get<ProductCategory[]>('/product-categories');
  return response.data;
}

export async function getActiveProductCategories(): Promise<ProductCategory[]> {
  const response = await telarApi.get<ProductCategory[]>('/product-categories/active');
  return response.data;
}

export async function getProductCategoryChildren(parentId: string): Promise<ProductCategory[]> {
  const response = await telarApi.get<ProductCategory[]>(`/product-categories/${parentId}/children`);
  return response.data;
}
