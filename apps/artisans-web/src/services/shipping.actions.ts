import { telarApi } from '@/integrations/api/telarApi';

export interface StandalonePiece {
  peso: number;
  largo: number;
  ancho: number;
  alto: number;
}

export interface StandaloneQuoteParams {
  pieces: StandalonePiece[];
  valorDeclarado: number;
  idCityOrigen: string;
  idCityDestino: string;
}

export interface StandaloneQuoteResponse {
  success: boolean;
  shippingCost: number;
  estimatedDays: number;
  error?: string;
}

export interface ShopPhysicalSpecsRow {
  shop_id: string;
  shop_name: string;
  department: string;
  municipality: string;
  region: string;
  servientrega_coverage: boolean;
  product_id: string | null;
  product_name: string | null;
  height_cm: number | null;
  width_cm: number | null;
  length_or_diameter_cm: number | null;
  real_weight_kg: number | null;
  base_price_minor: string | null;
}

export const quoteStandalone = async (
  params: StandaloneQuoteParams,
): Promise<StandaloneQuoteResponse> => {
  const response = await telarApi.post<StandaloneQuoteResponse>(
    '/servientrega/quote-standalone',
    params,
  );
  return response.data;
};

export const getShopsWithPhysicalSpecs = async (): Promise<
  ShopPhysicalSpecsRow[]
> => {
  const response = await telarApi.get<ShopPhysicalSpecsRow[]>(
    '/servientrega/shops-physical-specs',
  );
  return response.data;
};
