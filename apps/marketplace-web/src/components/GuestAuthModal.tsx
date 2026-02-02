import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Loader2, CheckCircle2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type LoadingState = 'idle' | 'sending' | 'sent' | 'verifying';

interface GuestAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GuestAuthModal = ({ isOpen, onClose, onSuccess }: GuestAuthModalProps) => {
  const navigate = useNavigate();
  const { sendCustomOTP, verifyCustomOTP } = useAuth();
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const isLoading = loadingState !== 'idle' && loadingState !== 'sent';

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }
    
    setLoadingState('sending');
    try {
      await sendCustomOTP(email, 'email');
      setLoadingState('sent');
      setTimeout(() => {
        setOtpSent(true);
        setLoadingState('idle');
      }, 800);
    } catch (error: any) {
      setLoadingState('idle');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Por favor ingresa un código de 6 dígitos válido");
      return;
    }
    
    setLoadingState('verifying');
    try {
      await verifyCustomOTP(email, otpCode);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      // Error ya mostrado en AuthContext
    } finally {
      setLoadingState('idle');
    }
  };

  const handleResendOTP = async () => {
    setLoadingState('sending');
    try {
      await sendCustomOTP(email, 'email');
      setLoadingState('sent');
      toast.success('Código reenviado');
      setTimeout(() => setLoadingState('idle'), 800);
    } catch (error: any) {
      setLoadingState('idle');
    }
  };

  const handleBack = () => {
    setOtpSent(false);
    setOtpCode('');
  };

  const handleGoToFullAuth = () => {
    onClose();
    navigate('/auth');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Reset state when closing
      setOtpSent(false);
      setOtpCode('');
      setEmail('');
      setLoadingState('idle');
    }
  };

  const renderLoadingIndicator = () => {
    if (loadingState === 'idle') return null;
    
    return (
      <div className="space-y-3 py-4">
        <div className="flex items-center justify-center gap-3">
          {loadingState === 'sending' && (
            <>
              <div className="relative">
                <Send className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <span className="text-sm text-muted-foreground">Enviando código...</span>
            </>
          )}
          {loadingState === 'sent' && (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600">Código enviado</span>
            </>
          )}
          {loadingState === 'verifying' && (
            <>
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Verificando...</span>
            </>
          )}
        </div>
        {loadingState === 'sending' && (
          <Progress value={66} className="h-1 w-full" />
        )}
        {loadingState === 'sent' && (
          <Progress value={100} className="h-1 w-full" />
        )}
        {loadingState === 'verifying' && (
          <Progress value={80} className="h-1 w-full animate-pulse" />
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md border-border/50">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl">
            {otpSent ? 'Ingresa el código' : 'Continuar como invitado'}
          </DialogTitle>
          <DialogDescription>
            {otpSent 
              ? `Enviamos un código de 6 dígitos a ${email}` 
              : 'Verifica tu email para continuar sin crear cuenta'}
          </DialogDescription>
        </DialogHeader>

        {loadingState !== 'idle' ? (
          renderLoadingIndicator()
        ) : !otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guest-modal-email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="guest-modal-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              Enviar código
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              El código expira en 10 minutos
            </p>

            <div className="pt-2 border-t border-border/50">
              <button 
                type="button"
                onClick={handleGoToFullAuth}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-2"
              >
                Prefiero crear una cuenta →
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <button 
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Cambiar email
            </button>

            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={setOtpCode}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || otpCode.length !== 6}>
              Verificar y continuar
            </Button>
            
            <div className="text-center">
              <button 
                type="button"
                onClick={handleResendOTP}
                className="text-sm text-primary hover:underline"
                disabled={isLoading}
              >
                ¿No recibiste el código? Reenviar
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GuestAuthModal;
