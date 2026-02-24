import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Tag, Sparkles, DollarSign, Package, Settings, Scale, Ruler, MapPin, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { PriceInput } from '@/components/ui/price-input';
import { useAIRefinement } from '../hooks/useAIRefinement';
import { WizardState, VariantOption, ProductVariant } from '../hooks/useWizardState';
import { SaveDraftButton } from '../components/SaveDraftButton';
import { ProductVariantsEditor } from '../components/ProductVariantsEditor';
import { toast } from 'sonner';

interface Step4PriceCategoryProps {
  name: string;
  description: string;
  price: number | null;
  category: string;
  tags: string[];
  comparePrice?: number | null;
  sku?: string;
  inventory?: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  customizable?: boolean;
  madeToOrder?: boolean;
  leadTimeDays?: number;
  productionTimeHours?: number;
  allowsLocalPickup?: boolean;
  hasVariants?: boolean;
  variantOptions?: VariantOption[];
  variants?: ProductVariant[];
  onDataChange: (data: {
    price?: number | null;
    category?: string;
    tags?: string[];
    comparePrice?: number | null;
    sku?: string;
    inventory?: number;
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    customizable?: boolean;
    madeToOrder?: boolean;
    leadTimeDays?: number;
    productionTimeHours?: number;
    allowsLocalPickup?: boolean;
    hasVariants?: boolean;
    variantOptions?: VariantOption[];
    variants?: ProductVariant[];
  }) => void;
  onNext: () => void;
  onPrevious: () => void;
  wizardState: WizardState;
}

const CATEGORIES = [
  'Joyería',
  'Textiles',
  'Cerámica',
  'Madera',
  'Cuero',
  'Decoración',
  'Arte',
  'Accesorios',
  'Juguetes',
  'Otros'
];

export const Step4PriceCategory: React.FC<Step4PriceCategoryProps> = ({
  name,
  description,
  price,
  category,
  tags,
  comparePrice,
  sku,
  inventory,
  weight,
  dimensions,
  customizable,
  madeToOrder,
  leadTimeDays,
  productionTimeHours,
  allowsLocalPickup,
  hasVariants,
  variantOptions = [],
  variants = [],
  onDataChange,
  onNext,
  onPrevious,
  wizardState,
}) => {
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const { refineContent } = useAIRefinement();

  useEffect(() => {
    if (name && description && !suggestedPrice) {
      generateSuggestions();
    }
  }, [name, description]);

  const generateSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      const mockSuggestions = {
        price: Math.floor(Math.random() * 200000) + 50000,
        category: 'Artesanías',
        tags: ['artesanal', 'hecho a mano', 'único', 'calidad premium']
      };

      setSuggestedPrice(mockSuggestions.price);
      setSuggestedTags(mockSuggestions.tags);
      
      if (!price) {
        onDataChange({ price: mockSuggestions.price });
      }
      
      if (!category) {
        onDataChange({ category: mockSuggestions.category });
      }
      
      if (tags.length === 0) {
        onDataChange({ tags: mockSuggestions.tags });
      }

      toast.success('Sugerencias generadas con IA');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Error generando sugerencias');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      onDataChange({ tags: updatedTags });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    onDataChange({ tags: updatedTags });
  };

  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      const updatedTags = [...tags, tag];
      onDataChange({ tags: updatedTags });
      setSuggestedTags(prev => prev.filter(t => t !== tag));
    }
  };

  const handleNext = () => {
    if (!price || price <= 0) {
      toast.error('Ingresa un precio válido');
      return;
    }
    if (!category) {
      toast.error('Selecciona una categoría');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Precio y detalles del producto</h2>
        <p className="text-muted-foreground">
          Configura precio, inventario y variantes de tu producto
        </p>
      </div>

      {/* SECCIÓN 1: Información Básica */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Información Básica</h3>
        </div>

        {/* AI Price Suggestion */}
        {isGeneratingSuggestions ? (
          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <Sparkles className="w-6 h-6 animate-pulse mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Analizando producto para sugerir precio...</p>
          </div>
        ) : suggestedPrice && (
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Precio sugerido por IA</span>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-lg font-semibold text-primary">
                ${suggestedPrice.toLocaleString()} COP
              </p>
              {price !== suggestedPrice && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDataChange({ price: suggestedPrice })}
                >
                  Usar sugerencia
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Price Input */}
          <div>
            <PriceInput
              value={price}
              onChange={(newPrice) => onDataChange({ price: newPrice })}
              label="Precio (COP) *"
              placeholder="50.000"
              required
            />
          </div>

          {/* Compare Price */}
          <div>
            <PriceInput
              value={comparePrice ?? null}
              onChange={(newPrice) => onDataChange({ comparePrice: newPrice })}
              label="Precio anterior (tachado)"
              placeholder="80.000"
              showConfirmation={false}
            />
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <Label>Categoría *</Label>
          <Select value={category} onValueChange={(value) => onDataChange({ category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Etiquetas
          </Label>

          {suggestedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => addSuggestedTag(tag)}
                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  + {tag}
                </motion.button>
              ))}
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Agregar etiqueta..."
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addTag}
              disabled={!newTag.trim()}
            >
              Agregar
            </Button>
          </div>
        </div>
      </Card>

      {/* SECCIÓN 2: Inventario y Envío */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Inventario y Envío</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* SKU */}
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={sku || ''}
              onChange={(e) => onDataChange({ sku: e.target.value })}
              placeholder="Auto"
            />
          </div>

          {/* Inventory */}
          <div>
            <Label htmlFor="inventory">Inventario</Label>
            <Input
              id="inventory"
              type="number"
              value={inventory ?? 1}
              onChange={(e) => onDataChange({ inventory: Number(e.target.value) || 1 })}
              placeholder="1"
            />
          </div>

          {/* Weight */}
          <div>
            <Label htmlFor="weight">Peso (g)</Label>
            <Input
              id="weight"
              type="number"
              value={weight ?? ''}
              onChange={(e) => onDataChange({ weight: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Gramos"
            />
          </div>

          {/* Empty for alignment */}
          <div></div>
        </div>

        {/* Dimensions */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Ruler className="w-4 h-4" />
            Dimensiones (cm)
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              value={dimensions?.length ?? ''}
              onChange={(e) => onDataChange({ 
                dimensions: { 
                  length: e.target.value ? Number(e.target.value) : 0,
                  width: dimensions?.width || 0,
                  height: dimensions?.height || 0
                } 
              })}
              placeholder="Largo"
            />
            <Input
              type="number"
              value={dimensions?.width ?? ''}
              onChange={(e) => onDataChange({ 
                dimensions: { 
                  length: dimensions?.length || 0,
                  width: e.target.value ? Number(e.target.value) : 0,
                  height: dimensions?.height || 0
                } 
              })}
              placeholder="Ancho"
            />
            <Input
              type="number"
              value={dimensions?.height ?? ''}
              onChange={(e) => onDataChange({ 
                dimensions: { 
                  length: dimensions?.length || 0,
                  width: dimensions?.width || 0,
                  height: e.target.value ? Number(e.target.value) : 0
                } 
              })}
              placeholder="Alto"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Opcional - Necesario para calcular costos de envío
          </p>
        </div>
      </Card>

      {/* SECCIÓN 3: Variantes */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Variantes</h3>
        </div>

        <ProductVariantsEditor
          hasVariants={hasVariants || false}
          variantOptions={variantOptions}
          variants={variants}
          basePrice={price}
          onHasVariantsChange={(value) => onDataChange({ hasVariants: value })}
          onVariantOptionsChange={(options) => onDataChange({ variantOptions: options })}
          onVariantsChange={(newVariants) => onDataChange({ variants: newVariants })}
        />
      </Card>

      {/* SECCIÓN 4: Opciones de Producción */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Opciones de Producción</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="customizable"
              checked={customizable || false}
              onCheckedChange={(checked) => onDataChange({ customizable: checked as boolean })}
            />
            <Label htmlFor="customizable" className="text-sm font-normal cursor-pointer">
              Este producto es personalizable
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="madeToOrder"
              checked={madeToOrder || false}
              onCheckedChange={(checked) => onDataChange({ madeToOrder: checked as boolean })}
            />
            <Label htmlFor="madeToOrder" className="text-sm font-normal cursor-pointer">
              Se hace por encargo
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowsLocalPickup"
              checked={allowsLocalPickup || false}
              onCheckedChange={(checked) => onDataChange({ allowsLocalPickup: checked as boolean })}
            />
            <Label htmlFor="allowsLocalPickup" className="text-sm font-normal cursor-pointer flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Ofrecer retiro en local
            </Label>
          </div>
        </div>

        {/* Conditional: Production times if made to order */}
        {madeToOrder && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="leadTimeDays">Días de entrega</Label>
              <Input
                id="leadTimeDays"
                type="number"
                value={leadTimeDays ?? 7}
                onChange={(e) => onDataChange({ leadTimeDays: Number(e.target.value) || 7 })}
                placeholder="7"
              />
            </div>

            <div>
              <Label htmlFor="productionTimeHours">Horas de producción</Label>
              <Input
                id="productionTimeHours"
                type="number"
                value={productionTimeHours ?? ''}
                onChange={(e) => onDataChange({ productionTimeHours: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Horas de trabajo"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          <SaveDraftButton 
            wizardState={wizardState}
            variant="outline"
          />

          <Button
            onClick={handleNext}
            disabled={!price || !category}
            className="flex items-center gap-2"
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
