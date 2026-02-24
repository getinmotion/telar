import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArtisanShop, CraftType, Region } from '@/types/artisan';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Star, Search, Filter, ShoppingBag, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useSemanticSearch } from '@/hooks/useSemanticSearch';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const ShopDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [shops, setShops] = useState<ArtisanShop[]>([]);
  const [filteredShops, setFilteredShops] = useState<ArtisanShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCraft, setSelectedCraft] = useState(searchParams.get('craft') || 'all');
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || 'all');
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === 'true');
  const [useSemanticSearchMode, setUseSemanticSearchMode] = useState(false);
  const [semanticShops, setSemanticShops] = useState<ArtisanShop[]>([]);
  
  const { search: semanticSearch, loading: semanticLoading, error: semanticError, executionTime } = useSemanticSearch();

  const craftTypes: { value: CraftType; label: string }[] = [
    { value: 'textiles', label: 'Textiles' },
    { value: 'ceramics', label: 'Cerámica' },
    { value: 'jewelry', label: 'Joyería' },
    { value: 'woodwork', label: 'Madera' },
    { value: 'leather', label: 'Cuero' },
    { value: 'basketry', label: 'Cestería' },
    { value: 'metalwork', label: 'Metalistería' },
    { value: 'glasswork', label: 'Vidrio' },
    { value: 'painting', label: 'Pintura' },
    { value: 'sculpture', label: 'Escultura' },
    { value: 'other', label: 'Otros' }
  ];

  const regions: { value: Region; label: string }[] = [
    { value: 'antioquia', label: 'Antioquia' },
    { value: 'atlantico', label: 'Atlántico' },
    { value: 'bolivar', label: 'Bolívar' },
    { value: 'boyaca', label: 'Boyacá' },
    { value: 'caldas', label: 'Caldas' },
    { value: 'cauca', label: 'Cauca' },
    { value: 'cundinamarca', label: 'Cundinamarca' },
    { value: 'huila', label: 'Huila' },
    { value: 'narino', label: 'Nariño' },
    { value: 'quindio', label: 'Quindío' },
    { value: 'risaralda', label: 'Risaralda' },
    { value: 'santander', label: 'Santander' },
    { value: 'tolima', label: 'Tolima' },
    { value: 'valle_del_cauca', label: 'Valle del Cauca' },
    { value: 'bogota', label: 'Bogotá' }
  ];

  useEffect(() => {
    const fetchShops = async () => {
      try {
        // TODO: Migrar a NestJS cuando esté disponible el endpoint:
        // GET /telar/server/artisan-shops?active=true&publishStatus=published&orderBy=featured:desc,createdAt:desc
        const { data, error } = await supabase
          .from('artisan_shops')
          .select('*')
          .eq('active', true)
          .eq('publish_status', 'published')
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setShops(data || []);
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  // Semantic search effect
  useEffect(() => {
    const performSemanticSearch = async () => {
      if (useSemanticSearchMode && searchQuery && searchQuery.length >= 3) {
        try {
          const results = await semanticSearch(searchQuery, 50, {
            craft_type: selectedCraft !== 'all' ? selectedCraft : undefined,
            region: selectedRegion !== 'all' ? selectedRegion : undefined,
          });

          // Convert semantic results to shop IDs
          const shopIds = new Set(results.map(r => r.shop_id));
          
          // Filter shops to only include those from semantic search results
          const semanticFiltered = shops.filter(shop => shopIds.has(shop.id));
          
          // Sort by similarity score from semantic search
          const sortedShops = semanticFiltered.sort((a, b) => {
            const aScore = results.find(r => r.shop_id === a.id)?.similarity_score || 0;
            const bScore = results.find(r => r.shop_id === b.id)?.similarity_score || 0;
            return bScore - aScore;
          });

          setSemanticShops(sortedShops);
        } catch (error) {
          console.error('Semantic search error:', error);
          // Fall back to keyword search on error
          setUseSemanticSearchMode(false);
        }
      }
    };

    performSemanticSearch();
  }, [searchQuery, useSemanticSearchMode, selectedCraft, selectedRegion, shops, semanticSearch]);

  useEffect(() => {
    // If semantic search is enabled and we have results, use those
    if (useSemanticSearchMode && searchQuery && semanticShops.length > 0) {
      let filtered = semanticShops;

      // Apply additional filters
      if (featuredOnly) {
        filtered = filtered.filter(shop => shop.featured);
      }

      setFilteredShops(filtered);
    } else {
      // Traditional keyword search
      let filtered = shops;

      // Search filter
      if (searchQuery) {
        filtered = filtered.filter(shop => 
          shop.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shop.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shop.craft_type?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Craft type filter
      if (selectedCraft !== 'all') {
        filtered = filtered.filter(shop => shop.craft_type === selectedCraft);
      }

      // Region filter
      if (selectedRegion !== 'all') {
        filtered = filtered.filter(shop => shop.region === selectedRegion);
      }

      // Featured filter
      if (featuredOnly) {
        filtered = filtered.filter(shop => shop.featured);
      }

      setFilteredShops(filtered);
    }

    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCraft !== 'all') params.set('craft', selectedCraft);
    if (selectedRegion !== 'all') params.set('region', selectedRegion);
    if (featuredOnly) params.set('featured', 'true');
    if (useSemanticSearchMode) params.set('semantic', 'true');
    setSearchParams(params);

  }, [shops, semanticShops, searchQuery, selectedCraft, selectedRegion, featuredOnly, useSemanticSearchMode, setSearchParams]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCraft('all');
    setSelectedRegion('all');
    setFeaturedOnly(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary-subtle to-secondary/10">
        <div className="text-center animate-fade-in">
          <div className="animate-float mb-4">
            <ShoppingBag className="w-16 h-16 mx-auto text-primary/60" />
          </div>
          <div className="text-xl font-medium text-primary">Cargando directorio...</div>
          <div className="text-sm text-muted-foreground mt-2">Descubriendo artesanos colombianos</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Directorio de Artesanos - Descubre Artesanías Colombianas Auténticas</title>
        <meta name="description" content="Explora el directorio completo de artesanos colombianos. Encuentra textiles, cerámica, joyería y más artesanías auténticas de todas las regiones de Colombia." />
        <meta name="keywords" content="artesanos colombia, directorio artesanos, artesanías colombianas, textiles, cerámica, joyería, madera, cuero" />
        <meta property="og:title" content="Directorio de Artesanos Colombianos" />
        <meta property="og:description" content="Descubre artesanías auténticas de Colombia. Encuentra artesanos locales y sus creaciones únicas." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/tiendas`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-primary-subtle to-secondary/10">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-4 py-20 text-center text-white">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Directorio de Artesanos
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                Descubre las mejores artesanías colombianas directamente de los maestros creadores
              </p>
              
              {/* Enhanced Search */}
              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-glass"></div>
                  <div className="relative flex items-center">
                    <Search className="absolute left-6 text-white/70 w-5 h-5 z-10" />
                    <Input
                      placeholder="Buscar artesanos, productos o técnicas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-14 pr-6 py-6 bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-2xl text-lg backdrop-blur-glass focus:bg-white/20 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Filters */}
          <Card className="mb-8 bg-gradient-glass backdrop-blur-glass shadow-glass border-0 animate-fade-in">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Filter className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Filtrar artesanos</h2>
                {(selectedCraft !== 'all' || selectedRegion !== 'all' || featuredOnly) && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="ml-auto">
                    Limpiar filtros
                  </Button>
                )}
              </div>

              {/* Semantic Search Toggle */}
              <div className="mb-6">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <Label htmlFor="semantic-search" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                      Búsqueda Inteligente (AI)
                      <Badge variant="secondary" className="text-xs">Beta</Badge>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Encuentra resultados por significado, no solo palabras exactas
                    </p>
                  </div>
                  <Switch
                    id="semantic-search"
                    checked={useSemanticSearchMode}
                    onCheckedChange={setUseSemanticSearchMode}
                  />
                </div>

                {/* Search Status */}
                {semanticLoading && (
                  <div className="flex items-center gap-2 text-sm text-purple-600 mt-3">
                    <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                    Buscando con inteligencia artificial...
                  </div>
                )}
                
                {semanticError && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mt-3">
                    {semanticError} - Usando búsqueda tradicional
                  </div>
                )}

                {useSemanticSearchMode && executionTime > 0 && searchQuery && (
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Búsqueda completada en {executionTime.toFixed(0)}ms con {filteredShops.length} resultados
                  </div>
                )}
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tipo de artesanía</label>
                  <Select value={selectedCraft} onValueChange={setSelectedCraft}>
                    <SelectTrigger className="bg-background/50 border-primary/20 hover:border-primary/40 transition-colors">
                      <SelectValue placeholder="Todas las artesanías" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-sm">
                      <SelectItem value="all">Todas las artesanías</SelectItem>
                      {craftTypes.map(craft => (
                        <SelectItem key={craft.value} value={craft.value}>
                          {craft.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Región</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="bg-background/50 border-primary/20 hover:border-primary/40 transition-colors">
                      <SelectValue placeholder="Todas las regiones" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-sm">
                      <SelectItem value="all">Todas las regiones</SelectItem>
                      {regions.map(region => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Destacados</label>
                  <Button
                    variant={featuredOnly ? "default" : "outline"}
                    onClick={() => setFeaturedOnly(!featuredOnly)}
                    className="w-full justify-start h-10 bg-background/50 border-primary/20 hover:border-primary/40 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    <Star className={`w-4 h-4 mr-2 ${featuredOnly ? 'fill-current' : ''}`} />
                    Solo destacados
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Results header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {filteredShops.length} tienda{filteredShops.length !== 1 ? 's' : ''}
              </h2>
              <p className="text-muted-foreground mt-1">
                {filteredShops.length !== 1 ? 'encontradas' : 'encontrada'} de {shops.length} artesanos registrados
              </p>
            </div>
            <Badge variant="outline" className="px-4 py-2 text-sm">
              {shops.length} total
            </Badge>
          </div>

          {/* Shop grid */}
          {filteredShops.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron tiendas</h3>
                <p className="text-muted-foreground mb-4">
                  Intenta ajustar los filtros o la búsqueda para encontrar más resultados.
                </p>
                <Button onClick={clearFilters}>Limpiar filtros</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredShops.map((shop, index) => (
                <Card 
                  key={shop.id}
                  className="group cursor-pointer bg-gradient-card backdrop-blur-sm border-0 shadow-card hover:shadow-hover transition-all duration-500 hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => navigate(`/tienda/${shop.shop_slug}`)}
                >
                  <CardContent className="p-0 overflow-hidden">
                    {/* Enhanced Shop banner/logo */}
                    <div className="relative h-56 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 overflow-hidden">
                      {(() => {
                        const bannerImage = shop.banner_url || 
                                           shop.hero_config?.slides?.[0]?.imageUrl || 
                                           shop.hero_config?.slides?.[0]?.image || 
                                           null;
                        
                        return bannerImage ? (
                          <>
                            <img 
                              src={bannerImage}
                              alt={`Banner de ${shop.shop_name}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/60 transition-all duration-500"></div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                            <ShoppingBag className="w-16 h-16 text-primary/60 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        );
                      })()}
                      
                      {/* Logo overlay with glow effect */}
                      {shop.logo_url && (
                        <div className="absolute bottom-4 left-4 group-hover:scale-105 transition-transform duration-300">
                          <img 
                            src={shop.logo_url}
                            alt={`Logo de ${shop.shop_name}`}
                            className="w-16 h-16 rounded-full border-4 border-white shadow-glow object-cover"
                          />
                        </div>
                      )}

                      {/* Enhanced Featured badge */}
                      {shop.featured && (
                        <div className="absolute top-4 right-4 animate-glow-pulse">
                          <Badge className="bg-gradient-accent text-white border-0 shadow-glow">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Destacado
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Shop info */}
                    <div className="p-6 bg-gradient-to-b from-background/80 to-background">
                      <div className="mb-4">
                        <h3 className="font-bold text-xl line-clamp-1 mb-2 group-hover:text-primary transition-colors duration-300">{shop.shop_name}</h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          {shop.craft_type && (
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary/80">
                              {shop.craft_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          )}
                          {shop.region && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="capitalize">{shop.region.replace(/_/g, ' ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {shop.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                          {shop.description}
                        </p>
                      )}

                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-gradient-primary group-hover:text-white group-hover:border-transparent transition-all duration-300 group-hover:shadow-glow"
                      >
                        <span className="group-hover:scale-105 transition-transform duration-300">Explorar tienda</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};