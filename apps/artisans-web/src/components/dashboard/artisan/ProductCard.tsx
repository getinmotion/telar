import React from 'react';
import { Edit, TrendingUp, Package, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  id: string;
  name: string;
  image?: string;
  price?: number;
  stock?: number;
  status: 'active' | 'draft' | 'low-stock' | 'out-of-stock';
  onEdit?: (id: string) => void;
  onViewStats?: (id: string) => void;
  workbenchMode?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  image,
  price,
  stock = 0,
  status,
  onEdit,
  onViewStats,
  workbenchMode = false
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return { label: 'En venta', color: 'bg-success', textColor: 'text-success-foreground' };
      case 'low-stock':
        return { label: 'Bajo stock', color: 'bg-warning', textColor: 'text-warning-foreground' };
      case 'out-of-stock':
        return { label: 'Sin stock', color: 'bg-destructive', textColor: 'text-destructive-foreground' };
      case 'draft':
        return { label: 'Borrador', color: 'bg-muted', textColor: 'text-muted-foreground' };
      default:
        return { label: 'Desconocido', color: 'bg-muted', textColor: 'text-muted-foreground' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card
      variant="neumorphic"
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        workbenchMode && "hover:rotate-1 hover:scale-105"
      )}
    >
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-background to-muted rounded-2xl">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        {/* Floating Status Badge */}
        <Badge
          className={cn(
            "absolute top-3 right-3 font-semibold shadow-neumorphic",
            statusConfig.color,
            statusConfig.textColor
          )}
        >
          {statusConfig.label}
        </Badge>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit?.(id)}
            className="shadow-neumorphic"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onViewStats?.(id)}
            className="shadow-neumorphic"
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Stats
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg text-foreground mb-3 line-clamp-1">
          {name}
        </h3>

        {/* Price & Stock */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" />
            <span className="text-lg font-bold text-foreground">
              {price ? `$${price.toLocaleString()}` : 'Sin precio'}
            </span>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 text-sm font-medium",
            stock > 10 ? 'text-success' : stock > 0 ? 'text-warning' : 'text-destructive'
          )}>
            <Package className="w-4 h-4" />
            <span>{stock} unid.</span>
          </div>
        </div>
      </div>

      {/* Workbench Mode: Decorative "Sketch" Lines */}
      {workbenchMode && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-muted to-transparent opacity-50" />
      )}
    </Card>
  );
};
