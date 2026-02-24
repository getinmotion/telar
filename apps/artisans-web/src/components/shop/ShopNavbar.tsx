import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useShopTheme } from '@/contexts/ShopThemeContext';
import { Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartSidebar } from '@/components/cart/CartSidebar';

interface ShopNavbarProps {
  shopName: string;
  cartItemCount?: number;
  logoUrl?: string;
  shopSlug?: string;
  artisanProfileCompleted?: boolean;
}

export const ShopNavbar: React.FC<ShopNavbarProps> = ({ 
  shopName, 
  cartItemCount = 0,
  logoUrl,
  shopSlug,
  artisanProfileCompleted = false
}) => {
  const { getPrimaryColor, getNeutralColor } = useShopTheme();
  const location = useLocation();
  
  // Preserve preview parameter in navigation
  const urlParams = new URLSearchParams(location.search);
  const previewParam = urlParams.get('preview') === 'true' ? '?preview=true' : '';

  return (
    <nav 
      className="border-b sticky top-0 z-50"
      style={{ 
        backgroundColor: getNeutralColor(50),
        borderColor: getNeutralColor(200)
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center gap-3">
            {logoUrl && (
              <img src={logoUrl} alt={shopName} className="h-10 w-10 object-contain" />
            )}
            <h1 
              className="text-2xl font-bold tracking-tight"
              style={{ color: getNeutralColor(900) }}
            >
              {shopName}
            </h1>
          </div>

          {/* Navigation Links */}
          {shopSlug && (
            <nav className="hidden md:flex items-center gap-6 ml-8">
              <Link 
                to={`/tienda/${shopSlug}${previewParam}`}
                className="transition-colors"
                style={{ 
                  color: getNeutralColor(700),
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = getPrimaryColor(600)}
                onMouseLeave={(e) => e.currentTarget.style.color = getNeutralColor(700)}
              >
                Inicio
              </Link>
              {artisanProfileCompleted && (
                <Link 
                  to={`/tienda/${shopSlug}/perfil-artesanal${previewParam}`}
                  className="transition-colors"
                  style={{ 
                    color: getNeutralColor(700),
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = getPrimaryColor(600)}
                  onMouseLeave={(e) => e.currentTarget.style.color = getNeutralColor(700)}
                >
                  Perfil Artesanal
                </Link>
              )}
              <Link 
                to={`/tienda/${shopSlug}/contacto${previewParam}`}
                className="transition-colors"
                style={{ 
                  color: getNeutralColor(700),
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = getPrimaryColor(600)}
                onMouseLeave={(e) => e.currentTarget.style.color = getNeutralColor(700)}
              >
                Contacto
              </Link>
            </nav>
          )}

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                style={{ color: getNeutralColor(400) }}
              />
              <Input 
                type="search" 
                placeholder="Buscar productos..." 
                className="pl-10 focus:ring-0"
                style={{ 
                  backgroundColor: getNeutralColor(100),
                  borderColor: getNeutralColor(200)
                }}
              />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Search - Mobile */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" style={{ color: getNeutralColor(600) }} />
            </Button>

            {/* User */}
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" style={{ color: getNeutralColor(600) }} />
            </Button>

            {/* Cart */}
            <CartSidebar />
          </div>
        </div>
      </div>
    </nav>
  );
};
