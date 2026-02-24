import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useInventory, Product } from '@/hooks/useInventory';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { ArrowLeft, ArrowRight, ShoppingCart, Package, Factory, Settings, RotateCcw, Check, Store, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const MOVEMENT_TYPES = [
  {
    id: 'physical_sale',
    label: 'Venta física',
    description: 'Vendí en persona o en mi local',
    icon: Store,
    type: 'OUT' as const,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'online_sale',
    label: 'Venta online',
    description: 'Pedido de mi tienda digital',
    icon: ShoppingCart,
    type: 'OUT' as const,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'production',
    label: 'Producción nueva',
    description: 'Creé más unidades',
    icon: Factory,
    type: 'IN' as const,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'adjustment',
    label: 'Ajuste de inventario',
    description: 'Conté y no coincide',
    icon: Settings,
    type: 'ADJUST' as const,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'return',
    label: 'Devolución',
    description: 'Me devolvieron producto',
    icon: RotateCcw,
    type: 'IN' as const,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
];

export const StockWizard: React.FC = () => {
  const navigate = useNavigate();
  const { shop } = useArtisanShop();
  const { fetchProducts, updateProduct } = useInventory();

  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [movementType, setMovementType] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [channel, setChannel] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      if (shop?.id) {
        const data = await fetchProducts(shop.id);
        setProducts(data);
      }
    };
    loadProducts();
  }, [shop?.id]);

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    if (!quantities[productId]) {
      setQuantities(prev => ({ ...prev, [productId]: 1 }));
    }
  };

  const updateQuantity = (productId: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.max(1, qty) }));
  };

  const handleConfirm = async () => {
    const selectedMovement = MOVEMENT_TYPES.find(m => m.id === movementType);
    if (!selectedMovement) return;

    // Aquí irían las actualizaciones de stock
    for (const productId of selectedProducts) {
      const product = products.find(p => p.id === productId);
      if (!product) continue;

      const qty = quantities[productId] || 1;
      let newInventory = product.inventory ?? 0;

      if (selectedMovement.type === 'OUT') {
        newInventory = Math.max(0, newInventory - qty);
      } else if (selectedMovement.type === 'IN') {
        newInventory = newInventory + qty;
      } else if (selectedMovement.type === 'ADJUST') {
        newInventory = qty;
      }

      await updateProduct(productId, { inventory: newInventory });
    }

    navigate('/inventario');
  };

  const canContinue = () => {
    if (step === 1) return selectedProducts.length > 0;
    if (step === 2) return movementType !== '';
    if (step === 3) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/inventario')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Gestión de Stock Guiada</h1>
              <p className="text-sm text-muted-foreground">
                Paso {step} de 3
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-2 flex-1 rounded-full transition-colors",
                  s <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* PASO 1: Selección de Productos */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Selecciona los productos</h2>
                <p className="text-muted-foreground">
                  Elige uno o más productos para ajustar su stock
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((product) => {
                  const images = Array.isArray(product.images) ? product.images : [];
                  const firstImage = images[0] || '/placeholder.svg';
                  const isSelected = selectedProducts.includes(product.id);

                  return (
                    <Card
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      className={cn(
                        "p-4 cursor-pointer transition-all hover:shadow-lg",
                        isSelected && "ring-2 ring-primary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={firstImage}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Stock: {product.inventory ?? 0} unidades
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO 2: Tipo de Movimiento */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">¿Qué tipo de movimiento?</h2>
                <p className="text-muted-foreground">
                  Selecciona la razón del ajuste de stock
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MOVEMENT_TYPES.map((movement) => (
                  <button
                    key={movement.id}
                    onClick={() => setMovementType(movement.id)}
                    className={cn(
                      "p-6 rounded-xl border-2 transition-all text-left",
                      movementType === movement.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3", movement.bgColor)}>
                      <movement.icon className={cn("w-6 h-6", movement.color)} />
                    </div>
                    <h3 className="font-semibold mb-1">{movement.label}</h3>
                    <p className="text-sm text-muted-foreground">{movement.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO 3: Detalles y Confirmación */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Confirma los detalles</h2>
                <p className="text-muted-foreground">
                  Revisa y ajusta las cantidades antes de guardar
                </p>
              </div>

              {/* Productos seleccionados con cantidades */}
              <div className="space-y-3">
                {selectedProducts.map((productId) => {
                  const product = products.find(p => p.id === productId);
                  if (!product) return null;

                  const images = Array.isArray(product.images) ? product.images : [];
                  const firstImage = images[0] || '/placeholder.svg';
                  const qty = quantities[productId] || 1;

                  return (
                    <Card key={productId} className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Stock actual: {product.inventory ?? 0}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Cantidad:</Label>
                          <Input
                            type="number"
                            min="1"
                            value={qty}
                            onChange={(e) => updateQuantity(productId, parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Canal (solo para ventas) */}
              {(movementType === 'physical_sale' || movementType === 'online_sale') && (
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
                          "p-3 rounded-lg border text-left transition-colors flex items-center gap-2",
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
                <Label>Notas (opcional)</Label>
                <Textarea
                  placeholder="Información adicional sobre este movimiento..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Resumen */}
              <Card className="p-4 bg-muted/30">
                <h3 className="font-semibold mb-3">Resumen de cambios</h3>
                <div className="space-y-2">
                  {selectedProducts.map((productId) => {
                    const product = products.find(p => p.id === productId);
                    if (!product) return null;

                    const qty = quantities[productId] || 1;
                    const selectedMovement = MOVEMENT_TYPES.find(m => m.id === movementType);
                    let newStock = product.inventory ?? 0;

                    if (selectedMovement?.type === 'OUT') {
                      newStock = Math.max(0, newStock - qty);
                    } else if (selectedMovement?.type === 'IN') {
                      newStock = newStock + qty;
                    } else if (selectedMovement?.type === 'ADJUST') {
                      newStock = qty;
                    }

                    return (
                      <div key={productId} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{product.name}</span>
                        <span className="font-medium">
                          {product.inventory ?? 0} → {newStock} unidades
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canContinue()}
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleConfirm}>
              <Check className="w-4 h-4 mr-2" />
              Confirmar y Guardar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
