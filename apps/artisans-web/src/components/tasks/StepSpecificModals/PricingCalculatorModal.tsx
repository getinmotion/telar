/**
 * Pricing Calculator Modal - FASE 5
 * Modal especializado para steps de cálculo de precios
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, DollarSign } from 'lucide-react';

interface PricingCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (pricingData: any) => void;
  stepTitle: string;
}

export const PricingCalculatorModal: React.FC<PricingCalculatorModalProps> = ({
  open,
  onClose,
  onComplete,
  stepTitle
}) => {
  const [costs, setCosts] = useState({
    materials: 0,
    labor: 0,
    overhead: 0,
    margin: 30
  });

  const totalCost = costs.materials + costs.labor + costs.overhead;
  const finalPrice = totalCost * (1 + costs.margin / 100);

  const handleComplete = () => {
    onComplete({
      costs,
      totalCost,
      finalPrice,
      stepCompleted: stepTitle
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Calculadora de Precios
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Costo de Materiales</Label>
            <Input
              type="number"
              value={costs.materials}
              onChange={(e) => setCosts(prev => ({ ...prev, materials: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>

          <div>
            <Label>Costo de Mano de Obra</Label>
            <Input
              type="number"
              value={costs.labor}
              onChange={(e) => setCosts(prev => ({ ...prev, labor: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>

          <div>
            <Label>Gastos Generales</Label>
            <Input
              type="number"
              value={costs.overhead}
              onChange={(e) => setCosts(prev => ({ ...prev, overhead: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>

          <div>
            <Label>Margen de Ganancia (%)</Label>
            <Input
              type="number"
              value={costs.margin}
              onChange={(e) => setCosts(prev => ({ ...prev, margin: Number(e.target.value) }))}
              placeholder="30"
            />
          </div>

          <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Costo Total:</span>
              <span className="font-semibold">${totalCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">Precio Sugerido:</span>
              <span className="text-xl font-bold text-primary flex items-center gap-1">
                <DollarSign className="w-5 h-5" />
                {finalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <Button onClick={handleComplete} className="w-full">
            Aplicar Precio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};