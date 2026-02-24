export type FeatureFlag = 
  | 'ADVANCED_MODE'
  | 'CAMINO_ARTESANAL'
  | 'ADVANCED_METRICS'
  | 'AGENT_LEGAL'
  | 'AGENT_LOGISTICA'
  | 'AGENT_FINANZAS'
  | 'AGENT_PUBLICIDAD'
  | 'AGENT_VENTAS_AVANZADAS'
  | 'MATURITY_TEST_FULL'
  | 'AI_STRATEGIC_ANALYSIS';

export const FEATURE_FLAGS: Record<FeatureFlag, boolean> = {
  ADVANCED_MODE: false,           // Modo avanzado bloqueado por defecto
  CAMINO_ARTESANAL: false,        // Ruta del artesano bloqueada
  ADVANCED_METRICS: false,        // Métricas avanzadas bloqueadas
  AGENT_LEGAL: false,             // Agentes bloqueados
  AGENT_LOGISTICA: false,
  AGENT_FINANZAS: false,
  AGENT_PUBLICIDAD: false,
  AGENT_VENTAS_AVANZADAS: false,
  MATURITY_TEST_FULL: false,      // Test completo bloqueado (solo 3 preguntas iniciales)
  AI_STRATEGIC_ANALYSIS: false,   // Análisis estratégico con IA bloqueado
};

export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
  return FEATURE_FLAGS[flag];
};
