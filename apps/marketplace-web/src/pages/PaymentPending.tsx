import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import telarLogo from "@/assets/telar-vertical.svg";
import { usePaymentStatus, PaymentStatus } from "@/hooks/usePaymentStatus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PaymentPending = () => {
  const navigate = useNavigate();
  const [cartId, setCartId] = useState<string | null>(null);
  const [giftCardsProcessed, setGiftCardsProcessed] = useState(false);

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

  // Procesar gift cards cuando el pago se complete
  useEffect(() => {
    const processGiftCards = async () => {
      if (paymentStatus === 'completed' && !giftCardsProcessed) {
        const pendingGiftCardsStr = sessionStorage.getItem('pendingGiftCards');
        if (pendingGiftCardsStr) {
          try {
            const giftCardsData = JSON.parse(pendingGiftCardsStr);
            
            // Llamar al edge function para generar las gift cards
            const { data, error } = await supabase.functions.invoke('generate-gift-cards', {
              body: {
                order_id: cartId,
                purchaser_email: giftCardsData.purchaser_email,
                items: giftCardsData.items
              }
            });

            if (error) {
              console.error('Error generating gift cards:', error);
              toast.error('Error al generar las Gift Cards');
            } else if (data?.success) {
              toast.success(`${data.codes_generated} Gift Card(s) generada(s) y enviada(s) por correo`);
            }

            // Limpiar sessionStorage
            sessionStorage.removeItem('pendingGiftCards');
            setGiftCardsProcessed(true);
          } catch (e) {
            console.error('Error processing gift cards:', e);
          }
        }
      }
    };

    processGiftCards();
  }, [paymentStatus, cartId, giftCardsProcessed]);

  const isProcessing = !paymentStatus || paymentStatus === 'initiated' || paymentStatus === 'processing';
  const isCompleted = paymentStatus === 'completed';
  const isFailed = paymentStatus === 'failed' || paymentStatus === 'canceled' || paymentStatus === 'returned';

  const handleGoHome = () => {
    sessionStorage.removeItem('pendingPaymentCartId');
    sessionStorage.removeItem('pendingGiftCards');
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
