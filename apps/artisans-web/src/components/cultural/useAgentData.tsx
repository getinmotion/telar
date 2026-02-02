import { useMemo } from 'react';
import { CulturalAgent, ArtisanCraftType } from './types';
import { artisanAgentsDatabase } from '@/data/artisanAgentsDatabase';

export const useAgentData = (language: 'en' | 'es') => {
  const culturalAgents: CulturalAgent[] = useMemo(() => {
    // Mapear los agentes artesanales al formato esperado
    return artisanAgentsDatabase.map(agent => ({
      id: agent.id,
      title: agent.name,
      description: agent.description,
      icon: agent.icon, // Usar directamente el icono de Lucide del artisanAgentsDatabase
      color: getColorClass(agent.category),
      craftTypes: agent.craftTypes as ArtisanCraftType[],
      priority: getPriorityNumber(agent.priority)
    }));
  }, [language]);

  return culturalAgents;
};

const getColorClass = (category: string) => {
  const colorMap: Record<string, string> = {
    'Financiera': 'bg-sage-green/10 text-forest-green border-forest-green/20',
    'Legal': 'bg-olive-green/10 text-olive-green border-olive-green/20',
    'Diagnóstico': 'bg-earth-terracotta/10 text-earth-terracotta border-earth-terracotta/20',
    'Comercial': 'bg-warm-sand/20 text-warm-sand border-warm-sand/30',
    'Operativo': 'bg-sage-green/10 text-forest-green border-sage-green/20',
    'Comunidad': 'bg-olive-green/10 text-olive-green border-olive-green/20'
  };
  
  return colorMap[category] || 'bg-sage-green/10 text-forest-green border-sage-green/20';
};

const getPriorityNumber = (priority: string): number => {
  const priorityMap: Record<string, number> = {
    'Alta': 1,
    'Media-Alta': 1,
    'Media': 2,
    'Baja': 2,
    'Muy Baja': 3
  };
  
  return priorityMap[priority] || 2;
};
