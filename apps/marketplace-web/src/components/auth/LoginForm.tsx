import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormProps {
  onToggleForm: () => void; // Cambiar a registro
  onForgotPassword: () => void; // Mostrar reset password
}

export function LoginForm({ onToggleForm, onForgotPassword }: LoginFormProps) {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(loginData.email, loginData.password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="login-email">Correo electrónico</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="tu@email.com"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          required
          className="h-10"
        />
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="login-password">Contraseña</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            required
            className="h-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Forgot password link */}
      <div className="text-right">
        <Button
          type="button"
          variant="link"
          onClick={onForgotPassword}
          className="p-0 h-auto text-sm"
        >
          ¿Olvidaste tu contraseña?
        </Button>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full h-10"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Iniciar sesión
      </Button>

      {/* Toggle to register */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">¿No tienes cuenta? </span>
        <Button
          type="button"
          variant="link"
          onClick={onToggleForm}
          className="p-0 h-auto"
        >
          Regístrate
        </Button>
      </div>
    </form>
  );
}
