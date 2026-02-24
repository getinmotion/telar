import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArtisanBankData } from "@/types/artisan";
import { useToast } from "@/components/ui/use-toast";
import counterpatiesService from "@/services/counterpatiesService";
import { useAuth } from "@/context/AuthContext";

interface BankDataForm {
  holder_name: string;
  document_type: string;
  document_number: string;
  bank_code: string;
  account_type: string;
  account_number: string;
  country: string;
  currency: string;
  status: string;
  geo: string;
}

export const useBankData = () => {
  const [bankData, setBankData] = useState<ArtisanBankData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentToken, setPaymentToken] = useState("");

  const { toast } = useToast();
  const { user } = useAuth();

  const obtenerToken = useCallback(async () => {
    try {
      const { data } = await supabase.functions.invoke("get-payment-token");
      setPaymentToken(data?.token || "");
    } catch (error) {
      console.error("Error getting payment token:", error);
    }
  }, []);

  const fetchBankData = useCallback(async () => {
    try {
      setLoading(true);
      
      // First check if user has id_contraparty in their shop
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data: shopData } = await supabase
        .from('artisan_shops')
        .select('id_contraparty')
        .eq('user_id', authUser.id)
        .single();

      if (!shopData?.id_contraparty) {
        setLoading(false);
        return;
      }

      // Fetch counterparty data from Cobre via edge function
      const { data, error } = await supabase.functions.invoke('get-counterparty', {
        body: { counterparty_id: shopData.id_contraparty }
      });

      if (error) {
        console.error('Error fetching counterparty:', error);
        setLoading(false);
        return;
      }

      if (data?.counterparty) {
        // Map Cobre response to ArtisanBankData format
        const counterparty = data.counterparty;
        setBankData({
          id: shopData.id_contraparty,
          user_id: authUser.id,
          holder_name: counterparty.legal_name || counterparty.name || '',
          document_type: counterparty.document_type || '',
          document_number: counterparty.document_number || '',
          bank_code: counterparty.bank_name || counterparty.bank_code || '',
          account_type: counterparty.account_type || '',
          account_number: counterparty.account_number || '',
          country: counterparty.country || 'Colombia',
          currency: counterparty.currency || 'COP',
          status: 'complete',
          created_at: counterparty.created_at || new Date().toISOString(),
          updated_at: counterparty.updated_at || new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error fetching bank data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    obtenerToken();
  }, [obtenerToken]);

  useEffect(() => {
    fetchBankData();
  }, [fetchBankData]);

  const saveBankData = async (formData: BankDataForm): Promise<{ success: boolean; id_contraparty?: string }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const result = await counterpatiesService.createCounterpartiesCobre(
        toast,
        paymentToken,
        formData,
        user.id
      );

      if (result.success) {
        toast({
          title: "Datos bancarios guardados",
          description: "Tus datos han sido guardados correctamente",
        });
      }

      return result;
    } catch (error) {
      console.error("Error saving bank data:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los datos bancarios",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const updateBankData = async (formData: BankDataForm): Promise<{ success: boolean; id_contraparty?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke("update-counterparty", {
        body: {
          holder_name: formData.holder_name,
          document_type: formData.document_type,
          document_number: formData.document_number,
          bank_code: formData.bank_code,
          account_type: formData.account_type,
          account_number: formData.account_number,
          geo: formData.geo || "col",
        },
      });

      if (error) {
        console.error("Error updating bank data:", error);
        toast({
          title: "Error",
          description: "No se pudieron actualizar los datos bancarios",
          variant: "destructive",
        });
        return { success: false };
      }

      toast({
        title: "Datos actualizados",
        description: "Tus datos bancarios han sido actualizados correctamente",
      });

      // Refetch to show updated data
      await fetchBankData();

      return { success: true, id_contraparty: data?.id_contraparty };
    } catch (error) {
      console.error("Error updating bank data:", error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos bancarios",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  return {
    bankData,
    loading,
    saveBankData,
    updateBankData,
    refetch: fetchBankData,
    paymentToken,
  };
};
