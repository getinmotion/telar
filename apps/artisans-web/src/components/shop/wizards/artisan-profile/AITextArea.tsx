import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Sparkles, Loader2, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VoiceInput } from '@/components/ui/voice-input';
import { useAIRefinement } from '@/components/shop/ai-upload/hooks/useAIRefinement';
import { useToast } from '@/components/ui/use-toast';

interface AITextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  hint?: string;
  context?: string;
  maxLength?: number;
  required?: boolean;
  className?: string;
}

export const AITextArea: React.FC<AITextAreaProps> = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  label,
  hint,
  context = 'artisan_profile',
  maxLength,
  required = false,
  className,
}) => {
  const { toast } = useToast();
  const { refineContent, isRefining } = useAIRefinement();
  const [showVoice, setShowVoice] = useState(false);
  const [isRefined, setIsRefined] = useState(false);

  const handleVoiceTranscript = (transcript: string) => {
    // Append to existing value or set as new value
    const newValue = value ? `${value} ${transcript}` : transcript;
    onChange(newValue);
    setShowVoice(false);
  };

  const handleRefine = async () => {
    if (!value.trim()) {
      toast({
        title: "Sin texto",
        description: "Escribe algo primero para poder refinarlo",
        variant: "destructive",
      });
      return;
    }

    try {
      const refined = await refineContent({
        context,
        currentValue: value,
        userPrompt: "Refina este texto manteniendo la autenticidad y voz del artesano. Corrige ortografía y gramática, mejora la claridad y fluidez, pero mantén el mensaje y sentimiento original. Responde SOLO con el texto refinado, sin explicaciones.",
      });

      if (refined) {
        onChange(refined);
        setIsRefined(true);
        toast({
          title: "Texto refinado",
          description: "Tu texto ha sido mejorado manteniendo tu voz",
        });
        // Reset refined indicator after 3 seconds
        setTimeout(() => setIsRefined(false), 3000);
      }
    } catch (error) {
      console.error('Error refining:', error);
      toast({
        title: "Error",
        description: "No se pudo refinar el texto",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label and actions */}
      <div className="flex items-center justify-between">
        {label && (
          <span className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </span>
        )}
        <div className="flex items-center gap-1">
          {/* Voice button */}
          <Button
            type="button"
            variant={showVoice ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowVoice(!showVoice)}
            className="h-7 px-2 text-xs gap-1"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dictar</span>
          </Button>

          {/* Refine button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRefine}
            disabled={isRefining || !value.trim()}
            className="h-7 px-2 text-xs gap-1"
          >
            {isRefining ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isRefined ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isRefining ? 'Refinando...' : isRefined ? 'Refinado' : 'Refinar con IA'}
            </span>
          </Button>
        </div>
      </div>

      {/* Voice input dropdown */}
      <AnimatePresence>
        {showVoice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-dashed">
              <VoiceInput 
                onTranscript={handleVoiceTranscript}
                language="es"
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground">
                Presiona el micrófono y habla
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Textarea */}
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            "resize-none transition-all",
            isRefined && "ring-2 ring-success/50"
          )}
        />
        
        {/* Character count */}
        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {value.length}/{maxLength}
          </div>
        )}
      </div>

      {/* Hint */}
      {hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
};