import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { LazyImage } from './LazyImage';
import { useCart } from '@/contexts/ShoppingCartContext';
import { toast } from 'sonner';

interface NeumorphicProductCardCompactProps {
  id: string;
  name: string;
  price: number;
  image: string;
  onClick: () => void;
}

export const NeumorphicProductCardCompact: React.FC<NeumorphicProductCardCompactProps> = ({
  id,
  name,
  price,
  image,
  onClick
}) => {
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(id, 1, price);
      toast.success('Agregado');
    } catch (error) {
      toast.error('Error');
    }
  };

  return (
    <motion.div
      className="group cursor-pointer"
      whileHover={{ y: -3 }}
      onClick={onClick}
    >
      <div className="neumorphic overflow-hidden p-3">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-xl mb-3">
          <LazyImage
            src={image || '/placeholder.svg'}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Hover Add to Cart */}
          <div className="absolute inset-0 bg-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={handleAddToCart}
              className="w-10 h-10 rounded-full bg-neumorphic-surface shadow-neumorphic hover:shadow-neumorphic-hover flex items-center justify-center transition-all"
            >
              <ShoppingCart className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          
          <span className="text-base font-bold text-foreground">
            ${price.toLocaleString('es-CO')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
