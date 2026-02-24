import { UserBusinessProfile } from '@/types/profile';

export interface DefaultTask {
  id: string;
  title: string;
  description: string;
  priority: number;
  relevance: 'high' | 'medium' | 'low';
  estimatedTime: string;
  category: string;
  agentId: string;
  impact: string;
  isUnlocked: boolean;
}

export const generateDefaultTasks = (
  language: 'en' | 'es', 
  businessProfile?: UserBusinessProfile
): DefaultTask[] => {
  const businessName = businessProfile?.brandName || 
    businessProfile?.businessDescription || 
    (language === 'es' ? 'tu negocio' : 'your business');
  
  const defaultTasksTranslations = {
    en: {
      tasks: [
        {
          id: 'default-1',
          title: `Define value proposition for ${businessName}`,
          description: 'Identify what makes your product or service unique and why customers should choose you.',
          category: 'Strategy',
          impact: 'high'
        },
        {
          id: 'default-2',
          title: 'Competitive pricing analysis',
          description: 'Study the market and define a profitable and attractive pricing strategy.',
          category: 'Monetization',
          impact: 'high'
        },
        {
          id: 'default-3',
          title: 'Customer validation interviews',
          description: 'Conduct interviews with potential customers to validate your business assumptions.',
          category: 'Market Research',
          impact: 'high'
        },
        {
          id: 'default-4',
          title: 'MVP development planning',
          description: 'Plan the development of your minimum viable product to test market demand.',
          category: 'Product Development',
          impact: 'medium'
        }
      ]
    },
    es: {
      tasks: [
        {
          id: 'default-1',
          title: `Definir propuesta de valor para ${businessName}`,
          description: 'Identifica qué hace único tu producto o servicio y por qué los clientes deberían elegirte.',
          category: 'Estrategia',
          impact: 'alto'
        },
        {
          id: 'default-2',
          title: 'Análisis de precios competitivos',
          description: 'Estudia el mercado y define una estrategia de precios rentable y atractiva.',
          category: 'Monetización',
          impact: 'alto'
        },
        {
          id: 'default-3',
          title: 'Entrevistas de validación con clientes',
          description: 'Realiza entrevistas con clientes potenciales para validar tus supuestos de negocio.',
          category: 'Investigación de Mercado',
          impact: 'alto'
        },
        {
          id: 'default-4',
          title: 'Planificación del desarrollo MVP',
          description: 'Planifica el desarrollo de tu producto mínimo viable para probar la demanda del mercado.',
          category: 'Desarrollo de Producto',
          impact: 'medio'
        }
      ]
    }
  };

  const tasksData = defaultTasksTranslations[language].tasks;
  
  return tasksData.map((task, index) => ({
    ...task,
    priority: index + 1,
    relevance: 'high' as const,
    estimatedTime: language === 'es' ? '45-60 min' : '45-60 min',
    agentId: 'business-advisor',
    isUnlocked: true
  }));
};