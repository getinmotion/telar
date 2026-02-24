import React from 'react';
import { Button } from '@/components/ui/button';
import { MotionLogo } from '@/components/MotionLogo';
import { ArrowLeft, Store, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ProductUploadHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50 shadow-sm">
      <div className="container mx-auto py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <MotionLogo size="md" />
          <div className="bg-primary/10 px-3 py-1 rounded-full">
            <span className="text-primary font-medium text-sm">Publicar Productos</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          
          <Link to="/mi-tienda">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Store className="h-4 w-4" />
              Mi Tienda
            </Button>
          </Link>
          
          <Link to="/dashboard">
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Taller Digital
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};