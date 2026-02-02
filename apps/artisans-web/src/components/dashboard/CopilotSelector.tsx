
import React from 'react';
import { FileText, Receipt, Calculator, FileSpreadsheet, Briefcase, Palette, Music, Globe, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { agentSystemPrompts } from '@/hooks/use-ai-agent';

export type RecommendedAgents = {
  admin: boolean;
  accounting: boolean;
  legal: boolean;
  operations: boolean;
  cultural: boolean; // New agent type for cultural creators
};

interface Agent {
  id: string;
  name: string;
  iconType: string;
  color: string;
  soon: boolean;
  greeting: string;
  category?: string; // Optional category for grouping
  chatEnabled?: boolean; // Whether this agent can chat using OpenAI
}

interface CopilotSelectorProps {
  onSelectCopilot: (id: string) => void;
  recommendedAgents?: RecommendedAgents;
  showCategories?: boolean; // Option to show agent categories
}

export const CopilotSelector = ({ onSelectCopilot, recommendedAgents, showCategories = false }: CopilotSelectorProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const translations = {
    en: {
      selectCopilot: "Select an agent to get started",
      selectCopilotText: "Choose between different specialized back office agents according to your needs.",
      adminAssistant: "Administrative Assistant",
      accountingAgent: "Accounting Agent",
      legalAdvisor: "Legal Advisor",
      operationsManager: "Operations Manager",
      culturalCreatorAgent: "Cultural Creator Agent",
      betaVersion: "Beta version",
      comingSoon: "Coming soon",
      aiEnabled: "AI enabled",
      // Categories
      backOfficeCategory: "Back Office",
      culturalCategory: "Cultural Sector",
      financialCategory: "Financial Management",
      legalCategory: "Legal Support"
    },
    es: {
      selectCopilot: "Selecciona una misión para comenzar",
      selectCopilotText: "Elige entre diferentes misiones especializadas de back office según tus necesidades.",
      adminAssistant: "Asistente Administrativo",
      accountingAgent: "Agente Contable",
      legalAdvisor: "Asesor Legal",
      operationsManager: "Gerente de Operaciones",
      culturalCreatorAgent: "Agente para Creadores Culturales",
      betaVersion: "Versión beta",
      comingSoon: "Próximamente",
      aiEnabled: "IA habilitada",
      // Categories
      backOfficeCategory: "Back Office",
      culturalCategory: "Sector Cultural",
      financialCategory: "Gestión Financiera",
      legalCategory: "Soporte Legal"
    }
  };
  
  const t = translations[language];
  
  // Check if agent has a system prompt (indicating it can chat)
  const isChatEnabled = (id: string) => {
    return Boolean(agentSystemPrompts[id]);
  };
  
  // Helper function to render icons based on iconType
  const renderIcon = (iconType: string) => {
    const iconProps = { className: "w-5 h-5" };
    switch(iconType) {
      case 'FileText':
        return <FileText {...iconProps} />;
      case 'Calculator':
        return <Calculator {...iconProps} />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet {...iconProps} />;
      case 'Briefcase':
        return <Briefcase {...iconProps} />;
      case 'Palette':
        return <Palette {...iconProps} />;
      default:
        return <FileText {...iconProps} />;
    }
  };
  
  const agents: Agent[] = [
    { 
      id: "admin", 
      name: t.adminAssistant, 
      iconType: "FileText", 
      color: "bg-violet-100 text-violet-700", 
      soon: false,
      category: t.backOfficeCategory,
      chatEnabled: isChatEnabled("admin"),
      greeting: language === 'en' 
        ? "Hi there! I'm your Administrative Assistant. I can help you organize your files, manage appointments, and handle correspondence. How can I assist you today?"
        : "¡Hola! Soy tu Asistente Administrativo. Puedo ayudarte a organizar tus archivos, gestionar citas y manejar correspondencia. ¿Cómo puedo ayudarte hoy?"
    },
    { 
      id: "accounting", 
      name: t.accountingAgent, 
      iconType: "Calculator", 
      color: "bg-indigo-100 text-indigo-700", 
      soon: false,
      category: t.financialCategory,
      chatEnabled: isChatEnabled("accounting"),
      greeting: language === 'en'
        ? "Hello! I'm your Accounting Agent. I can help you track expenses, prepare for tax filings, and manage your financial records. What financial tasks are you working on?"
        : "¡Hola! Soy tu Agente Contable. Puedo ayudarte a seguir gastos, preparar declaraciones de impuestos y gestionar tus registros financieros. ¿En qué tareas financieras estás trabajando?"
    },
    { 
      id: "legal", 
      name: t.legalAdvisor, 
      iconType: "FileSpreadsheet", 
      color: "bg-blue-100 text-blue-700", 
      soon: false,
      category: t.legalCategory,
      chatEnabled: isChatEnabled("legal"),
      greeting: language === 'en'
        ? "Hi! I'm your Legal Advisor. I can help you understand legal requirements, review contracts, and manage compliance issues. What legal matters can I assist you with today?"
        : "¡Hola! Soy tu Asesor Legal. Puedo ayudarte a entender requisitos legales, revisar contratos y gestionar temas de cumplimiento. ¿En qué asuntos legales puedo ayudarte hoy?"
    },
    { 
      id: "operations", 
      name: t.operationsManager, 
      iconType: "Briefcase", 
      color: "bg-emerald-100 text-emerald-700", 
      soon: false,
      category: t.backOfficeCategory,
      chatEnabled: isChatEnabled("operations"),
      greeting: language === 'en'
        ? "Hello! I'm your Operations Manager. I can help streamline your business processes, manage workflows, and optimize productivity. What operational challenges are you facing today?"
        : "¡Hola! Soy tu Gerente de Operaciones. Puedo ayudar a optimizar tus procesos de negocio, gestionar flujos de trabajo y mejorar la productividad. ¿Qué desafíos operativos enfrentas hoy?"
    },
    { 
      id: "cultural", 
      name: t.culturalCreatorAgent, 
      iconType: "Palette", 
      color: "bg-pink-100 text-pink-700", 
      soon: false,
      category: t.culturalCategory,
      chatEnabled: isChatEnabled("cultural"),
      greeting: language === 'en'
        ? "Hi there! I'm your Cultural Creator Agent. I can help you with contracts, cost calculations, portfolio creation, and export strategies specific to cultural creators. How can I assist you today?"
        : "¡Hola! Soy tu Agente para Creadores Culturales. Puedo ayudarte con contratos, cálculos de costos, creación de portafolios y estrategias de exportación específicas para creadores culturales. ¿Cómo puedo ayudarte hoy?"
    }
  ];

  // Group agents by category if showCategories is true
  const groupedAgents = showCategories 
    ? agents.reduce((acc, agent) => {
        const category = agent.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(agent);
        return acc;
      }, {} as Record<string, Agent[]>)
    : { 'All': agents };

  const handleSelectCopilot = (id: string) => {
    if (agents.find(c => c.id === id)?.soon) {
      toast({
        title: language === 'en' ? 'Coming Soon' : 'Próximamente',
        description: language === 'en' 
          ? 'This agent is still in development and will be available soon!'
          : '¡Este agente está aún en desarrollo y estará disponible pronto!',
      });
      return;
    }
    
    onSelectCopilot(id);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
      <h2 className="text-xl font-semibold mb-4">{t.selectCopilot}</h2>
      <p className="text-gray-600 mb-6">
        {t.selectCopilotText}
      </p>
      
      {showCategories ? (
        // Display agents grouped by category
        Object.entries(groupedAgents).map(([category, categoryAgents]) => (
          <div key={category} className="mb-6 last:mb-0">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-3">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryAgents.map((agent) => (
                <div 
                  key={agent.id}
                  className={`p-5 rounded-lg border ${agent.soon ? 'border-gray-200 opacity-70' : 'border-violet-200 cursor-pointer hover:border-violet-300 hover:shadow-sm transition-all'}`}
                  onClick={() => handleSelectCopilot(agent.id)}
                >
                  <div className={`w-10 h-10 rounded-full ${agent.color} flex items-center justify-center mb-3`}>
                    {renderIcon(agent.iconType)}
                  </div>
                  <h3 className="font-medium mb-1">{agent.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {agent.soon ? (
                      <span className="text-xs bg-gray-100 text-gray-500 py-0.5 px-2 rounded-full">
                        {t.comingSoon}
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 py-0.5 px-2 rounded-full">
                        {t.betaVersion}
                      </span>
                    )}
                    {agent.chatEnabled && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 py-0.5 px-2 rounded-full">
                        {t.aiEnabled}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        // Display agents without categories (original layout)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <div 
              key={agent.id}
              className={`p-5 rounded-lg border ${agent.soon ? 'border-gray-200 opacity-70' : 'border-violet-200 cursor-pointer hover:border-violet-300 hover:shadow-sm transition-all'}`}
              onClick={() => handleSelectCopilot(agent.id)}
            >
              <div className={`w-10 h-10 rounded-full ${agent.color} flex items-center justify-center mb-3`}>
                {renderIcon(agent.iconType)}
              </div>
              <h3 className="font-medium mb-1">{agent.name}</h3>
              <div className="flex flex-wrap gap-2">
                {agent.soon ? (
                  <span className="text-xs bg-gray-100 text-gray-500 py-0.5 px-2 rounded-full">
                    {t.comingSoon}
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 py-0.5 px-2 rounded-full">
                    {t.betaVersion}
                  </span>
                )}
                {agent.chatEnabled && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 py-0.5 px-2 rounded-full">
                    {t.aiEnabled}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
