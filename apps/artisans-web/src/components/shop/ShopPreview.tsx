import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

interface ShopPreviewProps {
  primaryColors?: string[];
  secondaryColors?: string[];
  logoUrl?: string | null;
  brandClaim?: string | null;
  shopName?: string;
}

export const ShopPreview: React.FC<ShopPreviewProps> = ({
  primaryColors = ['#6366f1'],
  secondaryColors = ['#8b5cf6'],
  logoUrl,
  brandClaim,
  shopName = 'Mi Tienda'
}) => {
  const primaryColor = primaryColors[0] || '#6366f1';
  const secondaryColor = secondaryColors[0] || '#8b5cf6';

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        Vista previa de cómo se verá tu tienda con estos colores:
      </div>

      {/* Hero Preview */}
      <Card className="overflow-hidden">
        <div 
          className="relative h-64 p-8 flex flex-col justify-center items-center text-primary-foreground"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
          }}
        >
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-16 w-16 object-contain mb-4 bg-background/10 backdrop-blur-sm rounded-lg p-2"
            />
          )}
          <h2 className="text-3xl font-bold text-center mb-2">
            {shopName}
          </h2>
          {brandClaim && (
            <p className="text-lg text-center text-primary-foreground/90 mb-4">
              {brandClaim}
            </p>
          )}
          <Button 
            className="shadow-lg bg-background/20 hover:bg-background/30 text-primary-foreground border-0"
            style={{
              backgroundColor: secondaryColor
            }}
          >
            Ver Productos
          </Button>
        </div>
      </Card>

      {/* Product Card Preview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow">
          <div 
            className="h-40 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`
            }}
          >
            <ShoppingBag 
              className="w-16 h-16 opacity-20" 
              style={{ color: primaryColor }}
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold mb-1">Producto Ejemplo</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Artesanía hecha a mano
            </p>
            <div className="flex items-center justify-between">
              <span className="font-bold" style={{ color: primaryColor }}>
                $50.000
              </span>
              <Button 
                size="sm"
                style={{
                  backgroundColor: primaryColor,
                  color: 'white'
                }}
              >
                Ver
              </Button>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow">
          <div 
            className="h-40 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${secondaryColor}20, ${primaryColor}20)`
            }}
          >
            <ShoppingBag 
              className="w-16 h-16 opacity-20" 
              style={{ color: secondaryColor }}
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold mb-1">Producto Ejemplo</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Diseño único
            </p>
            <div className="flex items-center justify-between">
              <span className="font-bold" style={{ color: secondaryColor }}>
                $75.000
              </span>
              <Button 
                size="sm"
                style={{
                  backgroundColor: secondaryColor,
                  color: 'white'
                }}
              >
                Ver
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Buttons Preview */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Botones y elementos UI:</h3>
        <div className="flex flex-wrap gap-3">
          <Button 
            style={{
              backgroundColor: primaryColor,
              color: 'white'
            }}
          >
            Botón Primario
          </Button>
          <Button 
            style={{
              backgroundColor: secondaryColor,
              color: 'white'
            }}
          >
            Botón Secundario
          </Button>
          <Button 
            variant="outline"
            style={{
              borderColor: primaryColor,
              color: primaryColor
            }}
          >
            Botón Outline
          </Button>
        </div>
      </Card>
    </div>
  );
};
