
import { useState, useCallback } from 'react';
import { CategoryScore } from '@/types/dashboard';
import { supabase } from '@/integrations/supabase/client';

interface AIRecommendation {
  title: string;
  description: string;
  priority: string;
  timeframe: string;
}

export const useRobustAIRecommendations = () => {
  const [loading, setLoading] = useState(false);

  const generateIntelligentFallbacks = useCallback((scores: CategoryScore): AIRecommendation[] => {
    if (!scores || typeof scores !== 'object') {
      console.warn('generateIntelligentFallbacks: Invalid scores provided');
      return getDefaultRecommendations();
    }

    const recommendations: AIRecommendation[] = [];
    
    try {
      // Analizar cada área y generar recomendaciones específicas
      const areas = [
        { key: 'monetization', value: scores.monetization || 0, name: 'Monetización' },
        { key: 'ideaValidation', value: scores.ideaValidation || 0, name: 'Validación de Idea' },
        { key: 'userExperience', value: scores.userExperience || 0, name: 'Experiencia de Usuario' },
        { key: 'marketFit', value: scores.marketFit || 0, name: 'Ajuste al Mercado' }
      ].sort((a, b) => a.value - b.value); // Ordenar por puntuación más baja

      // Generar recomendaciones para las 2-3 áreas más débiles
      areas.slice(0, 3).forEach((area, index) => {
        let title = '';
        let description = '';
        let priority = area.value < 40 ? 'Alta' : area.value < 60 ? 'Media' : 'Baja';

        switch (area.key) {
          case 'monetization':
            title = 'Desarrollar Estrategia de Monetización Robusta';
            description = `Tu puntuación en monetización es ${area.value}%. Enfócate en definir modelos de ingresos claros, calcular costos de producción precisos y establecer precios competitivos. Considera múltiples fuentes de ingresos para diversificar tu propuesta económica.`;
            break;
          case 'ideaValidation':
            title = 'Validar Profundamente tu Propuesta de Valor';
            description = `Con ${area.value}% en validación de idea, necesitas confirmar que tu concepto resuelve problemas reales y significativos. Realiza entrevistas estructuradas con clientes potenciales y prueba tu idea con audiencias específicas.`;
            break;
          case 'userExperience':
            title = 'Optimizar Integralmente la Experiencia del Usuario';
            description = `Tu puntuación de ${area.value}% en experiencia de usuario indica oportunidades importantes de mejora. Simplifica procesos complejos, mejora la usabilidad y establece canales efectivos para recolectar feedback continuo.`;
            break;
          case 'marketFit':
            title = 'Perfeccionar el Ajuste al Mercado Objetivo';
            description = `Con ${area.value}% en ajuste al mercado, debes investigar exhaustivamente tu competencia, definir con precisión tu nicho específico y ajustar tu propuesta para destacar significativamente.`;
            break;
        }

        if (title && description) {
          recommendations.push({
            title,
            description,
            priority,
            timeframe: priority === 'Alta' ? '1-2 semanas' : '2-4 semanas'
          });
        }
      });

      // Siempre incluir una recomendación general
      recommendations.push({
        title: 'Implementar Desarrollo Iterativo y Medible',
        description: 'Establece un sistema de mejora continua con métricas claras, metas semanales alcanzables y revisiones regulares de progreso. Mantén un enfoque constante en la validación de cada cambio implementado.',
        priority: 'Media',
        timeframe: 'Continuo'
      });

    } catch (error) {
      console.error('Error generating intelligent fallbacks:', error);
      return getDefaultRecommendations();
    }

    return recommendations.length > 0 ? recommendations : getDefaultRecommendations();
  }, []);

  const getDefaultRecommendations = (): AIRecommendation[] => {
    return [
      {
        title: 'Desarrollar Estrategia Básica de Negocio',
        description: 'Enfócate en definir claramente tu propuesta de valor, identificar tu mercado objetivo y establecer un modelo de ingresos básico pero funcional.',
        priority: 'Alta',
        timeframe: '2-3 semanas'
      },
      {
        title: 'Validar Concepto con Audiencia Real',
        description: 'Realiza pruebas simples con usuarios potenciales para confirmar que tu idea resuelve un problema real y significativo.',
        priority: 'Alta',
        timeframe: '1-2 semanas'
      },
      {
        title: 'Mejorar Experiencia del Usuario',
        description: 'Simplifica procesos, mejora la usabilidad y establece canales para recibir feedback continuo de tus usuarios.',
        priority: 'Media',
        timeframe: '2-4 semanas'
      }
    ];
  };

  const fetchRecommendationsWithFallback = useCallback(async (scores: CategoryScore): Promise<AIRecommendation[]> => {
    if (!scores) {
      console.log('fetchRecommendationsWithFallback: No scores provided, using defaults');
      return generateIntelligentFallbacks({
        ideaValidation: 50,
        userExperience: 50,
        marketFit: 50,
        monetization: 40
      });
    }

    setLoading(true);
    
    try {
      console.log('Attempting to fetch AI recommendations for scores:', scores);
      
      // Intentar obtener recomendaciones de IA con timeout más corto
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI request timeout')), 10000)
      );
      
      const aiPromise = supabase.functions.invoke('ai-recommendations', {
        body: { 
          scores, 
          profileData: {}, 
          language: 'es' 
        }
      });

      const { data, error } = await Promise.race([aiPromise, timeoutPromise]) as any;

      if (error || !data?.recommendations || !Array.isArray(data.recommendations)) {
        console.log('AI recommendations failed or invalid, using intelligent fallbacks:', { error, data });
        return generateIntelligentFallbacks(scores);
      }

      console.log('AI recommendations fetched successfully:', data.recommendations.length);
      return data.recommendations;
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
      return generateIntelligentFallbacks(scores);
    } finally {
      setLoading(false);
    }
  }, [generateIntelligentFallbacks]);

  return {
    fetchRecommendationsWithFallback,
    loading
  };
};
