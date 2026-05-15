/**
 * BackofficeLoginPage
 *
 * Login unificado para el backoffice de Telar.
 * Reemplaza AdminLoginPage y ModerationLogin.
 *
 * - Usa la misma acción login() del backend NestJS
 * - Verifica que el usuario tenga rol de backoffice (admin/moderator/super_admin)
 * - Redirige a la sección correcta según el rol
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { login } from '@/pages/auth/actions/login.actions';
import { useBackofficeAccess } from '@/hooks/useBackofficeAccess';
import { useAuthStore } from '@/stores/authStore';

export const BackofficeLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Destino al que volver después del login
  const from = (location.state as any)?.from?.pathname ?? null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email: email.trim().toLowerCase(), password });

      // Leer acceso después del login (el store ya fue hidratado por login())
      const { user, isAuthenticated } = useAuthStore.getState();
      const jwtRoles: string[] = (user as any)?.roles ?? [];
      const isSuperAdmin = user?.isSuperAdmin === true;
      const hasBackofficeRole =
        isSuperAdmin ||
        jwtRoles.includes('admin') ||
        jwtRoles.includes('moderator');

      if (!hasBackofficeRole) {
        // Usuario sin rol de backoffice
        useAuthStore.getState().clearAuth();
        toast({
          title: 'Acceso denegado',
          description: 'Tu usuario no tiene permisos de administrador o moderador.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Bienvenido al backoffice',
        description: 'Sesión iniciada correctamente.',
      });

      // Redirigir según el rol o al destino guardado
      if (from && from !== '/backoffice/login') {
        navigate(from, { replace: true });
      } else if (isSuperAdmin || jwtRoles.includes('admin')) {
        navigate('/backoffice/dashboard', { replace: true });
      } else {
        navigate('/backoffice/moderacion', { replace: true });
      }
    } catch (error: any) {
      toast({
        title: 'Error de autenticación',
        description:
          error?.response?.data?.message ?? 'Credenciales incorrectas o acceso denegado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf7ed] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-border shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
            Backoffice Telar
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Ingresa tus credenciales de administrador o moderador
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@telar.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Verificando...' : 'Acceder al backoffice'}
            </Button>
            <a
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground text-center transition-colors"
            >
              ← Volver al portal
            </a>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default BackofficeLoginPage;
