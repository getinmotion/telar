import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CartItem } from '@/types/cart';
import { useCart } from '@/contexts/ShoppingCartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemCardProps {
  item: CartItem;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const productImage = item.product?.images?.[0] || '/placeholder.svg';
  const productName = item.product?.name || 'Producto';
  const isOutOfStock = !item.product?.active || (item.product?.inventory ?? 0) < item.quantity;

  return (
    <div className="flex gap-3 p-3 border rounded-lg bg-card hover-glow transition-all duration-300">
      <div className="relative flex-shrink-0">
        <img
          src={productImage}
          alt={productName}
          className="w-16 h-16 object-cover rounded-md"
        />
        {isOutOfStock && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 text-xs"
          >
            Sin stock
          </Badge>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{productName}</h4>
        <p className="text-sm text-muted-foreground">
          {formatPrice(item.price)} c/u
        </p>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleQuantityChange(item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="px-2 py-1 text-sm font-medium min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isOutOfStock}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => removeFromCart(item.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        <div className="mt-1">
          <p className="text-sm font-semibold">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
};