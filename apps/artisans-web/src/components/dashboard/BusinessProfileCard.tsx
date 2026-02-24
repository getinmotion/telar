import React from 'react';
import { Brain, ArrowRight, Sparkles } from 'lucide-react';

interface BusinessProfileCardProps {
  onOpenProfile: () => void;
  language: 'en' | 'es';
  isProfileComplete?: boolean;
}

// Simplified profile card - no Card wrapper, clean borders
export const BusinessProfileCard: React.FC<BusinessProfileCardProps> = ({
  onOpenProfile,
  language,
  isProfileComplete = false
}) => {
  const content = language === 'es' ? {
    title: '🧠 Perfil Empresarial Inteligente',
    description: 'Responde preguntas inteligentes para generar tareas más personalizadas',
    cta: 'Mejorar Mi Perfil',
    completeBadge: 'Perfil Completo',
    incompleteBadge: 'Completar Perfil'
  } : {
    title: '🧠 Smart Business Profile',
    description: 'Answer intelligent questions to generate more personalized tasks',
    cta: 'Enhance My Profile',
    completeBadge: 'Profile Complete',
    incompleteBadge: 'Complete Profile'
  };

  return (
    <div className="border-l-4 border-primary bg-primary/5 p-6 rounded-r-lg hover:bg-primary/10 transition-colors">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{content.title}</h3>
            {isProfileComplete && (
              <div className="flex items-center gap-1 bg-success/20 text-success-foreground text-xs px-2 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                {content.completeBadge}
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            {content.description}
          </p>
          <button
            onClick={onOpenProfile}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center gap-2 text-sm"
          >
            {content.cta}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};