import React from 'react';
import { Button } from '@/components/ui/button';
import { CategoryMenu } from '@/components/navigation/CategoryMenu';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { SearchBar } from '@/components/search/SearchBar';
import { PromotionBanner } from '@/components/ui/PromotionBanner';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { 
  User, 
  Menu, 
  X,
  Heart,
  Settings,
  LogOut,
  Store,
  Palette
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface ModernHeaderProps {
  showPromotionBanner?: boolean;
  showBreadcrumbs?: boolean;
  className?: string;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  showPromotionBanner = true,
  showBreadcrumbs = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className={`w-full ${className}`}>
      {/* Promotion Banner */}
      {showPromotionBanner && (
        <PromotionBanner className="border-b" />
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo & Mobile Menu */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 font-bold text-xl hover-glow transition-all duration-300"
              >
                <Palette className="h-6 w-6 text-primary" />
                <span className="hidden sm:block bg-gradient-primary bg-clip-text text-transparent">
                  Artesanos
                </span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:block flex-1 max-w-2xl">
              <CategoryMenu />
            </nav>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md">
              <SearchBar className="w-full" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search for mobile/tablet */}
              <div className="lg:hidden">
                <SearchBar className="w-64" />
              </div>
              
              {/* Wishlist */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover-glow"
                onClick={() => navigate('/wishlist')}
              >
                <Heart className="h-5 w-5" />
              </Button>
              
              {/* Shopping Cart */}
              <CartSidebar />
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover-glow">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-panel">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/mi-tienda')}>
                    <Store className="mr-2 h-4 w-4" />
                    Mi Tienda
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                    <Heart className="mr-2 h-4 w-4" />
                    Lista de Deseos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t py-4">
              <CategoryMenu />
            </div>
          )}
        </div>
      </header>

      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-3">
            <Breadcrumbs />
          </div>
        </div>
      )}
    </div>
  );
};