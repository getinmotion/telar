import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CartIcon } from './CartIcon';
import { CartItemCard } from './CartItemCard';
import { useCart } from '@/contexts/ShoppingCartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartSidebarProps {
  children?: React.ReactNode;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ children }) => {
  const { cartItems, summary, loading } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);

  const handleCheckout = () => {
    setOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || <CartIcon />}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg glass-panel">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Tu Carrito
            {summary.itemCount > 0 && (
              <Badge variant="secondary">{summary.itemCount}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {summary.itemCount === 0 
              ? "No tienes productos en tu carrito"
              : `${summary.itemCount} producto${summary.itemCount > 1 ? 's' : ''} en tu carrito`
            }
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Tu carrito está vacío</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setOpen(false)}
            >
              Seguir comprando
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 py-4">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (19%)</span>
                  <span>{formatPrice(summary.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span>
                    {summary.shipping === 0 ? (
                      <Badge variant="secondary" className="text-xs">Gratis</Badge>
                    ) : (
                      formatPrice(summary.shipping)
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(summary.total)}</span>
                </div>
                {summary.subtotal < 150000 && (
                  <p className="text-xs text-muted-foreground">
                    Compra {formatPrice(150000 - summary.subtotal)} más para envío gratis
                  </p>
                )}
              </div>

              <Button 
                onClick={handleCheckout}
                className="w-full"
                size="lg"
              >
                Finalizar Compra
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};