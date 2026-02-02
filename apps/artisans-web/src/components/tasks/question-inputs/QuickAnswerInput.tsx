import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronDown, Sparkles } from 'lucide-react';
import { VoiceInput } from '@/components/ui/voice-input';

interface QuickAnswerInputProps {
  suggestedAnswers: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  language: 'en' | 'es';
}

export const QuickAnswerInput: React.FC<QuickAnswerInputProps> = ({
  suggestedAnswers,
  value,
  onChange,
  placeholder,
  helpText,
  language
}) => {
  const [showCustom, setShowCustom] = useState(false);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowCustom(true);
  };

  return (
    <div className="space-y-4">
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          <span>{language === 'es' ? 'Respuestas sugeridas:' : 'Suggested answers:'}</span>
        </div>
        
        {suggestedAnswers.map((suggestion, index) => (
          <motion.button
            key={index}
            type="button"
            onClick={() => handleSuggestionClick(suggestion)}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
            className={`
              w-full p-4 rounded-xl border-2 text-left transition-all
              ${value === suggestion
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border hover:border-primary/50 bg-card'
              }
            `}
          >
            <span className={`text-sm ${value === suggestion ? 'text-primary font-medium' : 'text-foreground'}`}>
              {suggestion}
            </span>
          </motion.button>
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={() => setShowCustom(!showCustom)}
        className="w-full text-sm"
      >
        <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${showCustom ? 'rotate-180' : ''}`} />
        {language === 'es' ? 'O escribe tu propia respuesta' : 'Or write your own answer'}
      </Button>

      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2"
          >
            <div className="relative">
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || (language === 'es' ? 'Escribe tu respuesta personalizada...' : 'Write your custom answer...')}
                rows={4}
                className="resize-none pr-12"
              />
              <div className="absolute right-2 top-2">
                <VoiceInput
                  onTranscript={(transcript) => {
                    const newValue = value ? `${value} ${transcript}` : transcript;
                    onChange(newValue);
                  }}
                  language={language}
                  className="h-8 w-8 p-0"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
