
import React from 'react';
import { Users, Bot, Zap } from 'lucide-react';

interface ModernStatsHeaderProps {
  title: string;
  subtitle: string;
  totalAgents: number;
  activeAgents: number;
  recommendedAgents: number;
  language: 'en' | 'es';
}

export const ModernStatsHeader: React.FC<ModernStatsHeaderProps> = ({
  title,
  subtitle,
  totalAgents,
  activeAgents,
  recommendedAgents,
  language
}) => {
  const translations = {
    en: {
      totalAgents: "Total Agents",
      activeAgents: "Active Agents", 
      recommendedAgents: "Recommended"
    },
    es: {
      totalAgents: "Agentes Totales",
      activeAgents: "Agentes Activos",
      recommendedAgents: "Recomendados"
    }
  };

  const t = translations[language];

  return (
    <div className="mb-6">
      <div className="bg-purple-600/20 backdrop-blur-xl rounded-xl border border-purple-300/30 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white mb-1">{title}</h1>
            <p className="text-sm text-purple-200">{subtitle}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mb-2 shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="text-lg font-bold text-white">{totalAgents}</div>
              <div className="text-xs text-purple-200">{t.totalAgents}</div>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mb-2 shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-lg font-bold text-white">{activeAgents}</div>
              <div className="text-xs text-purple-200">{t.activeAgents}</div>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mb-2 shadow-md">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="text-lg font-bold text-white">{recommendedAgents}</div>
              <div className="text-xs text-purple-200">{t.recommendedAgents}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
