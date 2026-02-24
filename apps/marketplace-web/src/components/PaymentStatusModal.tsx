import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentStatus } from "@/hooks/usePaymentStatus";
import { cn } from "@/lib/utils";

interface PaymentStatusModalProps {
  isOpen: boolean;
  status: PaymentStatus;
  onClose?: () => void;
  onSuccess?: () => void;
}

const statusConfig: Record<string, {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  showClose: boolean;
}> = {
  initiated: {
    icon: <Loader2 className="h-16 w-16 animate-spin" />,
    title: "Iniciando pago",
    description: "Conectando con el procesador de pagos...",
    color: "text-primary",
    showClose: false
  },
  processing: {
    icon: <Loader2 className="h-16 w-16 animate-spin" />,
    title: "Procesando pago",
    description: "Por favor espera mientras confirmamos tu pago. No cierres esta ventana.",
    color: "text-primary",
    showClose: false
  },
  completed: {
    icon: <CheckCircle2 className="h-16 w-16" />,
    title: "¡Pago exitoso!",
    description: "Tu compra ha sido procesada correctamente. Recibirás un correo de confirmación.",
    color: "text-green-500",
    showClose: true
  },
  canceled: {
    icon: <XCircle className="h-16 w-16" />,
    title: "Pago cancelado",
    description: "El pago fue cancelado. Puedes intentar nuevamente cuando lo desees.",
    color: "text-orange-500",
    showClose: true
  },
  failed: {
    icon: <XCircle className="h-16 w-16" />,
    title: "Pago fallido",
    description: "Hubo un problema al procesar tu pago. Por favor intenta con otro método de pago.",
    color: "text-destructive",
    showClose: true
  },
  returned: {
    icon: <AlertCircle className="h-16 w-16" />,
    title: "Pago devuelto",
    description: "El pago ha sido devuelto. Contacta a soporte si necesitas ayuda.",
    color: "text-orange-500",
    showClose: true
  }
};

export const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  isOpen,
  status,
  onClose,
  onSuccess
}) => {
  const config = status ? statusConfig[status] : statusConfig.initiated;
  const isSuccess = status === 'completed';
  const isFinal = ['completed', 'canceled', 'failed', 'returned'].includes(status || '');

  const handleAction = () => {
    if (isSuccess) {
      onSuccess?.();
    } else {
      onClose?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md text-center p-8"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Animated background circle */}
          <div className={cn(
            "relative flex items-center justify-center",
            !isFinal && "animate-pulse"
          )}>
            <div className={cn(
              "absolute w-24 h-24 rounded-full opacity-20",
              config.color.replace('text-', 'bg-')
            )} />
            <div className={config.color}>
              {config.icon}
            </div>
          </div>

          {/* Status text */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{config.title}</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              {config.description}
            </p>
          </div>

          {/* Progress indicator for non-final states */}
          {!isFinal && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Estado actual</span>
                <span className="capitalize">{status || 'Esperando...'}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full bg-primary rounded-full transition-all duration-500",
                    status === 'initiated' && "w-1/3",
                    status === 'processing' && "w-2/3 animate-pulse"
                  )}
                />
              </div>
            </div>
          )}

          {/* Action button for final states */}
          {config.showClose && (
            <Button 
              onClick={handleAction}
              className="w-full mt-2"
              variant={isSuccess ? "default" : "outline"}
            >
              {isSuccess ? "Ver mis pedidos" : "Volver al carrito"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
