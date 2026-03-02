import { useState, useEffect, useCallback } from "react";
import { ArtisanBankData } from "@/types/artisan";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getArtisanShopByUserId } from "@/services/artisanShops.actions";
import {
  getCounterparty,
  createCounterpartySelf,
  CounterpartyResponse,
} from "@/services/cobre.actions";

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

const mapCounterpartyToArtisanBankData = (
  userId: string,
  counterpartyId: string,
  data: CounterpartyResponse,
): ArtisanBankData => {
  const meta = data.metadata ?? {};
  return {
    id: counterpartyId,
    user_id: userId,
    holder_name: meta.counterparty_fullname ?? '',
    document_type: meta.counterparty_id_type ?? '',
    document_number: meta.counterparty_id_number ?? '',
    bank_code: meta.beneficiary_institution ?? '',
    account_type: data.type ?? '',
    account_number: meta.account_number ?? '',
    country: 'Colombia',
    currency: 'COP',
    status: 'complete',
    created_at: (data.created_at as string) ?? new Date().toISOString(),
    updated_at: (data.updated_at as string) ?? new Date().toISOString(),
  };
};

export const useBankData = () => {
  const [bankData, setBankData] = useState<ArtisanBankData | null>(null);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const { user } = useAuth();

  const fetchBankData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const shop = await getArtisanShopByUserId(user.id);
      if (!shop?.idContraparty) {
        setLoading(false);
        return;
      }

      const data = await getCounterparty(shop.idContraparty);
      setBankData(mapCounterpartyToArtisanBankData(user.id, shop.idContraparty, data));
    } catch {
      // Sin datos bancarios disponibles
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBankData();
  }, [fetchBankData]);

  const saveBankData = async (
    formData: BankDataForm,
  ): Promise<{ success: boolean; id_contraparty?: string }> => {
    if (!user?.id) {
      toast({ title: "Error", description: "Usuario no autenticado", variant: "destructive" });
      return { success: false };
    }

    try {
      const result = await createCounterpartySelf(user.id, {
        holder_name: formData.holder_name,
        document_type: formData.document_type,
        document_number: formData.document_number,
        bank_code: formData.bank_code,
        account_type: formData.account_type,
        account_number: formData.account_number,
      });

      toast({ title: "Datos bancarios guardados", description: "Tus datos han sido guardados correctamente" });
      return { success: true, id_contraparty: result.id_contraparty };
    } catch {
      toast({ title: "Error", description: "No se pudieron guardar los datos bancarios", variant: "destructive" });
      return { success: false };
    }
  };

  // "Actualizar" en Cobre implica crear una nueva contraparte y reemplazar la anterior
  const updateBankData = async (
    formData: BankDataForm,
  ): Promise<{ success: boolean; id_contraparty?: string }> => {
    if (!user?.id) {
      toast({ title: "Error", description: "Usuario no autenticado", variant: "destructive" });
      return { success: false };
    }

    try {
      const result = await createCounterpartySelf(user.id, {
        holder_name: formData.holder_name,
        document_type: formData.document_type,
        document_number: formData.document_number,
        bank_code: formData.bank_code,
        account_type: formData.account_type,
        account_number: formData.account_number,
      });

      toast({ title: "Datos actualizados", description: "Tus datos bancarios han sido actualizados correctamente" });
      await fetchBankData();
      return { success: true, id_contraparty: result.id_contraparty };
    } catch {
      toast({ title: "Error", description: "No se pudieron actualizar los datos bancarios", variant: "destructive" });
      return { success: false };
    }
  };

  return {
    bankData,
    loading,
    saveBankData,
    updateBankData,
    refetch: fetchBankData,
    // paymentToken kept for backward compat but no longer needed
    paymentToken: '',
  };
};
