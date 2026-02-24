import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import GuestAuthModal from "@/components/GuestAuthModal";

export const CartDrawer = () => {
  const { user } = useAuth();
  const { 
    items, 
    isCartOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity, 
    totalItems, 
    totalPrice 
  } = useCart();
  const navigate = useNavigate();
  const [guestModalOpen, setGuestModalOpen] = useState(false);

  const handleViewFullCart = () => {
    closeCart();
    navigate('/cart');
  };

  const handleCheckout = () => {
    if (user) {
      closeCart();
      navigate('/confirm-purchase');
    } else {
      setGuestModalOpen(true);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader className="space-y-2.5 pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="h-5 w-5" />
            Tu Carrito ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground mb-4">Tu carrito está vacío</p>
            <Button variant="outline" onClick={() => { closeCart(); navigate('/productos'); }}>
              Explorar productos
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.isGiftCard ? (
                      <div className="h-20 w-20 rounded-md bg-primary/10 shrink-0 flex items-center justify-center">
                        <Gift className="h-8 w-8 text-primary" />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-md overflow-hidden bg-muted shrink-0">
                        <img
                          src={item.product.image_url || '/placeholder.svg'}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm leading-tight truncate">
                        {item.product.name}
                      </h4>
                      {item.recipientEmail && (
                        <p className="text-xs text-muted-foreground truncate">
                          Para: {item.recipientEmail}
                        </p>
                      )}
                      <p className="text-sm text-primary font-semibold mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="pt-4 space-y-4">
              <Separator />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="grid gap-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleViewFullCart}
                >
                  Ver carrito completo
                </Button>
                <Button 
                  className="w-full"
                  onClick={handleCheckout}
                >
                  Finalizar compra
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
    
    {/* Guest Auth Modal */}
    <GuestAuthModal 
      isOpen={guestModalOpen} 
      onClose={() => setGuestModalOpen(false)}
      onSuccess={() => {
        setGuestModalOpen(false);
        closeCart();
        navigate('/confirm-purchase');
      }}
    />
    </>
  );
};