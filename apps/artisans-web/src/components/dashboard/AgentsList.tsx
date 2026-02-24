
import React from 'react';
import { Plus } from 'lucide-react';
import { AgentCard } from './AgentCard';
import { Agent } from '@/types/dashboard';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

interface AgentsListProps {
  agents: Agent[];
  onAgentAction: (id: string, action: string) => void;
  addNewAgentText: string;
  language: 'en' | 'es';
}

export const AgentsList: React.FC<AgentsListProps> = ({ 
  agents, 
  onAgentAction, 
  addNewAgentText,
  language
}) => {
  const isMobile = useIsMobile();
  
  console.log('AgentsList rendering with agents:', agents);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative">
        <Input 
          type="text" 
          placeholder={language === 'en' ? "Search agents..." : "Buscar agentes..."}
          className={`pl-8 bg-muted ${isMobile ? 'h-12 text-base' : 'h-9 sm:h-10'}`}
        />
        <div className={`absolute left-2.5 ${isMobile ? 'top-3.5' : 'top-2.5'}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 14L11.1 11.1" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
      <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'gap-2 sm:gap-3'}`}>
        {agents.length > 0 ? (
          agents.map((agent) => (
            <AgentCard 
              key={agent.id}
              agent={agent}
              onActionClick={onAgentAction}
              language={language}
            />
          ))
        ) : (
          <div className={`text-center ${isMobile ? 'py-12' : 'py-8'} text-muted-foreground`}>
            {language === 'en' ? 'No agents available' : 'No hay agentes disponibles'}
          </div>
        )}
        
        {/* Add new agent card */}
        <div 
          className={`flex items-center ${isMobile ? 'p-4' : 'p-3 sm:p-4'} border border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-all ${isMobile ? 'min-h-[60px]' : ''}`}
          onClick={() => onAgentAction('new', 'create')}
        >
          <div className={`${isMobile ? 'w-10 h-10' : 'w-8 h-8 sm:w-10 sm:h-10'} rounded-full bg-muted flex items-center justify-center ${isMobile ? 'mr-3' : 'mr-2 sm:mr-3'}`}>
            <Plus className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4 sm:w-5 sm:h-5'} text-muted-foreground`} />
          </div>
          <p className={`font-medium ${isMobile ? 'text-base' : 'text-sm sm:text-base'} text-muted-foreground`}>{addNewAgentText}</p>
        </div>
      </div>
    </div>
  );
};
