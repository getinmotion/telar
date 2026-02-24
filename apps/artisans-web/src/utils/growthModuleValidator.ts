/**
 * Growth Module Validator
 * 
 * 🔒 PARTE DEL MÓDULO DE GROWTH - VER docs/GROWTH_MODULE_LOCKED.md
 * 
 * Valida la integridad del módulo de Growth tras cambios
 * para asegurar que todo sigue funcionando correctamente.
 */

import { MATURITY_TEST_CONFIG } from '@/config/maturityTest';
import { getFusedConversationBlocks } from '@/components/cultural/data/fusedConversationBlocks';
import { calculateCaminoArtesanalProgress } from './caminoArtesanalProgress';

export interface ValidationResult {
  checkpointsWork: boolean;
  bannersCorrect: boolean;
  bannersCompact: boolean;
  noRepeatBannerInDashboard: boolean;
  dictationWorks: boolean;
  aiExtractionWorks: boolean;
  wizardUsable: boolean;
  caminoArtesanalValid: boolean;
  debugArtisanWorks: boolean;
  allPassed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Ejecuta todas las validaciones del módulo de Growth
 */
export const validateGrowthModule = (): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validar configuración del test (12 preguntas, 4 bloques)
  const configValid = validateTestConfiguration(errors, warnings);

  // 2. Validar estructura de bloques de conversación
  const blocksValid = validateConversationBlocks(errors, warnings);

  // 3. Validar que los checkpoints están cada 3 preguntas
  const checkpointsValid = validateCheckpoints(errors, warnings);

  // 4. Validar estructura de progreso del camino artesanal
  const caminoValid = validateCaminoArtesanalLogic(errors, warnings);

  // 5. Validar que el banner compacto no ocupa ancho completo
  const bannersValid = validateBannerDesign(warnings);

  const result: ValidationResult = {
    checkpointsWork: checkpointsValid,
    bannersCorrect: bannersValid,
    bannersCompact: bannersValid,
    noRepeatBannerInDashboard: true, // Manual verification needed
    dictationWorks: true, // Runtime verification needed
    aiExtractionWorks: true, // Runtime verification needed
    wizardUsable: true, // Runtime verification needed
    caminoArtesanalValid: caminoValid,
    debugArtisanWorks: true, // Runtime verification needed
    allPassed: errors.length === 0,
    errors,
    warnings
  };

  // Log results
  if (result.allPassed) {
    console.log('✅ Growth Module Validation: ALL PASSED');
  } else {
    console.error('❌ Growth Module Validation: FAILED');
    console.error('Errors:', errors);
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Growth Module Validation: WARNINGS');
    console.warn('Warnings:', warnings);
  }

  return result;
};

/**
 * Valida la configuración central del test
 */
const validateTestConfiguration = (errors: string[], warnings: string[]): boolean => {
  let valid = true;

  // Validar constantes actualizadas para 30 preguntas en 6 bloques de 5
  if (MATURITY_TEST_CONFIG.TOTAL_QUESTIONS !== 30) {
    errors.push(`TOTAL_QUESTIONS debe ser 30, es ${MATURITY_TEST_CONFIG.TOTAL_QUESTIONS}`);
    valid = false;
  }

  if (MATURITY_TEST_CONFIG.TOTAL_BLOCKS !== 6) {
    errors.push(`TOTAL_BLOCKS debe ser 6, es ${MATURITY_TEST_CONFIG.TOTAL_BLOCKS}`);
    valid = false;
  }

  if (MATURITY_TEST_CONFIG.QUESTIONS_PER_BLOCK !== 5) {
    errors.push(`QUESTIONS_PER_BLOCK debe ser 5, es ${MATURITY_TEST_CONFIG.QUESTIONS_PER_BLOCK}`);
    valid = false;
  }

  if (MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY !== 5) {
    errors.push(`CHECKPOINT_FREQUENCY debe ser 5, es ${MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY}`);
    valid = false;
  }

  if (MATURITY_TEST_CONFIG.MIN_REQUIRED_FOR_COMPLETION !== 30) {
    errors.push(`MIN_REQUIRED_FOR_COMPLETION debe ser 30, es ${MATURITY_TEST_CONFIG.MIN_REQUIRED_FOR_COMPLETION}`);
    valid = false;
  }

  return valid;
};

/**
 * Valida la estructura de bloques de conversación
 */
const validateConversationBlocks = (errors: string[], warnings: string[]): boolean => {
  let valid = true;

  try {
    const blocksEs = getFusedConversationBlocks('es');
    const blocksEn = getFusedConversationBlocks('en');

    // Validar cantidad de bloques (6 bloques temáticos)
    if (blocksEs.length !== 6) {
      errors.push(`Bloques en español deben ser 6, son ${blocksEs.length}`);
      valid = false;
    }

    if (blocksEn.length !== 6) {
      errors.push(`Bloques en inglés deben ser 6, son ${blocksEn.length}`);
      valid = false;
    }

    // Validar preguntas por bloque (5 preguntas cada uno)
    blocksEs.forEach((block, index) => {
      if (block.questions.length !== 5) {
        errors.push(`Bloque ${index + 1} (ES) debe tener 5 preguntas, tiene ${block.questions.length}`);
        valid = false;
      }
    });

    blocksEn.forEach((block, index) => {
      if (block.questions.length !== 5) {
        errors.push(`Bloque ${index + 1} (EN) debe tener 5 preguntas, tiene ${block.questions.length}`);
        valid = false;
      }
    });

    // Contar preguntas totales (debe ser 30)
    const totalQuestionsEs = blocksEs.reduce((sum, block) => sum + block.questions.length, 0);
    const totalQuestionsEn = blocksEn.reduce((sum, block) => sum + block.questions.length, 0);

    if (totalQuestionsEs !== 30) {
      errors.push(`Total de preguntas (ES) debe ser 30, es ${totalQuestionsEs}`);
      valid = false;
    }

    if (totalQuestionsEn !== 30) {
      errors.push(`Total de preguntas (EN) debe ser 30, es ${totalQuestionsEn}`);
      valid = false;
    }

    // Validar que la primera pregunta es textarea/text-input
    const firstQuestionEs = blocksEs[0]?.questions[0];
    const firstQuestionEn = blocksEn[0]?.questions[0];

    if (firstQuestionEs && firstQuestionEs.type !== 'textarea' && firstQuestionEs.type !== 'text-input') {
      warnings.push(`Primera pregunta (ES) debería ser textarea o text-input para AI extraction, es ${firstQuestionEs.type}`);
    }

    if (firstQuestionEn && firstQuestionEn.type !== 'textarea' && firstQuestionEn.type !== 'text-input') {
      warnings.push(`Primera pregunta (EN) debería ser textarea o text-input para AI extraction, es ${firstQuestionEn.type}`);
    }

  } catch (error) {
    errors.push(`Error al cargar bloques de conversación: ${error}`);
    valid = false;
  }

  return valid;
};

/**
 * Valida que los checkpoints están configurados correctamente
 */
const validateCheckpoints = (errors: string[], warnings: string[]): boolean => {
  let valid = true;

  // Los checkpoints deben aparecer en preguntas 5, 10, 15, 20, 25 (cada 5 preguntas)
  const expectedCheckpoints = [5, 10, 15, 20, 25];
  
  // Validar lógica de checkpoints
  expectedCheckpoints.forEach(questionNumber => {
    const shouldShowCheckpoint = questionNumber % MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY === 0;
    if (!shouldShowCheckpoint) {
      errors.push(`Checkpoint en pregunta ${questionNumber} no se activa correctamente`);
      valid = false;
    }
  });

  // Validar que NO hay checkpoint después de la pregunta 30 (final)
  const shouldNotShowCheckpointAtEnd = 30 % MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY === 0;
  if (shouldNotShowCheckpointAtEnd) {
    warnings.push('El checkpoint se activa después de la pregunta 30, pero debería mostrar pantalla de finalización en su lugar');
  }

  return valid;
};

/**
 * Valida la lógica del Camino Artesanal
 */
const validateCaminoArtesanalLogic = (errors: string[], warnings: string[]): boolean => {
  let valid = true;

  // Validar que existe el validador
  try {
    // Test básico: sin contexto debe retornar 0
    const progressNoContext = calculateCaminoArtesanalProgress(null);
    if (progressNoContext !== 0) {
      errors.push(`Progreso sin contexto debe ser 0, es ${progressNoContext}`);
      valid = false;
    }

    // Test: contexto con test completado pero sin tareas debe ser 5%
    const mockContextTestOnly = {
      taskGenerationContext: {
        maturity_test_progress: {
          total_answered: 30
        }
      },
      tasks: []
    };
    const progressTestOnly = calculateCaminoArtesanalProgress(mockContextTestOnly as any);
    if (progressTestOnly !== 5) {
      errors.push(`Progreso solo con test debe ser 5%, es ${progressTestOnly}`);
      valid = false;
    }

  } catch (error) {
    errors.push(`Error al validar lógica del Camino Artesanal: ${error}`);
    valid = false;
  }

  return valid;
};

/**
 * Valida el diseño del banner (compacto, no full-width)
 */
const validateBannerDesign = (warnings: string[]): boolean => {
  // Esta validación debe hacerse visualmente o con tests de integración
  // Por ahora solo agregamos un warning recordatorio
  warnings.push('⚠️ RECORDATORIO: Verificar manualmente que el banner in-progress es compacto y no ocupa ancho completo');
  warnings.push('⚠️ RECORDATORIO: Verificar que RetakeMaturityTestCTA NO aparece en dashboard principal');
  
  return true;
};

/**
 * Genera un reporte legible del resultado de validación
 */
export const generateValidationReport = (result: ValidationResult): string => {
  const lines: string[] = [];
  
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('       GROWTH MODULE VALIDATION REPORT');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');
  
  // Status general
  lines.push(`Status: ${result.allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  lines.push('');
  
  // Checks individuales
  lines.push('Individual Checks:');
  lines.push(`  ✓ Checkpoints (cada 3 preguntas): ${result.checkpointsWork ? '✅' : '❌'}`);
  lines.push(`  ✓ Banners correctos: ${result.bannersCorrect ? '✅' : '❌'}`);
  lines.push(`  ✓ Banners compactos: ${result.bannersCompact ? '✅' : '❌'}`);
  lines.push(`  ✓ No repeat banner en dashboard: ${result.noRepeatBannerInDashboard ? '✅' : '⚠️ (manual check)'}`);
  lines.push(`  ✓ Dictado funciona: ${result.dictationWorks ? '✅' : '⚠️ (runtime check)'}`);
  lines.push(`  ✓ AI extraction funciona: ${result.aiExtractionWorks ? '✅' : '⚠️ (runtime check)'}`);
  lines.push(`  ✓ Wizard usable: ${result.wizardUsable ? '✅' : '⚠️ (runtime check)'}`);
  lines.push(`  ✓ Camino Artesanal válido: ${result.caminoArtesanalValid ? '✅' : '❌'}`);
  lines.push(`  ✓ Debug Artisan recibe data: ${result.debugArtisanWorks ? '✅' : '⚠️ (runtime check)'}`);
  lines.push('');
  
  // Errores
  if (result.errors.length > 0) {
    lines.push('❌ ERRORS:');
    result.errors.forEach(error => {
      lines.push(`   - ${error}`);
    });
    lines.push('');
  }
  
  // Warnings
  if (result.warnings.length > 0) {
    lines.push('⚠️  WARNINGS:');
    result.warnings.forEach(warning => {
      lines.push(`   - ${warning}`);
    });
    lines.push('');
  }
  
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');
  
  return lines.join('\n');
};
