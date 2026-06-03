import { useState, useEffect, useCallback } from "react";
import { ArtisanBankData } from "@/types/artisan";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  getPayoutUserInfoByUserId,
  createPayoutUserInfo,
  updatePayoutUserInfo,
} from "@/services/payoutUserInfo.actions";
import { PayoutUserInfo } from "@/types/payoutUserInfo.types";

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

/**
 * ✅ MIGRATED: Mapea PayoutUserInfo (NestJS) a ArtisanBankData (formato legacy)
 * Resource: payout-user-info
 *
 * Nota: bankName y numAccount vienen DESENCRIPTADOS del backend
 * idType e idNumber vienen del perfil del usuario (user_profiles)
 */
const mapPayoutUserInfoToArtisanBankData = (
  data: PayoutUserInfo,
): ArtisanBankData => {
  return {
    id: data.id,
    user_id: data.userId,
    holder_name: data.namePayoutMain,
    document_type: data.idType || '', // Viene del perfil del usuario
    document_number: data.idNumber || '', // Viene del perfil del usuario (desencriptado)
    bank_code: data.bankName, // Nombre completo del banco (desencriptado)
    account_type: data.typeAccount,
    account_number: data.numAccount, // Desencriptado
    country: data.countryId, // UUID del país
    currency: data.currency,
    status: 'complete', // Asumimos completo si existe el registro
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  };
};

export const useBankData = () => {
  const [bankData, setBankData] = useState<ArtisanBankData | null>(null);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const { user } = useAuth();

  /**
   * ✅ MIGRATED: Obtiene los datos de payout desde NestJS
   * Endpoint: GET /payout-user-info/user/:userId
   */
  const fetchBankData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const payoutData = await getPayoutUserInfoByUserId(user.id);

      // Tomamos el primer registro (el usuario debería tener solo uno)
      if (payoutData && payoutData.length > 0) {
        setBankData(mapPayoutUserInfoToArtisanBankData(payoutData[0]));
      } else {
        setBankData(null);
      }
    } catch {
      // Sin datos bancarios disponibles
      setBankData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBankData();
  }, [fetchBankData]);

  /**
   * ✅ MIGRATED: Guarda los datos de payout en NestJS
   * Endpoint: POST /payout-user-info
   */
  const saveBankData = async (
    formData: BankDataForm,
  ): Promise<{ success: boolean; id_contraparty?: string }> => {
    if (!user?.id) {
      toast({ title: "Error", description: "Usuario no autenticado", variant: "destructive" });
      return { success: false };
    }

    try {
      const result = await createPayoutUserInfo({
        namePayoutMain: formData.holder_name,
        userId: user.id,
        idType: formData.document_type,
        idNumber: formData.document_number,
        typeAccount: formData.account_type,
        bankName: formData.bank_code, // Ahora se espera nombre del banco
        numAccount: formData.account_number,
        countryId: formData.country, // Se espera UUID del país
        currency: formData.currency,
        createdBy: user.id,
      });

      await fetchBankData(); // Actualizar datos locales
      toast({ title: "Datos bancarios guardados", description: "Tus datos han sido guardados correctamente" });
      return { success: true, id_contraparty: result.id };
    } catch (error) {
      console.error('Error saving payout info:', error);
      toast({ title: "Error", description: "No se pudieron guardar los datos bancarios", variant: "destructive" });
      return { success: false };
    }
  };

  /**
   * ✅ MIGRATED: Actualiza los datos de payout en NestJS
   * Endpoint: PATCH /payout-user-info/:id
   */
  const updateBankData = async (
    formData: BankDataForm,
  ): Promise<{ success: boolean; id_contraparty?: string }> => {
    if (!user?.id) {
      toast({ title: "Error", description: "Usuario no autenticado", variant: "destructive" });
      return { success: false };
    }

    if (!bankData?.id) {
      toast({ title: "Error", description: "No se encontró registro de datos bancarios para actualizar", variant: "destructive" });
      return { success: false };
    }

    try {
      const result = await updatePayoutUserInfo(bankData.id, {
        namePayoutMain: formData.holder_name,
        idType: formData.document_type,
        idNumber: formData.document_number,
        typeAccount: formData.account_type,
        bankName: formData.bank_code, // Ahora se espera nombre del banco
        numAccount: formData.account_number,
        countryId: formData.country, // Se espera UUID del país
        currency: formData.currency,
        updatedBy: user.id,
      });

      toast({ title: "Datos actualizados", description: "Tus datos bancarios han sido actualizados correctamente" });
      await fetchBankData();
      return { success: true, id_contraparty: result.id };
    } catch (error) {
      console.error('Error updating payout info:', error);
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
