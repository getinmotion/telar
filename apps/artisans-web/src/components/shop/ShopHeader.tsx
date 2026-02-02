import React from 'react';
import { Button } from '@/components/ui/button';
import { MotionLogo } from '@/components/MotionLogo';
import { ArrowLeft, Package, LayoutDashboard, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ShopHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showUploadButton?: boolean;
  showDashboardButton?: boolean;
  showPublicShopButton?: boolean;
  publicShopSlug?: string;
  shopPublishStatus?: string | null;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({
  title = "MI TIENDA",
  subtitle = "Gestiona tu tienda digital",
  showBackButton = true,
  showUploadButton = true,
  showDashboardButton = true,
  showPublicShopButton = false,
  publicShopSlug,
  shopPublishStatus
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50 shadow-sm">
      <div className="container mx-auto py-2 md:py-3 px-3 md:px-4 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-4">
          <MotionLogo size="md" />
          <div>
            <div className="bg-primary/10 px-2 md:px-3 py-1 rounded-full inline-block">
              <span className="text-primary font-medium text-xs md:text-sm">{title}</span>
            </div>
            {/* Subtitle hidden on mobile */}
            {subtitle && (
              <p className="hidden md:block text-xs text-muted-foreground ml-1 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          {showPublicShopButton && publicShopSlug && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = shopPublishStatus === 'published'
                  ? `/tienda/${publicShopSlug}`
                  : `/tienda/${publicShopSlug}?preview=true`;
                window.open(url, '_blank');
              }}
              className="flex items-center gap-2 h-8 w-8 md:h-9 md:w-auto p-0 md:px-3"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden md:inline">
                {shopPublishStatus === 'published' ? 'Ver Tienda' : 'Preview'}
              </span>
            </Button>
          )}
          
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 h-8 w-8 md:h-9 md:w-auto p-0 md:px-3"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">Volver</span>
            </Button>
          )}
          
          {showUploadButton && (
            <Link to="/productos/subir">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-8 w-8 md:h-9 md:w-auto p-0 md:px-3"
              >
                <Package className="h-4 w-4" />
                <span className="hidden md:inline">Cargar Producto</span>
              </Button>
            </Link>
          )}
          
          {showDashboardButton && (
            <Link to="/dashboard">
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-2 h-8 w-8 md:h-9 md:w-auto p-0 md:px-3"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:inline">Taller Digital</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};