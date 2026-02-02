import { useState } from "react";
import { Search, ShoppingCart, User, LogOut, Heart, Gift, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { SemanticSearchToggle } from "@/components/SemanticSearchToggle";
import { CartDrawer } from "@/components/CartDrawer";
import { MobileMenu } from "@/components/MobileMenu";
import GuestAuthModal from "@/components/GuestAuthModal";
import telarHorizontal from '@/assets/telar-horizontal.svg';
import telarIsotipo from '@/assets/telar-isotipo.svg';

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCategorySearch?: (category: string) => void;
  semanticSearchEnabled?: boolean;
  onSemanticSearchToggle?: (enabled: boolean) => void;
  onHomeClick?: () => void;
}

export const Navbar = ({ 
  searchQuery = "", 
  onSearchChange = () => {}, 
  onCategorySearch,
  semanticSearchEnabled = true,
  onSemanticSearchToggle = () => {},
  onHomeClick,
}: NavbarProps) => {
  const { user, signOut } = useAuth();
  const { totalItems, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);

  const handleCartClick = () => {
    if (!user) {
      setGuestModalOpen(true);
    } else {
      openCart();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-20 items-center justify-between gap-2 md:gap-4">
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-10 w-10"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo - Click clears filters and goes home */}
          {onHomeClick ? (
            <button onClick={onHomeClick} className="flex items-center gap-2 shrink-0">
              <img 
                src={telarHorizontal}
                alt="TELAR" 
                className="h-6 sm:h-8 md:h-12"
              />
            </button>
          ) : (
            <Link to="/?reset=true" className="flex items-center gap-2 shrink-0">
              <img 
                src={telarHorizontal}
                alt="TELAR" 
                className="h-6 sm:h-8 md:h-12"
              />
            </Link>
          )}

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar productos, artesanos..."
                  className="pl-11 h-11 bg-muted/30 border-border/40"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
              {searchQuery && onSemanticSearchToggle && (
                <SemanticSearchToggle
                  enabled={semanticSearchEnabled}
                  onToggle={onSemanticSearchToggle}
                />
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mobile Search Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden h-10 w-10"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            {/* Desktop Only Icons */}
            <Link to="/giftcards" className="hidden md:inline-flex">
              <Button variant="ghost" size="icon" className="h-11 w-11" title="Gift Cards">
                <Gift className="h-6 w-6" />
              </Button>
            </Link>

            <Link to="/wishlist" className="hidden md:inline-flex">
              <Button variant="ghost" size="icon" className="h-11 w-11" title="Mis favoritos">
                <Heart className="h-6 w-6" />
              </Button>
            </Link>

            {/* Cart - Always Visible */}
            <Button variant="ghost" size="icon" className="relative h-10 w-10 md:h-11 md:w-11" onClick={handleCartClick}>
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
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

            {/* Desktop User Actions */}
            {user ? (
              <>
                <Link to="/profile" className="hidden md:inline-flex">
                  <Button variant="ghost" size="icon" className="h-11 w-11" title="Mi cuenta">
                    <User className="h-6 w-6" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden md:inline-flex h-11 w-11" 
                  onClick={signOut} 
                  title="Cerrar sesión"
                >
                  <LogOut className="h-6 w-6" />
                </Button>
              </>
            ) : (
              <Link to="/auth" className="hidden md:inline-flex">
                <Button variant="default" size="sm" className="md:size-default">
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar - Expandable */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-10 h-10 bg-muted/30 border-border/40"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
    </header>
  );
};
