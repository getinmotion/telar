import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu, User, Heart, Gift, LogOut, ShoppingBag, Store, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MobileMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileMenu = ({ isOpen, onOpenChange }: MobileMenuProps) => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="text-left">Menú</SheetTitle>
        </SheetHeader>
        
        <nav className="flex flex-col py-2">
          {/* Navigation Links */}
          <Link 
            to="/?reset=true" 
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <Home className="h-5 w-5 text-muted-foreground" />
            <span>Inicio</span>
          </Link>
          
          <Link 
            to="/productos" 
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            <span>Productos</span>
          </Link>
          
          <Link 
            to="/tiendas" 
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <Store className="h-5 w-5 text-muted-foreground" />
            <span>Tiendas</span>
          </Link>

          <Separator className="my-2" />

          <Link 
            to="/giftcards" 
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <Gift className="h-5 w-5 text-muted-foreground" />
            <span>Gift Cards</span>
          </Link>
          
          <Link 
            to="/wishlist" 
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <Heart className="h-5 w-5 text-muted-foreground" />
            <span>Productos Favoritos</span>
          </Link>
          
          <Link 
            to="/tiendas-favoritas" 
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <Store className="h-5 w-5 text-red-500" />
            <span>Tiendas Favoritas</span>
          </Link>

          <Separator className="my-2" />

          {user ? (
            <>
              <Link 
                to="/profile" 
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <User className="h-5 w-5 text-muted-foreground" />
                <span>Mi Cuenta</span>
              </Link>
              
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left w-full"
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
                <span>Cerrar Sesión</span>
              </button>
            </>
          ) : (
            <Link 
              to="/auth" 
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <User className="h-5 w-5 text-muted-foreground" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
