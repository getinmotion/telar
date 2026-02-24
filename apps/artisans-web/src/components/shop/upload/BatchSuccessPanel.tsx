import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Plus, Package, Store, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompletedProduct {
  id: string;
  name: string;
  image: string;
  status: 'completed' | 'error';
  error?: string;
}

interface BatchSuccessPanelProps {
  completedProducts: CompletedProduct[];
  completedCount: number;
  errorCount: number;
  onUploadMore: () => void;
}

export const BatchSuccessPanel: React.FC<BatchSuccessPanelProps> = ({
  completedProducts,
  completedCount,
  errorCount,
  onUploadMore,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-6 bg-gradient-subtle border-primary/20">
        {/* Summary Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          
          <h3 className="text-2xl font-bold mb-2">
            ¡Lote Procesado!
          </h3>
          
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="font-medium">{completedCount} productos publicados</span>
            </div>
            
            {errorCount > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="font-medium">{errorCount} con errores</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <Button
            onClick={() => navigate('/dashboard/inventory')}
            className="bg-gradient-primary hover:shadow-glow transition-all"
          >
            <Package className="w-4 h-4 mr-2" />
            Ver todos en inventario
          </Button>

          <Button
            onClick={onUploadMore}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Subir más productos
          </Button>

          <Button
            onClick={() => navigate('/mi-tienda')}
            variant="outline"
          >
            <Store className="w-4 h-4 mr-2" />
            Ver tienda pública
          </Button>
        </div>

        {/* Products List */}
        {completedProducts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">
              Productos publicados:
            </h4>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {completedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                >
                  {/* Product Image */}
                  <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{product.name}</p>
                    {product.status === 'error' && product.error && (
                      <p className="text-xs text-destructive truncate">{product.error}</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  {product.status === 'completed' ? (
                    <>
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Publicado
                      </Badge>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/productos/editar/${product.id}`)}
                        className="flex-shrink-0"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    </>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Error
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
