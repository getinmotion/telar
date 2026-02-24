
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { AgentsList } from './AgentsList';
import { Agent } from '@/types/dashboard';
import { DashboardSummary } from './DashboardSummary';
import { useIsMobile } from '@/hooks/use-mobile';
import { mapToLegacyLanguage } from '@/utils/languageMapper';

interface DashboardMainProps {
  onSelectAgent: (id: string) => void;
  agents: Agent[];
}

export const DashboardMain: React.FC<DashboardMainProps> = ({ 
  onSelectAgent,
  agents
}) => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  
  const t = {
    en: {
      greeting: "Hello, Manu!",
      agentsReady: "Your agents are ready",
      configureAccount: "Configure account",
      myAgents: "My Agents",
      addNewAgent: "Add new agent",
      maturityCalculator: "Maturity Calculator"
    },
    es: {
      greeting: "¡Hola, Manu!",
      agentsReady: "Tus agentes están listos",
      configureAccount: "Configurar cuenta",
      myAgents: "Mis Agentes",
      addNewAgent: "Agregar agente nuevo",
      maturityCalculator: "Calculadora de Madurez"
    }
  };

  const handleAgentAction = (id: string, action: string) => {
    console.log(`Agent ${id} action: ${action}`);
    if (action === 'enter') {
      onSelectAgent(id);
    }
    // Here you would implement the actual agent status changes
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-xl sm:text-2xl font-medium mb-1 sm:mb-2">
          {t[language].greeting}
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          {t[language].agentsReady}
        </p>
      </div>
      
      {/* Dashboard summary */}
      <DashboardSummary language={mapToLegacyLanguage(language)} />
      
      {/* Agents section */}
      <div>
        <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
          <span className="mr-2">🧠</span>
          {t[language].myAgents}
        </h2>
        
        <AgentsList 
          agents={agents} 
          onAgentAction={handleAgentAction} 
          addNewAgentText={t[language].addNewAgent}
          language={mapToLegacyLanguage(language)}
        />
      </div>
    </div>
  );
};
