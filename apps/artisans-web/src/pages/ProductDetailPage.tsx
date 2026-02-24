import React from 'react';
import { useParams } from 'react-router-dom';
import { ModernHeader } from '@/components/layout/ModernHeader';
import { Footer } from '@/components/layout/Footer';
import { ProductReviews } from '@/components/reviews/ProductReviews';
import { TrustBadges } from '@/components/trust/TrustBadges';
import { ProductRating } from '@/components/trust/ProductRating';
import { StockBadge } from '@/components/trust/StockBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/ShoppingCartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { 
  Heart, 
  Share2, 
  Truck, 
  Shield,
  ShoppingCart,
  Plus,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

// Mock product data for demonstration
const mockProduct = {
  id: '1',
  name: 'Poncho Artesanal Wayuu',
  description: 'Hermoso poncho tejido a mano por artesanas de la comunidad Wayuu. Cada pieza es única y representa siglos de tradición ancestral en sus coloridos patrones geométricos.',
  price: 150000,
  compare_price: 200000,
  images: ['/placeholder.svg'],
  inventory: 5,
  active: true,
  featured: true,
  shop_id: '1',
  created_at: new Date().toISOString(),
  short_description: 'Poncho tradicional Wayuu tejido a mano',
  tags: ['wayuu', 'tradicional', 'tejido', 'artesanal']
};

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = React.useState(1);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(mockProduct.id);
      toast.success(`Producto agregado al carrito`);
    } catch (error) {
      toast.error('Error al agregar al carrito');
    }
  };

  const handleWishlist = async () => {
    try {
      await toggleWishlist(mockProduct.id);
      toast.success(
        isInWishlist(mockProduct.id) ? 'Eliminado de favoritos' : 'Agregado a favoritos'
      );
    } catch (error) {
      toast.error('Error al actualizar favoritos');
    }
  };

  const adjustQuantity = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= mockProduct.inventory) {
      setQuantity(newQuantity);
    }
  };

  return (
    <>
      <Helmet>
        <title>{mockProduct.name} - Artesanos</title>
        <meta name="description" content={mockProduct.description} />
      </Helmet>

      <div className="min-h-screen bg-gradient-subtle">
        <ModernHeader />

        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg glass-panel">
                <img
                  src={mockProduct.images[0]}
                  alt={mockProduct.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <StockBadge inventory={mockProduct.inventory} />
                  {mockProduct.featured && (
                    <Badge variant="secondary">Destacado</Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold mb-4">{mockProduct.name}</h1>
                
                <ProductRating 
                  productId={mockProduct.id} 
                  size="md" 
                  className="mb-4"
                />

                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(mockProduct.price)}
                  </span>
                  {mockProduct.compare_price && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(mockProduct.compare_price)}
                    </span>
                  )}
                  {mockProduct.compare_price && (
                    <Badge variant="destructive">
                      -{Math.round((1 - mockProduct.price / mockProduct.compare_price) * 100)}%
                    </Badge>
                  )}
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {mockProduct.description}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Cantidad:</span>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => adjustQuantity(-1)}
                      disabled={quantity <= 1}
                      className="h-10 w-10"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 min-w-[50px] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => adjustQuantity(1)}
                      disabled={quantity >= mockProduct.inventory}
                      className="h-10 w-10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={mockProduct.inventory === 0}
                    className="flex-1 hover-glow"
                    size="lg"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Agregar al Carrito
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleWishlist}
                    className={`hover-glow ${
                      isInWishlist(mockProduct.id) ? 'text-red-500 border-red-200' : ''
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist(mockProduct.id) ? 'fill-current' : ''}`} />
                  </Button>

                  <Button variant="outline" size="lg" className="hover-glow">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t">
                <TrustBadges />
              </div>
            </div>
          </div>

          <Separator className="my-12" />

          {/* Reviews Section */}
          <ProductReviews productId={mockProduct.id} />
        </main>

        <Footer />
      </div>
    </>
  );
};