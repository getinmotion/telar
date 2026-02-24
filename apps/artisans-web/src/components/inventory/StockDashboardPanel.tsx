import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/useInventory';
import { Package, AlertTriangle, XCircle, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface StockDashboardPanelProps {
  products: Product[];
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const StockDashboardPanel: React.FC<StockDashboardPanelProps> = ({ products }) => {
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => (p.inventory ?? 0) > 0 && (p.inventory ?? 0) <= 5);
  const outOfStockProducts = products.filter(p => (p.inventory ?? 0) === 0);
  const totalInventoryValue = products.reduce((sum, p) => {
    return sum + ((p.inventory ?? 0) * p.price);
  }, 0);

  const stats = [
    {
      label: 'Total Productos',
      value: totalProducts,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Bajo Stock',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Sin Stock',
      value: outOfStockProducts.length,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Valor Inventario',
      value: formatCurrency(totalInventoryValue),
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
      isValue: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.isValue ? stat.value : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alertas de Stock */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="font-semibold">Alertas de Stock</h3>
          </div>
          
          <div className="space-y-2">
            {outOfStockProducts.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/20"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {(() => {
                    const images = Array.isArray(product.images) ? product.images : [];
                    const firstImage = images[0] || '/placeholder.svg';
                    return (
                      <img
                        src={firstImage}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Sin stock</p>
                  </div>
                </div>
                <Badge variant="destructive" className="ml-2">
                  <XCircle className="w-3 h-3 mr-1" />
                  Agotado
                </Badge>
              </div>
            ))}

            {lowStockProducts.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-2 rounded-lg bg-warning/5 border border-warning/20"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {(() => {
                    const images = Array.isArray(product.images) ? product.images : [];
                    const firstImage = images[0] || '/placeholder.svg';
                    return (
                      <img
                        src={firstImage}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Solo quedan {product.inventory} unidades
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2 border-warning text-warning">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Bajo
                </Badge>
              </div>
            ))}

            {(lowStockProducts.length + outOfStockProducts.length) > 6 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{(lowStockProducts.length + outOfStockProducts.length) - 6} alertas más
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
