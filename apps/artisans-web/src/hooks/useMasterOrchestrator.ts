import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface OrchestratorResponse {
  status: 'success' | 'error';
  data?: any;
  message?: string;
  events?: string[];
}

interface TaskGenerationResult {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: string;
  category: string;
  agentId: string;
  isUnlocked: boolean;
  steps: Array<{
    id: string;
    stepNumber: number;
    title: string;
    description: string;
    isCompleted: boolean;
  }>;
}

interface AnalysisResult {
  agentId: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: string;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  progress?: string;
  nextSteps?: string[];
  deliverable?: {
    id: string;
    taskId: string;
    title: string;
    description: string;
    type: string;
    content: any;
    createdAt: string;
  };
}

/**
 * Hook para interactuar con el Master Coordinator Orchestrator
 * que usa IA para análisis, generación de tareas y validación
 */
export function useMasterOrchestrator() {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Analiza el contexto del usuario para un agente específico
   */
  const analyzeContext = async (agentId: string): Promise<AnalysisResult | null> => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return null;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke<OrchestratorResponse>(
        'master-coordinator-orchestrator',
        {
          body: {
            type: 'analyze',
            agentId,
            userId: user.id
          }
        }
      );

      if (error) throw error;

      if (data?.status === 'error') {
        throw new Error(data.message || 'Error en el análisis');
      }

      const result = data?.data as AnalysisResult;

      // Track analysis completion

      return result;

    } catch (error) {
      console.error('[useMasterOrchestrator] Analysis error:', error);
      toast.error('Error al analizar contexto');

      // Track error

      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Genera tareas personalizadas para un agente usando IA
   */
  const generateTasks = async (agentId: string): Promise<TaskGenerationResult[] | null> => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return null;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke<OrchestratorResponse>(
        'master-coordinator-orchestrator',
        {
          body: {
            type: 'generate_tasks',
            agentId,
            userId: user.id
          }
        }
      );

      if (error) throw error;

      if (data?.status === 'error') {
        throw new Error(data.message || 'Error generando tareas');
      }

      const tasks = data?.data as TaskGenerationResult[];
      toast.success('Tareas personalizadas generadas');

      // Track task generation

      return tasks;

    } catch (error) {
      console.error('[useMasterOrchestrator] Task generation error:', error);
      toast.error('Error al generar tareas');

      // Track error

      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Valida la completitud de una tarea usando IA
   */
  const validateTask = async (
    agentId: string,
    taskId: string
  ): Promise<ValidationResult | null> => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return null;
    }

    setIsValidating(true);

    try {
      const { data, error } = await supabase.functions.invoke<OrchestratorResponse>(
        'master-coordinator-orchestrator',
        {
          body: {
            type: 'validate_task',
            agentId,
            userId: user.id,
            payload: { taskId }
          }
        }
      );

      if (error) throw error;

      if (data?.status === 'error') {
        throw new Error(data.message || 'Error validando tarea');
      }

      const result = data?.data as ValidationResult;

      if (result.isValid) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }

      console.log('[useMasterOrchestrator] Validation complete:', result);

      // Track validation

      return result;

    } catch (error) {
      console.error('[useMasterOrchestrator] Validation error:', error);
      toast.error('Error al validar tarea');

      // Track error

      return null;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    analyzeContext,
    generateTasks,
    validateTask,
    isAnalyzing,
    isGenerating,
    isValidating,
    isLoading: isAnalyzing || isGenerating || isValidating
  };
}
