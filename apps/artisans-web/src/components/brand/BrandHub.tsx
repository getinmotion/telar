import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Search, Palette, MessageSquare, Brush, ArrowRight } from 'lucide-react';
import { LogoEditModal } from './LogoEditModal';
import { ColorPaletteModal } from './ColorPaletteModal';
import { ClaimEditorModal } from './ClaimEditorModal';

interface BrandHubProps {
  brandName: string;
  logoUrl: string | null;
  colorSystem: {
    primary_colors: string[];
    secondary_colors: string[];
  };
  claim: string;
  onStartDiagnosis: () => void;
  onElementUpdated: () => void;
}

export const BrandHub: React.FC<BrandHubProps> = ({
  brandName,
  logoUrl,
  colorSystem,
  claim,
  onStartDiagnosis,
  onElementUpdated
}) => {
  const [editMode, setEditMode] = useState<'logo' | 'colors' | 'claim' | null>(null);

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold">Tu Marca</h1>
          <p className="text-lg text-muted-foreground">
            Edita tu identidad visual o inicia un diagnóstico profundo con IA
          </p>
        </div>

        {/* Vista previa de marca actual */}
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={brandName} 
                    className="w-32 h-32 object-contain rounded-lg border-2 border-border p-2"
                  />
                ) : (
                  <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                    <Palette className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Información de marca */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <h2 className="text-2xl font-bold">{brandName}</h2>
                {claim && (
                  <p className="text-lg italic text-muted-foreground">"{claim}"</p>
                )}
                
                {/* Colores */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Paleta de Colores:</p>
                  <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                    {colorSystem.primary_colors.map((color, idx) => (
                      <div 
                        key={idx}
                        className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    {colorSystem.secondary_colors.map((color, idx) => (
                      <div 
                        key={`sec-${idx}`}
                        className="w-10 h-10 rounded-lg border-2 border-border shadow-sm opacity-70"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opciones principales */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Opción 1: Editar Marca */}
          <Card className="group cursor-pointer hover:border-primary transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Edit className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Editar Mi Marca</h3>
              <p className="text-muted-foreground">
                Cambia tu logo, ajusta colores o mejora tu claim sin hacer diagnóstico
              </p>
              <div className="pt-4 border-t border-border space-y-2">
                <Button
                  onClick={() => setEditMode('logo')}
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Cambiar Logo
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setEditMode('colors')}
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Brush className="w-4 h-4" />
                    Ajustar Colores
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setEditMode('claim')}
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Mejorar Claim
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Opción 2: Diagnóstico Profundo */}
          <Card className="group cursor-pointer hover:border-accent transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Search className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Diagnóstico Profundo</h3>
              <p className="text-muted-foreground">
                La IA analizará tu identidad de marca en 5 dimensiones y generará misiones personalizadas de mejora
              </p>
              <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>Análisis de logo, colores y tipografía</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>Evaluación de claim y mensaje</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>3-5 misiones específicas de mejora</span>
                </div>
              </div>
              <Button
                onClick={onStartDiagnosis}
                className="w-full mt-6"
                variant="default"
              >
                Iniciar Diagnóstico
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modales de edición */}
      {editMode === 'logo' && (
        <LogoEditModal
          currentLogoUrl={logoUrl}
          brandName={brandName}
          onClose={() => setEditMode(null)}
          onSave={() => {
            onElementUpdated();
            setEditMode(null);
          }}
        />
      )}

      {editMode === 'colors' && (
        <ColorPaletteModal
          currentColors={colorSystem}
          brandName={brandName}
          logoUrl={logoUrl}
          onClose={() => setEditMode(null)}
          onSave={() => {
            onElementUpdated();
            setEditMode(null);
          }}
        />
      )}

      {editMode === 'claim' && (
        <ClaimEditorModal
          currentClaim={claim}
          brandName={brandName}
          onClose={() => setEditMode(null)}
          onSave={() => {
            onElementUpdated();
            setEditMode(null);
          }}
        />
      )}
    </>
  );
};
