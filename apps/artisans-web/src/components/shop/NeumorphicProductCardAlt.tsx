import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import { LazyImage } from './LazyImage';
import { useCart } from '@/contexts/ShoppingCartContext';
import { toast } from 'sonner';

interface NeumorphicProductCardAltProps {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: string;
  shopLogo?: string;
  onClick: () => void;
}

export const NeumorphicProductCardAlt: React.FC<NeumorphicProductCardAltProps> = ({
  id,
  name,
  price,
  image,
  badge,
  shopLogo,
  onClick
}) => {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(id, 1, price);
      toast.success('Producto agregado', {
        description: name,
      });
    } catch (error) {
      toast.error('Error al agregar');
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.div
      className="group cursor-pointer"
      whileHover={{ y: -4 }}
      onClick={onClick}
    >
      <div className="neumorphic overflow-hidden">
        {/* Shop Logo */}
        {shopLogo && (
          <div className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-neumorphic-surface shadow-neumorphic overflow-hidden">
            <img src={shopLogo} alt="Shop" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-2xl">
          <LazyImage
            src={image || '/placeholder.svg'}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-neumorphic-surface shadow-neumorphic hover:shadow-neumorphic-hover flex items-center justify-center transition-all duration-300"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-accent text-accent' : 'text-muted-foreground'
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              {badge && (
                <span className="inline-block px-2 py-1 rounded-md text-xs font-semibold bg-accent/10 text-accent mb-2">
                  {badge}
                </span>
              )}
              <h3 className="font-display font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {name}
              </h3>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Precio</p>
              <span className="text-xl font-bold text-foreground">
                ${price.toLocaleString('es-CO')}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="px-4 py-2 rounded-full bg-foreground text-background hover:bg-foreground/90 flex items-center gap-2 shadow-neumorphic hover:shadow-neumorphic-hover transition-all font-semibold text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Comprar
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
