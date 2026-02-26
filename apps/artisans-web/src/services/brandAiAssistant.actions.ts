import { telarApi } from '@/integrations/api/telarApi';

interface BrandColors {
  primary: string[];
  secondary: string[];
}

export interface BrandDiagnosis {
  scores: {
    logo: { score: number; reasoning: string };
    color: { score: number; reasoning: string };
    typography: { score: number; reasoning: string };
    claim: { score: number; reasoning: string };
    global_identity: { score: number; reasoning: string };
  };
  average_score: number;
  summary: string;
  strengths: string[];
  opportunities: string[];
  risks: string[];
}

export async function generateColorPalette(
  primaryColors: string[]
): Promise<{ secondary_colors: string[] }> {
  const response = await telarApi.post<{ secondary_colors: string[]; reasoning: string }>(
    '/telar/server/ai/brand-assistant',
    { action: 'generate_color_palette', primaryColors }
  );
  return { secondary_colors: response.data.secondary_colors };
}

export async function diagnoseBrandIdentity(params: {
  logoUrl?: string | null;
  colors: BrandColors;
  brandName: string;
  businessDescription?: string;
  perception?: Record<string, unknown>;
}): Promise<{ diagnosis: BrandDiagnosis }> {
  const response = await telarApi.post<{ diagnosis: BrandDiagnosis }>(
    '/telar/server/ai/brand-assistant',
    {
      action: 'diagnose_brand_identity',
      logoUrl: params.logoUrl || undefined,
      colors: params.colors,
      brandName: params.brandName,
      businessDescription: params.businessDescription || '',
      perception: params.perception || {},
    }
  );
  return response.data;
}
