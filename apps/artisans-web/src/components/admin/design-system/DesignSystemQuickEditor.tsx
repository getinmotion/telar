import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EditableSemanticToken } from './EditableSemanticToken';
import { ColorPickerPopover } from './ColorPickerPopover';
import { useDesignSystemEditor } from '@/hooks/useDesignSystemEditor';
import { Save, X, RotateCcw, Download, Search, History, Palette } from 'lucide-react';

export function DesignSystemQuickEditor() {
  const {
    isOpen,
    closeEditor,
    config,
    isSaving,
    hasUnsavedChanges,
    changeHistory,
    updatePreviewColor,
    saveChanges,
    discardChanges,
    exportConfig
  } = useDesignSystemEditor();

  const [searchQuery, setSearchQuery] = useState('');

  if (!config) return null;

  const semanticTokenGroups = [
    {
      title: 'Colores Primarios',
      tokens: [
        { name: 'primary', desc: 'Color principal de marca' },
        { name: 'primary-foreground', desc: 'Texto sobre primary', contrastWith: 'primary' },
        { name: 'primary-glow', desc: 'Variante brillante de primary' },
        { name: 'primary-subtle', desc: 'Variante sutil de primary' }
      ]
    },
    {
      title: 'Colores Secundarios',
      tokens: [
        { name: 'secondary', desc: 'Color secundario' },
        { name: 'secondary-foreground', desc: 'Texto sobre secondary', contrastWith: 'secondary' },
        { name: 'secondary-glow', desc: 'Variante brillante de secondary' }
      ]
    },
    {
      title: 'Colores de Acento',
      tokens: [
        { name: 'accent', desc: 'Color de acento para CTAs' },
        { name: 'accent-foreground', desc: 'Texto sobre accent', contrastWith: 'accent' }
      ]
    },
    {
      title: 'Fondo y Superficie',
      tokens: [
        { name: 'background', desc: 'Fondo principal' },
        { name: 'foreground', desc: 'Texto principal', contrastWith: 'background' },
        { name: 'card', desc: 'Fondo de tarjetas' },
        { name: 'card-foreground', desc: 'Texto en tarjetas', contrastWith: 'card' },
        { name: 'muted', desc: 'Fondo atenuado' },
        { name: 'muted-foreground', desc: 'Texto atenuado', contrastWith: 'muted' }
      ]
    },
    {
      title: 'Estados',
      tokens: [
        { name: 'success', desc: 'Color de éxito' },
        { name: 'success-foreground', desc: 'Texto sobre success', contrastWith: 'success' },
        { name: 'warning', desc: 'Color de advertencia' },
        { name: 'warning-foreground', desc: 'Texto sobre warning', contrastWith: 'warning' },
        { name: 'destructive', desc: 'Color destructivo/error' },
        { name: 'destructive-foreground', desc: 'Texto sobre destructive', contrastWith: 'destructive' }
      ]
    },
    {
      title: 'Elementos UI',
      tokens: [
        { name: 'border', desc: 'Bordes' },
        { name: 'input', desc: 'Fondos de inputs' },
        { name: 'ring', desc: 'Anillos de foco' }
      ]
    }
  ];

  const palettes = [
    { name: 'navy', title: 'Navy Blue', desc: 'Azul marino principal' },
    { name: 'golden', title: 'Golden Yellow', desc: 'Amarillo dorado secundario' },
    { name: 'coral', title: 'Coral/Peach', desc: 'Coral de acento' },
    { name: 'cream', title: 'Cream', desc: 'Crema de fondo' }
  ];

  const filteredTokenGroups = searchQuery 
    ? semanticTokenGroups.map(group => ({
        ...group,
        tokens: group.tokens.filter(token => 
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.desc.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(group => group.tokens.length > 0)
    : semanticTokenGroups;

  return (
    <Dialog open={isOpen} onOpenChange={closeEditor}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 pointer-events-auto">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="w-6 h-6 text-primary" />
              <div>
                <DialogTitle>Design System Editor</DialogTitle>
                <DialogDescription>
                  Edita colores en tiempo real. Los cambios se aplican instantáneamente.
                </DialogDescription>
              </div>
            </div>
            {hasUnsavedChanges && (
              <Badge variant="warning" className="ml-auto mr-2">
                {changeHistory.length} cambios sin guardar
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="semantic" className="flex-1">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="semantic">Tokens Semánticos</TabsTrigger>
              <TabsTrigger value="palettes">Paletas</TabsTrigger>
              <TabsTrigger value="gradients">Gradientes</TabsTrigger>
              <TabsTrigger value="history">
                <History className="w-4 h-4 mr-2" />
                Historial
              </TabsTrigger>
            </TabsList>

            {/* Search */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Semantic Tokens Tab */}
          <TabsContent value="semantic" className="mt-0 flex-1">
            <ScrollArea className="h-[400px] px-6 py-4">
              <div className="space-y-6">
                {filteredTokenGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-sm font-semibold text-foreground mb-3">{group.title}</h3>
                    <div className="space-y-2">
                      {group.tokens.map((token) => {
                        const value = config.semantic[token.name as keyof typeof config.semantic];
                        const contrastValue = token.contrastWith 
                          ? config.semantic[token.contrastWith as keyof typeof config.semantic]
                          : undefined;
                        
                        return (
                          <EditableSemanticToken
                            key={token.name}
                            tokenName={token.name}
                            value={value}
                            onChange={(newValue) => updatePreviewColor('semantic', [token.name], newValue)}
                            contrastWith={contrastValue}
                            description={token.desc}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Palettes Tab */}
          <TabsContent value="palettes" className="mt-0 flex-1">
            <ScrollArea className="h-[400px] px-6 py-4">
              <div className="space-y-6">
                {palettes.map(({ name, title, desc }) => {
                  const palette = config.palettes[name as keyof typeof config.palettes];
                  
                  return (
                    <div key={name}>
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <div className="grid grid-cols-5 gap-3">
                        {Object.entries(palette).map(([shade, value]) => (
                          <div key={`${name}-${shade}`} className="space-y-2">
                            <ColorPickerPopover
                              label={`${name}-${shade}`}
                              value={value}
                              onChange={(newValue) => updatePreviewColor('palettes', [name, shade], newValue)}
                              size="lg"
                            />
                            <p className="text-xs text-center text-muted-foreground font-medium">
                              {shade}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Gradients Tab */}
          <TabsContent value="gradients" className="mt-0 flex-1">
            <ScrollArea className="h-[400px] px-6 py-4">
              <div className="space-y-4">
                {Object.entries(config.gradients).map(([name, value]) => (
                  <div key={name} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-foreground">--gradient-{name}</p>
                    </div>
                    <div 
                      className="h-24 rounded-lg"
                      style={{ background: value }}
                    />
                    <p className="text-xs text-muted-foreground font-mono mt-2">{value}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-0 flex-1">
            <ScrollArea className="h-[400px] px-6 py-4">
              {changeHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <History className="w-12 h-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No hay cambios aún
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {changeHistory.slice().reverse().map((change, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-card text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">
                          {change.category === 'semantic' ? '--' : ''}{change.path.join('-')}
                        </span>
                        <span className="text-muted-foreground">
                          {change.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-muted-foreground">{change.oldValue}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-primary">{change.newValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportConfig}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              {hasUnsavedChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={discardChanges}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Descartar
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={closeEditor}
              >
                <X className="w-4 h-4 mr-2" />
                Cerrar
              </Button>
              <Button
                size="sm"
                onClick={saveChanges}
                disabled={!hasUnsavedChanges || isSaving}
              >
                {isSaving ? (
                  <>Guardando...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar {changeHistory.length > 0 && `(${changeHistory.length})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
