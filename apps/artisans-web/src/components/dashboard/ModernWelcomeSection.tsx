
import React from 'react';
import { Sparkles, Bot, TrendingUp } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ModernWelcomeSectionProps {
  language: 'en' | 'es';
}

export const ModernWelcomeSection: React.FC<ModernWelcomeSectionProps> = ({ language }) => {
  const { profile, projects, agents, metrics, loading } = useUserData();

  const translations = {
    en: {
      greeting: "Welcome back",
      subtitle: "Your AI-powered creative workspace",
      description: "Manage your cultural projects and collaborate with specialized AI agents",
      activeAgents: "Active Agents",
      totalProjects: "Projects",
      growth: "Growth",
      growthTooltip: "Based on your agent usage, project activity, and engagement over time"
    },
    es: {
      greeting: "Bienvenido de vuelta",
      subtitle: "Tu espacio creativo potenciado por IA",
      description: "Gestiona tus proyectos culturales y colabora con agentes IA especializados",
      activeAgents: "Agentes Activos",
      totalProjects: "Proyectos",
      growth: "Crecimiento",
      growthTooltip: "Basado en el uso de agentes, actividad de proyectos y participación a lo largo del tiempo"
    }
  };

  const t = translations[language];

  // Calculate real metrics
  const activeAgentsCount = agents.filter(agent => agent.is_enabled).length;
  const totalProjectsCount = projects.length;
  
  // Improved growth calculation
  const growthPercentage = React.useMemo(() => {
    // Base calculation on multiple factors for more meaningful growth metric
    const agentUtilization = agents.length > 0 ? (activeAgentsCount / agents.length) * 40 : 0;
    const projectActivity = Math.min(totalProjectsCount * 15, 30);
    const sessionActivity = metrics?.total_sessions ? Math.min(metrics.total_sessions * 2, 30) : 0;
    
    return Math.round(agentUtilization + projectActivity + sessionActivity);
  }, [activeAgentsCount, agents.length, totalProjectsCount, metrics?.total_sessions]);

  const userName = profile?.full_name || 'Usuario';

  if (loading) {
    return (
      <div className="relative">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl animate-pulse">
          <div className="h-8 bg-white/20 rounded mb-3"></div>
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-3 bg-white/20 rounded mb-4"></div>
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/10 rounded-xl p-3">
                <div className="h-12 bg-white/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Compact welcome card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              {t.greeting}, {userName}!
            </h1>
            <p className="text-base text-purple-200 font-medium">{t.subtitle}</p>
            <p className="text-sm text-gray-300">{t.description}</p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Compact stats cards */}
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-3 border border-purple-300/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-xs font-medium">{t.activeAgents}</p>
                <p className="text-xl font-bold text-white">{activeAgentsCount}</p>
              </div>
              <Bot className="w-6 h-6 text-purple-300" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-3 border border-blue-300/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-xs font-medium">{t.totalProjects}</p>
                <p className="text-xl font-bold text-white">{totalProjectsCount}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-300" />
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl p-3 border border-emerald-300/20 cursor-help">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-200 text-xs font-medium">{t.growth}</p>
                      <p className="text-xl font-bold text-white">+{growthPercentage}%</p>
                    </div>
                    <Sparkles className="w-6 h-6 text-emerald-300" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{t.growthTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
