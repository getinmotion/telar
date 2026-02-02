import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  MapPin,
  Star,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  name: string;
  type: 'product' | 'shop' | 'category';
  price?: number;
  image?: string;
  shop_name?: string;
  location?: string;
  rating?: number;
  path: string;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  showFilters?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  className = '', 
  placeholder = 'Buscar productos artesanales...',
  showFilters = true 
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches] = useState<string[]>([
    'Bolsos artesanales',
    'Cerámica decorativa',
    'Joyería plata',
    'Textiles andinos',
    'Macetas barro'
  ]);

  const navigate = useNavigate();
  const { categories } = useCategories();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length >= 2) {
      const timeout = setTimeout(() => {
        performSearch(query);
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const results: SearchResult[] = [];

      // Search products
      const { data: products } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          images,
          shop:artisan_shops(shop_name, contact_info)
        `)
        .eq('active', true)
        .textSearch('name', searchQuery)
        .limit(5);

      if (products) {
        results.push(...products.map(product => ({
          id: product.id,
          name: product.name,
          type: 'product' as const,
          price: product.price,
          image: product.images?.[0],
          shop_name: product.shop?.shop_name,
          path: `/producto/${product.shop?.shop_name}/${product.id}`
        })));
      }

      // Search shops
      const { data: shops } = await supabase
        .from('artisan_shops')
        .select('id, shop_name, shop_slug, banner_url, contact_info')
        .eq('active', true)
        .textSearch('shop_name', searchQuery)
        .limit(3);

      if (shops) {
        results.push(...shops.map(shop => ({
          id: shop.id,
          name: shop.shop_name,
          type: 'shop' as const,
          image: shop.banner_url,
          location: typeof shop.contact_info === 'object' && shop.contact_info ? (shop.contact_info as any).city : undefined,
          rating: typeof shop.contact_info === 'object' && shop.contact_info ? (shop.contact_info as any).rating || 4.0 : 4.0,
          path: `/tienda/${shop.shop_slug}`
        })));
      }

      // Search categories
      const categoryResults = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 2);

      results.push(...categoryResults.map(category => ({
        id: category.id,
        name: category.name,
        type: 'category' as const,
        path: `/productos?category=${category.slug}`
      })));

      setResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      // Add to recent searches
      const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
      
      // Navigate to search results
      navigate(`/productos?q=${encodeURIComponent(searchTerm)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    setIsOpen(false);
    setQuery('');
  };

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pl-10 pr-12 bg-background border hover-glow focus:ring-2 focus:ring-primary/20"
          />
          {showFilters && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 glass-panel max-h-96 overflow-auto">
          <CardContent className="p-0">
            {loading && (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            )}

            {!loading && query && results.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-muted-foreground mb-2 px-2">
                  Resultados para "{query}"
                </div>
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors text-left"
                  >
                    {result.image && (
                      <img
                        src={result.image}
                        alt={result.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{result.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {result.type === 'product' ? 'Producto' : 
                           result.type === 'shop' ? 'Tienda' : 'Categoría'}
                        </Badge>
                      </div>
                      {result.price && (
                        <div className="text-sm text-primary font-semibold">
                          {formatPrice(result.price)}
                        </div>
                      )}
                      {result.shop_name && (
                        <div className="text-xs text-muted-foreground">
                          {result.shop_name}
                        </div>
                      )}
                      {result.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {result.location}
                        </div>
                      )}
                      {result.rating && (
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          {result.rating}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                
                {results.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <button
                      onClick={() => handleSearch(query)}
                      className="w-full p-2 text-sm text-primary hover:bg-accent rounded-md transition-colors text-left"
                    >
                      Ver todos los resultados para "{query}"
                    </button>
                  </>
                )}
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No se encontraron resultados para "{query}"</p>
                <p className="text-xs mt-1">Intenta con términos diferentes</p>
              </div>
            )}

            {!query && (recentSearches.length > 0 || trendingSearches.length > 0) && (
              <div className="p-2">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2 px-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Búsquedas recientes
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpiar
                      </Button>
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="w-full p-2 text-left hover:bg-accent rounded-md transition-colors text-sm"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                )}

                {/* Trending Searches */}
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2 px-2">
                    <TrendingUp className="h-3 w-3" />
                    Búsquedas populares
                  </div>
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full p-2 text-left hover:bg-accent rounded-md transition-colors text-sm"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};