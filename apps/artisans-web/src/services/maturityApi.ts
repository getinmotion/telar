/**
 * Servicio de API para el sistema de evaluación de madurez y onboarding
 * Integrado con el backend de NestJS
 */

import { telarApi } from "@/integrations/api/telarApi";


// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

/**
 * Request para extraer información de negocio con IA
 */
export interface ExtractBusinessInfoRequest {
  userText: string;
  language: 'es' | 'en';
  fieldsToExtract: string[];
}

/**
 * Response exitoso de extracción de información
 */
export interface ExtractBusinessInfoResponse {
  success: boolean;
  data: {
    brand_name: string | null;
    craft_type: string;
    business_location: string | null;
    unique_value: string;
    confidence: number;
    products?: string;
    target_audience?: string;
  };
  metadata: {
    hasFirstPerson: boolean;
    hasExplicitBrandName: boolean;
    hasBrandNegation: boolean;
    wasNameCorrected: boolean;
  };
}

/**
 * Request para crear/actualizar user_master_context
 */
export interface UserMasterContextRequest {
  userId: string;
  businessContext?: Record<string, any>;
  preferences?: Record<string, any>;
  conversationInsights?: Record<string, any>;
  technicalDetails?: Record<string, any>;
  goalsAndObjectives?: Record<string, any>;
  contextVersion?: number;
  businessProfile?: Record<string, any>;
  taskGenerationContext?: Record<string, any>;
  languagePreference?: 'es' | 'en';
}

/**
 * Response de user_master_context
 */
export interface UserMasterContextResponse {
  id: string;
  userId: string;
  businessContext: Record<string, any>;
  preferences: Record<string, any>;
  conversationInsights: Record<string, any>;
  technicalDetails: Record<string, any>;
  goalsAndObjectives: Record<string, any>;
  contextVersion: number;
  businessProfile: Record<string, any>;
  taskGenerationContext: Record<string, any>;
  languagePreference: string;
  lastAssessmentDate: string | null;
  lastUpdated: string;
  createdAt: string;
}

/**
 * Request para completar el onboarding (Fase 1)
 */
export interface CompleteOnboardingRequest {
  profileData: {
    businessDescription: string;
    brandName: string;
    craftType: string;
    businessLocation: string;
    salesStatus: string;
    targetCustomer: string;
  };
  answeredQuestionIds: string[];
  conversationInsights?: Record<string, any>;
}

/**
 * Response de completar onboarding
 */
export interface CompleteOnboardingResponse {
  success: boolean;
  message: string;
  data: {
    userProfileCreated: boolean;
    userProgressCreated: boolean;
    userMasterContextUpdated: boolean;
    caminoArtesanalProgress: number;
    tasksGenerated: number;
  };
}

// ============================================================================
// API METHODS
// ============================================================================

export const maturityApi = {
  /**
   * Extrae información estructurada de la descripción del negocio usando IA
   * Endpoint: POST /telar/server/ai/extract-business-info
   */
  extractBusinessInfo: async (
    data: ExtractBusinessInfoRequest
  ): Promise<ExtractBusinessInfoResponse> => {
    const response = await telarApi.post<ExtractBusinessInfoResponse>(
      '/telar/server/ai/extract-business-info',
      data
    );
    return response.data;
  },

  /**
   * Crea o actualiza el contexto maestro del usuario
   * Endpoint: POST /telar/server/user-master-context
   */
  createOrUpdateUserMasterContext: async (
    data: UserMasterContextRequest
  ): Promise<UserMasterContextResponse> => {
    const response = await telarApi.post<UserMasterContextResponse>(
      '/telar/server/user-master-context',
      data
    );
    return response.data;
  },

  /**
   * Obtiene el contexto maestro del usuario (progreso)
   * Endpoint: GET /telar/server/master-coordinator-context/user/{userId}
   */
  getUserMasterContext: async (userId: string): Promise<UserMasterContextResponse | null> => {
    try {
      const response = await telarApi.get<UserMasterContextResponse>(
        `/telar/server/master-coordinator-context/user/${userId}`
      );
      return response.data;
    } catch (error: any) {
      // Si no existe el contexto, retornar null
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Guarda el progreso del onboarding (3 preguntas)
   * Este método combina la lógica de guardar en user_master_context
   */
  saveOnboardingProgress: async (params: {
    userId: string;
    currentBlockIndex: number;
    answeredQuestionIds: string[];
    profileData: Record<string, any>;
  }) => {
    const { userId, currentBlockIndex, answeredQuestionIds, profileData } = params;

    // Construir el objeto para user_master_context
    const contextData: UserMasterContextRequest = {
      userId,
      businessProfile: profileData,
      taskGenerationContext: {
        maturity_test_progress: {
          current_block: currentBlockIndex,
          total_answered: answeredQuestionIds.length,
          answered_question_ids: answeredQuestionIds,
          is_complete: answeredQuestionIds.length >= 3,
          last_updated: new Date().toISOString(),
        },
      },
      languagePreference: 'es',
      contextVersion: 1,
    };

    return await maturityApi.createOrUpdateUserMasterContext(contextData);
  },

  /**
   * Obtiene el progreso del onboarding
   */
  getOnboardingProgress: async (userId: string) => {
    const context = await maturityApi.getUserMasterContext(userId);

    if (!context || !context.taskGenerationContext?.maturity_test_progress) {
      return {
        success: false,
        data: null,
      };
    }

    const progress = context.taskGenerationContext.maturity_test_progress;

    return {
      success: true,
      data: {
        currentBlockIndex: progress.current_block || 0,
        totalAnswered: progress.total_answered || 0,
        answeredQuestionIds: progress.answered_question_ids || [],
        profileData: context.businessProfile || {},
        isCompleted: progress.is_complete || false,
        lastUpdated: progress.last_updated,
      },
    };
  },

  /**
   * Completa el onboarding (finaliza las 3 preguntas)
   * ⚠️ NOTA: Este endpoint aún no existe en el backend
   * Endpoint esperado: POST /telar/server/maturity/complete-onboarding
   */
  completeOnboarding: async (
    data: CompleteOnboardingRequest
  ): Promise<CompleteOnboardingResponse> => {
    const response = await telarApi.post<CompleteOnboardingResponse>(
      '/telar/server/maturity/complete-onboarding',
      data
    );
    return response.data;
  },

  /**
   * Inicializa el user_progress (gamificación)
   * ⚠️ NOTA: Este endpoint aún no existe en el backend
   * Endpoint esperado: POST /telar/server/user-progress
   */
  initUserProgress: async (userId: string) => {
    const response = await telarApi.post('/telar/server/user-progress', {
      userId,
    });
    return response.data;
  },
};
