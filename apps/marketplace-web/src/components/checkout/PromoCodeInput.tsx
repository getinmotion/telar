import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { usePromotions, PromoValidationResult } from '@/hooks/usePromotions';
import { Tag, X, Loader2, Check, Gift } from 'lucide-react';
import { toast } from 'sonner';

const MAX_PROMOS = 3;

interface PromoCodeInputProps {
  cartTotal: number;
  hasOnlyGiftCards?: boolean;
  userId?: string;
  userEmail?: string;
  onPromosChanged: (promos: PromoValidationResult[]) => void;
  appliedPromos: PromoValidationResult[];
}

export const PromoCodeInput = ({ 
  cartTotal, 
  hasOnlyGiftCards = false,
  userId,
  userEmail, 
  onPromosChanged, 
  appliedPromos 
}: PromoCodeInputProps) => {
  const [code, setCode] = useState('');
  const { validatePromoCode, isValidating } = usePromotions();

  const fmt = (v: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(v);

  // Calcular el total después de descuentos ya aplicados
  const getCurrentTotal = () => {
    return appliedPromos.reduce((total, promo) => total - promo.discount_amount, cartTotal);
  };

  // Suma total de descuentos
  const totalDiscount = appliedPromos.reduce((sum, promo) => sum + promo.discount_amount, 0);

  const handleApply = async () => {
    if (!code.trim()) return;

    const upperCode = code.trim().toUpperCase();
    
    // Verificar si ya está aplicado
    if (appliedPromos.some(p => p.code === upperCode)) {
      toast.error('Este código ya está aplicado');
      return;
    }

    // Verificar límite
    if (appliedPromos.length >= MAX_PROMOS) {
      toast.error(`Máximo ${MAX_PROMOS} códigos permitidos`);
      return;
    }

    // Verificar que haya productos válidos para aplicar descuento
    const currentTotal = getCurrentTotal();
    if (currentTotal <= 0) {
      if (hasOnlyGiftCards) {
        toast.error('Los cupones no aplican a Gift Cards', {
          description: 'Los descuentos solo aplican a productos artesanales'
        });
      } else if (cartTotal <= 0) {
        toast.error('Carrito vacío', {
          description: 'Agrega productos para aplicar códigos promocionales'
        });
      } else {
        toast.error('Total insuficiente', {
          description: 'El descuento ya cubre el total de productos'
        });
      }
      return;
    }

    const result = await validatePromoCode(upperCode, currentTotal, userId, userEmail);
    
    if (result.valid) {
      const newPromo = { ...result, code: upperCode };
      onPromosChanged([...appliedPromos, newPromo]);
      toast.success('¡Código aplicado!', { description: result.message });
      setCode('');
    } else {
      toast.error('Código no aplicable', { description: result.message });
    }
  };

  const handleRemove = (codeToRemove: string) => {
    const newPromos = appliedPromos.filter(p => p.code !== codeToRemove);
    onPromosChanged(newPromos);
    toast.info('Código removido');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  const canAddMore = appliedPromos.length < MAX_PROMOS;

  return (
    <Card>
      <CardHeader className="p-4 md:p-6 pb-2">
        <h2 className="text-sm md:text-base font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" />
          ¿Tienes cupones o Gift Cards? (máx. {MAX_PROMOS})
        </h2>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-2 space-y-3">
        {/* Lista de códigos aplicados */}
        {appliedPromos.length > 0 && (
          <div className="space-y-2">
            {appliedPromos.map((promo) => (
              <div 
                key={promo.code} 
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {promo.type === 'gift_card' ? (
                    <Gift className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-green-700 dark:text-green-400 text-sm truncate">
                      {promo.code}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">
                      {promo.type === 'gift_card' ? 'Gift Card' : 'Cupón'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-green-600 text-sm whitespace-nowrap">
                    -{fmt(promo.discount_amount)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemove(promo.code!)}
                    className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Saldos restantes de gift cards */}
            {appliedPromos.some(p => p.type === 'gift_card' && p.remaining_balance !== undefined) && (
              <div className="text-xs text-muted-foreground space-y-1 pt-1">
                {appliedPromos
                  .filter(p => p.type === 'gift_card' && p.remaining_balance !== undefined)
                  .map(p => (
                    <div key={`balance-${p.code}`} className="flex justify-between">
                      <span>Saldo restante {p.code}:</span>
                      <span>{fmt(p.remaining_balance!)}</span>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Total de descuentos */}
            {appliedPromos.length > 1 && (
              <div className="flex justify-between pt-2 border-t border-green-200 dark:border-green-800">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Total descuentos:
                </span>
                <span className="text-sm font-bold text-green-600">
                  -{fmt(totalDiscount)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Campo de entrada - visible si hay espacio para más códigos */}
        {canAddMore ? (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder={appliedPromos.length > 0 ? "Agregar otro código" : "Ingresa tu código"}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                className="uppercase h-10"
                disabled={isValidating}
              />
            </div>
            <Button 
              onClick={handleApply} 
              disabled={isValidating || !code.trim()} 
              variant="secondary"
              className="h-10"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Aplicar'
              )}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-1">
            Límite de {MAX_PROMOS} códigos alcanzado
          </p>
        )}
      </CardContent>
    </Card>
  );
};
