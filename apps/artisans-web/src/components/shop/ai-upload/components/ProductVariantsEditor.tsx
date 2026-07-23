import React, { useState, useCallback } from 'react';
import { Plus, X, Palette, Ruler, Shirt, Package, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { VariantOption, ProductVariant } from '../hooks/useWizardState';

interface ProductVariantsEditorProps {
  hasVariants: boolean;
  variantOptions: VariantOption[];
  variants: ProductVariant[];
  basePrice: number | null;
  onHasVariantsChange: (hasVariants: boolean) => void;
  onVariantOptionsChange: (options: VariantOption[]) => void;
  onVariantsChange: (variants: ProductVariant[]) => void;
}

const VARIANT_PRESETS = [
  { 
    id: 'talla', 
    name: 'Talla', 
    icon: Shirt, 
    suggestions: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] 
  },
  { 
    id: 'color', 
    name: 'Color', 
    icon: Palette, 
    suggestions: ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Amarillo', 'Rosa', 'Gris'] 
  },
  { 
    id: 'tamaño', 
    name: 'Tamaño', 
    icon: Ruler, 
    suggestions: ['Pequeño', 'Mediano', 'Grande', 'Extra Grande'] 
  },
  { 
    id: 'material', 
    name: 'Material', 
    icon: Package, 
    suggestions: ['Algodón', 'Lana', 'Cuero', 'Madera', 'Cerámica', 'Metal'] 
  },
];

export const ProductVariantsEditor: React.FC<ProductVariantsEditorProps> = ({
  hasVariants,
  variantOptions,
  variants,
  basePrice,
  onHasVariantsChange,
  onVariantOptionsChange,
  onVariantsChange,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [newValue, setNewValue] = useState('');
  const [customTypeName, setCustomTypeName] = useState('');

  // Generate variants when options change
  const generateVariants = useCallback((options: VariantOption[]) => {
    if (options.length === 0 || options.every(o => o.values.length === 0)) {
      onVariantsChange([]);
      return;
    }

    // Generate all combinations
    const generateCombinations = (opts: VariantOption[]): Record<string, string>[] => {
      if (opts.length === 0) return [{}];
      
      const [first, ...rest] = opts;
      const restCombinations = generateCombinations(rest);
      
      if (first.values.length === 0) return restCombinations;
      
      const result: Record<string, string>[] = [];
      for (const value of first.values) {
        for (const combo of restCombinations) {
          result.push({ [first.name]: value, ...combo });
        }
      }
      return result;
    };

    const combinations = generateCombinations(options);
    
    // Create variants preserving existing data where possible
    const newVariants: ProductVariant[] = combinations.map((combo, index) => {
      // Try to find existing variant with same option values
      const existing = variants.find(v => 
        Object.entries(combo).every(([key, val]) => v.optionValues[key] === val)
      );
      
      if (existing) {
        return existing;
      }
      
      return {
        id: `variant-${Date.now()}-${index}`,
        optionValues: combo,
        price: basePrice || 0,
        stock: 1,
        sku: '',
      };
    });

    onVariantsChange(newVariants);
  }, [variants, basePrice, onVariantsChange]);

  const addVariantType = (presetId: string) => {
    const preset = VARIANT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    
    // Check if already exists
    if (variantOptions.some(o => o.name === preset.name)) return;
    
    const newOptions = [...variantOptions, { name: preset.name, values: [] }];
    onVariantOptionsChange(newOptions);
    setSelectedPreset(presetId);
  };

  const addCustomVariantType = () => {
    if (!customTypeName.trim()) return;
    if (variantOptions.some(o => o.name.toLowerCase() === customTypeName.toLowerCase())) return;
    
    const newOptions = [...variantOptions, { name: customTypeName.trim(), values: [] }];
    onVariantOptionsChange(newOptions);
    setCustomTypeName('');
  };

  const removeVariantType = (name: string) => {
    const newOptions = variantOptions.filter(o => o.name !== name);
    onVariantOptionsChange(newOptions);
    generateVariants(newOptions);
  };

  const addValueToOption = (optionName: string, value: string) => {
    if (!value.trim()) return;
    
    const newOptions = variantOptions.map(opt => {
      if (opt.name === optionName && !opt.values.includes(value.trim())) {
        return { ...opt, values: [...opt.values, value.trim()] };
      }
      return opt;
    });
    
    onVariantOptionsChange(newOptions);
    generateVariants(newOptions);
    setNewValue('');
  };

  const removeValueFromOption = (optionName: string, value: string) => {
    const newOptions = variantOptions.map(opt => {
      if (opt.name === optionName) {
        return { ...opt, values: opt.values.filter(v => v !== value) };
      }
      return opt;
    });
    
    onVariantOptionsChange(newOptions);
    generateVariants(newOptions);
  };

  const updateVariant = (variantId: string, field: 'price' | 'stock' | 'sku', value: number | string) => {
    const newVariants = variants.map(v => {
      if (v.id === variantId) {
        return { ...v, [field]: value };
      }
      return v;
    });
    onVariantsChange(newVariants);
  };

  const getCurrentPreset = () => VARIANT_PRESETS.find(p => p.id === selectedPreset);
  const currentOption = variantOptions.find(o => o.name === getCurrentPreset()?.name);

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <Label htmlFor="has-variants" className="font-medium cursor-pointer">
              Este producto tiene variantes
            </Label>
            <p className="text-xs text-muted-foreground">
              Activa si tienes diferentes tallas, colores o tamaños
            </p>
          </div>
        </div>
        <Switch
          id="has-variants"
          checked={hasVariants}
          onCheckedChange={onHasVariantsChange}
        />
      </div>

      {hasVariants && (
        <div className="space-y-4 animate-in slide-in-from-top-2">
          {/* Variant Type Selector */}
          <Card className="p-4 space-y-4">
            <Label>Tipo de variante</Label>
            <div className="flex flex-wrap gap-2">
              {VARIANT_PRESETS.map(preset => {
                const Icon = preset.icon;
                const isActive = variantOptions.some(o => o.name === preset.name);
                return (
                  <Button
                    key={preset.id}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => isActive ? removeVariantType(preset.name) : addVariantType(preset.id)}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {preset.name}
                    {isActive && <X className="w-3 h-3 ml-1" />}
                  </Button>
                );
              })}
            </div>
            
            {/* Custom variant type */}
            <div className="flex gap-2">
              <Input
                placeholder="Tipo personalizado (ej: Sabor, Estilo...)"
                value={customTypeName}
                onChange={(e) => setCustomTypeName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomVariantType()}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCustomVariantType}
                disabled={!customTypeName.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Values for each variant type */}
          {variantOptions.map(option => {
            const preset = VARIANT_PRESETS.find(p => p.name === option.name);
            return (
              <Card key={option.name} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">{option.name}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariantType(option.name)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Current values */}
                <div className="flex flex-wrap gap-2">
                  {option.values.map(value => (
                    <Badge
                      key={value}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive/20 transition-colors"
                      onClick={() => removeValueFromOption(option.name, value)}
                    >
                      {value}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>

                {/* Suggestions */}
                {preset && preset.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {preset.suggestions
                      .filter(s => !option.values.includes(s))
                      .slice(0, 6)
                      .map(suggestion => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => addValueToOption(option.name, suggestion)}
                          className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                        >
                          + {suggestion}
                        </button>
                      ))}
                  </div>
                )}

                {/* Add custom value */}
                <div className="flex gap-2">
                  <Input
                    placeholder={`Agregar ${option.name.toLowerCase()}...`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addValueToOption(option.name, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-1"
                  />
                </div>
              </Card>
            );
          })}

          {/* Variants Table */}
          {variants.length > 0 && (
            <Card className="p-4 space-y-3">
              <Label className="font-medium">Variantes generadas ({variants.length})</Label>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4">Variante</th>
                      <th className="text-left py-2 px-2">Precio</th>
                      <th className="text-left py-2 px-2">Stock</th>
                      <th className="text-left py-2 pl-2">SKU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map(variant => (
                      <tr key={variant.id} className="border-b border-border/50">
                        <td className="py-2 pr-4">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(variant.optionValues).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {value}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="number"
                            value={variant.price}
                            onChange={(e) => updateVariant(variant.id, 'price', Number(e.target.value))}
                            className="w-24 h-8"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))}
                            className="w-20 h-8"
                          />
                        </td>
                        <td className="py-2 pl-2">
                          <Input
                            value={variant.sku || ''}
                            onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                            placeholder="Auto"
                            className="w-24 h-8"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                Stock total: {variants.reduce((sum, v) => sum + v.stock, 0)} unidades
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
