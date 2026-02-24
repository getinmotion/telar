import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAIRefinement } from '../hooks/useAIRefinement';
import { AIChat } from '../components/AIChat';
import { AIDisclaimer } from '@/components/ui/AIDisclaimer';
import { WizardState } from '../hooks/useWizardState';
import { SaveDraftButton } from '../components/SaveDraftButton';
import { toast } from 'sonner';

interface Step2ProductNameProps {
  images: File[];
  name: string;
  onNameChange: (name: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  wizardState: WizardState;
}

type AnalysisStage = 'idle' | 'compressing' | 'uploading' | 'analyzing' | 'complete' | 'error';

export const Step2ProductName: React.FC<Step2ProductNameProps> = ({
  images,
  name,
  onNameChange,
  onNext,
  onPrevious,
  wizardState,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>('idle');
  const [analyzedImageCount, setAnalyzedImageCount] = useState(0);
  const { analyzeImages, refineContent, isRefining, error } = useAIRefinement();

  // Auto-detect new images and re-analyze
  useEffect(() => {
    if (images.length > 0 && images.length !== analyzedImageCount) {
      generateSuggestions();
    }
  }, [images.length, analyzedImageCount]);

  const generateSuggestions = async () => {
    if (images.length === 0) return;

    setIsGenerating(true);
    setAnalysisStage('compressing');
    
    try {
      // Simulate stage progression for better UX
      setTimeout(() => setAnalysisStage('uploading'), 800);
      setTimeout(() => setAnalysisStage('analyzing'), 1600);
      
      const analysis = await analyzeImages(images);
      
      if (analysis) {
        setAnalysisStage('complete');
        setAnalyzedImageCount(images.length);
        setSuggestions([
          analysis.suggestedName,
          `${analysis.suggestedName} Premium`,
          `${analysis.suggestedName} Artesanal`,
          `${analysis.suggestedName} Original`,
        ]);
        
        if (!name) {
          onNameChange(analysis.suggestedName);
        }
        toast.success('¡Análisis completado!');
      } else {
        setAnalysisStage('error');
        toast.error('No se pudo analizar la imagen. Intenta de nuevo.');
      }
    } catch (error) {
      setAnalysisStage('error');
      toast.error('Error generando sugerencias');
      console.error('Error generating suggestions:', error);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setAnalysisStage('idle'), 2000);
    }
  };

  const handleRefineName = async (prompt: string) => {
    if (!name) {
      toast.error('Ingresa un nombre primero');
      return;
    }

    const refinedName = await refineContent({
      context: 'product_name',
      currentValue: name,
      userPrompt: prompt,
      additionalContext: {
        hasImages: images.length > 0,
        imageCount: images.length,
      }
    });

    if (refinedName) {
      onNameChange(refinedName);
      toast.success('Nombre refinado con IA');
    }
  };

  const handleNext = () => {
    if (!name.trim()) {
      toast.error('Ingresa un nombre para continuar');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Nombre de tu producto</h2>
        <p className="text-muted-foreground">
          La IA ha analizado tus imágenes y sugiere estos nombres
        </p>
      </div>

      {/* All Images Preview */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {images.length} {images.length === 1 ? 'imagen cargada' : 'imágenes cargadas'}
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={generateSuggestions}
              disabled={isGenerating}
              className="h-8"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              Re-analizar
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto py-2">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-border"
              >
                <img 
                  src={URL.createObjectURL(image)} 
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index >= 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">No analizada</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {images.length > 3 && (
            <p className="text-sm text-amber-600 dark:text-amber-500 flex items-center gap-1">
              ⚠️ Solo las primeras 3 imágenes se analizan con IA
            </p>
          )}
        </div>
      )}

      {/* Error Display */}
      {analysisStage === 'error' && error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg space-y-3">
          <div>
            <p className="font-medium">❌ Error en el análisis</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateSuggestions}
            className="w-full border-destructive/30 hover:bg-destructive/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar de nuevo
          </Button>
        </div>
      )}

      {/* AI Disclaimer */}
      <AIDisclaimer variant="banner" context="generate" className="mb-4" />

      {/* AI Suggestions */}
      {isGenerating ? (
        <div className="text-center py-8 space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <p className="font-medium">
              {analysisStage === 'compressing' && '🗜️ Comprimiendo imágenes...'}
              {analysisStage === 'uploading' && '📤 Enviando a la IA...'}
              {analysisStage === 'analyzing' && '🤖 Analizando con IA...'}
              {analysisStage === 'complete' && '✅ ¡Completado!'}
              {analysisStage === 'error' && '❌ Error en el análisis'}
              {analysisStage === 'idle' && 'Preparando...'}
            </p>
            <p className="text-sm text-muted-foreground">
              {analysisStage === 'compressing' && 'Optimizando tamaño para análisis más rápido'}
              {analysisStage === 'uploading' && 'Transmitiendo datos al servidor'}
              {analysisStage === 'analyzing' && 'La IA está examinando tus imágenes'}
              {analysisStage === 'complete' && 'Sugerencias generadas exitosamente'}
              {analysisStage === 'error' && 'Hubo un problema, puedes intentar de nuevo'}
              {analysisStage === 'idle' && 'Iniciando proceso...'}
            </p>
          </div>
        </div>
      ) : (
        suggestions.length > 0 && (
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Sugerencias de la IA
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onNameChange(suggestion)}
                  className={`
                    p-3 text-left rounded-lg border transition-all hover:border-primary
                    ${name === suggestion ? 'border-primary bg-primary/5' : 'border-border'}
                  `}
                >
                  <span className="font-medium">{suggestion}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )
      )}

      {/* Manual Input */}
      <div className="space-y-2">
        <Label htmlFor="productName">Nombre del producto</Label>
        <Input
          id="productName"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ingresa el nombre de tu producto..."
          className="text-lg"
        />
      </div>

      {/* AI Chat for Refinement */}
      {name && (
        <AIChat
          title="Refina el nombre con IA"
          placeholder="Ej: Hazlo más elegante, más comercial, más creativo..."
          onSubmit={handleRefineName}
          isProcessing={isRefining}
          currentValue={name}
        />
      )}

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
            disabled={!name.trim()}
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
