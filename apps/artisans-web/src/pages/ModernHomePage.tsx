import React, { useState, useEffect } from 'react';
import { ModernHeader } from '@/components/layout/ModernHeader';
import { Footer } from '@/components/layout/Footer';
import { TrustIndicators } from '@/components/ui/PromotionBanner';
import { NeumorphicProductCardCompact } from '@/components/shop/NeumorphicProductCardCompact';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Star, 
  Users, 
  Package, 
  Truck, 
  Award,
  ChevronRight,
  Sparkles,
  Heart,
  TrendingUp
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface FeaturedProduct {
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

interface FeaturedShop {
  id: string;
  shop_name: string;
  shop_slug: string;
  banner_url?: string;
  description?: string;
  craft_type?: string;
  contact_info: any;
}

export const ModernHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [featuredShops, setFeaturedShops] = useState<FeaturedShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const stats = [
    { label: 'Artesanos', value: '500+', icon: Users },
    { label: 'Productos', value: '2,500+', icon: Package },
    { label: 'Órdenes', value: '10,000+', icon: Truck },
    { label: 'Calificación', value: '4.8/5', icon: Star },
  ];

  const categories = [
    { name: 'Textiles', emoji: '🧵', description: 'Ropa y accesorios únicos' },
    { name: 'Cerámica', emoji: '🏺', description: 'Arte en barro y cerámica' },
    { name: 'Joyería', emoji: '💎', description: 'Joyas artesanales' },
    { name: 'Madera', emoji: '🪵', description: 'Tallados y muebles' },
    { name: 'Decoración', emoji: '🏠', description: 'Arte para el hogar' },
    { name: 'Arte', emoji: '🎨', description: 'Obras originales' },
  ];

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      setLoading(true);

      // Fetch featured products
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .eq('featured', true)
        .limit(8);

      if (products) {
        setFeaturedProducts(products);
      }

      // Fetch featured shops
      const { data: shops } = await supabase
        .from('artisan_shops')
        .select('*')
        .eq('active', true)
        .eq('featured', true)
        .limit(6);

      if (shops) {
        setFeaturedShops(shops);
      }
    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter subscription logic
    console.log('Newsletter signup:', newsletterEmail);
    setNewsletterEmail('');
  };

  const handleProductClick = (product: FeaturedProduct) => {
    navigate(`/producto/shop/${product.id}`);
  };

  return (
    <>
      <Helmet>
        <title>Artesanos - Productos Artesanales Colombianos Únicos</title>
        <meta 
          name="description" 
          content="Descubre productos artesanales colombianos únicos hechos a mano. Conectamos artesanos locales con el mundo. Compra directo del creador."
        />
        <meta name="keywords" content="artesanías, productos colombianos, hecho a mano, artesanos, comprar artesanías" />
      </Helmet>

      <div className="min-h-screen bg-gradient-subtle">
        <ModernHeader />

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="h-6 w-6 text-primary" />
                <Badge variant="secondary" className="text-sm">
                  Nuevo: ¡Más de 500 artesanos conectados!
                </Badge>
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
                Arte Colombiano
                <br />
                <span className="text-foreground">Hecho a Mano</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Descubre productos únicos creados por artesanos colombianos. 
                Cada pieza cuenta una historia, cada compra apoya una tradición.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-8 hover-glow"
                  onClick={() => navigate('/productos')}
                >
                  Explorar Productos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 hover-glow"
                  onClick={() => navigate('/tienda')}
                >
                  Ver Tiendas
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 border-y bg-background/50">
          <div className="container mx-auto px-4">
            <TrustIndicators />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-background/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Explora por Categorías
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Desde textiles tradicionales hasta cerámica contemporánea, 
                encuentra el arte que habla contigo.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <Card 
                  key={index}
                  className="glass-panel hover-glow cursor-pointer transition-all duration-300 group"
                  onClick={() => navigate(`/productos?category=${category.name.toLowerCase()}`)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {category.emoji}
                    </div>
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-2">
                  Productos Destacados
                </h2>
                <p className="text-muted-foreground">
                  Los favoritos de nuestra comunidad
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate('/productos')}
                className="hover-glow"
              >
                Ver Todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="glass-panel animate-pulse">
                    <div className="aspect-square bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-6 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {featuredProducts.map((product) => (
                  <NeumorphicProductCardCompact
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.images?.[0] || '/placeholder.svg'}
                    onClick={() => handleProductClick(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Shops */}
        <section className="py-16 bg-background/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-2">
                  Tiendas Destacadas
                </h2>
                <p className="text-muted-foreground">
                  Conoce a nuestros artesanos
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate('/tienda')}
                className="hover-glow"
              >
                Ver Todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredShops.map((shop) => (
                <Card 
                  key={shop.id}
                  className="glass-panel hover-glow cursor-pointer transition-all duration-300 group"
                  onClick={() => navigate(`/tienda/${shop.shop_slug}`)}
                >
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={shop.banner_url || '/placeholder.svg'}
                      alt={shop.shop_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{shop.shop_name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {shop.craft_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {shop.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm">
                          {typeof shop.contact_info === 'object' && shop.contact_info 
                            ? (shop.contact_info as any).rating || 4.5 
                            : 4.5}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Ver Tienda
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto glass-panel">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-2">
                  Mantente Conectado
                </CardTitle>
                <p className="text-muted-foreground">
                  Recibe las últimas novedades, productos destacados y ofertas especiales directamente en tu email.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Tu email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button type="submit" className="hover-glow">
                    Suscribirse
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  No spam. Solo contenido valioso sobre arte y cultura colombiana.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};