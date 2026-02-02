/**
 * Validador de Progreso del Camino Artesanal
 * 
 * 🔒 PARTE DEL MÓDULO DE GROWTH - VER docs/GROWTH_MODULE_LOCKED.md
 * 
 * Fórmula de progreso:
 * - 5% base por completar el Maturity Test
 * - 95% restante basado en tareas completadas
 * 
 * Esto asegura que el progreso real refleje el trabajo del artesano
 * y no solo el hecho de haberse registrado o completado el test inicial.
 */

import { MasterContext } from '@/types/masterContext';

interface ProgressBreakdown {
  baseProgress: number; // 5% por completar test
  tasksProgress: number; // 95% por tareas completadas
  totalProgress: number; // 0-100
  completedTasks: number;
  totalTasks: number;
  completionRate: number; // 0-1
}

/**
 * Calcula el progreso del Camino Artesanal basado en tareas completadas
 * 
 * @param context - Contexto unificado del usuario
 * @returns Progreso total de 0 a 100
 */
export const calculateCaminoArtesanalProgress = (context?: MasterContext | null): number => {
  if (!context) {
    console.log('[CaminoArtesanal] No context provided, returning 0');
    return 0;
  }

  const breakdown = getProgressBreakdown(context);
  
  console.log('[CaminoArtesanal] Progress calculated:', {
    base: `${breakdown.baseProgress}%`,
    tasks: `${breakdown.tasksProgress}%`,
    total: `${breakdown.totalProgress}%`,
    completedTasks: breakdown.completedTasks,
    totalTasks: breakdown.totalTasks
  });

  return breakdown.totalProgress;
};

/**
 * Obtiene un desglose detallado del progreso
 * 
 * @param context - Contexto unificado del usuario
 * @returns Desglose completo del progreso
 */
export const getProgressBreakdown = (context: MasterContext): ProgressBreakdown => {
  // 1. Verificar si completó el Maturity Test
  const hasCompletedTest = hasCompletedMaturityTest(context);
  const baseProgress = hasCompletedTest ? 5 : 0;

  // 2. Calcular progreso de tareas
  const { completedTasks, totalTasks, completionRate } = getTasksCompletion(context);
  const tasksProgress = completionRate * 95; // 95% del total

  // 3. Calcular progreso total
  const totalProgress = Math.min(100, Math.round(baseProgress + tasksProgress));

  return {
    baseProgress,
    tasksProgress,
    totalProgress,
    completedTasks,
    totalTasks,
    completionRate
  };
};

/**
 * Verifica si el usuario completó el Maturity Test
 */
const hasCompletedMaturityTest = (context: MasterContext): boolean => {
  // Verificar en maturity scores
  const hasScores = context.maturity && 
    Object.values(context.maturity).some(score => typeof score === 'number' && score > 0);
  
  return hasScores || false;
};

/**
 * Calcula el progreso de tareas completadas
 */
const getTasksCompletion = (context: MasterContext): {
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
} => {
  const tasks = context.tasks || [];
  
  if (tasks.length === 0) {
    return {
      completedTasks: 0,
      totalTasks: 0,
      completionRate: 0
    };
  }

  const completedTasks = tasks.filter((task: any) => 
    task.status === 'completed' || 
    task.completion_status === 'completed' ||
    task.progress_percentage === 100
  ).length;

  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

  return {
    completedTasks,
    totalTasks,
    completionRate
  };
};

/**
 * Determina si el progreso debe actualizarse
 * Previene actualizaciones innecesarias
 */
export const shouldUpdateProgress = (
  currentProgress: number,
  newProgress: number
): boolean => {
  // Solo actualizar si hay un cambio significativo (>= 1%)
  return Math.abs(newProgress - currentProgress) >= 1;
};

/**
 * Obtiene el mensaje motivacional según el progreso
 */
export const getProgressMessage = (progress: number, language: 'es' | 'en' = 'es'): string => {
  const messages = {
    es: {
      0: '¡Empecemos tu camino artesanal! Completa el test de madurez.',
      5: '¡Test completado! Ahora comienza a trabajar en tus primeras tareas.',
      25: '¡Vas por buen camino! Ya llevas un cuarto del recorrido.',
      50: '¡Mitad del camino! Tu negocio está tomando forma.',
      75: '¡Casi llegando! Solo un 25% más para completar tu transformación.',
      100: '🎉 ¡Felicidades! Has completado tu camino artesanal.'
    },
    en: {
      0: 'Let\'s start your artisan journey! Complete the maturity test.',
      5: 'Test completed! Now start working on your first tasks.',
      25: 'You\'re on the right track! A quarter of the way there.',
      50: 'Halfway there! Your business is taking shape.',
      75: 'Almost there! Just 25% more to complete your transformation.',
      100: '🎉 Congratulations! You\'ve completed your artisan journey.'
    }
  };

  const ranges = [0, 5, 25, 50, 75, 100];
  const closestRange = ranges.reduce((prev, curr) => 
    Math.abs(curr - progress) < Math.abs(prev - progress) ? curr : prev
  );

  return messages[language][closestRange as keyof typeof messages.es];
};

/**
 * Valida la integridad del progreso guardado
 * Detecta y corrige anomalías
 */
export const validateProgressIntegrity = (context: MasterContext): {
  isValid: boolean;
  issues: string[];
  correctedProgress: number;
} => {
  const issues: string[] = [];
  const calculatedProgress = calculateCaminoArtesanalProgress(context);
  const savedProgress = (context as any).camino_artesanal_progress || 0;

  // Detectar progreso inflado
  if (savedProgress > calculatedProgress + 10) {
    issues.push(`Progreso guardado (${savedProgress}%) excede el calculado (${calculatedProgress}%) por más de 10%`);
  }

  // Detectar progreso sin tareas completadas
  const breakdown = getProgressBreakdown(context);
  if (savedProgress > 5 && breakdown.completedTasks === 0) {
    issues.push(`Progreso de ${savedProgress}% sin tareas completadas`);
  }

  // Detectar progreso >100%
  if (savedProgress > 100) {
    issues.push(`Progreso inválido: ${savedProgress}% (máximo: 100%)`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    correctedProgress: Math.min(100, calculatedProgress)
  };
};
