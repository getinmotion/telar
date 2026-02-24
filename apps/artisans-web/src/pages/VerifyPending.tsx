import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MotionLogo } from '@/components/MotionLogo';
import { Mail, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const VerifyPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { email, firstName } = location.state || {};
  
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      const { data, error } = await supabase.functions.invoke('resend-verification', {
        body: { email }
      });

      if (error) throw error;

      if (data.error) {
        if (data.code === 'ALREADY_VERIFIED') {
          toast({
            title: 'Cuenta ya verificada',
            description: 'Tu cuenta ya está verificada. Puedes iniciar sesión.',
          });
          navigate('/login');
          return;
        }
        
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Correo reenviado',
        description: 'Revisa tu bandeja de entrada',
      });
      setCountdown(60);

    } catch (error) {
      console.error('Resend error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo reenviar el correo. Intenta más tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <MotionLogo variant="dark" size="lg" className="mx-auto mb-4" />
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              ¡Revisa tu correo!
            </h1>
            <p className="text-muted-foreground text-sm">
              {firstName ? `¡Hola ${firstName}! ` : ''}
              Te enviamos un correo de verificación a:
            </p>
            <p className="font-semibold mt-2">{email}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium">Abre tu correo</p>
                  <p className="text-sm text-muted-foreground">
                    Revisa tu bandeja de entrada y busca el correo de TELAR
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium">Haz clic en el enlace</p>
                  <p className="text-sm text-muted-foreground">
                    Confirma tu cuenta haciendo clic en el botón del correo
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium">Completa tu perfil</p>
                  <p className="text-sm text-muted-foreground">
                    Serás redirigido automáticamente al onboarding
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>El enlace expira en 24 horas</span>
              </div>

              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isResending || countdown > 0}
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
                {countdown > 0 
                  ? `Reenviar en ${countdown}s` 
                  : isResending 
                    ? 'Reenviando...' 
                    : 'Reenviar correo'}
              </Button>

              <p className="text-xs text-muted-foreground">
                ¿No encuentras el correo? Revisa tu carpeta de spam
              </p>
            </div>

            <div className="text-center pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
              >
                Volver al inicio de sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyPending;
