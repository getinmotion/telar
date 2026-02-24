import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { VoiceInput } from '@/components/ui/voice-input';
import { Mic } from 'lucide-react';

interface TextAreaWithVoiceProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  language: 'en' | 'es';
  rows?: number;
}

export const TextAreaWithVoice: React.FC<TextAreaWithVoiceProps> = ({
  value,
  onChange,
  placeholder,
  helpText,
  language,
  rows = 4
}) => {
  const characterCount = value.length;
  const minChars = 10;
  const isShort = characterCount > 0 && characterCount < minChars;

  return (
    <div className="space-y-2">
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || (language === 'es' ? 'Escribe tu respuesta aquí...' : 'Write your answer here...')}
          rows={rows}
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

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground flex items-center gap-1">
          <Mic className="w-3 h-3" />
          {language === 'es' 
            ? 'Puedes usar el micrófono para dictar' 
            : 'You can use the microphone to dictate'}
        </span>
        
        <div className="flex items-center gap-2">
          {isShort && (
            <span className="text-warning">
              {language === 'es' ? '⚠️ Muy corta' : '⚠️ Too short'}
            </span>
          )}
          {characterCount > 0 && !isShort && characterCount < 50 && (
            <span className="text-muted-foreground">
              {language === 'es' ? '✓ Buena respuesta' : '✓ Good answer'}
            </span>
          )}
          {characterCount >= 50 && (
            <span className="text-success">
              {language === 'es' ? '✓ Excelente detalle' : '✓ Excellent detail'}
            </span>
          )}
          <span className="text-muted-foreground">{characterCount} caracteres</span>
        </div>
      </div>
    </div>
  );
};
