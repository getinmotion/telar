import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AIDisclaimer } from '@/components/ui/AIDisclaimer';

interface AIChatProps {
  title: string;
  placeholder: string;
  onSubmit: (prompt: string) => Promise<void>;
  isProcessing: boolean;
  currentValue: string;
  suggestions?: string[];
}

export const AIChat: React.FC<AIChatProps> = ({
  title,
  placeholder,
  onSubmit,
  isProcessing,
  currentValue,
  suggestions = [
    "Hazlo más elegante",
    "Más comercial",
    "Más creativo",
    "Más profesional",
    "Más emotivo",
    "Más directo"
  ],
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing) return;

    await onSubmit(prompt);
    setPrompt('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isProcessing) return;
    onSubmit(suggestion);
  };

  return (
    <Card className="p-4 space-y-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-medium">{title}</h3>
      </div>
      
      <AIDisclaimer variant="inline" context="refine" className="mt-2" />

      {/* Current Value Display */}
      <div className="bg-background/80 rounded-lg p-3 border">
        <p className="text-sm text-muted-foreground mb-1">Valor actual:</p>
        <p className="font-medium">{currentValue}</p>
      </div>

      {/* Quick Suggestions */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Sugerencias rápidas:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isProcessing}
              className="px-3 py-1 text-sm bg-background/60 hover:bg-background border border-border rounded-full transition-colors disabled:opacity-50"
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          disabled={isProcessing}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!prompt.trim() || isProcessing}
          size="icon"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          La IA está procesando tu solicitud...
        </motion.div>
      )}
    </Card>
  );
};