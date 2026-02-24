/**
 * 🔒 MÓDULO ESTABLE - NO MODIFICAR SIN AUTORIZACIÓN EXPLÍCITA
 * Este archivo es parte del Growth Agent y está certificado como estable.
 * Cualquier cambio debe ser solicitado explícitamente por el usuario.
 * Ver: docs/GROWTH_MODULE_LOCKED.md
 * 
 * Configuración central del Test de Madurez
 * Todos los componentes deben importar estas constantes
 */

export const MATURITY_TEST_CONFIG = {
  ONBOARDING_QUESTIONS: 3, // ✅ Preguntas del onboarding inicial
  FULL_TEST_QUESTIONS: 30, // ⬇️ Optimizado de 36 a 30 preguntas (sin contar onboarding)
  TOTAL_QUESTIONS_COMBINED: 33, // ✅ NUEVO: Total incluyendo onboarding (3 + 30)
  QUESTIONS_PER_BLOCK: 5, // ⬆️ Aumentado de 3 a 5 preguntas
  TOTAL_BLOCKS: 6, // ⬇️ Optimizado de 12 a 6 bloques temáticos
  CHECKPOINT_FREQUENCY: 5, // Cada 5 preguntas (cada bloque)
  MIN_REQUIRED_FOR_COMPLETION: 30, // ⬇️ Mínimo para completar evaluación completa
  // Legacy compatibility
  TOTAL_QUESTIONS: 30 // Deprecated: usar FULL_TEST_QUESTIONS
} as const;

/**
 * Calcula preguntas restantes de forma consistente
 */
export const getRemainingQuestions = (totalAnswered: number): number => {
  return Math.max(0, MATURITY_TEST_CONFIG.TOTAL_QUESTIONS - totalAnswered);
};

/**
 * Calcula porcentaje de progreso
 */
export const getProgressPercentage = (totalAnswered: number, totalQuestions: number = MATURITY_TEST_CONFIG.TOTAL_QUESTIONS): number => {
  return Math.min(
    100,
    Math.round((totalAnswered / totalQuestions) * 100)
  );
};

/**
 * Determina si la evaluación está completa (todas las 36 preguntas)
 */
export const isAssessmentComplete = (totalAnswered: number): boolean => {
  return totalAnswered >= MATURITY_TEST_CONFIG.MIN_REQUIRED_FOR_COMPLETION;
};

/**
 * Determina si el onboarding está completo (solo 3 preguntas)
 */
export const isOnboardingComplete = (totalAnswered: number): boolean => {
  return totalAnswered >= MATURITY_TEST_CONFIG.ONBOARDING_QUESTIONS;
};

/**
 * Calcula el número de pregunta global (1-based)
 */
export const getGlobalQuestionNumber = (totalAnswered: number): number => {
  return Math.min(totalAnswered + 1, MATURITY_TEST_CONFIG.TOTAL_QUESTIONS);
};

/**
 * Calcula el bloque actual basado en preguntas respondidas
 */
export const getCurrentBlock = (totalAnswered: number): number => {
  return Math.floor(totalAnswered / MATURITY_TEST_CONFIG.QUESTIONS_PER_BLOCK);
};

/**
 * Determina si debe mostrar un checkpoint
 */
export const shouldShowCheckpoint = (totalAnswered: number): boolean => {
  return totalAnswered > 0 && totalAnswered % MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY === 0;
};
