import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { LazyImage } from './LazyImage';
import { useCart } from '@/contexts/ShoppingCartContext';
import { toast } from 'sonner';

interface NeumorphicProductCardProps {
  id: string;
  name: string;
  price: number;
  images: string[];
  category?: string;
  badge?: string;
  moderationStatus?: string;
  onClick: () => void;
}

const getModerationBadge = (status: string) => {
  switch (status) {
    case 'pending_moderation':
      return { label: 'Pendiente de Aprobación', className: 'bg-warning text-warning-foreground' };
    case 'changes_requested':
      return { label: 'Cambios Solicitados', className: 'bg-destructive text-destructive-foreground' };
    case 'rejected':
      return { label: 'Rechazado', className: 'bg-destructive text-destructive-foreground' };
    case 'draft':
      return { label: 'Borrador', className: 'bg-muted text-muted-foreground' };
    default:
      return null;
  }
};

export const NeumorphicProductCard: React.FC<NeumorphicProductCardProps> = ({
  id,
  name,
  price,
  images,
  category,
  badge,
  moderationStatus,
  onClick
}) => {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Get moderation badge info if status requires one
  const moderationBadge = moderationStatus && moderationStatus !== 'approved' && moderationStatus !== 'approved_with_edits'
    ? getModerationBadge(moderationStatus)
    : null;

  return (
    <motion.div
      className="group cursor-pointer"
      whileHover={{ y: -4 }}
      onClick={onClick}
    >
      <div className="neumorphic overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-2xl">
          <LazyImage
            src={images[currentImageIndex] || images[0] || '/placeholder.svg'}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Moderation Status Badge - shown in preview mode */}
          {moderationBadge && (
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${moderationBadge.className}`}>
              {moderationBadge.label}
            </div>
          )}

          {/* Regular Badge - shown if no moderation badge */}
          {!moderationBadge && badge && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground neumorphic-inset">
              {badge}
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-neumorphic-surface shadow-neumorphic hover:shadow-neumorphic-hover flex items-center justify-center transition-all duration-300"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-accent text-accent' : 'text-muted-foreground'
              }`}
            />
          </button>

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neumorphic-surface/90 shadow-neumorphic hover:shadow-neumorphic-hover flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neumorphic-surface/90 shadow-neumorphic hover:shadow-neumorphic-hover flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>

              {/* Pagination Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-foreground w-4'
                        : 'bg-muted-foreground/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {category && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {category}
            </p>
          )}

          <h3 className="font-display font-bold text-xl text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>

          <div className="flex items-center justify-between gap-3">
            <span className="text-2xl font-bold text-foreground">
              ${price.toLocaleString('es-CO')}
            </span>

            <button
              onClick={handleAddToCart}
              className="btn-capsule bg-foreground text-background hover:bg-foreground/90 flex items-center gap-2 shadow-neumorphic hover:shadow-neumorphic-hover transition-all"
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
