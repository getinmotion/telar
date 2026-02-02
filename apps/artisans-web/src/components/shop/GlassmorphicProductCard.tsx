import React from 'react';
import { motion } from 'framer-motion';
import { useShopTheme } from '@/contexts/ShopThemeContext';
import { LazyImage } from './LazyImage';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Edit } from 'lucide-react';
import { useCart } from '@/contexts/ShoppingCartContext';
import { toast } from 'sonner';

interface GlassmorphicProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  onClick: () => void;
  isOwner?: boolean;
  onEdit?: () => void;
}

export const GlassmorphicProductCard: React.FC<GlassmorphicProductCardProps> = ({
  id,
  name,
  price,
  image,
  category,
  onClick,
  isOwner = false,
  onEdit
}) => {
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToCart(id, 1, price);
      toast.success('Producto agregado al carrito', {
        description: name,
      });
    } catch (error) {
      toast.error('Error al agregar al carrito');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  return (
    <motion.div
      className="group cursor-pointer"
      whileHover={{ y: -8 }}
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-md border border-border shadow-glass hover:shadow-hover transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <LazyImage
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Category Badge */}
          {category && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground backdrop-blur-md">
              {category}
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Owner Edit Button */}
          {isOwner && onEdit && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                onClick={handleEdit}
                className="shadow-neumorphic bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          
          <div className="flex items-center justify-between gap-2">
            <span className="text-xl font-bold text-primary">
              ${price.toLocaleString('es-CO')}
            </span>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="hover:scale-105 transition-transform bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
              
              <motion.button
                className="px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ver Más
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
