import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, checkAuthorization } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as any)?.from?.pathname ?? '/admin';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: 'Error de autenticación',
          description: 'Credenciales incorrectas o acceso denegado',
          variant: "destructive",
        });
      } else {
        const authorized = await checkAuthorization();
        if (authorized) {
          toast({
            title: 'Acceso administrativo concedido',
            description: 'Bienvenido al panel de administración',
          });
          navigate(fromPath, { replace: true });
        } else {
          toast({
            title: 'Acceso denegado',
            description: 'Tu usuario no tiene permisos de administrador',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
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
    <div className="min-h-screen bg-[#fbf7ed] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-border shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
            Acceso Administrativo
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Ingresa tus credenciales de administrador
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email Administrativo</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@telar.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50 border-border placeholder:text-muted-foreground"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background/50 border-border placeholder:text-muted-foreground pr-10"
                    autoComplete="current-password"
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
              {isLoading ? 'Verificando acceso...' : 'Ingresar al Panel'}
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={() => navigate('/forgot-password')}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
