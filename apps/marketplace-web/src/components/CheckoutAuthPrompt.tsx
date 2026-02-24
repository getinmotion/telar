import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, UserPlus, UserCheck } from 'lucide-react';
import GuestAuthModal from './GuestAuthModal';

export const CheckoutAuthPrompt = () => {
  const navigate = useNavigate();
  const [showGuestModal, setShowGuestModal] = useState(false);

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>¿Cómo deseas continuar?</CardTitle>
          <CardDescription>
            Elige una opción para proceder con tu compra
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Guest - Primary option */}
          <Button 
            className="w-full h-14 text-base justify-start gap-3" 
            onClick={() => setShowGuestModal(true)}
          >
            <UserCheck className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Continuar como invitado</div>
              <div className="text-xs opacity-80">Solo verifica tu email</div>
            </div>
          </Button>

          {/* Login */}
          <Button 
            variant="outline"
            className="w-full h-12 justify-start gap-3" 
            onClick={() => navigate('/auth')}
          >
            <User className="h-5 w-5" />
            <span>Iniciar sesión</span>
          </Button>

          {/* Register */}
          <Button 
            variant="ghost"
            className="w-full h-12 justify-start gap-3 text-muted-foreground" 
            onClick={() => navigate('/auth')}
          >
            <UserPlus className="h-5 w-5" />
            <span>Crear cuenta nueva</span>
          </Button>
        </CardContent>
      </Card>

      {/* Guest Auth Modal */}
      <GuestAuthModal 
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onSuccess={() => navigate('/confirm-purchase')}
      />
    </>
  );
};
