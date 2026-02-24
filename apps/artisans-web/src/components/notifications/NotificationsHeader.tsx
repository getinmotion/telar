import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MotionLogo } from '@/components/MotionLogo';
import { ArrowLeft, LayoutDashboard, CheckCheck } from 'lucide-react';

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({ 
  unreadCount, 
  onMarkAllAsRead 
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50 shadow-sm">
      <div className="container mx-auto py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <MotionLogo size="md" />
          <div>
            <div className="bg-primary/10 px-3 py-1 rounded-full inline-block mb-1">
              <span className="text-primary font-medium text-sm">NOTIFICACIONES</span>
            </div>
            <p className="text-xs text-muted-foreground ml-1">
              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              className="hidden sm:flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          
          <Link to="/dashboard">
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Taller Digital</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
