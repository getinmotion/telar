
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentConversation } from '@/hooks/useAgentConversations';
import { MessageSquare, Plus, Clock, Search, Trash2, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationHistorySidebarProps {
  agentId: string;
  language: 'en' | 'es';
  compact?: boolean;
  onConversationSelect?: (conversationId: string) => void;
  conversations: AgentConversation[];
  currentConversationId: string | null;
  selectConversation: (id: string) => Promise<void>;
  startNewConversation: () => void;
  deleteConversation: (id: string) => Promise<boolean>;
  loading: boolean;
}

export const ConversationHistorySidebar: React.FC<ConversationHistorySidebarProps> = ({
  language,
  onConversationSelect,
  conversations,
  currentConversationId,
  selectConversation,
  startNewConversation,
  deleteConversation,
  loading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  
  const t = {
    en: {
      conversations: "Conversations",
      newChat: "New Chat",
      search: "Search conversations...",
      noConversations: "No conversations yet",
      startFirst: "Start your first chat!",
      deleteConversation: "Delete conversation",
      confirmDelete: "Are you sure you want to delete this conversation?",
      deleteWarning: "This action cannot be undone. All messages in this conversation will be permanently removed.",
      cancel: "Cancel",
      delete: "Delete"
    },
    es: {
      conversations: "Conversaciones",
      newChat: "Chat Nuevo",
      search: "Buscar conversaciones...",
      noConversations: "No hay conversaciones",
      startFirst: "¡Inicia tu primer chat!",
      deleteConversation: "Eliminar conversación",
      confirmDelete: "¿Estás seguro de que quieres eliminar esta conversación?",
      deleteWarning: "Esta acción no se puede deshacer. Todos los mensajes de esta conversación se eliminarán permanentemente.",
      cancel: "Cancelar",
      delete: "Eliminar"
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    !searchQuery
  );

  const handleNewChat = () => {
    console.log('New chat button clicked - starting new conversation');
    startNewConversation();
    if (onConversationSelect) {
      onConversationSelect('new');
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    console.log('Conversation selected:', conversationId);
    try {
      await selectConversation(conversationId);
      console.log('Conversation selection completed successfully');
      
      if (onConversationSelect) {
        onConversationSelect(conversationId);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const success = await deleteConversation(conversationId);
    if (success) {
      setConversationToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-transparent h-full flex flex-col">
      <Button 
        onClick={handleNewChat}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white mb-3 flex-shrink-0"
        size="sm"
      >
        <Plus className="w-4 h-4 mr-2" />
        {t[language].newChat}
      </Button>

      <div className="relative mb-3 flex-shrink-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t[language].search}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
        />
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full pr-3">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t[language].noConversations}</p>
              <p className="text-xs opacity-75">{t[language].startFirst}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all hover:bg-white/10 ${
                    currentConversationId === conv.id 
                      ? 'bg-purple-500/30 border border-purple-400/50' 
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <div 
                    onClick={() => handleSelectConversation(conv.id)}
                    className="flex-1 min-w-0 pr-8"
                  >
                    <p className="text-white text-sm font-medium truncate">
                      {conv.title || 'Nueva conversación'}
                    </p>
                    <div className="flex items-center text-xs text-white/60 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(conv.updated_at), { 
                        addSuffix: true, 
                        locale: language === 'es' ? es : undefined 
                      })}
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            setConversationToDelete(conv.id);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t[language].deleteConversation}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!conversationToDelete} onOpenChange={() => setConversationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t[language].confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>
              {t[language].deleteWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t[language].cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => conversationToDelete && handleDeleteConversation(conversationToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t[language].delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
