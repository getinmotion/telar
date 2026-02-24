import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MotionLogo } from '@/components/MotionLogo';
import { LoginOnboardingSlider } from '@/components/auth/LoginOnboardingSlider';
import { usePerformanceMetrics, measurePageLoad } from '@/hooks/usePerformanceMetrics';
import { login as loginAction } from './actions/login.actions';
import { useAuthStore } from '@/stores/authStore';

const pageMetrics = measurePageLoad('Login');

/**
 * Obtener la ruta de redirección usando el store de Zustand
 * Ya no necesita hacer consultas a Supabase porque toda la info viene del backend
 */
const getUserRedirectPath = (): string => {
  // Obtener la ruta calculada desde el store
  return useAuthStore.getState().getRedirectPath();
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const perf = usePerformanceMetrics('Login');

  // ✅ Ref para evitar múltiples redirecciones
  const hasAttemptedRedirect = useRef(false);

  // ✅ Usar el store de Zustand en lugar de estado local
  const { isAuthenticated, user } = useAuthStore();

  // Mark page as ready on mount
  useEffect(() => {
    pageMetrics.markReady();
  }, []);

  // ✅ Redirigir si ya hay sesión activa (solo una vez)
  useEffect(() => {
    if (isAuthenticated && user && !hasAttemptedRedirect.current) {
      hasAttemptedRedirect.current = true;

      // Pequeño delay para asegurar que el estado se estabilice
      const timer = setTimeout(() => {
        const redirectPath = getUserRedirectPath();
        navigate(redirectPath, { replace: true });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    perf.startMetric('login_total');
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      perf.endMetric('login_total');
      setIsLoading(false);
      return;
    }

    try {
      perf.startMetric('nestjs_login');

      // ✅ Llamar al backend NestJS para login
      // La función loginAction ya guarda toda la info en el store de Zustand
      await loginAction({
        email: email.trim().toLowerCase(),
        password
      });

      perf.endMetric('nestjs_login');

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });

      // ✅ Calcular y redirigir inmediatamente después de que se actualice el store
      perf.startMetric('redirect_path_calculation');
      const redirectPath = getUserRedirectPath();
      perf.endMetric('redirect_path_calculation');

      perf.endMetric('login_total');
      perf.logReport();

      // Resetear loading antes de navegar
      setIsLoading(false);

      // Redirigir
      navigate(redirectPath, { replace: true });

    } catch (error: any) {
      perf.endMetric('login_total');
      perf.logReport();
      setIsLoading(false);

      // Manejar errores específicos del backend NestJS
      const errorResponse = error?.response?.data;

      if (errorResponse?.statusCode === 401) {
        const errorMessage = errorResponse?.message?.message || errorResponse?.message;

        if (typeof errorMessage === 'string' && errorMessage.includes('Credenciales inválidas')) {
          toast({
            title: "Credenciales incorrectas",
            description: "El email o la contraseña no son correctos",
            variant: "destructive",
          });
        } else if (typeof errorMessage === 'string' && errorMessage.includes('no verificado')) {
          toast({
            title: "Email no verificado",
            description: "Por favor verifica tu email antes de iniciar sesión",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error al iniciar sesión",
            description: "Credenciales inválidas",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error inesperado",
          description: "Ocurrió un error al iniciar sesión. Por favor intenta nuevamente.",
          variant: "destructive",
        });
      }
    }
  };

  // Mostrar loading solo durante el proceso de login
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Iniciando sesión...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, mostrar loading mientras redirige
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6 lg:p-8">
      <div className="min-h-[calc(100vh-32px)] md:min-h-[calc(100vh-48px)] lg:h-[calc(100vh-64px)] bg-white rounded-[24px] flex flex-col lg:flex-row overflow-hidden lg:overflow-visible">
        {/* Left Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center overflow-y-auto lg:overflow-y-visible lg:max-h-[calc(100vh-64px)]">
          <div className="w-full max-w-md px-8 py-8 lg:py-0">
            {/* Logo */}
            <div className="2xl:mb-16 mb-6 2xl:mt-0 flex justify-start">
              <MotionLogo size="md" />
            </div>

            {/* Title */}
            <div className="mb-9 text-left">
              <h1 className="2xl:text-[46px] text-4xl font-bold text-foreground leading-tight text-left">
                Hola,
              </h1>
              <h1 className="2xl:text-[46px] text-4xl font-bold text-foreground leading-tight text-left">
                Bienvenido
              </h1>
              <p className="text-[15px] text-muted-foreground mt-3 text-left">
                Hey, bienvenido a tu espacio especial
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="2xl:space-y-6 space-y-2">
              {/* Email Field */}
              <div className="space-y-2 text-left">
                <Label htmlFor="email" className="text-foreground text-sm font-semibold text-left block">
                  Correo
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[52px] rounded-[12px] border-border px-[18px] text-foreground placeholder:text-muted-foreground"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2 text-left">
                <Label htmlFor="password" className="text-foreground text-sm font-semibold text-left block">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-[52px] rounded-[12px] border-border px-[18px] pr-12 text-foreground placeholder:text-muted-foreground"
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
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-[13px] text-accent hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-start pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-[180px] h-12 rounded-[12px] bg-accent hover:bg-accent/90 text-white text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </div>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-left">
              <span className="text-muted-foreground text-sm">
                ¿No tienes cuenta?{' '}
              </span>
              <Link
                to="/register"
                className="text-accent text-sm font-semibold hover:underline"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>

        {/* Right Panel - Onboarding Slider */}
        <div className="hidden lg:flex lg:w-1/2 p-3">
          <LoginOnboardingSlider />
        </div>
      </div>
    </div>
  );
}
