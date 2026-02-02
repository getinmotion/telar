
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, Palette, Scale, Settings, FileText, Users, Target, TrendingUp } from 'lucide-react';
import { getAgentById } from '@/data/agentsDatabase';
import { getAgentTranslation } from '@/data/agentTranslations';

interface UnifiedAgentHeaderProps {
  agentId: string;
  language: 'en' | 'es';
  onBack?: () => void;
  variant?: 'floating' | 'embedded';
  showHeader?: boolean;
}

const getAgentIcon = (agentId: string) => {
  const iconMap = {
    'cost-calculator': Calculator,
    'collaboration-agreement': Scale,
    'maturity-evaluator': TrendingUp,
    'cultural-consultant': Palette,
    'project-manager': Settings,
    'marketing-advisor': Target,
    'export-advisor': FileText,
    'collaboration-pitch': Users,
    'portfolio-catalog': FileText,
    'artwork-description': FileText,
    'income-calculator': Calculator,
    'branding-strategy': Palette,
    'personal-brand-eval': Users,
    'funding-routes': Target,
    'contract-generator': Scale,
    'tax-compliance': FileText,
    'social-impact-eval': Target,
    'pricing-assistant': Calculator,
    'stakeholder-matching': Users,
    'admin': Settings
  };
  
  return iconMap[agentId as keyof typeof iconMap] || FileText;
};

export const UnifiedAgentHeader: React.FC<UnifiedAgentHeaderProps> = ({
  agentId,
  language,
  onBack,
  variant = 'embedded',
  showHeader = true
}) => {
  if (!showHeader) {
    return null;
  }

  const agent = getAgentById(agentId);
  const agentTranslation = getAgentTranslation(agentId, language);
  const IconComponent = getAgentIcon(agentId);
  
  const agentName = agentTranslation?.name || agent?.name || (language === 'en' ? 'AI Assistant' : 'Asistente IA');
  const agentDescription = agentTranslation?.description || agent?.description || (language === 'en' ? 'Ready to help you' : 'Listo para ayudarte');

  const t = {
    en: { backToDashboard: "Back to Dashboard" },
    es: { backToDashboard: "Volver al Dashboard" }
  };

  // Estilos para variante floating (chat flotante)
  if (variant === 'floating') {
    return (
      <div className="bg-muted/50 border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{agentName}</h2>
              <p className="text-sm text-muted-foreground">{agentDescription}</p>
            </div>
          </div>
          
          {onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t[language].backToDashboard}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Estilos para variante embedded (integrado en páginas normales)
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-2xl border-b border-purple-300/20 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center shadow-lg border border-white/30">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{agentName}</h2>
            <p className="text-sm text-purple-100 opacity-90">{agentDescription}</p>
          </div>
        </div>
        
        {onBack && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-white hover:bg-white/20 rounded-xl border border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t[language].backToDashboard}
          </Button>
        )}
      </div>
    </div>
  );
};
