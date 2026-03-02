/**
 * Servientrega Types
 * Tipos para cotización de envíos con Servientrega
 */

/**
 * Response de Servientrega (raw API)
 */
export interface ServientregaRawResponse {
  ValorFlete?: number;
  ValorSobreFlete?: number;
  ValorTotal?: number;
  TiempoEntrega?: number;
  [key: string]: any;
}

/**
 * Cotización de envío para una tienda
 */
export interface ShippingQuote {
  shopId?: string;
  shop_id?: string;
  shopName?: string;
  originCity?: string;
  origin_city?: string;
  destinationCity?: string;
  shippingCost?: number;
  estimatedDays?: number;
  error?: string;
  rawResponse?: ServientregaRawResponse;
  response?: ServientregaRawResponse; // Legacy compatibility
  status?: number;
}

/**
 * Request para cotización de envío
 */
export interface ServientregaQuoteRequest {
  cart_id: string; // UUID del carrito
  idCityDestino: string; // Código DANE de ciudad destino (ej: "11001" para Bogotá)
}

/**
 * Response de cotización de envío
 */
export interface ServientregaQuoteResponse {
  success: boolean;
  quotes: ShippingQuote[];
  totalShipping?: number;
  error?: string;
}
