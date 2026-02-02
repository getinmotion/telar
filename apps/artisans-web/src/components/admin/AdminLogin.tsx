import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { Eye, EyeOff } from 'lucide-react';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const { recordFailedAttempt, recordSuccessfulLogin, checkRateLimit } = useSecurityMonitoring();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check server-side rate limiting before attempting login
    const rateLimitResult = await checkRateLimit(email);
    if (rateLimitResult.isRateLimited) {
      toast({
        title: 'Demasiados intentos',
        description: rateLimitResult.message || 'Has superado el límite de intentos. Espera antes de volver a intentar.',
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        // Record failed attempt for security monitoring
        await recordFailedAttempt(email);
        
        toast({
          title: 'Error de autenticación',
          description: error.message || 'Credenciales incorrectas',
          variant: "destructive",
        });
      } else {
        // Record successful login
        await recordSuccessfulLogin(email);
        
        toast({
          title: 'Acceso concedido',
          description: 'Bienvenido al panel de administración',
        });
      }
    } catch (error) {
      // Record failed attempt on exception
      await recordFailedAttempt(email);
      
      toast({
        title: 'Error',
        description: 'Error al intentar iniciar sesión',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="bg-card/40 border-border">
      <CardHeader>
        <CardTitle className="text-center text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
          Panel de Administración
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Ingresa tus credenciales de administrador
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu-email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-border placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa la contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 border-border placeholder:text-muted-foreground pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/80 hover:to-primary/80"
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Acceder'}
          </Button>
          <Button
            type="button"
            variant="link"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
