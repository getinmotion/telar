import { supabase } from "@/integrations/supabase/client";

export default {
  async createCounterpartiesCobre(
    toast: Function,
    token: string,
    payload: any,
    userId: string,
  ): Promise<{ success: boolean; id_contraparty?: string }> {

    try {
      const { data, error } = await supabase.functions.invoke("quick-task", {
        method: "POST",
        body: {
          userId: userId,
          geo: payload.geo,
          type: payload.account_type,
          alias: `${payload.holder_name} - ${payload.account_type}`,
          metadata: {
            account_number: payload.account_number,
            beneficiary_institution: payload.bank_code,
            counterparty_fullname: payload.holder_name,
            counterparty_id_number: payload.document_number,
            counterparty_id_type: payload.document_type,
          },
        },
        headers: {
          "token-Cobre-Auth": `Bearer ${token}`,
        },
      });

      if (error) {
        console.error("API Error:", error);
        toast({
          title: "Error",
          description: "No se pudieron guardar los datos bancarios",
          variant: "destructive",
        });
        return { success: false };
      }

      return { 
        success: true, 
        id_contraparty: data?.id_contraparty 
      };
    } catch (error) {
      console.error("API Error:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los datos bancarios",
        variant: "destructive",
      });
      return { success: false };
    }
  },
};
