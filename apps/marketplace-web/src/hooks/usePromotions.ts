import { useState } from 'react';

const TELAR_FUNCTIONS_URL = 'https://ylooqmqmoufqtxvetxuj.supabase.co/functions/v1';
const TELAR_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsb29xbXFtb3VmcXR4dmV0eHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzc1ODIsImV4cCI6MjA2MzI1MzU4Mn0.F_FtGBwpHKBpog6Ad4zUjmogRZMLNVgk18rsbMv7JYs';

export interface PromoValidationResult {
  valid: boolean;
  type?: 'coupon' | 'gift_card';
  discount_type?: 'percentage' | 'fixed_value';
  discount_value?: number;
  discount_amount: number;
  new_total: number;
  message: string;
  coupon_id?: string;
  gift_card_id?: string;
  remaining_balance?: number;
  code?: string;
}

export const usePromotions = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const validatePromoCode = async (
    code: string, 
    cartTotal: number, 
    userId?: string,
    userEmail?: string
  ): Promise<PromoValidationResult> => {
    setIsValidating(true);
    try {
      const response = await fetch(`${TELAR_FUNCTIONS_URL}/validate-promo-code`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'apikey': TELAR_ANON_KEY,
        },
        body: JSON.stringify({ 
          code: code.trim().toUpperCase(), 
          cart_total: cartTotal, 
          user_id: userId,
          user_email: userEmail 
        })
      });
      
      const result = await response.json();
      
      // Even if HTTP status is 400, the response contains valid data with error message
      if (!result.valid) {
        return {
          valid: false,
          discount_amount: 0,
          new_total: cartTotal,
          message: result.error || result.message || 'Código no válido'
        };
      }
      
      return {
        ...result,
        message: result.message || 'Código aplicado'
      };
    } catch (error) {
      console.error('Error validating promo code:', error);
      return {
        valid: false, 
        discount_amount: 0, 
        new_total: cartTotal, 
        message: 'Error al validar el código' 
      };
    } finally {
      setIsValidating(false);
    }
  };

  const applyPromoCode = async (
    code: string, 
    orderId: string, 
    cartTotal: number, 
    userId?: string,
    userEmail?: string
  ): Promise<{ success: boolean; message: string; final_total?: number }> => {
    setIsApplying(true);
    try {
      const response = await fetch(`${TELAR_FUNCTIONS_URL}/apply-promo-code`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'apikey': TELAR_ANON_KEY,
        },
        body: JSON.stringify({ 
          code: code.trim().toUpperCase(), 
          order_id: orderId, 
          cart_total: cartTotal,
          user_id: userId,
          user_email: userEmail 
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error applying promo code:', error);
      return { success: false, message: 'Error al aplicar el código' };
    } finally {
      setIsApplying(false);
    }
  };

  return { validatePromoCode, applyPromoCode, isValidating, isApplying };
};
