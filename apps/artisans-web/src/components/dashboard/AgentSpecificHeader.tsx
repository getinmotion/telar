
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator } from 'lucide-react';
import { getAgentById } from '@/data/agentsDatabase';
import { getAgentTranslation } from '@/data/agentTranslations';
import { MotionLogo } from '@/components/MotionLogo';
import { useNavigate } from 'react-router-dom';

interface AgentSpecificHeaderProps {
  agentId: string;
  language: 'en' | 'es';
  onBack: () => void;
}

export const AgentSpecificHeader: React.FC<AgentSpecificHeaderProps> = ({
  agentId,
  language,
  onBack
}) => {
  const navigate = useNavigate();
  const agent = getAgentById(agentId);
  const agentTranslation = getAgentTranslation(agentId, language);

  const t = {
    en: { 
      backToDashboard: "Back to Digital Workshop",
      maturityCalculator: "Maturity Calculator"
    },
    es: { 
      backToDashboard: "Volver al Taller Digital",
      maturityCalculator: "Calculadora de Madurez"
    }
  };

  const handleMaturityCalculatorClick = () => {
    navigate('/maturity-calculator');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <MotionLogo variant="dark" size="lg" className="flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-foreground truncate">
                {agentTranslation.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2">
                {agentTranslation.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMaturityCalculatorClick}
              className="group flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/20 border-primary text-primary hover:from-primary/20 hover:to-primary/30 hover:border-primary transition-all duration-200 hover:scale-105 hover:shadow-md rounded-xl text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <Calculator className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform duration-200" />
              <span className="hidden sm:inline font-medium">
                {t[language].maturityCalculator}
              </span>
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBack}
              className="group flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-muted to-muted/80 border-border text-muted-foreground hover:from-muted/80 hover:to-muted/60 hover:border-border hover:text-foreground transition-all duration-200 hover:scale-105 hover:shadow-md rounded-xl text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex-shrink-0 font-medium"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="hidden sm:inline">
                {t[language].backToDashboard}
              </span>
              <span className="sm:hidden">
                {language === 'en' ? 'Back' : 'Volver'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
