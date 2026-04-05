/**
 * NavbarV2 Component
 * Nueva versión del Navbar con estructura de 2 filas
 * Fila 1: Búsqueda | Logo + Label | Iconos (Heart, Cart, User)
 * Fila 2: Menú (Explorar, Artesanos, Regalos)
 */

import { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, User, LogOut, Heart, LogIn } from "lucide-react";
import { CategoriesMegaMenu } from "@/components/CategoriesMegaMenu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { SemanticSearchToggle } from "@/components/SemanticSearchToggle";
import { CartDrawer } from "@/components/CartDrawer";
import GuestAuthModal from "@/components/GuestAuthModal";
import telarHorizontal from '@/assets/telar-horizontal.svg';

interface NavbarV2Props {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  semanticSearchEnabled?: boolean;
  onSemanticSearchToggle?: (enabled: boolean) => void;
  onHomeClick?: () => void;
}

export const NavbarV2 = ({
  searchQuery = "",
  onSearchChange = () => {},
  semanticSearchEnabled = true,
  onSemanticSearchToggle = () => {},
  onHomeClick,
}: NavbarV2Props) => {
  const { user, signOut } = useAuth();
  const { totalItems, openCart } = useCart();
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estado local para el input (no actualiza el contexto en tiempo real)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Sincronizar estado local cuando cambia searchQuery desde afuera
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      // Close search when scrolling back to top
      if (window.scrollY <= 50) {
        setSearchVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCartClick = () => {
    if (!user) {
      setGuestModalOpen(true);
    } else {
      openCart();
    }
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  const handleSearch = () => {
    if (localSearchQuery.trim().length > 0) {
      // Actualizar el contexto global antes de navegar
      onSearchChange(localSearchQuery);
      // Redirigir a productos con el query de búsqueda
      navigate(`/productos?q=${encodeURIComponent(localSearchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4 relative">
        {/* Primera Fila: Grid de 3 columnas */}
        <div className={`grid grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 items-center transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>

          {/* Columna 1: Búsqueda */}
          <div className="flex items-center gap-2">
            {!isScrolled ? (
              // Búsqueda normal (no scrolled)
              <>
                <div className="relative w-3/4 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar productos, artesanos..."
                    className="pl-10 pr-24 h-10 bg-muted/30 border-border/40"
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                    onClick={handleSearch}
                    disabled={localSearchQuery.trim().length === 0}
                  >
                    Buscar
                  </Button>
                </div>
                {searchQuery && onSemanticSearchToggle && (
                  <SemanticSearchToggle
                    enabled={semanticSearchEnabled}
                    onToggle={onSemanticSearchToggle}
                  />
                )}
              </>
            ) : (
              // Icono de búsqueda cuando scrolled
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleSearch}
                >
                  <Search className="h-4 w-4" />
                </Button>
                {/* Input expandible con transición */}
                <div className={`overflow-hidden transition-all duration-300 ${searchVisible ? 'w-64 opacity-100' : 'w-0 opacity-0'}`}>
                  {searchVisible && (
                    <div className="relative">
                      <Input
                        type="search"
                        placeholder="Buscar..."
                        className="h-8 text-sm pr-16"
                        value={localSearchQuery}
                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 text-xs px-2"
                        onClick={handleSearch}
                        disabled={localSearchQuery.trim().length === 0}
                      >
                        Ir
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Columna 2: Logo + Label (Centro) */}
          <div className="flex flex-col items-center gap-1">
            {onHomeClick ? (
              <button onClick={onHomeClick} className="flex flex-col items-center gap-1">
                <img
                  src={telarHorizontal}
                  alt="TELAR"
                  className={`transition-all duration-300 ${isScrolled ? 'h-6 md:h-7' : 'h-8 md:h-10'}`}
                />
              </button>
            ) : (
              <Link to="/?reset=true" className="flex flex-col items-center gap-1">
                <img
                  src={telarHorizontal}
                  alt="TELAR"
                  className={`transition-all duration-300 ${isScrolled ? 'h-6 md:h-7' : 'h-8 md:h-10'}`}
                />
              </Link>
            )}
          </div>

          {/* Columna 3: Iconos (Heart, Cart, User) */}
          <div className="flex items-center justify-end gap-2">
            {/* Favoritos */}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="h-10 w-10" title="Mis favoritos">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            {/* Carrito */}
            <Button variant="ghost" size="icon" className="relative h-10 w-10" onClick={handleCartClick}>
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>
            <CartDrawer />

            {/* Guest Auth Modal */}
            <GuestAuthModal
              isOpen={guestModalOpen}
              onClose={() => setGuestModalOpen(false)}
              onSuccess={() => {
                setGuestModalOpen(false);
                openCart();
              }}
            />

            {/* User Actions */}
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className={isScrolled ? "h-8 w-8" : "h-10 w-10"} title="Mi cuenta">
                    <User className={isScrolled ? "h-4 w-4" : "h-5 w-5"} />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className={isScrolled ? "h-8 w-8" : "h-10 w-10"}
                  onClick={signOut}
                  title="Cerrar sesión"
                >
                  <LogOut className={isScrolled ? "h-4 w-4" : "h-5 w-5"} />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                {isScrolled ? (
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Iniciar sesión">
                    <LogIn className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="default" size="sm">
                    Iniciar Sesión
                  </Button>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Segunda Fila: Menú */}
        <nav className={`border-t border-border/10 transition-all duration-300 ${isScrolled ? 'bg-muted/30' : ''}`}>
          <div className={`flex items-center justify-center gap-8 transition-all duration-300 ${isScrolled ? 'py-1.5' : 'py-3'}`}>
            <Link
              to="/productos"
              className={`font-semibold text-foreground/80 hover:text-foreground transition-colors ${isScrolled ? 'text-xs' : 'text-sm'}`}
            >
              Explorar
            </Link>
            <div
              className="relative"
              onMouseEnter={() => {
                if (megaMenuTimer.current) clearTimeout(megaMenuTimer.current);
                setMegaMenuOpen(true);
              }}
              onMouseLeave={() => {
                megaMenuTimer.current = setTimeout(() => setMegaMenuOpen(false), 150);
              }}
            >
              <Link
                to="/categorias"
                className={`font-semibold text-foreground/80 hover:text-foreground transition-colors ${isScrolled ? 'text-xs' : 'text-sm'} ${megaMenuOpen ? 'text-[#ec6d13]' : ''}`}
              >
                Categorías
                {megaMenuOpen && <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#ec6d13]" />}
              </Link>
            </div>
            <Link
              to="/tiendas"
              className={`font-semibold text-foreground/80 hover:text-foreground transition-colors ${isScrolled ? 'text-xs' : 'text-sm'}`}
            >
              Talleres
            </Link>
            <Link
              to="/giftcards"
              className={`font-semibold text-foreground/80 hover:text-foreground transition-colors ${isScrolled ? 'text-xs' : 'text-sm'}`}
            >
              Regalos
            </Link>
            <Link
              to="/blog"
              className={`font-semibold text-foreground/80 hover:text-foreground transition-colors ${isScrolled ? 'text-xs' : 'text-sm'}`}
            >
              Historias
            </Link>
            <Link
              to="/newsletter"
              className={`font-semibold text-foreground/80 hover:text-foreground transition-colors ${isScrolled ? 'text-xs' : 'text-sm'}`}
            >
              Suscríbete
            </Link>
          </div>
        </nav>

        {/* Categories Mega Menu */}
        {megaMenuOpen && (
          <div
            onMouseEnter={() => {
              if (megaMenuTimer.current) clearTimeout(megaMenuTimer.current);
            }}
            onMouseLeave={() => {
              megaMenuTimer.current = setTimeout(() => setMegaMenuOpen(false), 150);
            }}
          >
            <CategoriesMegaMenu onClose={() => setMegaMenuOpen(false)} />
          </div>
        )}
      </div>
    </header>
  );
};
