/**
 * ProductReviewPage — Review and edit migrated products by store.
 *
 * Features:
 *   - Navigate products by store
 *   - Summary table with key product info
 *   - Edit each layer via tabs (Core, Identity, Physical, Variant, Media, Legacy)
 *   - View legacy data for comparison
 */
import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Store, Package, Loader2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProductReview } from '@/hooks/useProductReview';
import { getActiveCategories } from '@/services/categories.actions';
import { telarApi } from '@/integrations/api/telarApi';
import type { CreateProductsNewDto } from '@/services/products-new.types';

// Tabs
import { CoreTab } from '@/components/product-review/tabs/CoreTab';
import { IdentityTab } from '@/components/product-review/tabs/IdentityTab';
import { PhysicalTab } from '@/components/product-review/tabs/PhysicalTab';
import { VariantTab } from '@/components/product-review/tabs/VariantTab';
import { MediaTab } from '@/components/product-review/tabs/MediaTab';
import { LegacyTab } from '@/components/product-review/tabs/LegacyTab';

interface TaxonomyItem {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-500',
  pending_moderation: 'bg-orange-500',
  changes_requested: 'bg-blue-500',
  approved: 'bg-emerald-500',
  approved_with_edits: 'bg-green-500',
  rejected: 'bg-red-500',
};

export const ProductReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    stores,
    products,
    selectedProduct,
    loadingStores,
    loadingProducts,
    saving,
    fetchStores,
    fetchProductsByStore,
    fetchProductDetail,
    updateProduct,
    setSelectedProduct,
  } = useProductReview();

  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Taxonomy data
  const [categories, setCategories] = useState<Category[]>([]);
  const [crafts, setCrafts] = useState<TaxonomyItem[]>([]);
  const [techniques, setTechniques] = useState<TaxonomyItem[]>([]);
  const [curatorialCategories, setCuratorialCategories] = useState<TaxonomyItem[]>([]);
  const [materials, setMaterials] = useState<TaxonomyItem[]>([]);

  // Load stores and taxonomy on mount
  useEffect(() => {
    fetchStores();
    loadTaxonomy();
  }, [fetchStores]);

  const loadTaxonomy = async () => {
    try {
      const [catsRes, craftsRes, techsRes, curatRes, matsRes] = await Promise.allSettled([
        getActiveCategories(),
        telarApi.get<TaxonomyItem[]>('/crafts'),
        telarApi.get<TaxonomyItem[]>('/techniques'),
        telarApi.get<TaxonomyItem[]>('/curatorial-categories'),
        telarApi.get<TaxonomyItem[]>('/materials'),
      ]);

      if (catsRes.status === 'fulfilled') setCategories(catsRes.value as Category[]);
      if (craftsRes.status === 'fulfilled') setCrafts(craftsRes.value.data);
      if (techsRes.status === 'fulfilled') setTechniques(techsRes.value.data);
      if (curatRes.status === 'fulfilled') setCuratorialCategories(curatRes.value.data);
      if (matsRes.status === 'fulfilled') setMaterials(matsRes.value.data);
    } catch (error) {
      console.error('Error loading taxonomy:', error);
    }
  };

  // When store changes, fetch its products
  const handleStoreChange = (storeId: string) => {
    setSelectedStoreId(storeId);
    setSelectedProduct(null);
    if (storeId) {
      fetchProductsByStore(storeId);
    }
  };

  // Build category lookup
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.categoryId && categoryMap[p.categoryId]?.toLowerCase().includes(q))
    );
  }, [products, searchQuery, categoryMap]);

  // Select product and load full detail
  const handleSelectProduct = async (productId: string) => {
    await fetchProductDetail(productId);
  };

  // Save handlers for each tab
  const handleSaveCore = async (updates: {
    name: string;
    shortDescription: string;
    history?: string;
    careNotes?: string;
    categoryId?: string;
    status?: string;
  }) => {
    if (!selectedProduct) return;
    const dto: CreateProductsNewDto = {
      productId: selectedProduct.id,
      storeId: selectedProduct.storeId,
      name: updates.name,
      shortDescription: updates.shortDescription,
      history: updates.history,
      careNotes: updates.careNotes,
      categoryId: updates.categoryId,
      status: updates.status as any,
    };
    await updateProduct(dto);
  };

  const handleSaveIdentity = async (updates: {
    artisanalIdentity: any;
    materials: any[];
  }) => {
    if (!selectedProduct) return;
    const dto: CreateProductsNewDto = {
      productId: selectedProduct.id,
      storeId: selectedProduct.storeId,
      name: selectedProduct.name,
      shortDescription: selectedProduct.shortDescription,
      artisanalIdentity: updates.artisanalIdentity,
      materials: updates.materials,
    };
    await updateProduct(dto);
  };

  const handleSavePhysical = async (updates: {
    physicalSpecs: any;
    logistics: any;
  }) => {
    if (!selectedProduct) return;
    const dto: CreateProductsNewDto = {
      productId: selectedProduct.id,
      storeId: selectedProduct.storeId,
      name: selectedProduct.name,
      shortDescription: selectedProduct.shortDescription,
      physicalSpecs: updates.physicalSpecs,
      logistics: updates.logistics,
    };
    await updateProduct(dto);
  };

  const handleSaveVariant = async (updates: {
    variants: any[];
    production?: any;
  }) => {
    if (!selectedProduct) return;
    const dto: CreateProductsNewDto = {
      productId: selectedProduct.id,
      storeId: selectedProduct.storeId,
      name: selectedProduct.name,
      shortDescription: selectedProduct.shortDescription,
      variants: updates.variants,
      production: updates.production,
    };
    await updateProduct(dto);
  };

  // Get price display from product variants
  const getPrice = (product: any): string => {
    const variant = product.variants?.[0];
    if (!variant?.basePriceMinor) return '—';
    const raw = typeof variant.basePriceMinor === 'string'
      ? parseInt(variant.basePriceMinor, 10)
      : variant.basePriceMinor;
    const pesos = raw / 100;
    return pesos >= 100 ? `$${pesos.toLocaleString()}` : `$${raw.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Revisor de Productos</h1>
            <p className="text-sm text-muted-foreground">
              Navega, revisa y edita las taxonomías de productos migrados
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Store Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="h-4 w-4" />
              Seleccionar Tienda
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStores ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando tiendas...
              </div>
            ) : (
              <select
                value={selectedStoreId}
                onChange={(e) => handleStoreChange(e.target.value)}
                className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— Selecciona una tienda —</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>

        {/* Products Table */}
        {selectedStoreId && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  {loadingProducts
                    ? 'Cargando...'
                    : `${filteredProducts.length} productos`}
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar producto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  {products.length === 0
                    ? 'Esta tienda no tiene productos migrados.'
                    : 'No se encontraron productos con ese filtro.'}
                </div>
              ) : (
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Imágenes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((p) => {
                        const isSelected = selectedProduct?.id === p.id;
                        return (
                          <TableRow
                            key={p.id}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-primary/10'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => handleSelectProduct(p.id)}
                          >
                            <TableCell className="font-medium max-w-[200px] truncate">
                              {p.name}
                            </TableCell>
                            <TableCell>
                              {p.categoryId ? (
                                <Badge variant="outline" className="text-xs">
                                  {categoryMap[p.categoryId] || '—'}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="gap-1 text-xs">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    STATUS_COLORS[p.status] || 'bg-gray-400'
                                  }`}
                                />
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{getPrice(p)}</TableCell>
                            <TableCell className="text-sm">
                              {p.variants?.[0]?.stockQuantity ?? 0}
                            </TableCell>
                            <TableCell className="text-sm">
                              {p.media?.filter((m) => m.mediaType === 'image').length || 0}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Product Detail Tabs */}
        {selectedProduct && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Editando: {selectedProduct.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="core" className="w-full">
                <TabsList className="mb-4 flex-wrap h-auto gap-1">
                  <TabsTrigger value="core">Core</TabsTrigger>
                  <TabsTrigger value="identity">Identidad Artesanal</TabsTrigger>
                  <TabsTrigger value="physical">Físico & Logística</TabsTrigger>
                  <TabsTrigger value="variant">Variante & Precio</TabsTrigger>
                  <TabsTrigger value="media">Imágenes</TabsTrigger>
                  <TabsTrigger value="legacy">Datos Legacy</TabsTrigger>
                </TabsList>

                <TabsContent value="core">
                  <CoreTab
                    product={selectedProduct}
                    categories={categories}
                    saving={saving}
                    onSave={handleSaveCore}
                  />
                </TabsContent>

                <TabsContent value="identity">
                  <IdentityTab
                    product={selectedProduct}
                    crafts={crafts}
                    techniques={techniques}
                    curatorialCategories={curatorialCategories}
                    materials={materials}
                    saving={saving}
                    onSave={handleSaveIdentity}
                  />
                </TabsContent>

                <TabsContent value="physical">
                  <PhysicalTab
                    product={selectedProduct}
                    saving={saving}
                    onSave={handleSavePhysical}
                  />
                </TabsContent>

                <TabsContent value="variant">
                  <VariantTab
                    product={selectedProduct}
                    saving={saving}
                    onSave={handleSaveVariant}
                  />
                </TabsContent>

                <TabsContent value="media">
                  <MediaTab product={selectedProduct} />
                </TabsContent>

                <TabsContent value="legacy">
                  <LegacyTab product={selectedProduct} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductReviewPage;
