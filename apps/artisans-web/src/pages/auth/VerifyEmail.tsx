import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MotionLogo } from '@/components/MotionLogo';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyEmail } from './actions/register.actions';
import { VerifyEmailSuccessResponse } from './types/register.types';

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleVerifyEmail = async () => {
      // Validar que exista el token
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación inválido');
        return;
      }

      try {
        // Llamar a la función verifyEmail del nuevo backend NestJS
        const response: VerifyEmailSuccessResponse = await verifyEmail(token);

        // Verificación exitosa
        setStatus('success');
        setMessage(response.message || '¡Tu cuenta ha sido verificada exitosamente!');

        // Redireccionar al dashboard después de 2 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);

      } catch (error: any) {
        console.error('Error al verificar email:', error);

        // Manejo de errores del backend
        const errorResponse = error?.response?.data;

        setStatus('error');

        // Mensajes de error específicos
        if (errorResponse?.message) {
          if (errorResponse.message.includes('Token inválido') ||
            errorResponse.message.includes('ya utilizado')) {
            setMessage('El enlace de verificación es inválido o ya fue utilizado.');
          } else if (errorResponse.message.includes('expirado')) {
            setMessage('El enlace de verificación ha expirado. Solicita uno nuevo.');
          } else {
            setMessage(errorResponse.message);
          }
        } else {
          setMessage('Ocurrió un error al verificar tu cuenta. Intenta nuevamente.');
        }
      }
    };

    handleVerifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <MotionLogo variant="dark" size="lg" className="mx-auto mb-4" />
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${status === 'loading' ? 'bg-muted' :
              status === 'success' ? 'bg-green-100' :
                'bg-red-100'
              }`}>
              {status === 'loading' && <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />}
              {status === 'success' && <CheckCircle2 className="w-8 h-8 text-green-600" />}
              {status === 'error' && <XCircle className="w-8 h-8 text-red-600" />}
            </div>

            <h1 className="text-2xl font-bold mb-2">
              {status === 'loading' && 'Verificando tu cuenta...'}
              {status === 'success' && '¡Cuenta verificada!'}
              {status === 'error' && 'Error de verificación'}
            </h1>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              {message}
            </p>



            {status === 'success' && (
              <div className="bg-success/10 p-4 rounded-lg text-center">
                <p className="text-sm text-success-foreground">
                  Redirigiendo al dashboard en unos segundos...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/register')}
                  className="w-full"
                >
                  Crear nueva cuenta
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Ir al inicio de sesión
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
