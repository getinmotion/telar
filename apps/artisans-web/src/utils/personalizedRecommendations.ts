import { UserBusinessProfile, PersonalizedRecommendation, BusinessModel, BusinessStage } from '@/types/profile';

export const generatePersonalizedRecommendations = (
  businessProfile: UserBusinessProfile,
  language: 'en' | 'es' = 'es'
): PersonalizedRecommendation[] => {
  const recommendations: PersonalizedRecommendation[] = [];

  // Business model specific recommendations
  const businessModelRecommendations = getBusinessModelRecommendations(businessProfile.businessModel, language);
  recommendations.push(...businessModelRecommendations);

  // Stage specific recommendations
  const stageRecommendations = getStageRecommendations(businessProfile.businessStage, language);
  recommendations.push(...stageRecommendations);

  // Channel specific recommendations
  const channelRecommendations = getChannelRecommendations(businessProfile, language);
  recommendations.push(...channelRecommendations);

  // Goal specific recommendations
  const goalRecommendations = getGoalRecommendations(businessProfile, language);
  recommendations.push(...goalRecommendations);

  // Remove duplicates and sort by priority
  const uniqueRecommendations = recommendations.filter((rec, index, self) => 
    index === self.findIndex(r => r.id === rec.id)
  );

  return uniqueRecommendations.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  }).slice(0, 8); // Limit to top 8 recommendations
};

function getBusinessModelRecommendations(model: BusinessModel, language: 'en' | 'es'): PersonalizedRecommendation[] {
  const recommendations = {
    artisan: [
      {
        id: 'artisan-cost-calculation',
        title: language === 'es' ? 'Cálculo de Costos de Producción' : 'Production Cost Calculation',
        description: language === 'es' 
          ? 'Aprende a calcular correctamente el costo real de tus productos artesanales'
          : 'Learn to correctly calculate the real cost of your artisan products',
        priority: 'critical' as const,
        category: 'accounting',
        estimatedTime: '45 min',
        businessModelRelevance: ['artisan'],
        stageRelevance: ['idea', 'mvp', 'early'],
        impact: language === 'es' ? 'Aumentar márgenes de ganancia' : 'Increase profit margins',
        agentId: 'accounting'
      },
      {
        id: 'artisan-pricing-strategy',
        title: language === 'es' ? 'Estrategia de Precios Competitiva' : 'Competitive Pricing Strategy',
        description: language === 'es'
          ? 'Establece precios que reflejen el valor de tu trabajo artesanal'
          : 'Set prices that reflect the value of your artisan work',
        priority: 'high' as const,
        category: 'marketing',
        estimatedTime: '30 min',
        businessModelRelevance: ['artisan'],
        stageRelevance: ['idea', 'mvp', 'early'],
        impact: language === 'es' ? 'Mejorar posicionamiento' : 'Improve positioning',
        agentId: 'cultural'
      }
    ],
    services: [
      {
        id: 'service-packaging',
        title: language === 'es' ? 'Empaquetar tus Servicios' : 'Package Your Services',
        description: language === 'es'
          ? 'Estructura tus servicios en paquetes claros y atractivos'
          : 'Structure your services into clear and attractive packages',
        priority: 'high' as const,
        category: 'marketing',
        estimatedTime: '60 min',
        businessModelRelevance: ['services', 'consulting'],
        stageRelevance: ['idea', 'mvp', 'early'],
        impact: language === 'es' ? 'Aumentar conversión' : 'Increase conversion',
        agentId: 'cultural'
      }
    ],
    ecommerce: [
      {
        id: 'ecommerce-inventory',
        title: language === 'es' ? 'Gestión de Inventario' : 'Inventory Management',
        description: language === 'es'
          ? 'Optimiza tu gestión de stock y evita pérdidas'
          : 'Optimize your stock management and avoid losses',
        priority: 'high' as const,
        category: 'operations',
        estimatedTime: '45 min',
        businessModelRelevance: ['ecommerce', 'retail'],
        stageRelevance: ['early', 'growth'],
        impact: language === 'es' ? 'Reducir costos' : 'Reduce costs',
        agentId: 'operations'
      }
    ]
  };

  return recommendations[model] || [];
}

function getStageRecommendations(stage: BusinessStage, language: 'en' | 'es'): PersonalizedRecommendation[] {
  const recommendations = {
    idea: [
      {
        id: 'idea-validation',
        title: language === 'es' ? 'Validación de Idea de Negocio' : 'Business Idea Validation',
        description: language === 'es'
          ? 'Valida tu idea antes de invertir tiempo y dinero'
          : 'Validate your idea before investing time and money',
        priority: 'critical' as const,
        category: 'strategy',
        estimatedTime: '90 min',
        businessModelRelevance: ['artisan', 'services', 'ecommerce', 'saas', 'consulting', 'retail', 'content', 'other'],
        stageRelevance: ['idea'],
        impact: language === 'es' ? 'Reducir riesgo de fracaso' : 'Reduce failure risk',
        agentId: 'admin'
      }
    ],
    mvp: [
      {
        id: 'mvp-launch',
        title: language === 'es' ? 'Lanzamiento de MVP' : 'MVP Launch',
        description: language === 'es'
          ? 'Lanza tu producto mínimo viable al mercado'
          : 'Launch your minimum viable product to market',
        priority: 'high' as const,
        category: 'operations',
        estimatedTime: '120 min',
        businessModelRelevance: ['artisan', 'services', 'ecommerce', 'saas', 'consulting', 'retail', 'content', 'other'],
        stageRelevance: ['mvp'],
        impact: language === 'es' ? 'Primeros ingresos' : 'First revenue',
        agentId: 'operations'
      }
    ],
    early: [
      {
        id: 'scale-operations',
        title: language === 'es' ? 'Escalar Operaciones' : 'Scale Operations',
        description: language === 'es'
          ? 'Optimiza tus procesos para manejar más volumen'
          : 'Optimize your processes to handle more volume',
        priority: 'high' as const,
        category: 'operations',
        estimatedTime: '90 min',
        businessModelRelevance: ['artisan', 'services', 'ecommerce', 'saas', 'consulting', 'retail', 'content', 'other'],
        stageRelevance: ['early'],
        impact: language === 'es' ? 'Aumentar capacidad' : 'Increase capacity',
        agentId: 'operations'
      }
    ]
  };

  return recommendations[stage] || [];
}

function getChannelRecommendations(profile: UserBusinessProfile, language: 'en' | 'es'): PersonalizedRecommendation[] {
  const recommendations: PersonalizedRecommendation[] = [];

  if (profile.currentChannels.includes('instagram')) {
    recommendations.push({
      id: 'instagram-optimization',
      title: language === 'es' ? 'Optimización de Instagram Business' : 'Instagram Business Optimization',
      description: language === 'es'
        ? 'Maximiza el potencial de ventas de tu cuenta de Instagram'
        : 'Maximize the sales potential of your Instagram account',
      priority: 'medium' as const,
      category: 'marketing',
      estimatedTime: '60 min',
      businessModelRelevance: ['artisan', 'services', 'ecommerce', 'content'],
      stageRelevance: ['mvp', 'early', 'growth'],
      impact: language === 'es' ? 'Aumentar engagement' : 'Increase engagement',
      agentId: 'cultural'
    });
  }

  if (profile.currentChannels.includes('whatsapp')) {
    recommendations.push({
      id: 'whatsapp-business',
      title: language === 'es' ? 'WhatsApp Business Automatizado' : 'Automated WhatsApp Business',
      description: language === 'es'
        ? 'Automatiza y profesionaliza tu atención al cliente por WhatsApp'
        : 'Automate and professionalize your WhatsApp customer service',
      priority: 'medium' as const,
      category: 'operations',
      estimatedTime: '45 min',
      businessModelRelevance: ['artisan', 'services', 'ecommerce', 'consulting'],
      stageRelevance: ['mvp', 'early', 'growth'],
      impact: language === 'es' ? 'Mejorar conversión' : 'Improve conversion',
      agentId: 'operations'
    });
  }

  return recommendations;
}

function getGoalRecommendations(profile: UserBusinessProfile, language: 'en' | 'es'): PersonalizedRecommendation[] {
  const recommendations: PersonalizedRecommendation[] = [];

  if (profile.primaryGoals.includes('increase_revenue')) {
    recommendations.push({
      id: 'revenue-optimization',
      title: language === 'es' ? 'Optimización de Ingresos' : 'Revenue Optimization',
      description: language === 'es'
        ? 'Identifica oportunidades para aumentar tus ingresos'
        : 'Identify opportunities to increase your revenue',
      priority: 'high' as const,
      category: 'strategy',
      estimatedTime: '75 min',
      businessModelRelevance: ['artisan', 'services', 'ecommerce', 'saas', 'consulting', 'retail', 'content', 'other'],
      stageRelevance: ['mvp', 'early', 'growth'],
      impact: language === 'es' ? 'Aumentar ingresos 20-40%' : 'Increase revenue 20-40%',
      agentId: 'admin'
    });
  }

  if (profile.primaryGoals.includes('automate_processes')) {
    recommendations.push({
      id: 'process-automation',
      title: language === 'es' ? 'Automatización de Procesos' : 'Process Automation',
      description: language === 'es'
        ? 'Automatiza tareas repetitivas para ganar tiempo'
        : 'Automate repetitive tasks to save time',
      priority: 'medium' as const,
      category: 'operations',
      estimatedTime: '90 min',
      businessModelRelevance: ['artisan', 'services', 'ecommerce', 'saas', 'consulting', 'retail', 'content', 'other'],
      stageRelevance: ['early', 'growth', 'established'],
      impact: language === 'es' ? 'Ahorrar 5-10 horas/semana' : 'Save 5-10 hours/week',
      agentId: 'operations'
    });
  }

  return recommendations;
}