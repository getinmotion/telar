import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Eye, 
  Palette, 
  Check, 
  RotateCcw, 
  Info,
  Download,
  Upload,
  Globe,
  User
} from 'lucide-react';
import { ColorVariables } from '@/types/designSystem';
import { EditableSemanticToken } from './EditableSemanticToken';
import { toast } from 'sonner';

interface InteractiveLivePreviewProps {
  config: ColorVariables;
  onColorChange: () => void;
  updatePreviewColor: (category: 'semantic' | 'palettes', path: string[], value: string) => void;
  updateElementOverride: (elementId: string, tokenName: string | null) => void;
}

const SEMANTIC_TOKENS = [
  { name: 'primary', label: 'Primary', classes: 'bg-primary text-primary-foreground' },
  { name: 'secondary', label: 'Secondary', classes: 'bg-secondary text-secondary-foreground' },
  { name: 'accent', label: 'Accent', classes: 'bg-accent text-accent-foreground' },
  { name: 'destructive', label: 'Destructive', classes: 'bg-destructive text-destructive-foreground' },
  { name: 'success', label: 'Success', classes: 'bg-success text-success-foreground' },
  { name: 'warning', label: 'Warning', classes: 'bg-warning text-warning-foreground' },
  { name: 'muted', label: 'Muted', classes: 'bg-muted text-muted-foreground' },
] as const;

export function InteractiveLivePreview({ 
  config, 
  onColorChange, 
  updatePreviewColor,
  updateElementOverride 
}: InteractiveLivePreviewProps) {
  const [editMode, setEditMode] = useState<'global' | 'individual'>('global');
  const [elementOverrides, setElementOverrides] = useState<Record<string, string>>(
    config.elementOverrides || {}
  );

  // Sync with config when it changes
  React.useEffect(() => {
    if (config.elementOverrides) {
      setElementOverrides(config.elementOverrides);
    }
  }, [config.elementOverrides]);

  const handleElementColorChange = (elementId: string, tokenName: string | null) => {
    const newOverrides = { ...elementOverrides };
    if (tokenName === null) {
      delete newOverrides[elementId];
    } else {
      newOverrides[elementId] = tokenName;
    }
    setElementOverrides(newOverrides);
    updateElementOverride(elementId, tokenName);
    onColorChange();
  };

  const resetAllOverrides = () => {
    setElementOverrides({});
    Object.keys(elementOverrides).forEach(elementId => {
      updateElementOverride(elementId, null);
    });
    onColorChange();
    toast.success('Todos los overrides han sido reseteados');
  };

  const exportOverrides = () => {
    const dataStr = JSON.stringify(elementOverrides, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `element-overrides-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Overrides exportados');
  };

  const importOverrides = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target?.result as string);
            setElementOverrides(imported);
            Object.entries(imported).forEach(([elementId, tokenName]) => {
              updateElementOverride(elementId, tokenName as string);
            });
            onColorChange();
            toast.success('Overrides importados correctamente');
          } catch (err) {
            toast.error('Error al importar overrides');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const ColorPicker = ({ elementId, defaultToken }: { 
    elementId: string; 
    defaultToken?: string;
  }) => {
    const currentOverride = elementOverrides[elementId];
    const isUsingOverride = !!currentOverride;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            size="sm"
            variant={isUsingOverride ? "default" : "ghost"}
            className="gap-2 relative"
          >
            <Palette className="w-3 h-3" />
            {isUsingOverride && (
              <div className={`w-3 h-3 rounded-full ${SEMANTIC_TOKENS.find(t => t.name === currentOverride)?.classes.split(' ')[0]}`} />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-background border-border z-50">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Selecciona un color:</p>
            <div className="grid grid-cols-2 gap-2">
              {SEMANTIC_TOKENS.map((token) => (
                <Button
                  key={token.name}
                  size="sm"
                  variant={currentOverride === token.name ? 'default' : 'outline'}
                  className={`${token.classes} justify-start gap-1`}
                  onClick={() => handleElementColorChange(elementId, token.name)}
                >
                  {currentOverride === token.name && <Check className="w-3 h-3" />}
                  {token.label}
                </Button>
              ))}
            </div>
            {isUsingOverride && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => handleElementColorChange(elementId, null)}
              >
                <RotateCcw className="w-3 h-3 mr-2" />
                Usar color global
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const EditableElement = ({ 
    elementId, 
    children, 
    defaultToken,
    className = ""
  }: { 
    elementId: string; 
    children: React.ReactNode; 
    defaultToken?: string;
    className?: string;
  }) => {
    const override = elementOverrides[elementId];
    const tokenToUse = override || defaultToken;
    const tokenClasses = tokenToUse ? SEMANTIC_TOKENS.find(t => t.name === tokenToUse)?.classes : '';

    return (
      <div className={`relative group inline-block ${className}`}>
        <div className={editMode === 'individual' ? tokenClasses : ''}>
          {children}
        </div>
        {editMode === 'individual' && (
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ColorPicker elementId={elementId} defaultToken={defaultToken} />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Vista Previa Interactiva
            </CardTitle>
            <CardDescription>
              {editMode === 'global' 
                ? 'Edita tokens semánticos para cambios globales' 
                : 'Haz hover sobre elementos para cambiarlos individualmente'
              }
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {editMode === 'individual' && Object.keys(elementOverrides).length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={exportOverrides}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm" onClick={importOverrides}>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </Button>
                <Button variant="outline" size="sm" onClick={resetAllOverrides}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resetear Todos
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mt-4">
          <Label htmlFor="edit-mode" className="font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Modo de edición:
          </Label>
          <div className="flex items-center gap-2">
            <span className={editMode === 'global' ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
              Global
            </span>
            <Switch 
              id="edit-mode"
              checked={editMode === 'individual'}
              onCheckedChange={(checked) => setEditMode(checked ? 'individual' : 'global')}
            />
            <span className={editMode === 'individual' ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
              Individual
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {editMode === 'global' && (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Tokens Semánticos</p>
                  <p className="text-xs text-muted-foreground">
                    Cambia los colores base que se aplican a todo el sistema
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(config.semantic).map(([key, value]) => {
                  const tokenInfo = SEMANTIC_TOKENS.find(t => t.name === key);
                  if (!tokenInfo) return null;
                  
                  return (
                    <EditableSemanticToken
                      key={key}
                      tokenName={key}
                      value={value}
                      onChange={(newValue) => {
                        updatePreviewColor('semantic', [key], newValue);
                        onColorChange();
                      }}
                      description={tokenInfo.label}
                    />
                  );
                })}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Botones */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Botones</p>
          <div className="flex flex-wrap gap-2">
            <EditableElement elementId="button-primary" defaultToken="primary">
              <Button size="sm">Primary</Button>
            </EditableElement>
            
            <EditableElement elementId="button-secondary" defaultToken="secondary">
              <Button size="sm" variant="secondary">Secondary</Button>
            </EditableElement>
            
            <EditableElement elementId="button-destructive" defaultToken="destructive">
              <Button size="sm" variant="destructive">Delete</Button>
            </EditableElement>
            
            <EditableElement elementId="button-outline">
              <Button size="sm" variant="outline">Outline</Button>
            </EditableElement>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Badges</p>
          <div className="flex flex-wrap gap-2">
            <EditableElement elementId="badge-primary" defaultToken="primary">
              <Badge>Primary</Badge>
            </EditableElement>
            
            <EditableElement elementId="badge-secondary" defaultToken="secondary">
              <Badge variant="secondary">Secondary</Badge>
            </EditableElement>
            
            <EditableElement elementId="badge-accent" defaultToken="accent">
              <Badge>Accent</Badge>
            </EditableElement>
            
            <EditableElement elementId="badge-destructive" defaultToken="destructive">
              <Badge variant="destructive">Error</Badge>
            </EditableElement>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Alertas</p>
          <EditableElement elementId="alert-info" defaultToken="primary" className="block">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Información</AlertTitle>
              <AlertDescription>
                Esta es una alerta informativa.
              </AlertDescription>
            </Alert>
          </EditableElement>
        </div>

        {/* Forms */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Formularios</p>
          <div className="space-y-2 max-w-sm">
            <Label htmlFor="preview-input">Email</Label>
            <EditableElement elementId="input-focus" className="block">
              <Input id="preview-input" placeholder="tu@email.com" />
            </EditableElement>
            
            <div className="flex items-center gap-2 mt-4">
              <EditableElement elementId="switch-active" defaultToken="primary">
                <Switch defaultChecked />
              </EditableElement>
              <Label>Notificaciones</Label>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Cards de Productos</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableElement elementId="card-product-1" className="block">
              <Card className="overflow-hidden">
                <div className="aspect-square bg-muted" />
                <CardContent className="p-4">
                  <h3 className="font-semibold">Producto Artesanal</h3>
                  <p className="text-sm text-muted-foreground">Hecho a mano</p>
                  <p className="text-lg font-bold mt-2">$2,500</p>
                  <EditableElement elementId="button-add-cart" defaultToken="primary" className="block mt-3">
                    <Button size="sm" className="w-full">Añadir al carrito</Button>
                  </EditableElement>
                </CardContent>
              </Card>
            </EditableElement>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Estadísticas</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EditableElement elementId="stat-card-1" defaultToken="primary" className="block">
              <Card className="border-2">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Ventas</p>
                  <p className="text-2xl font-bold">125</p>
                </CardContent>
              </Card>
            </EditableElement>
            
            <EditableElement elementId="stat-card-2" defaultToken="success" className="block">
              <Card className="border-2">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Ingresos</p>
                  <p className="text-2xl font-bold">$45,230</p>
                </CardContent>
              </Card>
            </EditableElement>
            
            <EditableElement elementId="stat-card-3" defaultToken="accent" className="block">
              <Card className="border-2">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Clientes</p>
                  <p className="text-2xl font-bold">89</p>
                </CardContent>
              </Card>
            </EditableElement>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Progress & Sliders</p>
          <div className="space-y-4 max-w-sm">
            <EditableElement elementId="slider-primary" defaultToken="primary" className="block">
              <Slider defaultValue={[50]} max={100} step={1} />
            </EditableElement>
          </div>
        </div>

        {/* Avatares */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Avatares</p>
          <div className="flex gap-2">
            <EditableElement elementId="avatar-1" defaultToken="primary">
              <Avatar>
                <AvatarFallback>MA</AvatarFallback>
              </Avatar>
            </EditableElement>
            
            <EditableElement elementId="avatar-2" defaultToken="secondary">
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </EditableElement>
            
            <EditableElement elementId="avatar-3" defaultToken="accent">
              <Avatar>
                <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
              </Avatar>
            </EditableElement>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
