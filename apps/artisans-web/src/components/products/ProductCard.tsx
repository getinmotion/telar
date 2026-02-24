import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/ShoppingCartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { ProductRating } from '@/components/trust/ProductRating';
import { StockBadge } from '@/components/trust/StockBadge';
import { 
  Eye, 
  Heart, 
  ShoppingCart, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Share2,
  Truck,
  Shield,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_price?: number;
  images: any;
  category_id?: string;
  inventory: number;
  active: boolean;
  featured: boolean;
  shop_id: string;
  created_at: string;
  short_description?: string;
  tags?: any;
}

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  size?: 'small' | 'medium' | 'large';
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onProductClick, 
  size = 'medium' 
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.inventory <= 0) {
      toast.error('Producto sin stock');
      return;
    }
    try {
      await addToCart(product.id, 1, product.price);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const wasInWishlist = isInWishlist(product.id);
      await toggleWishlist(product.id);
      toast.success(wasInWishlist ? 'Eliminado de favoritos' : 'Agregado a favoritos');
    } catch (error) {
      toast.error('Error actualizando favoritos');
    }
  };

  const images = Array.isArray(product.images) ? product.images : 
    product.images ? [product.images] : ['/placeholder.svg'];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const discountPercentage = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const cardSizeClasses = {
    small: 'w-full max-w-sm',
    medium: 'w-full',
    large: 'w-full max-w-md'
  };

  return (
    <Card 
      variant="elevated"
      className={`${cardSizeClasses[size]} group cursor-pointer overflow-hidden hover:scale-[1.02] transition-all duration-300`}
    >
      <div 
        className="relative aspect-square overflow-hidden bg-gray-100"
        onClick={() => onProductClick(product)}
      >
        {/* Main Image */}
        <img
          src={images[currentImageIndex] || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Image Navigation - Only show if multiple images */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Image Indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? 'bg-neon-green w-3' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <Badge className="text-xs bg-neon-green text-deep-green font-semibold">
              ⭐ Destacado
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge variant="destructive" className="text-xs font-bold">
              -{discountPercentage}%
            </Badge>
          )}
          {new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
            <Badge className="text-xs bg-deep-green text-white">
              Nuevo
            </Badge>
          )}
        </div>

        {/* Stock Status */}
        {product.inventory <= 0 && (
          <Badge 
            variant="destructive" 
            className="absolute top-2 right-2 text-xs"
          >
            Sin stock
          </Badge>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
          <QuickViewModal product={product}>
            <Button 
              size="icon" 
              className="bg-white hover:bg-white/90 text-charcoal"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </QuickViewModal>
          
          <Button 
            size="icon" 
            onClick={handleWishlist}
            className="bg-white hover:bg-white/90 text-charcoal"
          >
            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          
          <Button 
            size="icon" 
            onClick={handleAddToCart}
            disabled={product.inventory <= 0}
            className="bg-neon-green hover:bg-neon-green-400 text-deep-green"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4" onClick={() => onProductClick(product)}>
        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                className={`h-3 w-3 ${i < 4 ? 'text-neon-green fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">(4.0)</span>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-base text-charcoal line-clamp-2 mb-2 hover:text-deep-green transition-colors">
          {product.name}
        </h3>

        {/* Short Description */}
        {product.short_description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3">
            {product.short_description}
          </p>
        )}
        
        {/* Pricing */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-charcoal">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
          
          <Button
            size="sm"
            variant="neon"
            onClick={handleAddToCart}
            disabled={product.inventory <= 0}
            className="shrink-0"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {product.inventory <= 0 ? 'Agotado' : 'Agregar'}
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Truck className="h-3 w-3 text-neon-green-600" />
            <span>Envío gratis</span>
          </div>
          
          {product.inventory <= 5 && product.inventory > 0 && (
            <span className="text-orange-600 font-semibold">
              ¡{product.inventory} left!
            </span>
          )}
        </div>

        {/* Tags */}
        {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {product.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs border-neon-green-200 text-neon-green-700">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Quick View Modal Component
interface QuickViewModalProps {
  product: Product;
  children: React.ReactNode;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, children }) => {
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);

  const images = Array.isArray(product.images) ? product.images : 
    product.images ? [product.images] : ['/placeholder.svg'];

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity, product.price);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl glass-panel">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border">
              <img
                src={images[selectedImageIndex] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-auto">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-primary' : 'border-muted'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.0) • 23 reseñas</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.compare_price && product.compare_price > product.price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.compare_price)}
                  </span>
                )}
              </div>
              {product.compare_price && product.compare_price > product.price && (
                <p className="text-sm text-green-600 font-medium">
                  Ahorras {formatPrice(product.compare_price - product.price)} ({Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%)
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-muted-foreground">
                {product.description || product.short_description || 'Producto artesanal hecho a mano con materiales de alta calidad.'}
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-green-600" />
                <span>Envío gratis +$150k</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Compra protegida</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4 text-purple-600" />
                <span>30 días devolución</span>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Cantidad:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                    disabled={quantity >= product.inventory}
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.inventory} disponibles)
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.inventory <= 0}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Agregar al Carrito
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stock Warning */}
            {product.inventory <= 5 && product.inventory > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium">
                  ⚠️ ¡Últimas {product.inventory} unidades disponibles!
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};