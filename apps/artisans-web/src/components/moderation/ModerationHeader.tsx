import React from 'react';
import { Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { MotionLogo } from '@/components/MotionLogo';

export const ModerationHeader: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has salido del panel de moderación",
      });
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-4">
            <MotionLogo size="sm" />
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-border">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Panel de Moderación
              </span>
            </div>
          </div>

          {/* User Info + Logout */}
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden md:inline-block text-sm text-muted-foreground">
                {user.email}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
