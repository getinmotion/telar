
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown,
  ChevronUp,
  Settings,
  Download,
  HelpCircle,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAgentConversations } from '@/hooks/useAgentConversations';

interface CollapsibleMoreToolsProps {
  language: 'en' | 'es';
  agentId: string;
}

export const CollapsibleMoreTools: React.FC<CollapsibleMoreToolsProps> = ({
  language,
  agentId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const { messages, currentConversationId } = useAgentConversations(agentId);

  const t = {
    en: {
      moreTools: 'More Tools',
      exportChat: 'Export Chat',
      settings: 'Settings',
      help: 'Help',
      noConversation: 'No active conversation to export',
      exportSuccess: 'Chat exported successfully'
    },
    es: {
      moreTools: 'Más Herramientas',
      exportChat: 'Exportar Chat',
      settings: 'Configuración',
      help: 'Ayuda',
      noConversation: 'No hay conversación activa para exportar',
      exportSuccess: 'Chat exportado exitosamente'
    }
  };

  const handleExportChat = () => {
    if (!currentConversationId || messages.length === 0) {
      toast({
        title: language === 'es' ? 'Sin conversación' : 'No conversation',
        description: t[language].noConversation,
        variant: 'destructive'
      });
      return;
    }

    try {
      const chatContent = messages.map(msg => 
        `[${new Date(msg.created_at).toLocaleString()}] ${msg.message_type.toUpperCase()}: ${msg.content}`
      ).join('\n\n');

      const blob = new Blob([chatContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat_export_${currentConversationId}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: language === 'es' ? 'Exportado' : 'Exported',
        description: t[language].exportSuccess
      });
    } catch (error) {
      console.error('Error exporting chat:', error);
      toast({
        title: 'Error',
        description: language === 'es' ? 'No se pudo exportar el chat' : 'Could not export chat',
        variant: 'destructive'
      });
    }
  };

  const handleSettings = () => {
    toast({
      title: language === 'es' ? 'Configuración' : 'Settings',
      description: language === 'es' ? 'Panel de configuración próximamente' : 'Settings panel coming soon'
    });
  };

  const handleHelp = () => {
    toast({
      title: language === 'es' ? 'Ayuda' : 'Help',
      description: language === 'es' ? 'Sistema de ayuda próximamente' : 'Help system coming soon'
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 h-full">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between text-white hover:bg-white/10 p-3 h-auto rounded-2xl"
      >
        <div className="flex items-center gap-2">
          <MoreHorizontal className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{t[language].moreTools}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>
      
      {isExpanded && (
        <div className="p-3 pt-0">
          <div className="space-y-1">
            <button 
              className="w-full text-left text-xs text-muted-foreground hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center"
              onClick={handleExportChat}
            >
              <Download className="w-3 h-3 inline mr-2" />
              {t[language].exportChat}
            </button>
            <button 
              className="w-full text-left text-xs text-muted-foreground hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center"
              onClick={handleSettings}
            >
              <Settings className="w-3 h-3 inline mr-2" />
              {t[language].settings}
            </button>
            <button 
              className="w-full text-left text-xs text-muted-foreground hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center"
              onClick={handleHelp}
            >
              <HelpCircle className="w-3 h-3 inline mr-2" />
              {t[language].help}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
