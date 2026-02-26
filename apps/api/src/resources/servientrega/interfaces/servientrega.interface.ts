/**
 * Interfaces para Servientrega API
 */

export interface ServientregaAuthResponse {
  token: string;
  [key: string]: any;
}

export interface ServientregaPiece {
  Peso: number; // kg
  Largo: number; // cm
  Ancho: number; // cm
  Alto: number; // cm
}

export interface ServientregaQuoteRequest {
  IdProducto: number; // 2 = Entrega en punto
  NumeroPiezas: number;
  Piezas: ServientregaPiece[];
  ValorDeclarado: number; // Valor en pesos COP
  IdDaneCiudadOrigen: string; // Código DANE + 000
  IdDaneCiudadDestino: string; // Código DANE + 000
  EnvioConCobro: boolean;
  FormaPago: number; // 2 = Crédito
  TiempoEntrega: number; // 1 = Normal
  MedioTransporte: number; // 1 = Terrestre
  NumRecaudo: number;
}

export interface ServientregaQuoteResponse {
  ValorFlete?: number;
  valorTotal?: number;
  valor?: number;
  TiempoEntrega?: number;
  error?: string;
  [key: string]: any;
}

export interface ShopGroup {
  shopId: string;
  shopName: string;
  originCity: string; // Código DANE
  totalValue: number;
  itemsCount: number;
  pieces: ServientregaPiece[];
}

export interface ShopQuoteResult {
  shopId: string;
  shopName: string;
  originCity: string;
  destinationCity: string;
  shippingCost: number;
  estimatedDays: number;
  error?: string;
  rawResponse?: ServientregaQuoteResponse;
}

export interface QuoteShippingResponse {
  success: boolean;
  cart_id: string;
  destination_city: string;
  quotes: ShopQuoteResult[];
  totalShipping: number;
  error?: string;
}
