import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import * as CartActions from '@/services/cart.actions';
import * as PaymentActions from '@/services/payment.actions';
import { useAuth } from "./AuthContext";

interface PromoState {
  code: string;
  type: 'GIFTCARD' | 'COUPON';
  discountAmount: number;
  newTotal: number;
  remainingBalance: number | null;
  message: string | null;
}

interface CheckoutContextType {
  isLoading: boolean;
  promo: PromoState | null;
  createCheckoutLink: (cartId: string, price: number, provider: 'wompi' | 'cobre') => Promise<boolean>;
  validatePromoCode: (code: string, cartTotal: number) => Promise<boolean>;
  clearPromo: () => void;
  applyPromoToOrder: (orderId: string, cartTotal: number) => Promise<boolean>;
  getFinalTotal: (cartTotal: number) => number;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [promo, setPromo] = useState<PromoState | null>(null);
  const { user } = useAuth();

  // TEMPORALMENTE DESHABILITADO - Cupones y Gift Cards
  const validatePromoCode = async (code: string, cartTotal: number): Promise<boolean> => {
    // TODO: Migrar a nuevo endpoint de validación de promos
    console.warn('[CheckoutContext] validatePromoCode not implemented yet');
    toast.error("Validación de códigos promocionales temporalmente deshabilitada");
    return false;

    /* try {
      const { data, error } = await supabase.functions.invoke('validate-promo-code', {
        body: {
          code: code.toUpperCase().trim(),
          user_id: user?.id,
          cart_total: cartTotal
        }
      });

      if (error) {
        console.error("Error validating promo code:", error);
        toast.error("Error al validar el código");
        return false;
      }

      if (data?.valid) {
        setPromo({
          code: code.toUpperCase().trim(),
          type: data.type,
          discountAmount: data.discount_amount,
          newTotal: data.new_total,
          remainingBalance: data.remaining_balance_after_use ?? null,
          message: data.message
        });
        toast.success(data.message || "Código aplicado exitosamente");
        return true;
      } else {
        toast.error(data?.message || "Código no válido o expirado");
        return false;
      }
    } catch (error) {
      console.error("Exception validating promo code:", error);
      toast.error("Error al validar el código");
      return false;
    } */
  };

  const clearPromo = () => {
    setPromo(null);
  };

  // TEMPORALMENTE DESHABILITADO - Cupones y Gift Cards
  const applyPromoToOrder = async (orderId: string, cartTotal: number): Promise<boolean> => {
    // TODO: Migrar a nuevo endpoint de aplicación de promos
    console.warn('[CheckoutContext] applyPromoToOrder not implemented yet');
    return true; // Return true to not block order creation

    /* if (!promo) return true;

    try {
      const { data, error } = await supabase.functions.invoke('apply-promo-code', {
        body: {
          code: promo.code,
          user_id: user?.id,
          order_id: orderId,
          cart_total: cartTotal
        }
      });

      if (error) {
        console.error("Error applying promo code:", error);
        return false;
      }

      return data?.success ?? false;
    } catch (error) {
      console.error("Exception applying promo code:", error);
      return false;
    } */
  };

  const getFinalTotal = (cartTotal: number): number => {
    if (promo) {
      return promo.newTotal;
    }
    return cartTotal;
  };

  // Save cart snapshot to sessionStorage for payment processing
  const saveCartSnapshot = async (cartId: string) => {
    try {
      // Fetch cart items with enriched product data from backend
      const detailedItems = await CartActions.getCartItems(cartId);

      if (detailedItems && detailedItems.length > 0) {
        const snapshot = detailedItems.map(item => ({
          product_id: item.productId,
          variant_id: item.metadata?.variantId || null,
          quantity: item.quantity,
          product_name: item.product?.name,
          price: parseFloat(item.unitPriceMinor) / 100 // Convert from minor units
        }));

        sessionStorage.setItem('cartItemsSnapshot', JSON.stringify(snapshot));
      }
    } catch (err) {
      console.error('[CheckoutContext] Error saving cart snapshot:', err);
    }
  };

  const createCheckoutLink = async (
    cartId: string,
    price: number,
    provider: 'wompi' | 'cobre'
  ): Promise<boolean> => {
    if (!cartId) {
      toast.error("Datos del carrito inválidos");
      return false;
    }

    // If price is 0 or negative, this should be handled by process-zero-payment
    // This is a safety check - ConfirmPurchase should route $0 orders differently
    if (price <= 0) {
      console.warn("[CheckoutContext] Attempted to create checkout with $0 - this should be handled by process-zero-payment");
      toast.error("El total es $0. Usa el procesamiento de gift card.");
      return false;
    }

    setIsLoading(true);

    try {
      // Save cart snapshot BEFORE any state changes
      await saveCartSnapshot(cartId);

      // Use the final price (with discount if promo applied)
      const finalPrice = getFinalTotal(price);

      // Create checkout with payment service
      const returnUrl = `${window.location.origin}/payment-success`;

      const checkout = await PaymentActions.createCheckout({
        cart_id: cartId,
        amount: finalPrice,
        currency: 'COP',
        provider_code: provider,
        return_url: returnUrl
      });

      if (checkout?.checkout_url) {
        const opened = window.open(checkout.checkout_url, "_blank");
        if (!opened) {
          toast.error("Tu navegador bloqueó la ventana de pago. Permite pop-ups e intenta de nuevo.");
          return false;
        }
        toast.success("Redirigiendo al pago...");
        return true;
      }

      console.error("No checkout URL in response:", checkout);
      toast.error("No se pudo obtener el link de pago");
      return false;
    } catch (error) {
      console.error("Exception creating checkout link:", error);
      toast.error("Error inesperado al procesar el pago");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CheckoutContext.Provider value={{ 
      isLoading, 
      promo,
      createCheckoutLink, 
      validatePromoCode,
      clearPromo,
      applyPromoToOrder,
      getFinalTotal
    }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};
