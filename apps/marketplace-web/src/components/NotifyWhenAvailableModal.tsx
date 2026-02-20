import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Bell, CheckCircle, Mail } from "lucide-react";

interface NotifyWhenAvailableModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export const NotifyWhenAvailableModal = ({
  isOpen,
  onClose,
  productId,
  productName,
}: NotifyWhenAvailableModalProps) => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailToUse = user?.email || email;
    
    if (!emailToUse) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('product_waitlist')
        .insert({
          product_id: productId,
          user_id: user?.id || null,
          email: emailToUse,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.info("Ya estás registrado para recibir notificaciones de este producto");
          setIsSuccess(true);
        } else {
          throw error;
        }
      } else {
        toast.success("¡Te avisaremos cuando esté disponible!");
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      toast.error("Error al registrarte. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setEmail("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center">¡Listo!</DialogTitle>
              <DialogDescription className="text-center">
                Te enviaremos un correo cuando "{productName}" esté disponible para comprar.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} className="w-full">
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-center">
                Avísame cuando esté disponible
              </DialogTitle>
              <DialogDescription className="text-center">
                Te notificaremos por correo electrónico cuando "{productName}" esté listo para la venta.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {user ? (
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>Te notificaremos a:</span>
                  </div>
                  <p className="font-medium">{user.email}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Notificarme"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Solo te enviaremos un correo cuando el producto esté disponible.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};