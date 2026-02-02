import React, { useEffect, useState } from 'react';
import { Shield, RefreshCw, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModerationQueue } from '@/components/moderation/ModerationQueue';
import { ModerationDetailView } from '@/components/moderation/ModerationDetailView';
import { ModerationFilters } from '@/components/moderation/ModerationFilters';
import { useProductModeration, ModerationProduct, ModerationHistory } from '@/hooks/useProductModeration';

const ProductModerationPage: React.FC = () => {
  const {
    products,
    counts,
    loading,
    moderating,
    fetchModerationQueue,
    moderateProduct,
    fetchProductHistory,
  } = useProductModeration();

  const [activeFilter, setActiveFilter] = useState('pending_moderation');
  const [selectedProduct, setSelectedProduct] = useState<ModerationProduct | null>(null);
  const [productHistory, setProductHistory] = useState<ModerationHistory[]>([]);

  useEffect(() => {
    fetchModerationQueue(activeFilter);
  }, [activeFilter, fetchModerationQueue]);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductHistory(selectedProduct.id).then(setProductHistory);
    } else {
      setProductHistory([]);
    }
  }, [selectedProduct, fetchProductHistory]);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setSelectedProduct(null);
  };

  const handleSelectProduct = (product: ModerationProduct) => {
    setSelectedProduct(product);
  };

  const handleModerate = async (
    action: 'approve' | 'approve_with_edits' | 'request_changes' | 'reject',
    comment?: string,
    edits?: Record<string, any>
  ) => {
    if (!selectedProduct) return;
    
    await moderateProduct(selectedProduct.id, action, comment, edits);
    setSelectedProduct(null);
    fetchModerationQueue(activeFilter);
  };

  const handleRefresh = () => {
    fetchModerationQueue(activeFilter);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Panel de Moderación</h1>
                <p className="text-sm text-muted-foreground">
                  Revisa y aprueba productos de artesanos
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-4 border-b bg-card/50">
        <ModerationFilters
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={counts}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Cola de Productos
                  {products.length > 0 && (
                    <span className="text-muted-foreground font-normal">
                      ({products.length})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ModerationQueue
                  products={products}
                  selectedProductId={selectedProduct?.id || null}
                  onSelectProduct={handleSelectProduct}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Detail View */}
          <div className="lg:col-span-2">
            {selectedProduct ? (
              <ModerationDetailView
                product={selectedProduct}
                history={productHistory}
                onModerate={handleModerate}
                moderating={moderating}
              />
            ) : (
              <Card className="h-[calc(100vh-280px)] flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Selecciona un producto de la cola para revisarlo</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModerationPage;