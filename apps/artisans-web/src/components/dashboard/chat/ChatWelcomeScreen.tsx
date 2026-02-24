
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageCircle, Target } from 'lucide-react';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';

interface ChatWelcomeScreenProps {
  agentId: string;
  agentName: string;
  onSendMessage: (message: string) => void;
  language: 'en' | 'es';
}

export const ChatWelcomeScreen: React.FC<ChatWelcomeScreenProps> = ({
  agentId,
  agentName,
  onSendMessage,
  language
}) => {
  const [taskContext, setTaskContext] = useState<any>(null);
  const [hasPrompt, setHasPrompt] = useState(false);
  const userLocalStorage = useUserLocalStorage();

  useEffect(() => {
    // Check if there's a pending task prompt for this agent
    const storedPrompt = userLocalStorage.getItem(`agent-${agentId}-prompt`);
    const storedTask = userLocalStorage.getItem(`agent-${agentId}-task`);
    
    if (storedPrompt && storedTask) {
      setHasPrompt(true);
      setTaskContext(JSON.parse(storedTask));
    }
  }, [agentId, userLocalStorage]);

  const handleStartTask = () => {
    const storedPrompt = userLocalStorage.getItem(`agent-${agentId}-prompt`);
    if (storedPrompt) {
      onSendMessage(storedPrompt);
      // Clear the stored prompt after using it
      userLocalStorage.removeItem(`agent-${agentId}-prompt`);
      userLocalStorage.removeItem(`agent-${agentId}-task`);
    }
  };

  const t = {
    en: {
      welcome: `Hello! I'm ${agentName}`,
      description: "I'm here to help you with your creative project.",
      startTask: "Start Recommended Task",
      askAnything: "Ask me anything",
      pendingTask: "You have a recommended task ready to start",
      askAnythingPrompt: `Hi ${agentName}, how can you help me today?`
    },
    es: {
      welcome: `¡Hola! Soy ${agentName}`,
      description: "Estoy aquí para ayudarte con tu proyecto creativo.",
      startTask: "Iniciar Tarea Recomendada",
      askAnything: "Pregúntame lo que necesites",
      pendingTask: "Tienes una tarea recomendada lista para empezar",
      askAnythingPrompt: `Hola ${agentName}, ¿cómo puedes ayudarme hoy?`
    }
  };

  return (
    <div className="flex-1 min-h-0 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-primary-foreground" />
        </div>
        
        <h2 className="text-3xl font-bold mb-4">
          {t[language].welcome}
        </h2>
        
        <p className="text-muted-foreground text-lg mb-8">
          {t[language].description}
        </p>

        {/* Task Context Card */}
        {hasPrompt && taskContext && (
          <div className="bg-muted border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-medium">{t[language].pendingTask}</span>
            </div>
            <h4 className="font-semibold mb-2">{taskContext.title}</h4>
            <p className="text-muted-foreground text-sm mb-4">{taskContext.description}</p>
            <Button
              onClick={handleStartTask}
              className="w-full"
            >
              <Target className="w-4 h-4 mr-2" />
              {t[language].startTask}
            </Button>
          </div>
        )}

        {/* General Action */}
        <Button
          variant="outline"
          onClick={() => onSendMessage(t[language].askAnythingPrompt)}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {t[language].askAnything}
        </Button>
      </div>
    </div>
  );
};
