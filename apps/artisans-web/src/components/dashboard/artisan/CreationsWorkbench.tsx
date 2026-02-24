import React, { useState } from 'react';
import { Plus, Grid3x3, List, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NeumorphicProductCardAlt } from '@/components/shop/NeumorphicProductCardAlt';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  image?: string;
  price?: number;
  stock?: number;
  status: 'active' | 'draft' | 'low-stock' | 'out-of-stock';
}

interface CreationsWorkbenchProps {
  products?: Product[];
  onAddProduct?: () => void;
}

export const CreationsWorkbench: React.FC<CreationsWorkbenchProps> = ({
  products = [],
  onAddProduct
}) => {
  const [viewMode, setViewMode] = useState<'gallery' | 'table'>('gallery');
  const navigate = useNavigate();

  const handleEditProduct = (id: string) => {
    navigate(`/productos/editar/${id}`);
  };

  const handleViewStats = (id: string) => {
    navigate(`/productos/${id}/estadisticas`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">
            🎨 Tus Creaciones
          </h2>
          <p className="text-gray-600 mt-1">
            Cada pieza cuenta tu historia
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'gallery' ? 'default' : 'ghost'}
              onClick={() => setViewMode('gallery')}
              className={cn(
                "h-8",
                viewMode === 'gallery' && "bg-gradient-to-r from-neon-green-400 to-neon-green-600 text-white hover:from-neon-green-500 hover:to-neon-green-700"
              )}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              onClick={() => setViewMode('table')}
              className={cn(
                "h-8",
                viewMode === 'table' && "bg-gradient-to-r from-neon-green-400 to-neon-green-600 text-white hover:from-neon-green-500 hover:to-neon-green-700"
              )}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Add Product Button */}
          <Button
            onClick={onAddProduct}
            className="bg-gradient-to-r from-neon-green-400 to-neon-green-600 text-white hover:from-neon-green-500 hover:to-neon-green-700 shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Pieza
          </Button>
        </div>
      </div>

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-neon-green-200 rounded-2xl p-12 text-center shadow-float hover:shadow-hover transition-all duration-300">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-neon-green-100 rounded-full mb-4">
            <Package className="w-10 h-10 text-neon-green-600" />
          </div>
          <h3 className="text-xl font-bold text-charcoal mb-2">
            Tu mesa de trabajo está lista
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Comienza añadiendo tu primera creación artesanal. Cada producto es una obra única.
          </p>
          <Button
            onClick={onAddProduct}
            size="lg"
            className="bg-gradient-to-r from-neon-green-400 to-neon-green-600 text-white hover:from-neon-green-500 hover:to-neon-green-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear Primera Pieza
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'gallery' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
            viewMode === 'table' && "space-y-4"
          )}
        >
          {products.map((product) => (
            <NeumorphicProductCardAlt
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price || 0}
              image={product.image || '/placeholder.svg'}
              badge={product.status === 'low-stock' ? 'Bajo Stock' : product.status === 'out-of-stock' ? 'Agotado' : undefined}
              onClick={() => handleEditProduct(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
