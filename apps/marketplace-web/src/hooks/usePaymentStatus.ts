import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PaymentStatus = 'initiated' | 'processing' | 'completed' | 'canceled' | 'failed' | 'returned' | null;

const FINAL_STATUSES: PaymentStatus[] = ['completed', 'canceled', 'failed', 'returned'];

interface UsePaymentStatusOptions {
  cartId: string | null;
  onStatusChange?: (status: PaymentStatus) => void;
  onFinalStatus?: (status: PaymentStatus) => void;
}

export const usePaymentStatus = ({ cartId, onStatusChange, onFinalStatus }: UsePaymentStatusOptions) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(null);
  const [isListening, setIsListening] = useState(false);
  const [isFinalStatus, setIsFinalStatus] = useState(false);

  const checkIsFinal = useCallback((status: PaymentStatus) => {
    return status !== null && FINAL_STATUSES.includes(status);
  }, []);

  // Función para consultar el estado actual usando RPC o query raw
  const fetchCurrentStatus = useCallback(async () => {
    if (!cartId) return null;

    try {
      // Usar query directo con from() y cast para evitar problemas de tipos
      const { data, error } = await (supabase as any)
        .from('cart')
        .select('payment_status')
        .eq('id', cartId)
        .single();

      if (error) {
        console.error('Error fetching payment status:', error);
        return null;
      }

      return data?.payment_status as PaymentStatus;
    } catch (err) {
      console.error('Exception fetching payment status:', err);
      return null;
    }
  }, [cartId]);

  // Iniciar escucha de cambios
  const startListening = useCallback(() => {
    if (!cartId || isListening) return;

    setIsListening(true);

    // Consultar estado inicial
    fetchCurrentStatus().then((status) => {
      if (status) {
        setPaymentStatus(status);
        onStatusChange?.(status);
        
        if (checkIsFinal(status)) {
          setIsFinalStatus(true);
          onFinalStatus?.(status);
        }
      }
    });
  }, [cartId, isListening, fetchCurrentStatus, onStatusChange, onFinalStatus, checkIsFinal]);

  // Detener escucha
  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  // Configurar Realtime subscription
  useEffect(() => {
    if (!cartId || !isListening) return;

    const channel = supabase
      .channel(`cart-payment-${cartId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cart',
          filter: `id=eq.${cartId}`
        },
        (payload) => {
          const newStatus = payload.new.payment_status as PaymentStatus;
          
          setPaymentStatus(newStatus);
          onStatusChange?.(newStatus);

          if (checkIsFinal(newStatus)) {
            setIsFinalStatus(true);
            onFinalStatus?.(newStatus);
            // Opcional: detener listener después de estado final
            // stopListening();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cartId, isListening, onStatusChange, onFinalStatus, checkIsFinal]);

  // Polling como fallback (cada 3 segundos)
  useEffect(() => {
    if (!cartId || !isListening || isFinalStatus) return;

    const pollInterval = setInterval(async () => {
      const status = await fetchCurrentStatus();
      if (status && status !== paymentStatus) {
        setPaymentStatus(status);
        onStatusChange?.(status);

        if (checkIsFinal(status)) {
          setIsFinalStatus(true);
          onFinalStatus?.(status);
          clearInterval(pollInterval);
        }
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [cartId, isListening, isFinalStatus, paymentStatus, fetchCurrentStatus, onStatusChange, onFinalStatus, checkIsFinal]);

  return {
    paymentStatus,
    isListening,
    isFinalStatus,
    startListening,
    stopListening,
    fetchCurrentStatus
  };
};
