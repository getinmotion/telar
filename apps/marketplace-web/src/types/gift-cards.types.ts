/**
 * Gift Cards Types
 * Tipos para gestión de gift cards
 */

/**
 * Gift Card del backend (camelCase)
 */
export interface GiftCard {
  id: string;
  code: string;
  initialAmount: string;      // Decimal como string
  remainingAmount: string;    // Decimal como string
  currency: string;            // "COP"
  status: 'active' | 'inactive' | 'expired' | 'used';
  expirationDate: string | null;
  purchaserEmail: string;
  recipientEmail: string | null;
  message: string | null;
  marketplaceOrderId: string | null;
  originalAmount: string | null;   // Decimal como string
  orderId: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response del endpoint GET /gift-cards/user/:email
 */
export type GetUserGiftCardsResponse = GiftCard[];
