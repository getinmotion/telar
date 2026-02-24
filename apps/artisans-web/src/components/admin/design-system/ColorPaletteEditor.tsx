import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorVariables } from '@/types/designSystem';
import { ColorSwatch } from './ColorSwatch';

interface ColorPaletteEditorProps {
  config: ColorVariables;
  onColorChange: () => void;
}

export function ColorPaletteEditor({ config, onColorChange }: ColorPaletteEditorProps) {
  const palettes = [
    { name: 'navy', title: 'Navy Blue', description: 'Azul marino - Color primario' },
    { name: 'golden', title: 'Golden Yellow', description: 'Amarillo dorado - Color secundario' },
    { name: 'coral', title: 'Coral/Peach', description: 'Coral - Color de acento' },
    { name: 'cream', title: 'Cream', description: 'Crema - Color de fondo' },
  ];

  return (
    <div className="space-y-6">
      {palettes.map(({ name, title, description }) => {
        const palette = config.palettes[name as keyof typeof config.palettes];
        
        return (
          <Card key={name}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(palette).map(([shade, value]) => (
                  <ColorSwatch
                    key={`${name}-${shade}`}
                    paletteName={name}
                    shade={shade}
                    value={value}
                    onColorChange={onColorChange}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
