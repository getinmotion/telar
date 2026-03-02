import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useIsModerator } from '@/hooks/useIsModerator';
import { MotionLogo } from '@/components/MotionLogo';
import { login } from '@/pages/auth/actions/login.actions';
import { toast } from 'sonner';

export default function ModerationLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isModerator } = useIsModerator();

  // Si ya está autenticado y es moderador al llegar a la página, redirigir directamente
  useEffect(() => {
    if (!authLoading && user && isModerator) {
      navigate('/', { replace: true });
    }
  }, [authLoading, user, isModerator, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning('Campos requeridos', {
        description: 'Por favor completa todos los campos',
      });
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, password });
      // Navegar directamente — ModeratorProtectedRoute verifica el acceso
      navigate('/', { replace: true });
    } catch {
      // toastError ya es llamado por login.actions.ts
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf7ec]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {isLoading ? 'Autenticando...' : 'Verificando permisos...'}
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
              disabled={isLoading}
            >
              {isLoading ? 'Verificando...' : 'Acceder al Panel'}
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
