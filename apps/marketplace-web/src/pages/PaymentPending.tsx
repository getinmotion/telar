import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import telarLogo from "@/assets/telar-vertical.svg";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

const PaymentPending = () => {
  const navigate = useNavigate();
  const [cartId, setCartId] = useState<string | null>(null);
  const { resetCart } = useCart();
  const postPaymentTriggeredRef = useRef(false);

  // Obtener cartId de sessionStorage
  useEffect(() => {
    const storedCartId = sessionStorage.getItem('pendingPaymentCartId');
    if (storedCartId) {
      setCartId(storedCartId);
    }
  }, []);

  const { paymentStatus, startListening } = usePaymentStatus({
    cartId,
  });

  // Iniciar escucha cuando tenemos cartId
  useEffect(() => {
    if (cartId) {
      startListening();
    }
  }, [cartId, startListening]);

  // Trigger post-payment processing when payment completes
  useEffect(() => {
    const triggerPostPayment = async () => {
      console.log("[PaymentPending] useEffect triggered - paymentStatus:", paymentStatus, "cartId:", cartId, "triggered:", postPaymentTriggeredRef.current);
      
      if (paymentStatus !== 'completed' || !cartId || postPaymentTriggeredRef.current) {
        console.log("[PaymentPending] Skipping - conditions not met");
        return;
      }

      postPaymentTriggeredRef.current = true;
      console.log("[PaymentPending] Payment completed! Triggering sync-payment-status...");

      try {
        // Get cart items snapshot from sessionStorage
        let cartItemsSnapshot = null;
        const snapshotStr = sessionStorage.getItem('cartItemsSnapshot');
        if (snapshotStr) {
          try {
            cartItemsSnapshot = JSON.parse(snapshotStr);
            console.log("[PaymentPending] Cart items snapshot found:", cartItemsSnapshot?.length, "items");
          } catch (e) {
            console.error("[PaymentPending] Error parsing cart snapshot:", e);
          }
        } else {
          console.warn("[PaymentPending] No cart items snapshot found in sessionStorage");
        }

        // Get payment breakdown from sessionStorage
        let breakdown = null;
        const breakdownStr = sessionStorage.getItem('pendingPaymentBreakdown');
        if (breakdownStr) {
          try {
            breakdown = JSON.parse(breakdownStr);
            console.log("[PaymentPending] Payment breakdown found:", breakdown);
          } catch (e) {
            console.error("[PaymentPending] Error parsing breakdown:", e);
          }
        }

        const requestBody: any = {
          cart_id: cartId,
          payment_status: 'completed',
        };

        // Include cart items snapshot if available
        if (cartItemsSnapshot && cartItemsSnapshot.length > 0) {
          requestBody.cart_items = cartItemsSnapshot;
          console.log("[PaymentPending] Including cart_items in request:", cartItemsSnapshot);
        }

        // Include breakdown if available
        if (breakdown) {
          requestBody.breakdown = breakdown;
          console.log("[PaymentPending] Including breakdown in request:", breakdown);
        }

        const { data, error } = await supabase.functions.invoke('sync-payment-status', {
          body: requestBody,
        });

        // Handle 401 gracefully - the webhook from telar.ia already processed the payment
        // This frontend call is redundant backup, so don't fail the user experience
        if (error) {
          console.warn("[PaymentPending] sync-payment-status returned error (this is OK if webhook already processed):", error);
          // Don't throw - the order was likely already created by the webhook
        } else {
          console.log("[PaymentPending] sync-payment-status SUCCESS:", data);
        }

        // Clear the snapshot after use
        sessionStorage.removeItem('cartItemsSnapshot');
      } catch (err) {
        // Non-blocking error - webhook already processed, this is just cleanup
        console.warn("[PaymentPending] Exception in sync-payment-status (non-blocking):", err);
      }

      // Reset cart after processing regardless of sync result
      resetCart();
    };

    triggerPostPayment();
  }, [paymentStatus, cartId, resetCart]);

  const isProcessing = !paymentStatus || paymentStatus === 'initiated' || paymentStatus === 'processing';
  const isCompleted = paymentStatus === 'completed';
  const isFailed = paymentStatus === 'failed' || paymentStatus === 'canceled' || paymentStatus === 'returned';

  const handleGoHome = () => {
    sessionStorage.removeItem('pendingPaymentCartId');
    sessionStorage.removeItem('pendingPaymentBreakdown');
    sessionStorage.removeItem('pendingGiftCards');
    sessionStorage.removeItem('cartItemsSnapshot');
    navigate('/');
  };

  const getIcon = () => {
    if (isProcessing) {
      return (
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-primary/20 rounded-full" />
          <Clock className="absolute inset-0 m-auto w-12 h-12 text-primary animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      );
    }
    
    if (isCompleted) {
      return (
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-green-500/10 rounded-full" />
          <div className="absolute inset-2 bg-green-500/20 rounded-full" />
          <CheckCircle className="absolute inset-0 m-auto w-12 h-12 text-green-500" />
        </div>
      );
    }
    
    if (isFailed) {
      return (
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-red-500/10 rounded-full" />
          <div className="absolute inset-2 bg-red-500/20 rounded-full" />
          <XCircle className="absolute inset-0 m-auto w-12 h-12 text-red-500" />
        </div>
      );
    }

    // Estado desconocido
    return (
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 bg-muted/20 rounded-full" />
        <div className="absolute inset-2 bg-muted/30 rounded-full" />
        <HelpCircle className="absolute inset-0 m-auto w-12 h-12 text-muted-foreground" />
      </div>
    );
  };

  const getMessage = () => {
    if (isProcessing) {
      return {
        title: "Estamos confirmando tu pago",
        description: "Por favor revisa tu correo electrónico para más detalles sobre tu compra.",
        hint: "Este proceso puede tomar unos minutos. No cierres esta ventana."
      };
    }
    
    if (isCompleted) {
      return {
        title: "¡Pago confirmado!",
        description: "Tu compra ha sido procesada exitosamente. Recibirás un correo con los detalles.",
        hint: ""
      };
    }
    
    if (isFailed) {
      return {
        title: "Pago no completado",
        description: paymentStatus === 'canceled' 
          ? "El pago fue cancelado." 
          : "Hubo un problema al procesar tu pago. Por favor intenta nuevamente.",
        hint: ""
      };
    }

    return {
      title: "Estado desconocido",
      description: "No pudimos determinar el estado de tu pago.",
      hint: ""
    };
  };

  const message = getMessage();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Telar Logo */}
        <img 
          src={telarLogo} 
          alt="Telar" 
          className="h-16 mx-auto"
        />
        
        {/* Status Icon */}
        {getIcon()}
        
        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            {message.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {message.description}
          </p>
        </div>
        
        {/* Additional info */}
        {message.hint && (
          <p className="text-sm text-muted-foreground/70">
            {message.hint}
          </p>
        )}

        {/* Botón volver - solo aparece si no está en estado de procesamiento */}
        {!isProcessing && (
          <Button 
            onClick={handleGoHome} 
            variant="outline" 
            size="lg"
            className="mt-4"
          >
            Volver al inicio
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaymentPending;
