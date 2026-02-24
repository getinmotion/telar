
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getAgentById } from '@/data/agentsDatabase';
import { MotionLogo } from '@/components/MotionLogo';

interface FloatingAgentInfoModuleProps {
  agentId: string;
  language: 'en' | 'es';
  onBack: () => void;
}

export const FloatingAgentInfoModule: React.FC<FloatingAgentInfoModuleProps> = ({
  agentId,
  language,
  onBack
}) => {
  const agent = getAgentById(agentId);
  const agentName = agent?.name || 'AI Assistant';

  const t = {
    en: { backToDashboard: "Back to Digital Workshop" },
    es: { backToDashboard: "Volver al Taller Digital" }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 mx-4 mt-4 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MotionLogo variant="dark" size="sm" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{agentName}</h2>
            <p className="text-sm text-gray-600">{agent?.description}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          {t[language].backToDashboard}
        </Button>
      </div>
    </div>
  );
};
