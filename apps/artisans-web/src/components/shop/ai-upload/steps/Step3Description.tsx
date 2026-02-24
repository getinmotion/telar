import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAIRefinement } from '../hooks/useAIRefinement';
import { AIChat } from '../components/AIChat';
import { AIDisclaimer } from '@/components/ui/AIDisclaimer';
import { WizardState } from '../hooks/useWizardState';
import { SaveDraftButton } from '../components/SaveDraftButton';
import { toast } from 'sonner';

interface Step3DescriptionProps {
  images: File[];
  name: string;
  description: string;
  onDescriptionChange: (description: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  wizardState: WizardState;
}

export const Step3Description: React.FC<Step3DescriptionProps> = ({
  images,
  name,
  description,
  onDescriptionChange,
  onNext,
  onPrevious,
  wizardState,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { analyzeImages, refineContent, isRefining } = useAIRefinement();

  // Generate initial description when component mounts
  useEffect(() => {
    if (name && !description) {
      generateDescription();
    }
  }, [name]);

  const generateDescription = async () => {
    if (!name) return;

    setIsGenerating(true);
    try {
      const analysis = await analyzeImages(images);
      if (analysis) {
        onDescriptionChange(analysis.suggestedDescription);
        toast.success('Descripción generada con IA');
      }
    } catch (error) {
      // Fallback description based on name
      const fallbackDescription = `${name} es un producto artesanal de alta calidad, cuidadosamente elaborado con materiales premium. Perfecto para quienes buscan originalidad y excelencia en cada detalle.`;
      onDescriptionChange(fallbackDescription);
      toast.info('Descripción base generada');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineDescription = async (prompt: string) => {
    if (!description) {
      toast.error('Genera una descripción primero');
      return;
    }

    const refinedDescription = await refineContent({
      context: 'product_description',
      currentValue: description,
      userPrompt: prompt,
      additionalContext: {
        productName: name,
        hasImages: images.length > 0,
        imageCount: images.length,
      }
    });

    if (refinedDescription) {
      onDescriptionChange(refinedDescription);
      toast.success('Descripción refinada con IA');
    }
  };

  const handleNext = () => {
    if (!description.trim()) {
      toast.error('Ingresa una descripción para continuar');
      return;
    }
    onNext();
  };

  const descriptionSuggestions = [
    "Añade beneficios del producto",
    "Hazla más emocional",
    "Más técnica y detallada",
    "Enfócate en la calidad",
    "Añade casos de uso",
    "Más persuasiva"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Descripción del producto</h2>
        <p className="text-muted-foreground">
          Crea una descripción que conecte con tus clientes
        </p>
      </div>

      {/* Product Context */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-medium">Contexto del producto</span>
        </div>
        <p className="text-sm">
          <span className="font-medium">Nombre:</span> {name}
        </p>
        {images.length > 0 && (
          <p className="text-sm">
            <span className="font-medium">Imágenes:</span> {images.length} imagen(es) subida(s)
          </p>
        )}
      </div>

      {/* AI Disclaimer */}
      <AIDisclaimer variant="banner" context="generate" className="mb-4" />

      {/* Description Input */}
      <div className="space-y-2">
        <Label htmlFor="productDescription">Descripción del producto</Label>
        {isGenerating ? (
          <div className="h-32 bg-muted/50 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <Sparkles className="w-6 h-6 animate-pulse mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Generando descripción con IA...</p>
            </div>
          </div>
        ) : (
          <Textarea
            id="productDescription"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="La IA generará una descripción automáticamente basada en tu producto..."
            className="min-h-32 text-base leading-relaxed"
          />
        )}
      </div>

      {/* Generate Button */}
      {!description && !isGenerating && (
        <div className="text-center">
          <Button
            onClick={generateDescription}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generar descripción con IA
          </Button>
        </div>
      )}

      {/* AI Chat for Refinement */}
      {description && (
        <AIChat
          title="Refina la descripción con IA"
          placeholder="Ej: Añade beneficios, hazla más emocional, más técnica..."
          onSubmit={handleRefineDescription}
          isProcessing={isRefining}
          currentValue={description}
          suggestions={descriptionSuggestions}
        />
      )}

      {/* Tips */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium">Consejos para una buena descripción</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Destaca los beneficios, no solo las características</li>
          <li>• Usa un lenguaje que conecte emocionalmente</li>
          <li>• Menciona materiales y técnicas artesanales</li>
          <li>• Incluye casos de uso específicos</li>
          <li>• Mantén un tono consistente con tu marca</li>
        </ul>
      </div>

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
            disabled={!description.trim()}
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
