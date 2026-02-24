
import { CategoryScore, RecommendedAgents } from '@/types/dashboard';
import { culturalAgentsDatabase } from '@/data/agentsDatabase';

export const generateMaturityBasedRecommendations = (scores: CategoryScore): RecommendedAgents => {
  console.log('Generating maturity-based recommendations for scores:', scores);
  
  const recommendations: RecommendedAgents = {
    primary: [],
    secondary: []
  };

  // Analyze scores to determine which areas need most help
  const scoreAnalysis = [
    { category: 'ideaValidation', score: scores.ideaValidation, agents: ['maturity-evaluator', 'market-researcher', 'business-validator'] },
    { category: 'userExperience', score: scores.userExperience, agents: ['user-experience-designer', 'feedback-analyzer', 'prototype-developer'] },
    { category: 'marketFit', score: scores.marketFit, agents: ['market-researcher', 'competitive-analyst', 'export-advisor'] },
    { category: 'monetization', score: scores.monetization, agents: ['cost-calculator', 'pricing-assistant', 'income-calculator'] }
  ];

  // Sort by lowest scores first (areas that need most help)
  scoreAnalysis.sort((a, b) => a.score - b.score);

  // Add high-priority agents for lowest scoring areas
  const lowestScoringAreas = scoreAnalysis.slice(0, 2);
  lowestScoringAreas.forEach(area => {
    if (area.score < 70) {
      area.agents.forEach(agentId => {
        const agent = culturalAgentsDatabase.find(a => a.id === agentId);
        if (agent && !recommendations.primary?.includes(agentId)) {
          recommendations.primary?.push(agentId);
        }
      });
    }
  });

  // Always include essential high-priority agents
  const essentialAgents = culturalAgentsDatabase
    .filter(agent => agent.priority === 'Alta')
    .map(agent => agent.id);
  
  essentialAgents.forEach(agentId => {
    if (!recommendations.primary?.includes(agentId)) {
      recommendations.primary?.push(agentId);
    }
  });

  // Limit primary recommendations to 6
  if (recommendations.primary && recommendations.primary.length > 6) {
    recommendations.primary = recommendations.primary.slice(0, 6);
  }

  // Add secondary recommendations based on medium scoring areas
  const mediumScoringAreas = scoreAnalysis.filter(area => area.score >= 40 && area.score < 80);
  mediumScoringAreas.forEach(area => {
    area.agents.slice(0, 1).forEach(agentId => {
      const agent = culturalAgentsDatabase.find(a => a.id === agentId);
      if (agent && !recommendations.primary?.includes(agentId) && !recommendations.secondary?.includes(agentId)) {
        recommendations.secondary?.push(agentId);
      }
    });
  });

  // Add medium priority agents to secondary
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

  console.log('Generated maturity-based recommendations:', recommendations);
  return recommendations;
};

export const getAgentRecommendationReason = (agentId: string, scores: CategoryScore): string => {
  const translations = {
    'maturity-evaluator': scores.ideaValidation < 50 ? 'Tu validación de idea necesita fortalecimiento' : 'Continúa validando tu propuesta',
    'cost-calculator': scores.monetization < 60 ? 'Tu estrategia de monetización requiere desarrollo' : 'Optimiza tus costos',
    'market-researcher': scores.marketFit < 70 ? 'Necesitas mejor comprensión del mercado' : 'Profundiza tu análisis de mercado',
    'pricing-assistant': scores.monetization < 50 ? 'Tus precios necesitan estructura' : 'Optimiza tu estrategia de precios'
  };

  return translations[agentId as keyof typeof translations] || 'Recomendado para tu perfil';
};
