import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/useInventory';
import { Search, ShoppingCart, Package, Plus, Minus, Store, MessageSquare, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSave: (productId: string, change: number, channel: string, notes: string) => Promise<void>;
}

export const QuickStockModal: React.FC<QuickStockModalProps> = ({
  open,
  onOpenChange,
  products,
  onSave
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<'sale' | 'entry'>('sale');
  const [quantity, setQuantity] = useState(1);
  const [channel, setChannel] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuickAmount = (amount: number) => {
    setQuantity(Math.max(1, amount));
  };

  const handleSave = async () => {
    if (!selectedProduct) return;

    setSaving(true);
    try {
      const change = movementType === 'sale' ? -quantity : quantity;
      await onSave(selectedProduct.id, change, channel, notes);
      
      // Reset form
      setSelectedProduct(null);
      setQuantity(1);
      setChannel('');
      setNotes('');
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  // Reset cuando se cierra
  useEffect(() => {
    if (!open) {
      setSelectedProduct(null);
      setSearchQuery('');
      setMovementType('sale');
      setQuantity(1);
      setChannel('');
      setNotes('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Registrar Movimiento Rápido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Búsqueda de producto */}
          {!selectedProduct ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {filteredProducts.map((product) => {
                  const images = Array.isArray(product.images) ? product.images : [];
                  const firstImage = images[0] || '/placeholder.svg';

                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors flex items-center gap-3"
                    >
                      <img
                        src={firstImage}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Stock actual: {product.inventory ?? 0} unidades
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Producto seleccionado */}
              <div className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                {(() => {
                  const images = Array.isArray(selectedProduct.images) ? selectedProduct.images : [];
                  const firstImage = images[0] || '/placeholder.svg';
                  return (
                    <img
                      src={firstImage}
                      alt={selectedProduct.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  );
                })()}
                <div className="flex-1">
                  <p className="font-semibold">{selectedProduct.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Stock actual: <span className="font-medium text-foreground">{selectedProduct.inventory ?? 0}</span> unidades
                  </p>
                </div>
              </div>

              {/* Tipo de movimiento */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMovementType('sale')}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-center",
                    movementType === 'sale'
                      ? "border-destructive bg-destructive/10"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <ShoppingCart className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-semibold text-sm">VENTA</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAmount(1);
                      }}
                      className="h-7 px-2"
                    >
                      -1
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAmount(5);
                      }}
                      className="h-7 px-2"
                    >
                      -5
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAmount(10);
                      }}
                      className="h-7 px-2"
                    >
                      -10
                    </Button>
                  </div>
                </button>

                <button
                  onClick={() => setMovementType('entry')}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-center",
                    movementType === 'entry'
                      ? "border-success bg-success/10"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <Package className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-semibold text-sm">ENTRADA</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAmount(1);
                      }}
                      className="h-7 px-2"
                    >
                      +1
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAmount(5);
                      }}
                      className="h-7 px-2"
                    >
                      +5
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAmount(10);
                      }}
                      className="h-7 px-2"
                    >
                      +10
                    </Button>
                  </div>
                </button>
              </div>

              {/* Cantidad */}
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Canal de venta (solo para ventas) */}
              {movementType === 'sale' && (
                <div className="space-y-2">
                  <Label>Canal de venta</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'fisica', label: 'Tienda física', icon: Store },
                      { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                      { value: 'feria', label: 'Feria/Evento', icon: Calendar },
                      { value: 'online', label: 'Tienda Online', icon: ShoppingCart }
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setChannel(value)}
                        className={cn(
                          "p-2 rounded-lg border text-left transition-colors flex items-center gap-2",
                          channel === value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              <div className="space-y-2">
                <Label>Nota (opcional)</Label>
                <Textarea
                  placeholder="Ej: Cliente Juan Pérez, Feria Expoartesanías..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Resumen */}
              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Nuevo stock:</span>{' '}
                  <span className="font-semibold">
                    {(selectedProduct.inventory ?? 0) + (movementType === 'sale' ? -quantity : quantity)}
                  </span>{' '}
                  unidades
                </p>
                <p className="text-xs text-muted-foreground">
                  {movementType === 'sale' ? `Vendiendo ${quantity}` : `Agregando ${quantity}`} unidad{quantity !== 1 ? 'es' : ''}
                </p>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1"
                >
                  Cambiar Producto
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || (movementType === 'sale' && !channel)}
                  className="flex-1"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Guardar Movimiento
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
