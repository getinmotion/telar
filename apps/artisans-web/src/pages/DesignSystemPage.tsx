import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Palette, Sparkles, Box, Type } from 'lucide-react';

const DesignSystemPage = () => {
  const colors = [
    { name: 'Primary', value: 'hsl(220 50% 15%)', class: 'bg-primary', text: 'Navy Blue #142239' },
    { name: 'Primary Glow', value: 'hsl(220 45% 25%)', class: 'bg-[hsl(220_45%_25%)]', text: 'Navy Claro' },
    { name: 'Primary Subtle', value: 'hsl(220 30% 96%)', class: 'bg-[hsl(220_30%_96%)]', text: 'Navy Muy Claro' },
    { name: 'Secondary', value: 'hsl(45 100% 54%)', class: 'bg-secondary', text: 'Golden Yellow #ffc716' },
    { name: 'Secondary Glow', value: 'hsl(45 95% 64%)', class: 'bg-[hsl(45_95%_64%)]', text: 'Golden Claro' },
    { name: 'Accent', value: 'hsl(20 89% 66%)', class: 'bg-accent', text: 'Coral #f48c5f' },
    { name: 'Background', value: 'hsl(40 50% 98%)', class: 'bg-background', text: 'Cream #fcf7ec' },
    { name: 'Success', value: 'hsl(142 76% 36%)', class: 'bg-success', text: 'Verde Éxito' },
  ];

  const gradients = [
    { name: 'Primary', class: 'bg-[linear-gradient(135deg,hsl(220_50%_15%),hsl(220_45%_25%))]', description: 'Navy → Navy Claro' },
    { name: 'Secondary', class: 'bg-[linear-gradient(135deg,hsl(45_100%_54%),hsl(45_95%_64%))]', description: 'Golden Yellow → Golden Claro' },
    { name: 'Accent', class: 'bg-[linear-gradient(135deg,hsl(20_89%_66%),hsl(45_100%_54%))]', description: 'Coral → Golden' },
    { name: 'Hero', class: 'bg-[linear-gradient(135deg,hsl(220_50%_15%/0.9),hsl(45_100%_54%/0.8))]', description: 'Navy → Golden (con opacidad)' },
    { name: 'Warm', class: 'bg-[linear-gradient(135deg,hsl(20_89%_66%),hsl(40_50%_98%))]', description: 'Coral → Cream' },
    { name: 'Brand', class: 'bg-[linear-gradient(135deg,hsl(220_50%_15%),hsl(45_100%_54%),hsl(20_89%_66%))]', description: 'Navy → Golden → Coral' },
  ];

  const shadows = [
    { name: 'Elegant', class: 'shadow-[0_10px_30px_-10px_hsl(220_50%_15%/0.3)]' },
    { name: 'Glow', class: 'shadow-[0_0_40px_hsl(45_100%_54%/0.4)]' },
    { name: 'Card', class: 'shadow-[0_4px_20px_hsl(220_50%_15%/0.08)]' },
    { name: 'Hover', class: 'shadow-[0_20px_40px_-10px_hsl(220_50%_15%/0.15)]' },
    { name: 'Glass', class: 'shadow-[0_8px_32px_hsl(220_50%_15%/0.12)]' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Sistema de Diseño TELAR</h1>
                <p className="text-sm text-muted-foreground">Paleta de colores, componentes y estilos</p>
              </div>
            </div>
            <Button asChild variant="outline">
              <a href="/dashboard">Volver al Dashboard</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Colors Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Palette className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Colores Principales</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {colors.map((color) => (
              <Card key={color.name} className="overflow-hidden">
                <div className={`h-32 ${color.class}`} />
                <CardHeader>
                  <CardTitle className="text-lg">{color.name}</CardTitle>
                  <CardDescription>{color.text}</CardDescription>
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block">{color.value}</code>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Gradients Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Gradientes</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gradients.map((gradient) => (
              <Card key={gradient.name} className="overflow-hidden">
                <div className={`h-40 ${gradient.class}`} />
                <CardHeader>
                  <CardTitle className="text-lg">Gradiente {gradient.name}</CardTitle>
                  <CardDescription>{gradient.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Buttons Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Box className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Botones</h2>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Variantes de Botones</CardTitle>
              <CardDescription>Todas las variantes disponibles en el sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Primary Variants */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Variantes Principales</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              {/* Status Variants */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Estados</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="warning">Warning</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="premium">Premium</Button>
                </div>
              </div>

              {/* TELAR Variants */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Variantes TELAR</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="artisan">Artisan</Button>
                  <Button variant="earth">Earth</Button>
                  <Button variant="clay">Clay</Button>
                  <Button variant="moss">Moss</Button>
                  <Button variant="golden">Golden</Button>
                  <Button variant="neon">Neon</Button>
                  <Button variant="dark-elevated">Dark Elevated</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Tamaños</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                  <Button size="icon">
                    <Palette className="w-4 h-4" />
                  </Button>
                  <Button size="pill">Pill Shape</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Cards Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Box className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Cards</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Estilo estándar con borde</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Contenido de la tarjeta con estilo por defecto.</p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>Con sombra flotante</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Tarjeta elevada con efecto hover.</p>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
                <CardDescription>Efecto glassmorphism</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Tarjeta con transparencia y blur.</p>
              </CardContent>
            </Card>

            <Card variant="neon-border">
              <CardHeader>
                <CardTitle>Neon Border</CardTitle>
                <CardDescription>Con borde brillante</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Tarjeta con borde neón.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Shadows Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Box className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Sombras</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {shadows.map((shadow) => (
              <div key={shadow.name} className="space-y-4">
                <div className={`h-32 bg-card rounded-xl ${shadow.class}`} />
                <p className="text-sm font-medium text-center">{shadow.name}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Form Components */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Type className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Componentes de Formulario</h2>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Inputs y Controles</CardTitle>
              <CardDescription>Elementos de formulario con estilos TELAR</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="text-input">Input de Texto</Label>
                <Input id="text-input" placeholder="Escribe algo aquí..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-input">Email</Label>
                <Input id="email-input" type="email" placeholder="tu@email.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="textarea">Textarea</Label>
                <Textarea id="textarea" placeholder="Escribe un mensaje más largo..." rows={4} />
              </div>

              <div className="flex gap-4">
                <Badge>Default Badge</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Typography */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Type className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Tipografía</h2>
          </div>
          
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Heading 1</h1>
                <p className="text-sm text-muted-foreground">text-4xl font-bold</p>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Heading 2</h2>
                <p className="text-sm text-muted-foreground">text-3xl font-bold</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Heading 3</h3>
                <p className="text-sm text-muted-foreground">text-2xl font-bold</p>
              </div>
              <div>
                <p className="text-base text-foreground mb-2">Texto de párrafo normal con suficiente longitud para ver cómo se comporta en múltiples líneas y diferentes contextos de la aplicación.</p>
                <p className="text-sm text-muted-foreground">text-base</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Texto pequeño para descripciones y metadata</p>
                <p className="text-sm text-muted-foreground">text-sm text-muted-foreground</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            Sistema de Diseño TELAR - Todos los derechos reservados © 2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DesignSystemPage;
