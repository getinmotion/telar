import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useInventory, InventoryMovement } from '@/hooks/useInventory';
import { Package, Plus, Minus, TrendingUp, TrendingDown, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslations } from '@/hooks/useTranslations';

interface StockManagerProps {
  variantId: string;
  currentStock: number;
  minStock?: number;
  onStockChange?: (newStock: number) => void;
  showHistory?: boolean;
}

export const StockManager: React.FC<StockManagerProps> = ({
  variantId,
  currentStock,
  minStock = 5,
  onStockChange,
  showHistory = true,
}) => {
  const { t } = useTranslations();
  const { adjustStock, fetchMovements, loading } = useInventory();
  const [localStock, setLocalStock] = useState(currentStock);
  const [localMinStock, setLocalMinStock] = useState(minStock);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [adjustmentType, setAdjustmentType] = useState<'IN' | 'OUT' | 'ADJUST'>('IN');
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    setLocalStock(currentStock);
  }, [currentStock]);

  useEffect(() => {
    if (showHistory) {
      loadMovements();
    }
  }, [variantId, showHistory]);

  const loadMovements = async () => {
    const data = await fetchMovements(variantId);
    setMovements(data);
  };

  const handleQuickAdjustment = async (amount: number) => {
    const type = amount > 0 ? 'IN' : 'OUT';
    const qty = Math.abs(amount);
    const success = await adjustStock(variantId, qty, type, 'Ajuste rápido');
    
    if (success) {
      const newStock = localStock + amount;
      setLocalStock(newStock);
      onStockChange?.(newStock);
      await loadMovements();
    }
  };

  const handleManualAdjustment = async () => {
    const qty = parseInt(adjustmentQty);
    if (isNaN(qty) || qty <= 0) {
      return;
    }

    const success = await adjustStock(variantId, qty, adjustmentType, reason || undefined);
    
    if (success) {
      let newStock = localStock;
      if (adjustmentType === 'IN') {
        newStock += qty;
      } else if (adjustmentType === 'OUT') {
        newStock -= qty;
      } else {
        newStock = qty;
      }
      
      setLocalStock(newStock);
      onStockChange?.(newStock);
      setAdjustmentQty('');
      setReason('');
      await loadMovements();
    }
  };

  const getStockStatus = () => {
    if (localStock === 0) return { color: 'text-destructive', label: 'Sin stock', icon: AlertTriangle };
    if (localStock < localMinStock) return { color: 'text-orange-600', label: 'Stock bajo', icon: AlertTriangle };
    return { color: 'text-success', label: 'Stock disponible', icon: Package };
  };

  const status = getStockStatus();
  const StatusIcon = status.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Gestión de Stock</CardTitle>
          </div>
          <Badge variant="outline" className={status.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Stock Display */}
        <div className="space-y-3">
          <Label>Stock Actual</Label>
          <div className="flex items-center justify-center gap-4 p-6 bg-muted/50 rounded-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdjustment(-10)}
              disabled={loading || localStock < 10}
            >
              -10
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdjustment(-1)}
              disabled={loading || localStock < 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="text-center min-w-[120px]">
              <div className={`text-4xl font-bold ${status.color}`}>
                {localStock}
              </div>
              <div className="text-sm text-muted-foreground">unidades</div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdjustment(1)}
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdjustment(10)}
              disabled={loading}
            >
              +10
            </Button>
          </div>
        </div>

        {/* Minimum Stock */}
        <div className="space-y-2">
          <Label htmlFor="minStock">Stock Mínimo (alerta de reabastecimiento)</Label>
          <Input
            id="minStock"
            type="number"
            value={localMinStock}
            onChange={(e) => setLocalMinStock(parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>

        {/* Manual Adjustment */}
        <div className="space-y-3 pt-4 border-t">
          <Label>Ajuste Manual de Stock</Label>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="adjustmentType">Tipo</Label>
              <Select value={adjustmentType} onValueChange={(value: any) => setAdjustmentType(value)}>
                <SelectTrigger id="adjustmentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Entrada
                    </div>
                  </SelectItem>
                  <SelectItem value="OUT">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      Salida
                    </div>
                  </SelectItem>
                  <SelectItem value="ADJUST">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-blue-600" />
                      Ajuste
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustmentQty">Cantidad</Label>
              <Input
                id="adjustmentQty"
                type="number"
                value={adjustmentQty}
                onChange={(e) => setAdjustmentQty(e.target.value)}
                min={1}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Razón</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          <Button 
            onClick={handleManualAdjustment}
            disabled={loading || !adjustmentQty}
            className="w-full"
          >
            Aplicar Ajuste
          </Button>
        </div>

        {/* Movement History */}
        {showHistory && movements.length > 0 && (
          <Accordion type="single" collapsible className="border-t pt-4">
            <AccordionItem value="history" className="border-none">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Historial de Movimientos ({movements.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 mt-2">
                  {movements.map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-3">
                        {movement.type === 'IN' && (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        )}
                        {movement.type === 'OUT' && (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        {movement.type === 'ADJUST' && (
                          <RefreshCw className="h-4 w-4 text-blue-600" />
                        )}
                        
                        <div>
                          <div className="font-medium">
                            {movement.type === 'IN' && '+'}
                            {movement.type === 'OUT' && '-'}
                            {movement.qty} unidades
                            {movement.type === 'ADJUST' && ' (ajuste)'}
                          </div>
                          {movement.reason && (
                            <div className="text-xs text-muted-foreground">
                              {movement.reason}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(movement.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};
