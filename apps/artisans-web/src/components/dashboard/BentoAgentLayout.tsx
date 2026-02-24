
import React, { useState } from 'react';
import { useAgentConversations } from '@/hooks/useAgentConversations';
import { ConversationHistorySidebar } from './ConversationHistorySidebar';
import { AgentMiniDashboard } from './AgentMiniDashboard';
import { ModernFloatingAgentChat } from './ModernFloatingAgentChat';
import { AgentQuickActions } from './AgentQuickActions';
import { CollapsibleMoreTools } from './CollapsibleMoreTools';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTaskChatActions } from '@/hooks/useTaskChatActions';
import { Button } from '@/components/ui/button';
import { MessageSquare, BarChart3, Zap, Menu, Plus, PanelLeftClose, PanelRightClose, ListTodo, ArrowLeft } from 'lucide-react';
import { AgentTasksPanel } from './AgentTasksPanel';
import { useToast } from '@/hooks/use-toast';

interface BentoAgentLayoutProps {
  selectedAgent: string;
  language: 'en' | 'es';
  onBack: () => void;
}

export const BentoAgentLayout: React.FC<BentoAgentLayoutProps> = ({
  selectedAgent,
  language,
  onBack
}) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'chat' | 'conversations' | 'dashboard' | 'actions'>('chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'conversations' | 'tasks'>('conversations');
  const [isCreatingTaskConversation, setIsCreatingTaskConversation] = useState(false);

  const conversationManager = useAgentConversations(selectedAgent);
  const { handleTaskAction } = useTaskChatActions(selectedAgent);

  const t = {
    en: {
      chat: "Chat",
      conversations: "History", 
      dashboard: "Stats",
      actions: "Actions",
      tasks: "Tasks",
      back: "Back",
      creatingTaskConversation: "Starting conversation with agent..."
    },
    es: {
      chat: "Chat",
      conversations: "Historial",
      dashboard: "Stats", 
      actions: "Acciones",
      tasks: "Tareas",
      back: "Volver",
      creatingTaskConversation: "Iniciando misión..."
    }
  };

  // Function to handle chat with task context - ALWAYS creates new conversation
  const handleChatWithTaskContext = async (taskId: string, taskTitle: string) => {
    // Prevent multiple simultaneous calls
    if (isCreatingTaskConversation) {
      console.log('Already creating a task conversation, ignoring duplicate call');
      return;
    }

    setIsCreatingTaskConversation(true);
    console.log('=== STARTING TASK CONVERSATION ===');
    console.log('Task ID:', taskId);
    console.log('Task Title:', taskTitle);
    console.log('Agent ID:', selectedAgent);
    
    try {
      // Switch to chat tab in mobile view
      if (isMobile) {
        setActiveTab('chat');
      }
      
      // Switch to conversations in sidebar
      setSidebarTab('conversations');
      
      // Always create a new conversation for the task
      console.log('Calling createTaskConversation...');
      const conversationId = await conversationManager.createTaskConversation(taskId, taskTitle);
      console.log('createTaskConversation returned:', conversationId);
      
      if (conversationId) {
        console.log('✅ Task conversation created successfully:', conversationId);
        toast({
          title: 'Conversación iniciada',
          description: `Conversación creada para la tarea: ${taskTitle}`,
        });
        
        // Ensure the conversation is selected
        if (conversationManager.selectConversation) {
          console.log('Selecting the new conversation...');
          conversationManager.selectConversation(conversationId);
        }
      } else {
        console.error('❌ createTaskConversation returned null/undefined');
        
        // Fallback: Try to start a generic conversation
        console.log('Attempting fallback: starting generic conversation...');
        conversationManager.startNewConversation();
        
        // Add initial message about the task
        setTimeout(() => {
          if (conversationManager.currentConversationId && conversationManager.addMessage) {
            const initialMessage = `Quiero trabajar en la tarea: "${taskTitle}"`;
            console.log('Adding fallback message:', initialMessage);
            conversationManager.addMessage(
              conversationManager.currentConversationId, 
              initialMessage, 
              'user'
            );
          }
        }, 500);
        
        toast({
          title: 'Conversación iniciada',
          description: `Chat abierto para discutir: ${taskTitle}`,
        });
      }
    } catch (error) {
      console.error('❌ ERROR in handleChatWithTaskContext:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      
      // Fallback: Always try to open a generic chat
      try {
        console.log('🔄 Attempting final fallback...');
        conversationManager.startNewConversation();
        
        toast({
          title: 'Chat iniciado',
          description: `Puedes discutir la tarea "${taskTitle}" en el chat general`,
          variant: 'default',
        });
      } catch (fallbackError) {
        console.error('❌ Even fallback failed:', fallbackError);
        toast({
          title: 'Error',
          description: 'No se pudo iniciar ningún tipo de conversación. Intenta recargar la página.',
          variant: 'destructive',
        });
      }
    } finally {
      console.log('=== ENDING TASK CONVERSATION ATTEMPT ===');
      setIsCreatingTaskConversation(false);
    }
  };

  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20 pt-20">
        {/* Mobile back button */}
        <div className="mb-4 px-4 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            {t[language].back}
          </Button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col px-4">
          {/* Main content area with tab switching */}
          <div className="flex-1 mb-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
            {activeTab === 'chat' && (
              <ModernFloatingAgentChat
                agentId={selectedAgent}
                language={language}
                showHeader={false}
                messages={conversationManager.messages}
                currentConversationId={conversationManager.currentConversationId}
                isProcessing={conversationManager.isProcessing || isCreatingTaskConversation}
                messagesLoading={conversationManager.messagesLoading}
                setIsProcessing={conversationManager.setIsProcessing}
                createConversation={conversationManager.createConversation}
                addMessage={conversationManager.addMessage}
                onTaskAction={handleTaskAction}
              />
            )}
            
            {activeTab === 'conversations' && (
              <div className="h-full p-4">
                <ConversationHistorySidebar
                  agentId={selectedAgent}
                  language={language}
                  conversations={conversationManager.conversations}
                  currentConversationId={conversationManager.currentConversationId}
                  selectConversation={conversationManager.selectConversation}
                  startNewConversation={conversationManager.startNewConversation}
                  deleteConversation={conversationManager.deleteConversation}
                  loading={conversationManager.loading}
                />
              </div>
            )}
            
            {activeTab === 'dashboard' && (
              <div className="h-full p-4">
                <AgentMiniDashboard 
                  agentId={selectedAgent} 
                  language={language} 
                />
              </div>
            )}
            
            {activeTab === 'actions' && (
              <div className="h-full p-4">
                <AgentQuickActions 
                  agentId={selectedAgent} 
                  language={language} 
                />
              </div>
            )}
          </div>
          
          {/* Mobile bottom navigation */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4">
            <div className="flex justify-around items-center">
              <Button
                variant={activeTab === 'chat' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('chat')}
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  activeTab === 'chat' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs">{t[language].chat}</span>
              </Button>
              
              <Button
                variant={activeTab === 'conversations' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('conversations')}
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  activeTab === 'conversations' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Menu className="w-5 h-5" />
                <span className="text-xs">{t[language].conversations}</span>
              </Button>
              
              <Button
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  activeTab === 'dashboard' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs">{t[language].dashboard}</span>
              </Button>
              
              <Button
                variant={activeTab === 'actions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('actions')}
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  activeTab === 'actions' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Zap className="w-5 h-5" />
                <span className="text-xs">{t[language].actions}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex gap-4 pt-20">
      {/* Sidebar */}
      <div className={`h-full transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarCollapsed ? 'w-[68px]' : 'w-[340px]'}`}>
        {isSidebarCollapsed ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 h-full p-2 flex flex-col items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(false)} className="text-white hover:bg-white/10 w-full">
              <PanelRightClose className="w-5 h-5" />
            </Button>
            <div className="flex-1 flex flex-col gap-2 w-full mt-2">
              <Button
                variant={sidebarTab === 'conversations' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setSidebarTab('conversations')}
                className={`text-white w-full h-12 ${sidebarTab === 'conversations' ? 'bg-accent/30' : 'hover:bg-white/10'}`}
                title={t[language].conversations}
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
              <Button
                variant={sidebarTab === 'tasks' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setSidebarTab('tasks')}
                className={`text-white w-full h-12 ${sidebarTab === 'tasks' ? 'bg-primary/30' : 'hover:bg-white/10'}`}
                title={t[language].tasks}
              >
                <ListTodo className="w-5 h-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={conversationManager.startNewConversation}
              className="text-white bg-accent hover:bg-accent/90 w-full h-12"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 h-full flex flex-col p-3">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-1 p-1 bg-black/20 rounded-lg">
                <Button 
                  size="sm" 
                  onClick={() => setSidebarTab('conversations')}
                  className={`text-xs px-3 py-1 h-auto transition-colors ${sidebarTab === 'conversations' ? 'bg-accent text-white' : 'bg-transparent text-white/70 hover:bg-white/10'}`}
                >
                  <MessageSquare className="w-3 h-3 mr-2"/>
                  {t[language].conversations}
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setSidebarTab('tasks')}
                  className={`text-xs px-3 py-1 h-auto transition-colors ${sidebarTab === 'tasks' ? 'bg-primary text-white' : 'bg-transparent text-white/70 hover:bg-white/10'}`}
                >
                  <ListTodo className="w-3 h-3 mr-2"/>
                  {t[language].tasks}
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(true)} className="text-white hover:bg-white/10">
                <PanelLeftClose className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 min-h-0">
              {sidebarTab === 'conversations' ? (
                <ConversationHistorySidebar
                  agentId={selectedAgent}
                  language={language}
                  conversations={conversationManager.conversations}
                  currentConversationId={conversationManager.currentConversationId}
                  selectConversation={conversationManager.selectConversation}
                  startNewConversation={conversationManager.startNewConversation}
                  deleteConversation={conversationManager.deleteConversation}
                  loading={conversationManager.loading}
                />
              ) : (
                <AgentTasksPanel 
                  agentId={selectedAgent} 
                  language={language}
                  onChatWithAgent={handleChatWithTaskContext}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main chat - Now takes full remaining width */}
      <div className="flex-1 h-full min-w-0">
        {isCreatingTaskConversation && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-white">{t[language].creatingTaskConversation}</p>
            </div>
          </div>
        )}
        <ModernFloatingAgentChat
          agentId={selectedAgent}
          language={language}
          onBack={onBack}
          showHeader={true}
          messages={conversationManager.messages}
          currentConversationId={conversationManager.currentConversationId}
          isProcessing={conversationManager.isProcessing || isCreatingTaskConversation}
          messagesLoading={conversationManager.messagesLoading}
          setIsProcessing={conversationManager.setIsProcessing}
          createConversation={conversationManager.createConversation}
          addMessage={conversationManager.addMessage}
          onTaskAction={handleTaskAction}
        />
      </div>

      {/* Right widgets - TEMPORARILY REMOVED TO GIVE MORE SPACE TO CHAT */}
      {/* Uncomment this section to restore the right sidebar modules */}
      {/*
      <div className="w-[340px] h-full flex flex-col gap-4 flex-shrink-0">
        <div className="flex-1 min-h-0">
          <AgentMiniDashboard agentId={selectedAgent} language={language} />
        </div>
        <div className="flex-1 min-h-0">
          <AgentQuickActions agentId={selectedAgent} language={language} />
        </div>
        <div className="flex-1 min-h-0">
          <CollapsibleMoreTools language={language} agentId={selectedAgent} />
        </div>
      </div>
      */}
    </div>
  );
};
