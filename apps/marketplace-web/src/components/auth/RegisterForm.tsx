import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useColombiaLocations } from "@/hooks/useColombiaLocations";
import { SignUpData } from "@/types/auth.types";
import { toast } from "sonner";

interface RegisterFormProps {
  onToggleForm: () => void; // Cambiar a login
}

export function RegisterForm({ onToggleForm }: RegisterFormProps) {
  const { signUp } = useAuth();
  const { departments, getMunicipalities, isLoading: locationsLoading } = useColombiaLocations();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [municipalities, setMunicipalities] = useState<string[]>([]);

  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    countryCode: "+57", // Código de país (default: Colombia)
    whatsapp: "", // Número sin código de país
    department: "",
    city: "",
    acceptTerms: false,
    newsletterOptIn: false,
  });

  // Códigos de país más comunes
  const countryCodes = [
    { code: "+57", name: "Colombia", flag: "🇨🇴" },
    { code: "+1", name: "Estados Unidos/Canadá", flag: "🇺🇸" },
    { code: "+52", name: "México", flag: "🇲🇽" },
    { code: "+34", name: "España", flag: "🇪🇸" },
    { code: "+54", name: "Argentina", flag: "🇦🇷" },
    { code: "+51", name: "Perú", flag: "🇵🇪" },
    { code: "+56", name: "Chile", flag: "🇨🇱" },
    { code: "+58", name: "Venezuela", flag: "🇻🇪" },
    { code: "+593", name: "Ecuador", flag: "🇪🇨" },
    { code: "+55", name: "Brasil", flag: "🇧🇷" },
  ];

  // Manejar cambio de departamento
  const handleDepartmentChange = (department: string) => {
    setSignupData({
      ...signupData,
      department,
      city: "", // Reset city cuando cambia departamento
    });

    // Obtener municipios del departamento seleccionado
    const cities = getMunicipalities(department);
    setMunicipalities(cities);
  };

  // Validaciones
  const validateForm = (): boolean => {
    // Email válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return false;
    }

    // Contraseñas coinciden
    if (signupData.password !== signupData.passwordConfirmation) {
      toast.error("Las contraseñas no coinciden");
      return false;
    }

    // Contraseña mínima
    if (signupData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    // Teléfono válido (mínimo 7 dígitos, máximo 15)
    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(signupData.whatsapp)) {
      toast.error("Por favor ingresa un número de celular válido (7-15 dígitos)");
      return false;
    }

    // Departamento y ciudad seleccionados
    if (!signupData.department || !signupData.city) {
      toast.error("Por favor selecciona tu departamento y ciudad");
      return false;
    }

    // Términos aceptados
    if (!signupData.acceptTerms) {
      toast.error("Debes aceptar los términos y condiciones");
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Construir payload
      const payload: SignUpData = {
        firstName: signupData.firstName.trim(),
        lastName: signupData.lastName.trim(),
        email: signupData.email.trim().toLowerCase(),
        password: signupData.password,
        passwordConfirmation: signupData.passwordConfirmation,
        whatsapp: signupData.countryCode + signupData.whatsapp, // ⚠️ Concatenar código de país
        department: signupData.department,
        city: signupData.city,
        hasRUT: false,
        acceptTerms: signupData.acceptTerms,
        newsletterOptIn: signupData.newsletterOptIn,
      };

      await signUp(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {/* Nombres */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="signup-firstName">Nombre</Label>
          <Input
            id="signup-firstName"
            type="text"
            placeholder="Juan"
            value={signupData.firstName}
            onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
            required
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-lastName">Apellido</Label>
          <Input
            id="signup-lastName"
            type="text"
            placeholder="Pérez"
            value={signupData.lastName}
            onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
            required
            className="h-10"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="signup-email">Correo electrónico</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="tu@email.com"
          value={signupData.email}
          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
          required
          className="h-10"
        />
      </div>

      {/* Teléfono/WhatsApp */}
      <div className="space-y-2">
        <Label htmlFor="signup-whatsapp">Celular (WhatsApp)</Label>
        <div className="flex gap-2">
          <Select
            value={signupData.countryCode}
            onValueChange={(code) => setSignupData({ ...signupData, countryCode: code })}
          >
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.code}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            id="signup-whatsapp"
            type="tel"
            placeholder="3001234567"
            value={signupData.whatsapp}
            onChange={(e) => {
              // Solo permitir dígitos (máximo 15)
              const value = e.target.value.replace(/\D/g, "").slice(0, 15);
              setSignupData({ ...signupData, whatsapp: value });
            }}
            maxLength={15}
            required
            className="h-10 flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Número completo: {signupData.countryCode} {signupData.whatsapp || "___"}
        </p>
      </div>

      {/* Ubicación */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="signup-department">Departamento</Label>
          <Select
            value={signupData.department}
            onValueChange={handleDepartmentChange}
            disabled={locationsLoading}
          >
            <SelectTrigger id="signup-department" className="h-10">
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-city">Ciudad</Label>
          <Select
            value={signupData.city}
            onValueChange={(city) => setSignupData({ ...signupData, city })}
            disabled={!signupData.department || locationsLoading}
          >
            <SelectTrigger id="signup-city" className="h-10">
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              {municipalities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contraseñas */}
      <div className="space-y-2">
        <Label htmlFor="signup-password">Contraseña</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={signupData.password}
            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
            minLength={6}
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

      <div className="space-y-2">
        <Label htmlFor="signup-passwordConfirmation">Confirmar contraseña</Label>
        <div className="relative">
          <Input
            id="signup-passwordConfirmation"
            type={showPasswordConfirmation ? "text" : "password"}
            placeholder="••••••••"
            value={signupData.passwordConfirmation}
            onChange={(e) => setSignupData({ ...signupData, passwordConfirmation: e.target.value })}
            minLength={6}
            required
            className="h-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPasswordConfirmation ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Términos y condiciones */}
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="acceptTerms"
            checked={signupData.acceptTerms}
            onCheckedChange={(checked) =>
              setSignupData({ ...signupData, acceptTerms: checked as boolean })
            }
            required
            className="mt-1"
          />
          <Label htmlFor="acceptTerms" className="font-normal text-sm leading-relaxed">
            Acepto los{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center"
            >
              Términos y Condiciones
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
            , la{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center"
            >
              Política de Privacidad
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
            {" "}y el{" "}
            <a
              href="/data-treatment"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center"
            >
              Tratamiento de Datos Personales
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Label>
        </div>

        {/* Newsletter opcional */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="newsletterOptIn"
            checked={signupData.newsletterOptIn}
            onCheckedChange={(checked) =>
              setSignupData({ ...signupData, newsletterOptIn: checked as boolean })
            }
            className="mt-1"
          />
          <Label htmlFor="newsletterOptIn" className="font-normal text-sm leading-relaxed">
            Deseo recibir novedades y promociones de Telar
          </Label>
        </div>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full h-10"
        disabled={loading || !signupData.acceptTerms}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Crear cuenta
      </Button>

      {/* Toggle to login */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
        <Button
          type="button"
          variant="link"
          onClick={onToggleForm}
          className="p-0 h-auto"
        >
          Inicia sesión
        </Button>
      </div>
    </form>
  );
}
