import { telarApi } from '@/integrations/api/telarApi';

export interface FaqItem {
  q: string;
  a: string;
}

export interface StorePoliciesConfig {
  id: string;
  returnPolicy: string | null;
  faq: FaqItem[] | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface StorePoliciesConfigPayload {
  returnPolicy?: string;
  faq?: FaqItem[];
}

export const getStorePoliciesConfig = async (id: string): Promise<StorePoliciesConfig> => {
  const response = await telarApi.get<StorePoliciesConfig>(`/store-policies-config/${id}`);
  return response.data;
};

export const createStorePoliciesConfig = async (
  payload: StorePoliciesConfigPayload,
): Promise<StorePoliciesConfig> => {
  const response = await telarApi.post<StorePoliciesConfig>('/store-policies-config', payload);
  return response.data;
};

export const updateStorePoliciesConfig = async (
  id: string,
  payload: StorePoliciesConfigPayload,
): Promise<StorePoliciesConfig> => {
  const response = await telarApi.patch<StorePoliciesConfig>(`/store-policies-config/${id}`, payload);
  return response.data;
};
