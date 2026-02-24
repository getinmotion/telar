import React from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { ProductEditForm } from '@/components/shop/ProductEditForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const ProductEditPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { shop, loading } = useArtisanShop();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!shop) {
    return <Navigate to="/dashboard/create-shop" replace />;
  }

  if (!productId) {
    return <Navigate to="/dashboard/inventory" replace />;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <Helmet>
        <title>Editar Producto - {shop.shop_name}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/inventory')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Inventario
        </Button>

        <h1 className="text-3xl font-bold mb-6">Editar Producto</h1>

        <ProductEditForm
          productId={productId}
          shopId={shop.id}
        />
      </div>
    </div>
  );
};
