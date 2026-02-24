/**
 * Shared order helper functions for consistent logic across admin dashboard and orders panel
 */

export interface OrderForTypeCheck {
  shipping_address?: any;
  shipping_cost?: number | null;
  notes?: string | null;
}

/**
 * Determines if an order is a pickup order based on shipping_address.method,
 * shipping_cost, and notes. This is the SINGLE SOURCE OF TRUTH for this logic.
 */
export const isPickupOrder = (order: OrderForTypeCheck): boolean => {
  const address = order.shipping_address;
  
  // 1. Check explicit method in shipping_address
  if (address?.method === 'pickup' || address?.type === 'pickup') {
    return true;
  }
  
  // 2. If method is a known courier, it's NOT pickup
  if (address?.method === 'servientrega' || address?.method === 'coordinadora' || address?.method === 'interrapidisimo') {
    return false;
  }
  
  // 3. If has shipping cost > 0, it's shipping (NOT pickup)
  if (order.shipping_cost && order.shipping_cost > 0) {
    return false;
  }
  
  // 4. Check notes and address notes for pickup indicators
  const notes = (order.notes || '').toLowerCase();
  const addressNote = (address?.note || '').toLowerCase();
  const descEnvio = (address?.desc_envio || '').toLowerCase();
  
  if (notes.includes('pickup') || notes.includes('retiro') ||
      addressNote.includes('pickup') || addressNote.includes('retiro') ||
      descEnvio.includes('pickup') || descEnvio.includes('retiro')) {
    return true;
  }
  
  // 5. If shipping_cost is 0 and no explicit method, check if address is empty
  if ((!order.shipping_cost || order.shipping_cost === 0) && !address?.method) {
    // If address is essentially empty, assume pickup
    const hasAddress = address?.address || address?.city || address?.state || address?.department;
    if (!hasAddress) {
      return true;
    }
  }
  
  // Default: if we can't determine, assume it's shipping (safer for fulfillment)
  return false;
};

export interface OrderForPaymentCheck {
  payment_method?: string | null;
  notes?: string | null;
  total: number;
  shipping_cost?: number | null;
}

/**
 * Checks if an order was paid (partially or fully) with a gift card
 */
export const isGiftCardPayment = (order: OrderForPaymentCheck): boolean => {
  const notes = (order.notes || '').toLowerCase();
  return order.payment_method === 'gift_card' || 
         notes.includes('gift card') || 
         notes.includes('giftcard') ||
         notes.includes('tarjeta regalo');
};

/**
 * Gets the real money revenue from an order (excluding gift card amounts)
 * - If 100% gift card: returns 0 (already counted when GC was sold)
 * - If mixed (GC + shipping): returns only the shipping cost
 * - If no GC: returns the full total
 */
export const getRealRevenueFromOrder = (order: OrderForPaymentCheck): number => {
  if (order.payment_method === 'gift_card') {
    // 100% gift card - no real money in this order
    return 0;
  }
  
  const notes = (order.notes || '').toLowerCase();
  if (notes.includes('gift card') || notes.includes('giftcard') || notes.includes('tarjeta regalo')) {
    // Mixed payment - only shipping is real money
    return order.shipping_cost || 0;
  }
  
  // Normal payment - full total is real money
  return order.total;
};

/**
 * Gets the gift card amount used in an order
 */
export const getGiftCardAmount = (order: OrderForPaymentCheck): number => {
  if (order.payment_method === 'gift_card') {
    return order.total;
  }
  
  const notes = (order.notes || '').toLowerCase();
  if (notes.includes('gift card') || notes.includes('giftcard') || notes.includes('tarjeta regalo')) {
    return order.total - (order.shipping_cost || 0);
  }
  
  return 0;
};
