import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, AlertCircle, Info, ShoppingBag, Loader2, Star, Heart, TrendingUp, Users } from 'lucide-react';

export function LivePreviewPanel() {
  const [progress, setProgress] = useState(65);
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchChecked, setSwitchChecked] = useState(true);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Vista Previa en Vivo</CardTitle>
        <CardDescription>Todos los cambios se reflejan en tiempo real</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 max-h-[calc(100vh-12rem)] overflow-y-auto">
        {/* Buttons */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Botones</p>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="secondary">Secondary</Button>
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Accent</Button>
              <Button size="sm" variant="outline">Outline</Button>
              <Button size="sm" variant="ghost">Ghost</Button>
              <Button size="sm" variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled>Disabled</Button>
              <Button size="sm" variant="outline" disabled>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Loading
              </Button>
              <Button size="sm" variant="link">Link Style</Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Form Inputs */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground">Inputs y Formularios</p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" placeholder="Escribe tu nombre..." />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tu@email.com" />
            </div>
            <div>
              <Label htmlFor="select">Categoría</Label>
              <Select>
                <SelectTrigger id="select">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceramica">Cerámica</SelectItem>
                  <SelectItem value="textil">Textil</SelectItem>
                  <SelectItem value="madera">Madera</SelectItem>
                  <SelectItem value="joyeria">Joyería</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Checkboxes and Radio */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground">Checkboxes y Radio Buttons</p>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" defaultChecked />
              <Label htmlFor="terms" className="text-sm">Acepto términos y condiciones</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="newsletter" />
              <Label htmlFor="newsletter" className="text-sm">Recibir newsletter</Label>
            </div>
            <RadioGroup defaultValue="option1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option1" id="option1" />
                <Label htmlFor="option1">Opción 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option2" id="option2" />
                <Label htmlFor="option2">Opción 2</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <Separator />

        {/* Switch and Slider */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground">Switch y Slider</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notificaciones</Label>
              <Switch 
                id="notifications" 
                checked={switchChecked} 
                onCheckedChange={setSwitchChecked}
              />
            </div>
            <div className="space-y-2">
              <Label>Volumen: {sliderValue[0]}%</Label>
              <Slider 
                value={sliderValue} 
                onValueChange={setSliderValue}
                max={100}
                step={1}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Progress */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Progress Bars</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progreso</span>
                <span className="text-foreground font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Completado</span>
                <span className="text-success font-medium">100%</span>
              </div>
              <Progress value={100} className="[&>div]:bg-success" />
            </div>
          </div>
        </div>

        <Separator />

        {/* Badges */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Badges y Tags</p>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">
              <Check className="w-3 h-3 mr-1" />
              Success
            </Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>

        <Separator />

        {/* Alerts */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Alertas</p>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Información</AlertTitle>
            <AlertDescription>
              Esta es una alerta informativa con el color primario.
            </AlertDescription>
          </Alert>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Esta alerta usa el color destructivo del sistema.
            </AlertDescription>
          </Alert>

          <Alert className="border-success/50 bg-success/10">
            <Check className="h-4 w-4 text-success" />
            <AlertTitle className="text-success">Éxito</AlertTitle>
            <AlertDescription className="text-success/90">
              Operación completada correctamente.
            </AlertDescription>
          </Alert>
        </div>

        <Separator />

        {/* Cards */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Tarjetas</p>
          <div className="grid gap-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tarjeta de Producto</CardTitle>
                <CardDescription>Con descripción y footer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Producto Ejemplo</p>
                    <p className="text-xs text-muted-foreground">Artesanía única</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">$50.000</p>
                    <Badge variant="success" className="text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Disponible
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button size="sm" className="flex-1">Ver Detalles</Button>
                <Button size="sm" variant="outline">
                  <Heart className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-accent">
              <CardHeader className="bg-accent/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" />
                  Destacado
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-foreground">Tarjeta con border de acento y fondo en header.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Tabs */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Tabs</p>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tab1">General</TabsTrigger>
              <TabsTrigger value="tab2">Avanzado</TabsTrigger>
              <TabsTrigger value="tab3">Configuración</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="space-y-2">
              <p className="text-sm text-foreground">Contenido de la pestaña General</p>
              <p className="text-xs text-muted-foreground">Los tabs usan los colores del sistema</p>
            </TabsContent>
            <TabsContent value="tab2" className="space-y-2">
              <p className="text-sm text-foreground">Contenido de la pestaña Avanzado</p>
            </TabsContent>
            <TabsContent value="tab3" className="space-y-2">
              <p className="text-sm text-foreground">Contenido de Configuración</p>
            </TabsContent>
          </Tabs>
        </div>

        <Separator />

        {/* Stats Cards */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Tarjetas de Estadísticas</p>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Ventas Totales</CardDescription>
                <CardTitle className="text-2xl text-primary">$2.4M</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-success">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Usuarios Activos</CardDescription>
                <CardTitle className="text-2xl text-secondary">1,234</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="w-3 h-3 mr-1" />
                  +180 nuevos
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Avatars */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Avatares</p>
          <div className="flex items-center gap-2">
            <Avatar className="bg-primary text-primary-foreground">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar className="bg-secondary text-secondary-foreground">
              <AvatarFallback>MG</AvatarFallback>
            </Avatar>
            <Avatar className="bg-accent text-accent-foreground">
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <Avatar className="bg-muted text-muted-foreground">
              <AvatarFallback>CD</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <Separator />

        {/* Typography */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Tipografía</p>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Heading 1</h1>
            <h2 className="text-xl font-bold text-foreground">Heading 2</h2>
            <h3 className="text-lg font-semibold text-foreground">Heading 3</h3>
            <p className="text-base text-foreground">Texto de párrafo normal con foreground</p>
            <p className="text-sm text-muted-foreground">Texto secundario con muted-foreground</p>
            <p className="text-xs text-muted-foreground">Texto pequeño para metadatos</p>
            <div className="flex gap-2 mt-2">
              <span className="text-primary font-medium">Color Primary</span>
              <span className="text-secondary font-medium">Color Secondary</span>
              <span className="text-accent font-medium">Color Accent</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Table */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Tabla</p>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 font-semibold text-foreground">Producto</th>
                  <th className="text-right p-2 font-semibold text-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border hover:bg-muted/50">
                  <td className="p-2 text-foreground">Cerámica Azul</td>
                  <td className="p-2 text-right">
                    <Badge variant="success">Activo</Badge>
                  </td>
                </tr>
                <tr className="border-t border-border hover:bg-muted/50">
                  <td className="p-2 text-foreground">Textil Rojo</td>
                  <td className="p-2 text-right">
                    <Badge variant="warning">Pendiente</Badge>
                  </td>
                </tr>
                <tr className="border-t border-border hover:bg-muted/50">
                  <td className="p-2 text-foreground">Joyería Plata</td>
                  <td className="p-2 text-right">
                    <Badge variant="destructive">Agotado</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
