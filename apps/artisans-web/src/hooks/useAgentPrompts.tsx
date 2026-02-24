
import { useState, useCallback } from 'react';
import { useUserLocalStorage } from './useUserLocalStorage';

interface AgentPromptData {
  agentId: string;
  taskTitle: string;
  taskDescription: string;
  prompt: string;
}

export const useAgentPrompts = () => {
  const [currentPrompt, setCurrentPrompt] = useState<AgentPromptData | null>(null);
  const userLocalStorage = useUserLocalStorage();

  const generatePrompt = useCallback((
    agentId: string, 
    taskTitle: string, 
    taskDescription: string,
    agentName: string
  ) => {
    console.log('Generating prompt for:', { agentId, taskTitle, taskDescription, agentName });
    
    // Generate contextual prompt based on agent and task
    const prompts: Record<string, string> = {
      'cultural-consultant': `Como consultor cultural especializado, ayúdame con: "${taskTitle}". 

Contexto: ${taskDescription}

Por favor, proporciona:
1. Análisis del contexto cultural actual
2. Recomendaciones específicas y accionables
3. Estrategias para implementar estas recomendaciones
4. Métricas para medir el éxito

Responde de manera práctica y orientada a resultados.`,

      'project-manager': `Como gestor de proyectos creativos, necesito tu ayuda con: "${taskTitle}".

Situación: ${taskDescription}

Proporciona:
1. Plan de acción paso a paso
2. Cronograma sugerido
3. Recursos necesarios
4. Posibles riesgos y mitigaciones
5. Indicadores de progreso

Estructura tu respuesta de forma clara y ejecutable.`,

      'cost-calculator': `Como especialista en análisis financiero para proyectos culturales, ayúdame con: "${taskTitle}".

Descripción: ${taskDescription}

Necesito:
1. Desglose de costos estimados
2. Análisis de viabilidad financiera
3. Estrategias de optimización de presupuesto
4. Recomendaciones de financiamiento
5. Proyección de retorno de inversión

Presenta los números de forma clara y justifica tus estimaciones.`,

      'content-creator': `Como especialista en creación de contenido cultural, ayúdame con: "${taskTitle}".

Proyecto: ${taskDescription}

Proporciona:
1. Estrategia de contenido específica
2. Calendario editorial sugerido
3. Tipos de contenido más efectivos
4. Canales de distribución recomendados
5. Métricas de engagement a seguir

Enfócate en crear contenido auténtico y atractivo.`,

      'default': `Como asistente especializado en ${agentName}, ayúdame con la siguiente tarea: "${taskTitle}".

Contexto: ${taskDescription}

Por favor, proporciona una respuesta detallada y práctica que incluya:
1. Análisis de la situación
2. Recomendaciones específicas
3. Pasos de implementación
4. Consideraciones importantes

Tu respuesta debe ser accionable y orientada a resultados.`
    };

    const prompt = prompts[agentId] || prompts['default'];
    
    const promptData: AgentPromptData = {
      agentId,
      taskTitle,
      taskDescription,
      prompt
    };

    setCurrentPrompt(promptData);
    
    // Store in user-namespaced localStorage for the agent to pick up
    userLocalStorage.setItem(`agent-${agentId}-prompt`, prompt);
    userLocalStorage.setItem(`agent-${agentId}-task`, JSON.stringify({
      title: taskTitle,
      description: taskDescription
    }));

    console.log('Prompt generated and stored:', promptData);
    
    return promptData;
  }, []);

  const clearPrompt = useCallback(() => {
    setCurrentPrompt(null);
  }, []);

  return {
    currentPrompt,
    generatePrompt,
    clearPrompt
  };
};
