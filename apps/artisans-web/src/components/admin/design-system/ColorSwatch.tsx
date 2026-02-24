import React, { useState } from 'react';
import { useDesignSystemContext } from '@/contexts/DesignSystemContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { parseHSL, formatHSL, hslToHex, hexToHSL } from '@/utils/colorUtils';
import { HSLColor } from '@/types/designSystem';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ColorSwatchProps {
  paletteName: string;
  shade: string;
  value: string;
  onColorChange: () => void;
}

export function ColorSwatch({ paletteName, shade, value, onColorChange }: ColorSwatchProps) {
  const { updateColor } = useDesignSystemContext();
  const [hsl, setHsl] = useState<HSLColor>(parseHSL(value));
  const [hexInput, setHexInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleHSLChange = (component: 'h' | 's' | 'l', newValue: number) => {
    const updated = { ...hsl, [component]: newValue };
    setHsl(updated);
    const hslString = formatHSL(updated);
    updateColor('palettes', [paletteName, shade], hslString);
    onColorChange();
  };

  const handleHexInput = (hex: string) => {
    setHexInput(hex);
    try {
      const hexMatch = hex.match(/^#?([a-f\d]{6})$/i);
      if (!hexMatch) return;
      
      const hslString = hexToHSL(hex);
      const updated = parseHSL(hslString);
      setHsl(updated);
      updateColor('palettes', [paletteName, shade], hslString);
      onColorChange();
      toast.success('Color actualizado desde HEX');
    } catch (error) {
      console.error('Invalid hex color', error);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success(`${type} copiado`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const hexColor = hslToHex(hsl.h, hsl.s, hsl.l);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-colors">
          <div 
            className="h-24 w-full transition-transform group-hover:scale-105"
            style={{ backgroundColor: hexColor }}
          />
          <div className="p-2 bg-card text-center">
            <p className="text-xs font-medium text-foreground">{shade}</p>
            <p className="text-xs text-muted-foreground font-mono">{hexColor}</p>
          </div>
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">
              {paletteName}-{shade}
            </h4>
            <div 
              className="w-12 h-12 rounded-lg border-2 border-border"
              style={{ backgroundColor: hexColor }}
            />
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor={`h-${paletteName}-${shade}`} className="text-xs">
                Hue (Matiz): {hsl.h}°
              </Label>
              <Input
                id={`h-${paletteName}-${shade}`}
                type="range"
                min="0"
                max="360"
                value={hsl.h}
                onChange={(e) => handleHSLChange('h', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`s-${paletteName}-${shade}`} className="text-xs">
                Saturation (Saturación): {hsl.s}%
              </Label>
              <Input
                id={`s-${paletteName}-${shade}`}
                type="range"
                min="0"
                max="100"
                value={hsl.s}
                onChange={(e) => handleHSLChange('s', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`l-${paletteName}-${shade}`} className="text-xs">
                Lightness (Luminosidad): {hsl.l}%
              </Label>
              <Input
                id={`l-${paletteName}-${shade}`}
                type="range"
                min="0"
                max="100"
                value={hsl.l}
                onChange={(e) => handleHSLChange('l', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            <div className="pt-2 border-t">
              <Label className="text-xs text-muted-foreground">Hex Value</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="text"
                  value={hexInput || hexColor}
                  onChange={(e) => setHexInput(e.target.value)}
                  onBlur={() => {
                    if (hexInput) {
                      handleHexInput(hexInput);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && hexInput) {
                      handleHexInput(hexInput);
                    }
                  }}
                  placeholder="#RRGGBB"
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(hexColor, 'HEX')}
                  className="shrink-0"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">HSL Value</Label>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm font-mono text-foreground">{formatHSL(hsl)}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(formatHSL(hsl), 'HSL')}
                  className="h-8 px-2"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
