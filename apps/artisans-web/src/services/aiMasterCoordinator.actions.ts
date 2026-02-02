/**
 * AI Master Coordinator Service - Centralized API calls to NestJS backend
 * 
 * Este servicio maneja las invocaciones al coordinador maestro de IA
 * usando el backend NestJS en lugar de Edge Functions de Supabase.
 */

import { telarApi } from '@/integrations/api/telarApi';
import type {
  MasterCoordinatorRequest,
  AnalyzeAndGenerateTasksRequest,
  AnalyzeAndGenerateTasksResponse,
  MasterCoordinatorErrorResponse
} from '@/types/aiMasterCoordinator.types';

/**
 * Invoca al coordinador maestro de IA con cualquier acción
 * @param request - Solicitud con la acción y parámetros
 * @returns Respuesta del coordinador maestro
 */
export const invokeMasterCoordinator = async <T = any>(
  request: MasterCoordinatorRequest
): Promise<T> => {
  try {
    const response = await telarApi.post<T>(
      `/telar/server/ai/master-coordinator`,
      request
    );
    return response.data;
  } catch (error: any) {
    console.error('[AIMasterCoordinator] Error al invocar coordinador:', error);
    
    if (error.response?.data) {
      throw error.response.data as MasterCoordinatorErrorResponse;
    }
    throw error;
  }
};

/**
 * Analiza el perfil del usuario y genera tareas personalizadas
 * @param request - Datos del usuario y contexto
 * @returns Lista de tareas generadas con análisis
 */
export const analyzeAndGenerateTasks = async (
  request: Omit<AnalyzeAndGenerateTasksRequest, 'action'>
): Promise<AnalyzeAndGenerateTasksResponse> => {
  return invokeMasterCoordinator<AnalyzeAndGenerateTasksResponse>({
    action: 'analyze_and_generate_tasks',
    ...request
  });
};
