import React, { useState } from 'react';
import { useDesignSystemContext } from '@/contexts/DesignSystemContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Save, RotateCcw, Palette, Sparkles, Eye } from 'lucide-react';
import { ColorPaletteEditor } from '@/components/admin/design-system/ColorPaletteEditor';
import { SemanticTokenEditor } from '@/components/admin/design-system/SemanticTokenEditor';
import { InteractiveLivePreview } from '@/components/admin/design-system/InteractiveLivePreview';

export default function DesignSystemEditorPage() {
  const { config, isLoading, saveConfig, resetToDefaults, reloadConfig, updateColor } = useDesignSystemContext();
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSave = async () => {
    if (!config) return;
    
    setIsSaving(true);
    const success = await saveConfig(config);
    if (success) {
      setHasUnsavedChanges(false);
    }
    setIsSaving(false);
  };

  const handleReset = async () => {
    if (confirm('¿Estás seguro de que quieres restaurar los valores por defecto? Esto sobrescribirá todos los cambios no guardados.')) {
      await resetToDefaults();
      setHasUnsavedChanges(false);
    }
  };

  const handleUpdatePreviewColor = (category: 'semantic' | 'palettes', path: string[], value: string) => {
    updateColor(category, path, value);
    setHasUnsavedChanges(true);
  };

  const handleUpdateElementOverride = (elementId: string, tokenName: string | null) => {
    // This will be handled by the config update
    setHasUnsavedChanges(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>No se pudo cargar la configuración del Design System</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={reloadConfig}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf7ed]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Editor de Design System</h1>
                <p className="text-sm text-muted-foreground">
                  Edita colores y ve los cambios en tiempo real
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-warning">Cambios no guardados</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restaurar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Tabs Principales */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="editor">
              <Palette className="w-4 h-4 mr-2" />
              Editor de Colores
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa Interactiva
            </TabsTrigger>
          </TabsList>

          {/* Tab: Editor */}
          <TabsContent value="editor" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Paletas de Color
                    </CardTitle>
                    <CardDescription>
                      Edita las paletas Navy, Golden, Coral y Cream
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ColorPaletteEditor 
                      config={config}
                      onColorChange={() => setHasUnsavedChanges(true)}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" />
                      Tokens Semánticos
                    </CardTitle>
                    <CardDescription>
                      Edita primary, secondary, accent, success, warning, destructive
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SemanticTokenEditor 
                      config={config}
                      onTokenChange={() => setHasUnsavedChanges(true)}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Vista Previa Interactiva */}
          <TabsContent value="preview" className="mt-6">
            {config && (
              <InteractiveLivePreview 
                config={config}
                onColorChange={() => setHasUnsavedChanges(true)} 
                updatePreviewColor={handleUpdatePreviewColor}
                updateElementOverride={handleUpdateElementOverride}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
