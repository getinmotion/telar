
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Settings,
  Zap,
  Upload,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CreateTaskModal } from './CreateTaskModal';
import { DocumentCreator } from './DocumentCreator';
import { FileUploader } from './FileUploader';
import { UserSettings } from './UserSettings';
import { useAgentTasks } from '@/hooks/useAgentTasks';

interface AgentQuickActionsProps {
  agentId: string;
  language: 'en' | 'es';
  compact?: boolean;
}

export const AgentQuickActions: React.FC<AgentQuickActionsProps> = ({
  agentId,
  language,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showDocumentCreator, setShowDocumentCreator] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { createTask } = useAgentTasks(agentId);

  const t = {
    en: {
      quickActions: "Quick Actions",
      newTask: "New Task",
      newDocument: "New Document", 
      schedule: "Schedule",
      upload: "Upload File",
      settings: "Settings",
      automate: "Automate"
    },
    es: {
      quickActions: "Acciones Rápidas",
      newTask: "Nueva Tarea",
      newDocument: "Nuevo Documento",
      schedule: "Programar", 
      upload: "Subir Archivo",
      settings: "Configuración",
      automate: "Automatizar"
    }
  };

  if (compact) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-3 text-center">
        <Plus className="w-5 h-5 text-primary mx-auto mb-1" />
        <div className="text-white text-xs font-medium">{t[language].quickActions}</div>
      </div>
    );
  }

  return (
    <>
      <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl h-full">
        <CardHeader className="pb-2">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-between text-white hover:bg-white/10 p-2 h-auto"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{t[language].quickActions}</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="p-3 pt-0">
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-white/10 h-auto p-2"
                onClick={() => setShowCreateTask(true)}
              >
                <Plus className="w-3 h-3 mr-2" />
                <span className="text-xs">{t[language].newTask}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-white/10 h-auto p-2"
                onClick={() => setShowDocumentCreator(true)}
              >
                <FileText className="w-3 h-3 mr-2" />
                <span className="text-xs">{t[language].newDocument}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-white/10 h-auto p-2"
                onClick={() => alert(language === 'es' ? 'Función de programación próximamente' : 'Schedule feature coming soon')}
              >
                <Calendar className="w-3 h-3 mr-2" />
                <span className="text-xs">{t[language].schedule}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-white/10 h-auto p-2"
                onClick={() => setShowFileUploader(true)}
              >
                <Upload className="w-3 h-3 mr-2" />
                <span className="text-xs">{t[language].upload}</span>
              </Button>
              
              <div className="border-t border-white/10 pt-1 mt-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:bg-white/10 h-auto p-2"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="w-3 h-3 mr-2" />
                  <span className="text-xs">{t[language].settings}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Modals */}
      <CreateTaskModal
        agentId={agentId}
        language={language}
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onCreateTask={createTask}
      />
      
      <DocumentCreator
        agentId={agentId}
        language={language}
        isOpen={showDocumentCreator}
        onClose={() => setShowDocumentCreator(false)}
      />
      
      <FileUploader
        language={language}
        isOpen={showFileUploader}
        onClose={() => setShowFileUploader(false)}
      />
      
      <UserSettings
        language={language}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};
