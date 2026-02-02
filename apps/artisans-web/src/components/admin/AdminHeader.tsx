
import React from 'react';
import { Button } from '@/components/ui/button';
import { MotionLogo } from '@/components/MotionLogo';
import { LogOut, Database, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminHeaderProps {
  onLogout: () => void;
  isAuthenticated: boolean;
}

export const AdminHeader = ({ onLogout, isAuthenticated }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-border shadow-md">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <MotionLogo variant="light" />
          <div className="bg-accent/20 px-3 py-1 rounded-full flex items-center gap-1">
            <Database size={16} />
            <span className="text-accent font-medium text-sm">Admin Panel</span>
          </div>
        </div>
        
        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <Link to="/admin/design-system" aria-label="Abrir Editor de Design System">
              <Button variant="outline" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Editor DS
              </Button>
            </Link>
            <Button 
              variant="ghost"
              onClick={onLogout}
              className="text-muted-foreground hover:text-foreground hover:bg-accent/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
