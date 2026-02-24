import { UserProfileData } from '../../types/wizardTypes';
import { CategoryScore } from '@/components/maturity/types';
import { RecommendedAgents } from '@/types/dashboard';
import { culturalAgentsDatabase } from '@/data/agentsDatabase';

interface BreakdownEntry {
  points: number;
  reason: string;
}

export interface ScoreBreakdown {
  ideaValidation: BreakdownEntry[];
  userExperience: BreakdownEntry[];
  marketFit: BreakdownEntry[];
  monetization: BreakdownEntry[];
}

const getTranslations = (language: 'en' | 'es') => ({
  en: {
    industry: "For defining your creative industry.",
    activities: "For detailing your project activities.",
    experience: {
      beginner: "For your beginner experience level.",
      intermediate: "For your intermediate experience level.",
      advanced: "For your advanced experience level."
    },
    paymentMethods: {
      base: "For having defined payment methods.",
      multiple: "For offering multiple payment methods.",
      billing_system: "For using a billing system.",
      digital_platforms: "For selling on digital platforms."
    },
    brandIdentity: "For having a brand identity.",
    financialControl: "For having financial control.",
    teamStructure: "For having a team structure.",
    taskOrganization: {
      base: "For organizing your tasks.",
      multiple: "For using multiple organization methods.",
      digital_tools: "For using digital management tools.",
      formal_processes: "For having formal work processes."
    },
    decisionMaking: "For your decision-making method.",
    deepAnalysis: {
      pricingMethod: "Deep analysis: For defining your pricing method.",
      internationalSales: "Deep analysis: For having international sales.",
      formalizedBusiness: "Deep analysis: For having a formalized business.",
      collaboration: {
        base: "Deep analysis: For collaborating with others.",
        multiple: "Deep analysis: For having multiple collaboration types.",
        businesses: "Deep analysis: For collaborating with businesses.",
        institutions: "Deep analysis: For collaborating with institutions."
      }
    }
  },
  es: {
    industry: "Por definir tu industria creativa.",
    activities: "Por detallar las actividades de tu proyecto.",
    experience: {
      beginner: "Por tu experiencia de nivel principiante.",
      intermediate: "Por tu experiencia de nivel intermedio.",
      advanced: "Por tu experiencia de nivel avanzado."
    },
    paymentMethods: {
      base: "Por tener métodos de pago definidos.",
      multiple: "Por ofrecer múltiples métodos de pago.",
      billing_system: "Por usar un sistema de facturación.",
      digital_platforms: "Por vender en plataformas digitales."
    },
    brandIdentity: "Por tener una identidad de marca.",
    financialControl: "Por tener control financiero.",
    teamStructure: "Por tener una estructura de equipo.",
    taskOrganization: {
      base: "Por organizar tus tareas.",
      multiple: "Por usar varios métodos de organización.",
      digital_tools: "Por usar herramientas digitales de gestión.",
      formal_processes: "Por tener procesos formales de trabajo."
    },
    decisionMaking: "Por tu método para tomar decisiones.",
    deepAnalysis: {
      pricingMethod: "Análisis profundo: Por definir tu método de fijación de precios.",
      internationalSales: "Análisis profundo: Por tener ventas internacionales.",
      formalizedBusiness: "Análisis profundo: Por tener un negocio formalizado.",
      collaboration: {
        base: "Análisis profundo: Por colaborar con otros.",
        multiple: "Análisis profundo: Por tener múltiples tipos de colaboración.",
        businesses: "Análisis profundo: Por colaborar con empresas.",
        institutions: "Análisis profundo: Por colaborar con instituciones."
      }
    }
  }
}[language]);

export const calculateMaturityScores = (profileData: UserProfileData, language: 'en' | 'es'): { scores: CategoryScore; breakdown: ScoreBreakdown } => {
  const t = getTranslations(language);
  const breakdown: ScoreBreakdown = {
    ideaValidation: [],
    userExperience: [],
    marketFit: [],
    monetization: [],
  };

  // Cultural Profile scoring (REDUCED - test only shows potential, not execution)
  if (profileData.industry) {
    breakdown.ideaValidation.push({ points: 5, reason: t.industry });
    breakdown.marketFit.push({ points: 3, reason: t.industry });
  }

  if (profileData.activities && profileData.activities.length > 0) {
    breakdown.userExperience.push({ points: 3, reason: t.activities });
    breakdown.ideaValidation.push({ points: 2, reason: t.activities });
  }

  // Business Maturity scoring (DRASTICALLY REDUCED - experience != results)
  if (profileData.experience) {
    switch (profileData.experience) {
      case 'beginner':
        breakdown.ideaValidation.push({ points: 2, reason: t.experience.beginner });
        break;
      case 'intermediate':
        breakdown.ideaValidation.push({ points: 5, reason: t.experience.intermediate });
        breakdown.userExperience.push({ points: 4, reason: t.experience.intermediate });
        break;
      case 'advanced':
        breakdown.ideaValidation.push({ points: 8, reason: t.experience.advanced });
        breakdown.userExperience.push({ points: 7, reason: t.experience.advanced });
        breakdown.marketFit.push({ points: 5, reason: t.experience.advanced });
        break;
    }
  }

  // Handle payment methods (DRASTICALLY REDUCED - setup != sales)
  if (profileData.paymentMethods) {
    const paymentMethodsArray = Array.isArray(profileData.paymentMethods) 
      ? profileData.paymentMethods 
      : [profileData.paymentMethods];
    
    breakdown.monetization.push({ points: 3, reason: t.paymentMethods.base });
    breakdown.marketFit.push({ points: 2, reason: t.paymentMethods.base });
    
    if (paymentMethodsArray.length > 1) {
      breakdown.monetization.push({ points: 2, reason: t.paymentMethods.multiple });
      breakdown.marketFit.push({ points: 1, reason: t.paymentMethods.multiple });
    }
    
    if (paymentMethodsArray.includes('billing_system')) {
      breakdown.monetization.push({ points: 2, reason: t.paymentMethods.billing_system });
    }
    if (paymentMethodsArray.includes('digital_platforms')) {
      breakdown.marketFit.push({ points: 2, reason: t.paymentMethods.digital_platforms });
    }
  }

  if (profileData.brandIdentity) {
    breakdown.userExperience.push({ points: 4, reason: t.brandIdentity });
    breakdown.marketFit.push({ points: 3, reason: t.brandIdentity });
  }

  // Management Style scoring (REDUCED - systems != execution)
  if (profileData.financialControl) {
    breakdown.monetization.push({ points: 4, reason: t.financialControl });
  }

  if (profileData.teamStructure) {
    breakdown.userExperience.push({ points: 3, reason: t.teamStructure });
    breakdown.marketFit.push({ points: 2, reason: t.teamStructure });
  }

  // Handle task organization (REDUCED - organization != delivery)
  if (profileData.taskOrganization) {
    const taskOrgArray = Array.isArray(profileData.taskOrganization) 
      ? profileData.taskOrganization 
      : [profileData.taskOrganization];
    
    breakdown.userExperience.push({ points: 2, reason: t.taskOrganization.base });
    breakdown.ideaValidation.push({ points: 1, reason: t.taskOrganization.base });
    
    if (taskOrgArray.length > 1) {
      breakdown.userExperience.push({ points: 2, reason: t.taskOrganization.multiple });
      breakdown.ideaValidation.push({ points: 1, reason: t.taskOrganization.multiple });
    }
    
    if (taskOrgArray.includes('digital_tools')) {
      breakdown.userExperience.push({ points: 2, reason: t.taskOrganization.digital_tools });
    }
    if (taskOrgArray.includes('formal_processes')) {
      breakdown.userExperience.push({ points: 3, reason: t.taskOrganization.formal_processes });
      breakdown.ideaValidation.push({ points: 2, reason: t.taskOrganization.formal_processes });
    }
  }

  if (profileData.decisionMaking) {
    breakdown.marketFit.push({ points: 3, reason: t.decisionMaking });
    breakdown.ideaValidation.push({ points: 2, reason: t.decisionMaking });
  }

  // Extended questions bonus (REDUCED - plans != execution)
  if (profileData.analysisPreference === 'deep') {
    if (profileData.pricingMethod) {
      breakdown.monetization.push({ points: 3, reason: t.deepAnalysis.pricingMethod });
    }
    if (profileData.internationalSales) {
      breakdown.marketFit.push({ points: 2, reason: t.deepAnalysis.internationalSales });
    }
    if (profileData.formalizedBusiness) {
      breakdown.monetization.push({ points: 2, reason: t.deepAnalysis.formalizedBusiness });
      breakdown.marketFit.push({ points: 2, reason: t.deepAnalysis.formalizedBusiness });
    }
    
    if (profileData.collaboration) {
      const collaborationArray = Array.isArray(profileData.collaboration) 
        ? profileData.collaboration 
        : [profileData.collaboration];
      
      if (!collaborationArray.includes('none')) {
        breakdown.marketFit.push({ points: 2, reason: t.deepAnalysis.collaboration.base });
        breakdown.userExperience.push({ points: 1, reason: t.deepAnalysis.collaboration.base });
        
        if (collaborationArray.length > 1) {
          breakdown.marketFit.push({ points: 1, reason: t.deepAnalysis.collaboration.multiple });
          breakdown.userExperience.push({ points: 1, reason: t.deepAnalysis.collaboration.multiple });
        }
        
        if (collaborationArray.includes('businesses')) {
          breakdown.monetization.push({ points: 2, reason: t.deepAnalysis.collaboration.businesses });
        }
        if (collaborationArray.includes('institutions')) {
          breakdown.marketFit.push({ points: 2, reason: t.deepAnalysis.collaboration.institutions });
        }
      }
    }
  }

  const calculateTotal = (entries: BreakdownEntry[]) => entries.reduce((sum, entry) => sum + entry.points, 0);

  const scores = {
    ideaValidation: Math.min(100, calculateTotal(breakdown.ideaValidation)),
    userExperience: Math.min(100, calculateTotal(breakdown.userExperience)),
    marketFit: Math.min(100, calculateTotal(breakdown.marketFit)),
    monetization: Math.min(100, calculateTotal(breakdown.monetization))
  };

  return { scores, breakdown };
};

export const getRecommendedAgents = (profileData: UserProfileData, scores: CategoryScore): RecommendedAgents => {
  console.log('Generating recommendations for scores:', scores);
  
  const recommendations: RecommendedAgents = {
    primary: [],
    secondary: []
  };

  // Always include high priority agents
  const highPriorityAgents = culturalAgentsDatabase
    .filter(agent => agent.priority === 'Alta')
    .map(agent => agent.id);
  
  recommendations.primary = [...highPriorityAgents];

  // Add agents based on low scores (they need more help)
  const needsAssessment = [
    { agentId: 'cost-calculator', score: scores.monetization },
    { agentId: 'contract-generator', score: scores.marketFit },
    { agentId: 'maturity-evaluator', score: scores.ideaValidation },
    { agentId: 'export-advisor', score: scores.marketFit },
    { agentId: 'pricing-assistant', score: scores.monetization }
  ];

  // Sort by lowest scores first
  needsAssessment.sort((a, b) => a.score - b.score);

  // Add most needed agents to primary
  needsAssessment.slice(0, 2).forEach(item => {
    if (item.score < 60 && !recommendations.primary?.includes(item.agentId)) {
      recommendations.primary?.push(item.agentId);
    }
  });

  // Add secondary agents based on profile and industry
  if (profileData.industry) {
    const industryAgents = culturalAgentsDatabase
      .filter(agent => 
        agent.profiles?.includes(profileData.industry) && 
        !recommendations.primary?.includes(agent.id)
      )
      .slice(0, 3)
      .map(agent => agent.id);
    
    recommendations.secondary = [...(recommendations.secondary || []), ...industryAgents];
  }

  // Add recommendations based on multi-select responses
  const paymentMethods = Array.isArray(profileData.paymentMethods) 
    ? profileData.paymentMethods 
    : profileData.paymentMethods ? [profileData.paymentMethods] : [];
  
  if (paymentMethods.includes('billing_system')) {
    if (!recommendations.primary?.includes('income-calculator')) {
      recommendations.secondary?.push('income-calculator');
    }
  }

  const collaborationTypes = Array.isArray(profileData.collaboration) 
    ? profileData.collaboration 
    : profileData.collaboration ? [profileData.collaboration] : [];
  
  if (collaborationTypes.includes('businesses') || collaborationTypes.includes('institutions')) {
    if (!recommendations.primary?.includes('contract-generator')) {
      recommendations.secondary?.push('contract-generator');
    }
  }

  // Add medium priority agents to complete recommendations
  const mediumPriorityAgents = culturalAgentsDatabase
    .filter(agent => 
      (agent.priority === 'Media' || agent.priority === 'Media-Alta') &&
      !recommendations.primary?.includes(agent.id) &&
      !recommendations.secondary?.includes(agent.id)
    )
    .slice(0, 4)
    .map(agent => agent.id);

  recommendations.secondary = [...(recommendations.secondary || []), ...mediumPriorityAgents];

  // Maintain compatibility with legacy format
  recommendations.admin = true;
  recommendations.cultural = true;
  recommendations.accounting = recommendations.primary?.includes('cost-calculator') || recommendations.secondary?.includes('income-calculator');
  recommendations.legal = recommendations.primary?.includes('contract-generator') || recommendations.secondary?.includes('collaboration-agreement');
  recommendations.operations = recommendations.primary?.includes('collaborator-management') || recommendations.secondary?.includes('stakeholder-matching');

  console.log('Generated recommendations:', recommendations);
  return recommendations;
};
