import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Settings, Globe } from 'lucide-react';

export const PreferencesSection: React.FC = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Preferencias
        </CardTitle>
        <CardDescription>
          Configura tu experiencia en la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Display */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Idioma de la plataforma</Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-border bg-muted/30">
            <span className="text-2xl">🇪🇸</span>
            <div className="flex-1">
              <span className="font-medium">Español</span>
              <span className="text-sm text-muted-foreground block">
                Interfaz en español
              </span>
            </div>
          </div>
        </div>

        {/* Future options */}
        <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            Más opciones de personalización próximamente (moneda, zona horaria, etc.)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
