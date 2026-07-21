import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface OtpLoginFormProps {
  onToggleForm: () => void;
}

export function OtpLoginForm({ onToggleForm }: OtpLoginFormProps) {
  const { sendCustomOTP, verifyCustomOTP } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await sendCustomOTP(email.trim().toLowerCase());
      setOtpSent(true);
    } catch (error: any) {
      // toast ya manejado por el servicio
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      await verifyCustomOTP(email.trim().toLowerCase(), code.trim());
    } catch (error: any) {
      // toast ya manejado por el servicio
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await sendCustomOTP(email.trim().toLowerCase());
      toast.success("Código reenviado");
    } catch (error: any) {
      // toast ya manejado por el servicio
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setOtpSent(false);
    setCode("");
  };

  if (!otpSent) {
    // Fase 1: Ingreso de email
    return (
      <form onSubmit={handleSendOtp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp-email">Correo electrónico</Label>
          <Input
            id="otp-email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10"
          />
        </div>

        <Button type="submit" className="w-full h-10" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enviar código
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">¿Prefieres usar contraseña? </span>
          <Button
            type="button"
            variant="link"
            onClick={onToggleForm}
            className="p-0 h-auto"
          >
            Ingresar con contraseña
          </Button>
        </div>
      </form>
    );
  }

  // Fase 2: Ingreso de código OTP
  return (
    <form onSubmit={handleVerifyOtp} className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Enviamos un código de 6 dígitos a
        </p>
        <p className="text-sm font-medium">{email}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp-code">Código de verificación</Label>
        <Input
          id="otp-code"
          type="text"
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
          value={code}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
            setCode(value);
          }}
          required
          className="h-10 text-center text-lg tracking-widest"
        />
      </div>

      <Button type="submit" className="w-full h-10" disabled={loading || code.length < 6}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Verificar código
      </Button>

      <div className="flex items-center justify-between text-sm">
        <Button
          type="button"
          variant="link"
          onClick={handleChangeEmail}
          className="p-0 h-auto text-sm"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Cambiar email
        </Button>
        <Button
          type="button"
          variant="link"
          onClick={handleResendCode}
          disabled={loading}
          className="p-0 h-auto text-sm"
        >
          Reenviar código
        </Button>
      </div>
    </form>
  );
}
