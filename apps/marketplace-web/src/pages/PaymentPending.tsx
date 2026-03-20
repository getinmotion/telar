import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import telarLogo from "@/assets/telar-vertical.svg";
import { useCart } from "@/contexts/CartContext";
import { getCheckoutById, type CheckoutStatus } from "@/services/checkouts.actions";

const PaymentPending = () => {
  const navigate = useNavigate();
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<CheckoutStatus | null>(null);
  const { resetCart } = useCart();
  const postPaymentTriggeredRef = useRef(false);
  const pollingIntervalRef = useRef<number | null>(null);

  // Obtener checkoutId de sessionStorage
  useEffect(() => {
    const storedCheckoutId = sessionStorage.getItem('pendingCheckoutId');
    if (storedCheckoutId) {
      setCheckoutId(storedCheckoutId);
    }
  }, []);

  // Polling del estado del checkout
  useEffect(() => {
    if (!checkoutId) return;

    const pollCheckoutStatus = async () => {
      try {
        const checkout = await getCheckoutById(checkoutId);
        console.log('[PaymentPending] Checkout status:', checkout.status);
        setPaymentStatus(checkout.status);
      } catch (error) {
        console.error('[PaymentPending] Error polling checkout status:', error);
      }
    };

    // Poll immediately
    pollCheckoutStatus();

    // Then poll every 3 seconds
    pollingIntervalRef.current = setInterval(pollCheckoutStatus, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [checkoutId]);

  // Trigger post-payment processing when payment completes
  useEffect(() => {
    const triggerPostPayment = async () => {
      console.log("[PaymentPending] useEffect triggered - paymentStatus:", paymentStatus, "triggered:", postPaymentTriggeredRef.current);

      if (paymentStatus !== 'paid' || postPaymentTriggeredRef.current) {
        console.log("[PaymentPending] Skipping - conditions not met");
        return;
      }

      postPaymentTriggeredRef.current = true;
      console.log("[PaymentPending] Payment completed! Cleaning up...");

      try {
        // Clear stored data
        sessionStorage.removeItem('cartItemsSnapshot');
        sessionStorage.removeItem('pendingPaymentCartId');
        sessionStorage.removeItem('pendingPaymentBreakdown');
        sessionStorage.removeItem('pendingCheckoutId');

        // Reset cart
        resetCart();

        console.log("[PaymentPending] Cleanup complete");
      } catch (err) {
        console.warn("[PaymentPending] Error during cleanup:", err);
      }
    };

    triggerPostPayment();
  }, [paymentStatus, resetCart]);

  const isProcessing = !paymentStatus || paymentStatus === 'created' || paymentStatus === 'awaiting_payment';
  const isCompleted = paymentStatus === 'paid';
  const isFailed = paymentStatus === 'failed' || paymentStatus === 'canceled';

  const handleGoHome = () => {
    sessionStorage.removeItem('pendingPaymentCartId');
    sessionStorage.removeItem('pendingPaymentBreakdown');
    sessionStorage.removeItem('pendingGiftCards');
    sessionStorage.removeItem('cartItemsSnapshot');
    sessionStorage.removeItem('pendingCheckoutId');
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
