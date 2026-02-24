
import React from 'react';
import { Users, Bot, Zap } from 'lucide-react';

interface CompactStatsHeaderProps {
  title: string;
  subtitle: string;
  totalAgents: number;
  activeAgents: number;
  recommendedAgents: number;
  language: 'en' | 'es';
}

export const CompactStatsHeader: React.FC<CompactStatsHeaderProps> = ({
  title,
  subtitle,
  totalAgents,
  activeAgents,
  recommendedAgents,
  language
}) => {
  const translations = {
    en: {
      totalAgents: "Total",
      activeAgents: "Active", 
      recommendedAgents: "Recommended"
    },
    es: {
      totalAgents: "Total",
      activeAgents: "Activos",
      recommendedAgents: "Recomendados"
    }
  };

  const t = translations[language];

  return (
    <div className="bg-purple-600/20 backdrop-blur-xl rounded-xl border border-purple-300/30 p-3 shadow-lg h-full">
      <div className="flex flex-col h-full">
        <div className="mb-2">
          <h1 className="text-lg font-bold text-white leading-tight">{title}</h1>
          <p className="text-xs text-purple-200 leading-tight">{subtitle}</p>
        </div>
        
        <div className="flex items-center gap-4 flex-1">
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mb-1 shadow-md">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm font-bold text-white">{totalAgents}</div>
            <div className="text-xs text-purple-200">{t.totalAgents}</div>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mb-1 shadow-md">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm font-bold text-white">{activeAgents}</div>
            <div className="text-xs text-purple-200">{t.activeAgents}</div>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mb-1 shadow-md">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm font-bold text-white">{recommendedAgents}</div>
            <div className="text-xs text-purple-200">{t.recommendedAgents}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
