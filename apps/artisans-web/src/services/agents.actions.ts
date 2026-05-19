import { agentsApi } from '@/integrations/api/agentsApi';

export interface ModerationInsight {
  type: string;
  severity: 'warning' | 'suggestion' | 'info';
  message: string;
  suggested_value?: string | null;
}

export interface ModerationAnalyzeRequest {
  product_id: string;
  name: string;
  short_description?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  materials?: string[];
  craft_name?: string | null;
  technique_name?: string | null;
  image_urls?: string[];
  price?: number | null;
  shop_name?: string | null;
  shop_region?: string | null;
}

export interface ModerationAnalyzeResponse {
  product_id: string;
  quality_score: number;
  insights: ModerationInsight[];
  suggested_category: string | null;
  summary: string;
}

export async function analyzeModerationProduct(
  request: ModerationAnalyzeRequest,
): Promise<ModerationAnalyzeResponse> {
  const response = await agentsApi.post<ModerationAnalyzeResponse>(
    '/agents/moderation/analyze',
    request,
  );
  return response.data;
}
