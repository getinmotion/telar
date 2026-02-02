import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface StockBadgeProps {
  inventory: number;
  className?: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ inventory, className }) => {
  const getStockInfo = () => {
    if (inventory === 0) {
      return {
        label: 'Agotado',
        variant: 'destructive' as const,
        icon: XCircle
      };
    } else if (inventory <= 3) {
      return {
        label: `¡Solo ${inventory} disponibles!`,
        variant: 'warning' as const,
        icon: AlertTriangle
      };
    } else if (inventory <= 10) {
      return {
        label: 'Pocas unidades',
        variant: 'warning' as const,
        icon: Clock
      };
    } else {
      return {
        label: 'En stock',
        variant: 'success' as const,
        icon: CheckCircle
      };
    }
  };

  const stockInfo = getStockInfo();
  const Icon = stockInfo.icon;

  return (
    <Badge variant={stockInfo.variant} className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {stockInfo.label}
    </Badge>
  );
};