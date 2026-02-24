import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MotionLogo } from '@/components/MotionLogo';
import { useIsModerator } from '@/hooks/useIsModerator';

export default function ModerationLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  const { isModerator, loading: checkingModeratorStatus } = useIsModerator();
  const { toast } = useToast();

  // Si ya está autenticado y es moderador, redirigir
  useEffect(() => {
    if (user && !checkingModeratorStatus) {
      if (isModerator) {
        navigate('/', { replace: true });
      } else {
        // Usuario autenticado pero no es moderador
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos de moderador",
          variant: "destructive",
        });
        setChecking(false);
      }
    }
  }, [user, isModerator, checkingModeratorStatus, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setChecking(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Credenciales incorrectas",
            description: "El email o la contraseña no son correctos",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error al iniciar sesión",
            description: error.message,
            variant: "destructive",
          });
        }
        setChecking(false);
        return;
      }

      // Después de login exitoso, el useEffect verificará permisos
      toast({
        title: "Autenticación exitosa",
        description: "Verificando permisos de moderador...",
      });
      setChecking(false);

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al iniciar sesión. Por favor intenta nuevamente.",
        variant: "destructive",
      });
      setChecking(false);
    }
  };

  if (authLoading || checking || checkingModeratorStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf7ec]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {checking ? 'Autenticando...' : 'Verificando permisos...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf7ec] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-[24px] shadow-lg p-8">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <MotionLogo size="md" />
          </div>

          {/* Title with Icon */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Panel de Moderación
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Ingresa con tu cuenta de moderador
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
                placeholder="moderador@telar.co"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm font-semibold">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl"
              disabled={checking}
            >
              {checking ? 'Verificando...' : 'Acceder al Panel'}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Solo personal autorizado puede acceder a este panel
          </div>
        </div>
      </div>
    </div>
  );
}
