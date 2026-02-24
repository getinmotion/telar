import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ModernHeader } from '@/components/layout/ModernHeader';
import { Footer } from '@/components/layout/Footer';
import { ProductFilters } from '@/components/products/ProductFilters';
import { NeumorphicProductCard } from '@/components/shop/NeumorphicProductCard';
import { TrustIndicators } from '@/components/ui/PromotionBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryFilters } from '@/types/category';
import { useCategories } from '@/hooks/useCategories';
import { useCart } from '@/contexts/ShoppingCartContext';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Heart, Eye, Star, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

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
}

export const ShopPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getCategoryBySlug } = useCategories();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CategoryFilters>({
    sortBy: 'newest',
  });

  // Get category from URL
  const categorySlug = searchParams.get('category');
  const selectedCategory = categorySlug ? getCategoryBySlug(categorySlug) : null;

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('active', true);

      // Apply category filter
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory.id);
      }

      // Apply price range filter
      if (filters.priceRange) {
        query = query
          .gte('price', filters.priceRange.min)
          .lte('price', filters.priceRange.max);
      }

      // Apply stock filter
      if (filters.inStock) {
        query = query.gt('inventory', 0);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
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

  const handleProductClick = (product: Product) => {
    // Navigate to product detail page - we'll need shop slug for this
    navigate(`/producto/shop/${product.id}`);
  };

  const clearFilters = () => {
    setFilters({ sortBy: 'newest' });
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, filters]);

  return (
    <>
      <Helmet>
        <title>
          {selectedCategory 
            ? `${selectedCategory.name} - Productos Artesanales` 
            : 'Tienda de Productos Artesanales'
          }
        </title>
        <meta 
          name="description" 
          content={
            selectedCategory 
              ? `Descubre ${selectedCategory.name.toLowerCase()} artesanales únicos. ${selectedCategory.description}`
              : 'Explora nuestra colección completa de productos artesanales colombianos hechos a mano.'
          }
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-subtle">
        <ModernHeader showBreadcrumbs />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {selectedCategory ? selectedCategory.name : 'Todos los Productos'}
            </h1>
            {selectedCategory?.description && (
              <p className="text-muted-foreground mt-2">{selectedCategory.description}</p>
            )}
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={clearFilters}
              />
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="glass-panel animate-pulse">
                      <div className="aspect-square bg-muted rounded-t-lg"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-6 bg-muted rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
                  <p className="text-muted-foreground">
                    Intenta ajustar los filtros o explora otras categorías
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <NeumorphicProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      images={product.images || ['/placeholder.svg']}
                      category={product.category_id}
                      badge={product.featured ? 'Destacado' : undefined}
                      onClick={() => handleProductClick(product)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <TrustIndicators className="mt-12" />
        </main>

        <Footer />
      </div>
    </>
  );
};