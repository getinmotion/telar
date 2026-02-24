import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NeumorphicProductCard } from '@/components/shop/NeumorphicProductCard';
import { NeumorphicProductCardAlt } from '@/components/shop/NeumorphicProductCardAlt';
import { NeumorphicProductCardCompact } from '@/components/shop/NeumorphicProductCardCompact';
import { TelarLoadingAnimation } from '@/components/ui/TelarLoadingAnimation';
import { ShoppingCartProvider } from '@/contexts/ShoppingCartContext';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockProducts = [
  {
    id: '1',
    name: 'Mochila Wayúu Tradicional',
    price: 185000,
    images: ['/placeholder.svg'],
    category: 'Textiles',
  },
  {
    id: '2',
    name: 'Jarrón de Cerámica Artesanal',
    price: 95000,
    images: ['/placeholder.svg'],
    category: 'Cerámica',
  },
  {
    id: '3',
    name: 'Collar de Chaquiras',
    price: 45000,
    images: ['/placeholder.svg'],
    category: 'Joyería',
  },
];

export default function DesignShowcasePage() {
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(false);

  const handleShowLoading = () => {
    setShowLoading(true);
    setTimeout(() => setShowLoading(false), 3000);
  };

  return (
    <ShoppingCartProvider>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Design Showcase</h1>
              <p className="text-muted-foreground">
                Demostración de componentes neumórficos y animaciones
              </p>
            </div>
          </div>

          {/* Telar Loading Animation Section */}
          <Card className="neumorphic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5" />
                TelarLoadingAnimation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-8 items-end mb-6">
                <div className="text-center">
                  <TelarLoadingAnimation size="sm" />
                  <p className="text-sm text-muted-foreground mt-2">Small</p>
                </div>
                <div className="text-center">
                  <TelarLoadingAnimation size="md" />
                  <p className="text-sm text-muted-foreground mt-2">Medium</p>
                </div>
                <div className="text-center">
                  <TelarLoadingAnimation size="lg" />
                  <p className="text-sm text-muted-foreground mt-2">Large</p>
                </div>
              </div>
              
              <Button onClick={handleShowLoading} disabled={showLoading}>
                {showLoading ? 'Mostrando animación...' : 'Ver en pantalla completa (3s)'}
              </Button>

              {showLoading && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="text-center">
                    <TelarLoadingAnimation size="lg" />
                    <p className="mt-4 text-lg font-medium">Tejiendo tu experiencia...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* NeumorphicProductCard - Principal */}
          <Card className="neumorphic">
            <CardHeader>
              <CardTitle>NeumorphicProductCard (Principal)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Carrusel de imágenes, botón favorito, badge opcional
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProducts.map((product, index) => (
                  <NeumorphicProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    images={product.images}
                    category={product.category}
                    badge={index === 0 ? 'Más Vendido' : undefined}
                    onClick={() => console.log('Click:', product.name)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* NeumorphicProductCardAlt */}
          <Card className="neumorphic">
            <CardHeader>
              <CardTitle>NeumorphicProductCardAlt (Alternativo)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Logo de tienda, diseño más limpio, ideal para workbench
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProducts.map((product, index) => (
                  <NeumorphicProductCardAlt
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.images[0]}
                    shopLogo="/placeholder.svg"
                    badge={index === 1 ? 'Nuevo' : undefined}
                    onClick={() => console.log('Click:', product.name)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* NeumorphicProductCardCompact */}
          <Card className="neumorphic">
            <CardHeader>
              <CardTitle>NeumorphicProductCardCompact (Compacto)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Diseño minimalista para grids densos, hover para agregar al carrito
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mockProducts.map((product) => (
                  <NeumorphicProductCardCompact
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.images[0]}
                    onClick={() => console.log('Click:', product.name)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Neumorphic UI Elements */}
          <Card className="neumorphic">
            <CardHeader>
              <CardTitle>Elementos Neumórficos Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                <div className="neumorphic p-6 rounded-xl">
                  <p className="text-sm text-muted-foreground">Clase: neumorphic</p>
                </div>
                <div className="neumorphic-inset p-6 rounded-xl">
                  <p className="text-sm text-muted-foreground">Clase: neumorphic-inset</p>
                </div>
                <div className="neumorphic-pressed p-6 rounded-xl">
                  <p className="text-sm text-muted-foreground">Clase: neumorphic-pressed</p>
                </div>
                <button className="btn-capsule px-6 py-3">
                  Botón Cápsula
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ShoppingCartProvider>
  );
}
