import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, Shield, RotateCcw } from "lucide-react";

interface ProductSpecsProps {
  stock?: number;
  freeShipping?: boolean;
  category?: string;
  sku?: string;
}

export const ProductSpecs = ({ stock, freeShipping, category, sku }: ProductSpecsProps) => {
  return (
    <div className="space-y-6">
      {/* Specifications Table */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Especificaciones</h3>
          <div className="space-y-3">
            {category && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Categoría</span>
                <span className="font-medium">{category}</span>
              </div>
            )}
            {sku && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">SKU</span>
                <span className="font-medium">{sku}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Disponibilidad</span>
              <span className={`font-medium ${stock && stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock && stock > 0 ? `${stock} disponibles` : 'Agotado'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Envío</span>
              <span className="font-medium">{freeShipping ? 'Gratis' : 'Con costo'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Features */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-sm">Hecho a mano</h4>
            <p className="text-xs text-muted-foreground">Artesanía única</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-sm">Envío rápido</h4>
            <p className="text-xs text-muted-foreground">3-5 días hábiles</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-sm">Compra segura</h4>
            <p className="text-xs text-muted-foreground">Pago protegido</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <RotateCcw className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-semibold text-sm">Devoluciones</h4>
            <p className="text-xs text-muted-foreground">30 días</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
