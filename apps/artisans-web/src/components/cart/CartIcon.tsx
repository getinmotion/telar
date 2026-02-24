import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/ShoppingCartContext';

interface CartIconProps {
  onClick?: () => void;
  className?: string;
}

export const CartIcon: React.FC<CartIconProps> = ({ onClick, className }) => {
  const { summary } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`relative hover-scale ${className}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {summary.itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full animate-scale-in"
        >
          {summary.itemCount > 99 ? '99+' : summary.itemCount}
        </Badge>
      )}
    </Button>
  );
};