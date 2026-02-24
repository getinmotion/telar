
import { CategoryScore } from '@/types/dashboard';
import { getAgentById } from '@/data/agentsDatabase';
import { OptimizedRecommendedTask } from '../types/recommendedTasksTypes';

export const getAvailableAgents = (enabledAgentIds: string[]) => {
  console.log('getAvailableAgents called with:', { enabledAgentIds });
  
  // Defensive validation
  if (!Array.isArray(enabledAgentIds)) {
    console.warn('getAvailableAgents: enabledAgentIds is not an array:', enabledAgentIds);
    return [];
  }
  
  const availableAgents = enabledAgentIds
    .filter(id => id && typeof id === 'string')
    .map(id => getAgentById(id))
    .filter(agent => agent !== undefined);
  
  console.log('Available agents found:', {
    enabledAgentIds,
    availableAgents: availableAgents.map(a => ({ id: a?.id, name: a?.name }))
  });
  
  return availableAgents;
};

export const generateRobustTasksFromScores = (
  scores: CategoryScore, 
  enabledAgentIds: string[]
): OptimizedRecommendedTask[] => {
  console.log('Generating robust tasks from scores:', scores);
  console.log('Available agents for task generation:', enabledAgentIds);
  
  // Defensive validations
  if (!scores || typeof scores !== 'object') {
    console.warn('generateRobustTasksFromScores: Invalid scores object:', scores);
    return generateEmergencyTasks();
  }
  
  if (!Array.isArray(enabledAgentIds)) {
    console.warn('generateRobustTasksFromScores: Invalid enabledAgentIds:', enabledAgentIds);
    return generateEmergencyTasks();
  }
  
  const availableAgents = getAvailableAgents(enabledAgentIds);
  
  if (availableAgents.length === 0) {
    console.log('No available agents found, generating fallback tasks');
    return generateEmergencyTasks(scores);
  }
  
  const tasks: OptimizedRecommendedTask[] = [];
  
  try {
    // Generar tareas basadas en puntuaciones más bajas (mayor prioridad)
    const scoreEntries = Object.entries(scores)
      .filter(([key, value]) => key && typeof value === 'number' && value >= 0)
      .sort(([,a], [,b]) => a - b)
      .filter(([, score]) => score < 70); // Solo crear tareas para puntuaciones bajo 70%

    scoreEntries.forEach(([category, score], index) => {
      if (index < availableAgents.length) {
        const agent = availableAgents[index];
        if (!agent || !agent.id || !agent.name) {
          console.warn('Invalid agent found:', agent);
          return;
        }
        
        const priority = score < 30 ? 'high' : score < 60 ? 'medium' : 'low';
        
        const task: OptimizedRecommendedTask = {
          id: `score-task-${category}`,
          title: getTaskTitleForCategory(category),
          description: getTaskDescriptionForCategory(category, score),
          agentId: agent.id,
          agentName: agent.name,
          priority: priority as 'high' | 'medium' | 'low',
          category: 'Mejora Recomendada',
          estimatedTime: '2-3 horas',
          prompt: getTaskPromptForCategory(category, score),
          completed: false,
          isRealAgent: true
        };
        
        tasks.push(task);
      }
    });
    
    // Si no se generaron tareas desde scores, crear al menos una tarea básica
    if (tasks.length === 0 && availableAgents.length > 0) {
      const primaryAgent = availableAgents[0];
      if (primaryAgent && primaryAgent.id && primaryAgent.name) {
        tasks.push({
          id: 'default-task-1',
          title: 'Desarrollar tu Proyecto Creativo',
          description: 'Comienza a trabajar en los aspectos fundamentales de tu proyecto creativo.',
          agentId: primaryAgent.id,
          agentName: primaryAgent.name,
          priority: 'medium',
          category: 'Desarrollo',
          estimatedTime: '1-2 horas',
          prompt: '¿Cómo puedo empezar a desarrollar mi proyecto creativo de manera efectiva?',
          completed: false,
          isRealAgent: true
        });
      }
    }
  } catch (error) {
    console.error('Error generating tasks from scores:', error);
    return generateEmergencyTasks(scores);
  }
  
  return tasks;
};

const generateEmergencyTasks = (scores?: CategoryScore): OptimizedRecommendedTask[] => {
  console.log('Generating emergency tasks for scores:', scores);
  
  const emergencyTasks: OptimizedRecommendedTask[] = [];
  
  try {
    if (scores && typeof scores === 'object') {
      // Obtener el área con puntuación más baja
      const validScores = Object.entries(scores)
        .filter(([key, value]) => key && typeof value === 'number' && value >= 0);
      
      if (validScores.length > 0) {
        const lowestScore = Math.min(...validScores.map(([, score]) => score));
        const lowestCategory = validScores.find(([, score]) => score === lowestScore)?.[0];
        
        if (lowestCategory) {
          emergencyTasks.push({
            id: 'emergency-task-1',
            title: `Mejorar ${getCategoryDisplayName(lowestCategory)}`,
            description: `Tu puntuación en ${getCategoryDisplayName(lowestCategory)} es ${lowestScore}%. Te sugerimos enfocarte en esta área prioritaria.`,
            agentId: 'cultural-consultant',
            agentName: 'Especialista Creativo',
            priority: 'high',
            category: 'Área de Mejora',
            estimatedTime: '1-2 horas',
            prompt: `Mi puntuación en ${getCategoryDisplayName(lowestCategory)} es ${lowestScore}%. ¿Cómo puedo mejorar específicamente en esta área?`,
            completed: false,
            isRealAgent: false
          });
        }
      }
    }
    
    // Agregar tarea general siempre
    emergencyTasks.push({
      id: 'emergency-task-2',
      title: 'Comenzar con los Fundamentos',
      description: 'Enfócate en establecer los elementos básicos de tu proyecto creativo paso a paso.',
      agentId: 'cultural-consultant',
      agentName: 'Especialista Creativo',
      priority: 'medium',
      category: 'Fundamentos',
      estimatedTime: '30 min',
      prompt: '¿Cuáles son los primeros pasos más importantes para desarrollar mi proyecto creativo?',
      completed: false,
      isRealAgent: false
    });
  } catch (error) {
    console.error('Error generating emergency tasks:', error);
    // Tarea absolutamente básica si todo falla
    emergencyTasks.push({
      id: 'fallback-task',
      title: 'Comenzar tu Proyecto',
      description: 'Da los primeros pasos en tu proyecto creativo.',
      agentId: 'cultural-consultant',
      agentName: 'Especialista Creativo',
      priority: 'medium',
      category: 'Básico',
      estimatedTime: '30 min',
      prompt: '¿Cómo puedo comenzar mi proyecto creativo?',
      completed: false,
      isRealAgent: false
    });
  }
  
  return emergencyTasks;
};

const getTaskTitleForCategory = (category: string): string => {
  const titles = {
    ideaValidation: 'Validar y Refinar tu Idea de Negocio',
    userExperience: 'Mejorar la Experiencia del Usuario',
    marketFit: 'Analizar el Ajuste al Mercado',
    monetization: 'Desarrollar Estrategia de Monetización'
  };
  return titles[category as keyof typeof titles] || 'Mejorar Área de Negocio';
};

const getTaskDescriptionForCategory = (category: string, score: number): string => {
  const descriptions = {
    ideaValidation: `Tu puntuación de validación de idea es ${score}%. Necesitas validar mejor tu propuesta de valor.`,
    userExperience: `Tu puntuación de experiencia de usuario es ${score}%. Mejora cómo interactúan los usuarios con tu producto.`,
    marketFit: `Tu puntuación de ajuste al mercado es ${score}%. Analiza mejor tu mercado objetivo y competencia.`,
    monetization: `Tu puntuación de monetización es ${score}%. Desarrolla una estrategia de ingresos más sólida.`
  };
  return descriptions[category as keyof typeof descriptions] || `Mejora necesaria en esta área (${score}%)`;
};

const getTaskPromptForCategory = (category: string, score: number): string => {
  const prompts = {
    ideaValidation: `Mi puntuación de validación de idea es ${score}%. ¿Cómo puedo validar mejor mi propuesta de valor y asegurarme de que resuelve un problema real?`,
    userExperience: `Mi puntuación de experiencia de usuario es ${score}%. ¿Qué pasos específicos puedo tomar para mejorar la experiencia de mis usuarios?`,
    marketFit: `Mi puntuación de ajuste al mercado es ${score}%. ¿Cómo puedo analizar mejor mi mercado objetivo y entender a mi competencia?`,
    monetization: `Mi puntuación de monetización es ${score}%. ¿Qué estrategias de monetización son más apropiadas para mi tipo de negocio creativo?`
  };
  return prompts[category as keyof typeof prompts] || `Ayúdame a mejorar en esta área donde tengo ${score}% de puntuación.`;
};

const getCategoryDisplayName = (category: string): string => {
  const displayNames = {
    ideaValidation: 'Validación de Idea',
    userExperience: 'Experiencia de Usuario',
    marketFit: 'Ajuste al Mercado',
    monetization: 'Monetización'
  };
  return displayNames[category as keyof typeof displayNames] || category;
};
