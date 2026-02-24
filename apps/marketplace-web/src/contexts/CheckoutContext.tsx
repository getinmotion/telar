import React, { createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as ProductsActions from '@/services/products.actions';
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
  createCheckoutLink: (cartId: string, price: number) => Promise<boolean>;
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

  const validatePromoCode = async (code: string, cartTotal: number): Promise<boolean> => {
    try {
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
    }
  };

  const clearPromo = () => {
    setPromo(null);
  };

  const applyPromoToOrder = async (orderId: string, cartTotal: number): Promise<boolean> => {
    if (!promo) return true;

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
    }
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
      // Fetch cart items from database
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select('product_id, variant_id, quantity')
        .eq('cart_id', cartId);

      if (error) {
        console.error('[CheckoutContext] Error fetching cart items for snapshot:', error);
        return;
      }

      if (cartItems && cartItems.length > 0) {
        // Fetch product details from products service
        const productIds = cartItems.map(item => item.product_id);

        const productPromises = productIds.map(id =>
          ProductsActions.getProductById(id).catch(() => null)
        );
        const products = await Promise.all(productPromises);

        const productMap = new Map(
          products
            .filter(p => p !== null)
            .map(p => [p!.id, p!])
        );

        const snapshot = cartItems.map(item => {
          const product = productMap.get(item.product_id);
          return {
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            product_name: product?.name,
            price: product?.price
          };
        });

        sessionStorage.setItem('cartItemsSnapshot', JSON.stringify(snapshot));
        console.log('[CheckoutContext] Cart snapshot saved:', snapshot.length, 'items');
      }
    } catch (err) {
      console.error('[CheckoutContext] Error saving cart snapshot:', err);
    }
  };

  const createCheckoutLink = async (cartId: string, price: number): Promise<boolean> => {
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
      console.log('[CheckoutContext] Saving cart snapshot before checkout...');
      await saveCartSnapshot(cartId);

      await supabase
        .from("cart")
        .update({ is_active_cart: false })
        .eq("id", cartId);

      // Use the final price (with discount if promo applied)
      const finalPrice = getFinalTotal(price);

      // Call telar.ia's edge function directly since Cobre secrets are there
      const TELAR_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsb29xbXFtb3VmcXR4dmV0eHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzc1ODIsImV4cCI6MjA2MzI1MzU4Mn0.F_FtGBwpHKBpog6Ad4zUjmogRZMLNVgk18rsbMv7JYs';
      
      const response = await fetch(
        'https://ylooqmqmoufqtxvetxuj.supabase.co/functions/v1/checkout-link-cobre',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TELAR_ANON_KEY}`,
            'apikey': TELAR_ANON_KEY,
          },
          body: JSON.stringify({ cart_id: cartId, price: finalPrice }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Error creating checkout link:", data);
        toast.error(data?.hint || "No pudimos generar el link de pago");
        return false;
      }

      if (data?.checkout_url) {
        const opened = window.open(data.checkout_url, "_blank");
        if (!opened) {
          toast.error("Tu navegador bloqueó la ventana de pago. Permite pop-ups e intenta de nuevo.");
          return false;
        }
        toast.success("Redirigiendo al pago...");
        return true;
      }

      console.error("No checkout URL in response:", data);
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
