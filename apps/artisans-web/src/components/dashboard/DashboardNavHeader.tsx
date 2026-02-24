import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Target, Store, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MotionLogo } from '@/components/MotionLogo';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { useIsModerator } from '@/hooks/useIsModerator';
import { supabase } from '@/integrations/supabase/client';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export const DashboardNavHeader: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { masterState } = useMasterAgent();
  const { isModerator } = useIsModerator();
  const [pendingCount, setPendingCount] = useState<number>(0);
  
  const hasShop = masterState.tienda.has_shop;

  // Fetch pending moderation count if user is moderator
  useEffect(() => {
    if (!isModerator) return;

    const fetchPendingCount = async () => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('moderation_status', 'pending_moderation');
      
      setPendingCount(count || 0);
    };

    fetchPendingCount();

    // Subscribe to changes
    const subscription = supabase
      .channel('moderation_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: 'moderation_status=eq.pending_moderation',
        },
        () => {
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isModerator]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <MotionLogo size="md" />
        </div>
        
        {/* Center: Navigation */}
        <nav className="flex items-center gap-2" aria-label="Navegación del taller digital">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10"
            aria-label="Ir a mi perfil"
          >
            <User className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Perfil</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/tasks')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10"
            aria-label="Ver mis tareas"
          >
            <Target className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Tareas</span>
          </Button>

          {isModerator && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/moderacion')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10 relative"
              aria-label="Panel de moderación"
            >
              <Shield className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Moderación</span>
              {pendingCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center text-[10px] px-1"
                >
                  {pendingCount}
                </Badge>
              )}
            </Button>
          )}
          
          <Button
            variant={hasShop ? "ghost" : "default"}
            size="sm"
            onClick={() => hasShop ? navigate('/mi-tienda') : navigate('/dashboard/create-shop')}
            className={`
              flex items-center gap-2 relative
              ${hasShop 
                ? 'text-muted-foreground hover:text-foreground hover:bg-primary/10' 
                : 'bg-gradient-primary hover:opacity-90 text-white shadow-md animate-pulse'
              }
            `}
            aria-label={hasShop ? "Ver mi tienda" : "Crear mi tienda"}
          >
            <Store className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">
              {hasShop ? 'Mi Tienda' : 'Crear Tienda'}
            </span>
            {!hasShop && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] animate-bounce"
              >
                ¡Nuevo!
              </Badge>
            )}
          </Button>
        </nav>
        
        {/* Right: Notifications & Logout */}
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <Button 
            onClick={signOut} 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
