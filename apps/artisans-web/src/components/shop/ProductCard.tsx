import React from 'react';
import { LazyImage } from './LazyImage';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onClick 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden bg-muted rounded-lg">
        <LazyImage
          src={product.images?.[0] || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      <div className="mt-4 space-y-2">
        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-sm font-medium text-foreground">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
};