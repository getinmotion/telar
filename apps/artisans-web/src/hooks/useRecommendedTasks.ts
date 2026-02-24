
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CategoryScore } from '@/types/dashboard';
import { supabase } from '@/integrations/supabase/client';

export interface RecommendedTask {
  id: string;
  title: string;
  description: string;
  agentId: string;
  agentName: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedTime: string;
  prompt: string;
  completed: boolean;
}

interface AIRecommendation {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low' | 'Alta' | 'Media' | 'Baja';
  timeframe: string;
}

export const useRecommendedTasks = (maturityScores: CategoryScore | null) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<RecommendedTask[]>([]);
  const [loading, setLoading] = useState(false);

  const generateTasksFromScores = (scores: CategoryScore): RecommendedTask[] => {
    const generatedTasks: RecommendedTask[] = [];

    // Generate tasks based on low scores (areas needing improvement)
    if (scores.ideaValidation < 60) {
      generatedTasks.push({
        id: 'validate-concept',
        title: 'Valida tu Concepto Creativo',
        description: 'Investiga tu público objetivo y valida la demanda del mercado para tu propuesta creativa',
        agentId: 'cultural',
        agentName: 'Especialista Creativo',
        priority: 'high',
        category: 'Validación',
        estimatedTime: '2 horas',
        prompt: 'Ayúdame a validar mi concepto creativo. Necesito investigar mi público objetivo y entender la demanda del mercado. Mi proyecto es sobre [describe brevemente tu proyecto]. ¿Qué pasos específicos debería seguir para validar esta idea?',
        completed: false
      });
    }

    if (scores.userExperience < 60) {
      generatedTasks.push({
        id: 'user-journey',
        title: 'Diseña la Experiencia del Usuario',
        description: 'Crea un mapa detallado de la experiencia que tendrán tus usuarios con tu servicio creativo',
        agentId: 'admin',
        agentName: 'Asistente Administrativo',
        priority: 'medium',
        category: 'Experiencia',
        estimatedTime: '1.5 horas',
        prompt: 'Necesito diseñar la experiencia completa del usuario para mi servicio creativo. ¿Puedes ayudarme a crear un mapa de experiencia que incluya todos los puntos de contacto desde que conocen mi servicio hasta que se convierten en clientes satisfechos?',
        completed: false
      });
    }

    if (scores.marketFit < 60) {
      generatedTasks.push({
        id: 'market-analysis',
        title: 'Analiza tu Posición en el Mercado',
        description: 'Estudia a tu competencia y define tu propuesta de valor única en el mercado cultural',
        agentId: 'cultural',
        agentName: 'Especialista Creativo',
        priority: 'high',
        category: 'Mercado',
        estimatedTime: '2.5 horas',
        prompt: 'Ayúdame a analizar mi posición en el mercado cultural. Necesito entender quiénes son mis competidores directos e indirectos, y cómo puedo diferenciarme. Mi proyecto se enfoca en [describe tu área]. ¿Cómo puedo crear una propuesta de valor única?',
        completed: false
      });
    }

    if (scores.monetization < 60) {
      generatedTasks.push({
        id: 'pricing-strategy',
        title: 'Desarrolla tu Estrategia de Precios',
        description: 'Crea un modelo de precios competitivo y sostenible para tus servicios creativos',
        agentId: 'accounting',
        agentName: 'Asesor Financiero',
        priority: 'high',
        category: 'Monetización',
        estimatedTime: '1 hora',
        prompt: 'Necesito desarrollar una estrategia de precios para mi servicio creativo. ¿Puedes ayudarme a analizar diferentes modelos de precios, calcular mis costos base y determinar precios competitivos que me permitan ser rentable?',
        completed: false
      });
    }

    // Add advanced tasks for higher-scoring areas
    if (scores.ideaValidation >= 60 && scores.monetization < 80) {
      generatedTasks.push({
        id: 'revenue-optimization',
        title: 'Optimiza tus Fuentes de Ingresos',
        description: 'Explora nuevas formas de monetizar tu talento creativo y diversificar ingresos',
        agentId: 'accounting',
        agentName: 'Asesor Financiero',
        priority: 'medium',
        category: 'Crecimiento',
        estimatedTime: '1.5 horas',
        prompt: 'Mi negocio creativo ya está validado, pero quiero optimizar y diversificar mis fuentes de ingresos. ¿Qué estrategias puedes sugerirme para maximizar la monetización de mi talento creativo?',
        completed: false
      });
    }

    return generatedTasks;
  };

  const fetchAIRecommendations = async (): Promise<AIRecommendation[]> => {
    if (!maturityScores || !user) return [];

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { 
          scores: maturityScores, 
          profileData: {}, // Could be enhanced with actual profile data
          language: 'es' 
        }
      });

      if (error) {
        console.error('Error fetching AI recommendations:', error);
        return [];
      }

      return data?.recommendations || [];
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const convertAIRecommendationsToTasks = (recommendations: AIRecommendation[]): RecommendedTask[] => {
    return recommendations.map((rec, index) => {
      // Map AI recommendations to appropriate agents
      let agentId = 'cultural';
      let agentName = 'Especialista Creativo';
      
      if (rec.title.toLowerCase().includes('precio') || rec.title.toLowerCase().includes('financ')) {
        agentId = 'accounting';
        agentName = 'Asesor Financiero';
      } else if (rec.title.toLowerCase().includes('usuario') || rec.title.toLowerCase().includes('experiencia')) {
        agentId = 'admin';
        agentName = 'Asistente Administrativo';
      }

      const priority = (rec.priority === 'Alta' || rec.priority === 'High') ? 'high' : 
                      (rec.priority === 'Media' || rec.priority === 'Medium') ? 'medium' : 'low';

      return {
        id: `ai-rec-${index}`,
        title: rec.title,
        description: rec.description,
        agentId,
        agentName,
        priority,
        category: 'IA Recomendado',
        estimatedTime: rec.timeframe || '1-2 horas',
        prompt: `Basado en mi evaluación de madurez, me recomendaste: "${rec.title}". ${rec.description}. ¿Puedes ayudarme a desarrollar un plan específico para implementar esta recomendación?`,
        completed: false
      };
    });
  };

  useEffect(() => {
    const loadTasks = async () => {
      if (!maturityScores) return;

      // Generate base tasks from maturity scores
      const scoreTasks = generateTasksFromScores(maturityScores);
      
      // Fetch AI-powered recommendations
      const aiRecommendations = await fetchAIRecommendations();
      const aiTasks = convertAIRecommendationsToTasks(aiRecommendations);
      
      // Combine and prioritize tasks
      const allTasks = [...aiTasks, ...scoreTasks];
      
      // Sort by priority and limit to top 6 tasks
      const prioritizedTasks = allTasks
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 6);

      setTasks(prioritizedTasks);
    };

    loadTasks();
  }, [maturityScores, user]);

  const markTaskCompleted = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
  };

  return {
    tasks,
    loading,
    markTaskCompleted
  };
};
