import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Clock, Bell } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { NotifyWhenAvailableModal } from "./NotifyWhenAvailableModal";

interface ProductPurchaseButtonProps {
  productId: string;
  productName: string;
  canPurchase: boolean;
  stock?: number;
  quantity?: number;
  variantId?: string;
  variant?: "card" | "detail";
  className?: string;
}

export const ProductPurchaseButton = ({
  productId,
  productName,
  canPurchase,
  stock,
  quantity = 1,
  variantId,
  variant = "card",
  className = "",
}: ProductPurchaseButtonProps) => {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(productId, quantity, variantId);
  };

  const handleNotifyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  // Determinar el tipo de indisponibilidad
  const isOutOfStock = stock === 0;
  const isComingSoon = !canPurchase && (stock === undefined || stock > 0);

  // Versión para tarjeta de producto (compacta)
  if (variant === "card") {
    // PRIMERO verificar si está agotado (stock = 0)
    if (isOutOfStock) {
      return (
        <>
          <Badge 
            variant="destructive" 
            className="bg-red-500 hover:bg-red-500 text-white border-0 cursor-pointer"
            onClick={handleNotifyClick}
          >
            Agotado
          </Badge>
          <NotifyWhenAvailableModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            productId={productId}
            productName={productName}
          />
        </>
      );
    }

    // DESPUÉS verificar si puede comprarse (tiene stock y tienda lista)
    if (canPurchase) {
      return (
        <Button
          size="icon"
          className={`h-9 w-9 rounded-full ${className}`}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      );
    }

    // Por defecto: Próximamente (tiene stock pero tienda no lista)
    return (
      <Badge 
        className="bg-amber-500 hover:bg-amber-500 text-white border-0"
      >
        Próximamente
      </Badge>
    );
  }

  // Versión para página de detalle (completa)
  // PRIMERO verificar si está agotado
  if (isOutOfStock) {
    return (
      <>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Agotado</span>
            </div>
            <p className="text-sm text-red-600/80">
              Este producto no está disponible actualmente.
            </p>
          </div>
          
          <Button 
            variant="outline"
            className={`w-full h-12 ${className}`}
            onClick={handleNotifyClick}
          >
            <Bell className="mr-2 h-5 w-5" />
            Avísame cuando esté disponible
          </Button>
        </div>
        
        <NotifyWhenAvailableModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productId={productId}
          productName={productName}
        />
      </>
    );
  }

  // DESPUÉS verificar si puede comprarse
  if (canPurchase) {
    return (
      <Button 
        className={`w-full h-14 text-lg ${className}`}
        size="lg" 
        onClick={handleAddToCart}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Agregar al carrito
      </Button>
    );
  }

  // Próximamente (tiene stock pero tienda no lista)
  return (
    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
      <div className="flex items-center gap-2 text-amber-600 mb-2">
        <Clock className="w-5 h-5" />
        <span className="font-medium">Próximamente</span>
      </div>
      <p className="text-sm text-amber-600/80">
        Este producto estará disponible pronto.
      </p>
    </div>
  );
};
