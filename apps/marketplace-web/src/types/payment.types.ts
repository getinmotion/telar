/**
 * Payment Types
 * Tipos para integración con el servicio de pagos
 */

/**
 * Request para crear checkout de pago
 */
export interface CreateCheckoutRequest {
  cart_id: string; // UUID del carrito
  amount: number; // Monto total en COP (sin centavos)
  currency: string; // ISO 4217 (ej: 'COP')
  provider_code: 'wompi' | 'cobre'; // Proveedor de pago
  return_url: string; // URL de retorno después del pago
}

/**
 * Response de creación de checkout
 */
export interface CheckoutResponse {
  checkout_id: string; // ID del checkout
  payment_intent_id: string; // ID de la intención de pago
  payment_attempt_id: string; // ID del intento de pago
  attempt_no: number; // Número de intento
  checkout_url: string; // URL para redirigir al usuario
  status: string; // Estado del checkout
  expires_at: string; // Fecha de expiración
}
