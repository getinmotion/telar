
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputBarProps {
  inputMessage: string;
  isProcessing: boolean;
  language: 'en' | 'es';
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  inputMessage,
  isProcessing,
  language,
  onInputChange,
  onSubmit
}) => {
  const t = {
    en: { typeMessage: "Ask me anything..." },
    es: { typeMessage: "Pregúntame lo que quieras..." }
  };

  return (
    <div className="p-4 border-t bg-background">
      <form onSubmit={onSubmit}>
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={t[language].typeMessage}
            className="flex-grow"
            disabled={isProcessing}
          />
          <Button 
            type="submit" 
            disabled={!inputMessage.trim() || isProcessing}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
