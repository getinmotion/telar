import React, { createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { telarClient } from "@/lib/telarClient";
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
  createCheckoutLink: (cartId: string, price: number) => Promise<void>;
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

  const createCheckoutLink = async (cartId: string, price: number) => {
    if (!cartId || price <= 0) {
      toast.error("Datos del carrito inválidos");
      return;
    }

    setIsLoading(true);

    try {
      await telarClient
        .from("cart")
        .update({ is_active_cart: false })
        .eq("id", cartId);

      // Use the final price (with discount if promo applied)
      const finalPrice = getFinalTotal(price);

      const { data, error } = await supabase.functions.invoke(
        "checkout-link-cobre",
        {
          body: { cart_id: cartId, price: finalPrice },
        }
      );

      if (error) {
        console.error("Error creating checkout link:", error);
        toast.error("Error al crear el link de pago");
        return;
      }

      if (data?.checkout_url) {
        window.open(data.checkout_url, "_blank");
        toast.success("Redirigiendo al pago...");
      } else {
        console.error("No checkout URL in response:", data);
        toast.error("No se pudo obtener el link de pago");
      }
    } catch (error) {
      console.error("Exception creating checkout link:", error);
      toast.error("Error inesperado al procesar el pago");
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
