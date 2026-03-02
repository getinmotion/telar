import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import telarLogo from "@/assets/telar-vertical.svg";
import { NavLink } from "@/components/NavLink";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

const Auth = () => {
  const navigate = useNavigate();
  const { user, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(resetEmail);
      toast.success("Revisa tu email para restablecer tu contraseña");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message || "Error al enviar el correo de recuperación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <Card className={`w-full ${isRegistering ? 'max-w-2xl' : 'max-w-md'} transition-all duration-300`}>
        <CardHeader className="space-y-4 text-center pb-6">
          <NavLink to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto">
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </NavLink>

          <div className="flex justify-center">
            <img src={telarLogo} alt="Telar" className="h-12" />
          </div>

          <div>
            <CardTitle className="text-2xl">
              {showForgotPassword
                ? "Recuperar contraseña"
                : isRegistering
                ? "Crear cuenta"
                : "Iniciar sesión"}
            </CardTitle>
            <CardDescription className="mt-2">
              {showForgotPassword
                ? "Ingresa tu email para recuperar tu contraseña"
                : isRegistering
                ? "Únete a nuestra comunidad de artesanos y compradores"
                : "Bienvenido de vuelta al marketplace de artesanías"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {showForgotPassword ? (
            // Formulario de recuperación de contraseña
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Correo electrónico</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <Button type="submit" className="w-full h-10" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar correo de recuperación
              </Button>

              <Button
                type="button"
                variant="link"
                onClick={() => setShowForgotPassword(false)}
                className="w-full"
              >
                Volver al inicio de sesión
              </Button>
            </form>
          ) : isRegistering ? (
            // Formulario de registro (componente separado)
            <RegisterForm onToggleForm={() => setIsRegistering(false)} />
          ) : (
            // Formulario de login (componente separado)
            <LoginForm
              onToggleForm={() => setIsRegistering(true)}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
          )}

          <Separator />

          {/* Enlace a artesanos */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              ¿Eres artesano y quieres vender tus productos?{" "}
              <a
                href="https://app.telar.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Regístrate aquí
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
