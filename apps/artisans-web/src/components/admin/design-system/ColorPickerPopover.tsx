import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { parseHSL, formatHSL, hslToHex, getContrastRatio } from '@/utils/colorUtils';
import { HSLColor } from '@/types/designSystem';
import { Check, Copy, Pipette } from 'lucide-react';
import { toast } from 'sonner';

interface ColorPickerPopoverProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showWCAGValidation?: boolean;
  contrastBackground?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ColorPickerPopover({ 
  label, 
  value, 
  onChange, 
  showWCAGValidation = false,
  contrastBackground,
  size = 'md'
}: ColorPickerPopoverProps) {
  const [hsl, setHsl] = useState<HSLColor>(parseHSL(value));
  const [isCopied, setIsCopied] = useState(false);
  const hexColor = hslToHex(hsl.h, hsl.s, hsl.l);

  const handleHSLChange = (component: 'h' | 's' | 'l', newValue: number) => {
    const updated = { ...hsl, [component]: newValue };
    setHsl(updated);
    const hslString = formatHSL(updated);
    onChange(hslString);
  };

  const handleHexInput = (hex: string) => {
    // Convertir hex a HSL y actualizar
    try {
      const hexMatch = hex.match(/^#?([a-f\d]{6})$/i);
      if (!hexMatch) return;
      
      const r = parseInt(hexMatch[1].substring(0, 2), 16) / 255;
      const g = parseInt(hexMatch[1].substring(2, 4), 16) / 255;
      const b = parseInt(hexMatch[1].substring(4, 6), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      
      const updated = {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
      };
      
      setHsl(updated);
      onChange(formatHSL(updated));
    } catch (error) {
      console.error('Invalid hex color', error);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success(`${type} copiado al portapapeles`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // WCAG validation
  let contrastRatio = 0;
  let passesAA = false;
  if (showWCAGValidation && contrastBackground) {
    contrastRatio = getContrastRatio(value, contrastBackground);
    passesAA = contrastRatio >= 4.5;
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className={`${sizeClasses[size]} rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-105 relative group`}
          style={{ backgroundColor: hexColor }}
          aria-label={`Editar color ${label}`}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 rounded-lg">
            <Pipette className="w-4 h-4 text-foreground" />
          </div>
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 pointer-events-auto" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground text-sm">
              {label}
            </h4>
            <div 
              className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
              style={{ backgroundColor: hexColor }}
            />
          </div>

          {/* HSL Sliders */}
          <div className="space-y-3">
            <div>
              <Label htmlFor={`h-${label}`} className="text-xs flex justify-between">
                <span>Matiz (H)</span>
                <span className="font-mono text-muted-foreground">{hsl.h}°</span>
              </Label>
              <Input
                id={`h-${label}`}
                type="range"
                min="0"
                max="360"
                value={hsl.h}
                onChange={(e) => handleHSLChange('h', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`s-${label}`} className="text-xs flex justify-between">
                <span>Saturación (S)</span>
                <span className="font-mono text-muted-foreground">{hsl.s}%</span>
              </Label>
              <Input
                id={`s-${label}`}
                type="range"
                min="0"
                max="100"
                value={hsl.s}
                onChange={(e) => handleHSLChange('s', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`l-${label}`} className="text-xs flex justify-between">
                <span>Luminosidad (L)</span>
                <span className="font-mono text-muted-foreground">{hsl.l}%</span>
              </Label>
              <Input
                id={`l-${label}`}
                type="range"
                min="0"
                max="100"
                value={hsl.l}
                onChange={(e) => handleHSLChange('l', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Values */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">HSL</Label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono text-foreground">{formatHSL(hsl)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(formatHSL(hsl), 'HSL')}
                >
                  {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">HEX</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={hexColor}
                  onChange={(e) => handleHexInput(e.target.value)}
                  className="h-6 text-xs font-mono w-24 px-2"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(hexColor, 'HEX')}
                >
                  {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>

          {/* WCAG Validation */}
          {showWCAGValidation && contrastBackground && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Contraste WCAG</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-foreground">
                    {contrastRatio.toFixed(2)}:1
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    passesAA 
                      ? 'bg-success/20 text-success' 
                      : 'bg-destructive/20 text-destructive'
                  }`}>
                    {passesAA ? 'AA ✓' : 'AA ✗'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
