import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Tag, Gift, Check, X } from "lucide-react";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useCart } from "@/contexts/CartContext";

interface PromoCodeInputProps {
  cartTotal: number;
}

export const PromoCodeInput = ({ cartTotal }: PromoCodeInputProps) => {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { promo, validatePromoCode, clearPromo } = useCheckout();
  const { nonGiftCardTotal } = useCart();

  const fmt = (v: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(v);

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setIsValidating(true);
    // Usar nonGiftCardTotal para excluir gift cards del cálculo de descuento
    await validatePromoCode(code.trim(), nonGiftCardTotal);
    setIsValidating(false);
  };

  const handleClear = () => {
    setCode("");
    clearPromo();
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-medium flex items-center gap-2">
          <Tag className="h-5 w-5" />
          ¿Tienes un cupón de descuento o una Gift Card?
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {!promo ? (
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="promo-code" className="sr-only">Código promocional</Label>
              <Input
                id="promo-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ingresa tu código"
                className="uppercase"
                disabled={isValidating}
              />
            </div>
            <Button 
              onClick={handleApply} 
              disabled={isValidating || !code.trim()}
              variant="secondary"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Aplicar"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Código aplicado */}
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                {promo.type === 'GIFTCARD' ? (
                  <Gift className="h-5 w-5 text-green-600" />
                ) : (
                  <Check className="h-5 w-5 text-green-600" />
                )}
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">
                    {promo.code}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-500">
                    {promo.type === 'GIFTCARD' ? 'Gift Card' : 'Cupón'} aplicado
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleClear}
                className="h-8 w-8 text-green-600 hover:text-green-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Detalles del descuento */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descuento aplicado:</span>
                <span className="font-medium text-green-600">-{fmt(promo.discountAmount)}</span>
              </div>
              
              {promo.type === 'GIFTCARD' && promo.remainingBalance !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo restante en tu Gift Card:</span>
                  <span className="font-medium">{fmt(promo.remainingBalance)}</span>
                </div>
              )}
            </div>

            {promo.message && (
              <p className="text-sm text-muted-foreground italic">
                {promo.message}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
