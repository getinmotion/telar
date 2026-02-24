import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PromoValidationResult {
  valid: boolean;
  type?: "GIFTCARD" | "COUPON";
  promo_id?: string;
  discount_amount?: number;
  new_total?: number;
  remaining_balance_after_use?: number;
  message?: string;
  error?: string;
  coupon_type?: string;
  coupon_value?: number;
}

interface PromoApplicationResult {
  success: boolean;
  type?: "GIFTCARD" | "COUPON";
  discount_applied?: number;
  new_total?: number;
  remaining_balance?: number;
  message?: string;
  error?: string;
}

interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed_amount";
  value: number;
  description: string | null;
  is_public: boolean;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  usage_limit_total: number | null;
  usage_limit_per_user: number | null;
  times_used: number;
  conditions_json: Record<string, unknown>;
  created_at: string;
}

interface GiftCard {
  id: string;
  code: string;
  initial_amount: number;
  remaining_amount: number;
  currency: string;
  status: "active" | "expired" | "depleted" | "blocked";
  expiration_date: string | null;
  purchaser_email: string;
  recipient_email: string | null;
  message: string | null;
  marketplace_order_id: string | null;
  created_at: string;
}

export function usePromotions() {
  const [loading, setLoading] = useState(false);

  const validatePromoCode = async (
    code: string,
    cartTotal: number,
    userId?: string,
    userEmail?: string
  ): Promise<PromoValidationResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-promo-code", {
        body: {
          code,
          cart_total: cartTotal,
          user_id: userId,
          user_email: userEmail,
        },
      });

      if (error) throw error;
      return data as PromoValidationResult;
    } catch (error) {
      console.error("Error validating promo code:", error);
      return { valid: false, error: "Error al validar el código" };
    } finally {
      setLoading(false);
    }
  };

  const applyPromoCode = async (
    code: string,
    orderId: string,
    cartTotal: number,
    userId?: string,
    userEmail?: string
  ): Promise<PromoApplicationResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("apply-promo-code", {
        body: {
          code,
          order_id: orderId,
          cart_total: cartTotal,
          user_id: userId,
          user_email: userEmail,
        },
      });

      if (error) throw error;
      return data as PromoApplicationResult;
    } catch (error) {
      console.error("Error applying promo code:", error);
      return { success: false, error: "Error al aplicar el código" };
    } finally {
      setLoading(false);
    }
  };

  // Admin functions
  const listCoupons = async (): Promise<Coupon[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-coupons", {
        body: { action: "list" },
      });

      if (error) throw error;
      return data.coupons || [];
    } catch (error) {
      console.error("Error listing coupons:", error);
      toast.error("Error al cargar cupones");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (couponData: Partial<Coupon>): Promise<Coupon | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-coupons", {
        body: { action: "create", data: couponData },
      });

      if (error) throw error;
      if (!data.success) {
        toast.error(data.error || "Error al crear cupón");
        return null;
      }
      toast.success("Cupón creado exitosamente");
      return data.coupon;
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error("Error al crear cupón");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCoupon = async (id: string, updates: Partial<Coupon>): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-coupons", {
        body: { action: "update", data: { id, ...updates } },
      });

      if (error) throw error;
      if (!data.success) {
        toast.error(data.error || "Error al actualizar cupón");
        return false;
      }
      toast.success("Cupón actualizado");
      return true;
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error("Error al actualizar cupón");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deactivateCoupon = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-coupons", {
        body: { action: "deactivate", data: { id } },
      });

      if (error) throw error;
      if (!data.success) {
        toast.error(data.error || "Error al desactivar cupón");
        return false;
      }
      toast.success("Cupón desactivado");
      return true;
    } catch (error) {
      console.error("Error deactivating coupon:", error);
      toast.error("Error al desactivar cupón");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Gift card admin functions - use edge function to avoid RLS issues
  const listGiftCards = async (filters?: { status?: string }): Promise<GiftCard[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-gift-cards", {
        body: { action: "list", status: filters?.status },
      });

      if (error) throw error;
      return data?.data || [];
    } catch (error) {
      console.error("Error listing gift cards:", error);
      toast.error("Error al cargar gift cards");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getGiftCardTransactions = async (giftCardId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-gift-cards", {
        body: { action: "get_transactions", gift_card_id: giftCardId },
      });

      if (error) throw error;
      return data?.data || [];
    } catch (error) {
      console.error("Error fetching gift card transactions:", error);
      return [];
    }
  };

  const blockGiftCard = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("manage-gift-cards", {
        body: { action: "block", id },
      });

      if (error) throw error;
      toast.success("Gift card bloqueada");
      return true;
    } catch (error) {
      console.error("Error blocking gift card:", error);
      toast.error("Error al bloquear gift card");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unblockGiftCard = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("manage-gift-cards", {
        body: { action: "unblock", id },
      });

      if (error) throw error;
      toast.success("Gift card desbloqueada");
      return true;
    } catch (error) {
      console.error("Error unblocking gift card:", error);
      toast.error("Error al desbloquear gift card");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createGiftCard = async (data: {
    amount: number;
    purchaser_email: string;
    recipient_email?: string;
    message?: string;
    expiration_days?: number;
  }): Promise<GiftCard | null> => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("manage-gift-cards", {
        body: { action: "create", ...data },
      });

      if (error) throw error;
      toast.success(`Gift card creada: ${result?.data?.code}`);
      return result?.data;
    } catch (error) {
      console.error("Error creating gift card:", error);
      toast.error("Error al crear gift card");
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate gift cards from a marketplace order purchase.
   * Called when a customer purchases gift cards through the marketplace.
   * 
   * NOTE: primera_compra condition validation currently only checks coupon_redemptions table,
   * not actual marketplace orders. Full validation requires marketplace integration.
   */
  const generateGiftCards = async (data: {
    order_id: string;
    purchaser_email: string;
    gift_cards: Array<{
      amount: number;
      quantity?: number;
      recipient_email?: string;
      message?: string;
      expiration_days?: number;
    }>;
  }): Promise<{ success: boolean; gift_cards: GiftCard[]; message?: string } | null> => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-gift-cards", {
        body: data,
      });

      if (error) throw error;
      if (!result?.success) {
        toast.error(result?.error || "Error al generar gift cards");
        return null;
      }
      toast.success(result.message || "Gift cards generadas exitosamente");
      return result;
    } catch (error) {
      console.error("Error generating gift cards:", error);
      toast.error("Error al generar gift cards");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    validatePromoCode,
    applyPromoCode,
    listCoupons,
    createCoupon,
    updateCoupon,
    deactivateCoupon,
    listGiftCards,
    getGiftCardTransactions,
    blockGiftCard,
    unblockGiftCard,
    createGiftCard,
    generateGiftCards,
  };
}
