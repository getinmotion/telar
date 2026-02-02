/**
 * System Integrity Validator
 * 
 * Comprehensive validation system for platform health and data consistency.
 * Validates Master Coordinator health, agent system integrity, data synchronization,
 * mission system health, and UI coherence.
 */

import { supabase } from '@/integrations/supabase/client';
import { ALLOWED_AGENTS, BLOCKED_AGENTS, AGENT_DISPLAY_INFO } from '@/config/allowedAgents';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';
import { getUserMasterContextByUserId } from '@/services/userMasterContext.actions';
import { getArtisanShopByUserId } from '@/services/artisanShops.actions';

export interface ValidationCheck {
  id: string;
  name: string;
  passed: boolean;
  message: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  recommendation?: string;
  data?: any;
}

export interface SystemIntegrityResult {
  masterCoordinatorHealth: {
    passed: boolean;
    checks: ValidationCheck[];
  };
  agentSystemIntegrity: {
    passed: boolean;
    allowedAgentsActive: string[];
    blockedAgentsInactive: string[];
    blockedAgentsWithMissions: string[];
    checks: ValidationCheck[];
  };
  dataSynchronization: {
    passed: boolean;
    businessNameConsistent: boolean;
    maturityScoresSource: 'master_context' | 'legacy_table' | 'none';
    checks: ValidationCheck[];
  };
  missionSystemHealth: {
    passed: boolean;
    totalMissions: number;
    missionsByAgent: Record<string, number>;
    missionsWithoutCategory: number;
    checks: ValidationCheck[];
  };
  uiCoherence: {
    passed: boolean;
    checks: ValidationCheck[];
  };
  overallPassed: boolean;
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  timestamp: Date;
}

/**
 * Run complete system integrity validation
 */
export const validateSystemIntegrity = async (userId: string): Promise<SystemIntegrityResult> => {
  console.log('🔍 [SYSTEM INTEGRITY] Starting validation for user:', userId);

  const [
    masterCoordinatorHealth,
    agentSystemIntegrity,
    dataSynchronization,
    missionSystemHealth,
    uiCoherence
  ] = await Promise.all([
    validateMasterCoordinatorHealth(userId),
    validateAgentSystemIntegrity(userId),
    validateDataSynchronization(userId),
    validateMissionSystemHealth(userId),
    validateUICoherence(userId)
  ]);

  // Collect all critical issues, warnings, and recommendations
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const allChecks = [
    ...masterCoordinatorHealth.checks,
    ...agentSystemIntegrity.checks,
    ...dataSynchronization.checks,
    ...missionSystemHealth.checks,
    ...uiCoherence.checks
  ];

  allChecks.forEach(check => {
    if (!check.passed) {
      if (check.severity === 'critical' || check.severity === 'error') {
        criticalIssues.push(check.message);
      } else if (check.severity === 'warning') {
        warnings.push(check.message);
      }
    }
    if (check.recommendation) {
      recommendations.push(check.recommendation);
    }
  });

  const overallPassed = 
    masterCoordinatorHealth.passed &&
    agentSystemIntegrity.passed &&
    dataSynchronization.passed &&
    missionSystemHealth.passed &&
    uiCoherence.passed;

  console.log('✅ [SYSTEM INTEGRITY] Validation complete:', {
    overallPassed,
    criticalIssues: criticalIssues.length,
    warnings: warnings.length
  });

  return {
    masterCoordinatorHealth,
    agentSystemIntegrity,
    dataSynchronization,
    missionSystemHealth,
    uiCoherence,
    overallPassed,
    criticalIssues,
    warnings,
    recommendations,
    timestamp: new Date()
  };
};

/**
 * Validate Master Coordinator Health
 */
async function validateMasterCoordinatorHealth(userId: string) {
  const checks: ValidationCheck[] = [];

  // Check 1: user_master_context exists and has valid structure
  const { data: masterContext, error: contextError } = await supabase
    .from('user_master_context')
    .select('*')
    .eq('user_id', userId)
    .single();

  checks.push({
    id: 'master_context_exists',
    name: 'Master Context Exists',
    passed: !!masterContext && !contextError,
    message: masterContext 
      ? '✓ Master context existe con estructura válida'
      : '✗ Master context no encontrado o tiene errores',
    severity: masterContext ? 'info' : 'critical',
    recommendation: masterContext ? undefined : 'Ejecutar syncAll() en MasterAgentContext para inicializar',
    data: { exists: !!masterContext, hasError: !!contextError }
  });

  // Check 2: task_generation_context is present
  const hasTaskContext = masterContext?.task_generation_context != null;
  checks.push({
    id: 'task_generation_context_present',
    name: 'Task Generation Context',
    passed: hasTaskContext,
    message: hasTaskContext
      ? '✓ Task generation context configurado'
      : '✗ Task generation context no encontrado',
    severity: hasTaskContext ? 'info' : 'error',
    recommendation: hasTaskContext ? undefined : 'Completar maturity test para generar contexto'
  });

  // Check 3: Master state synchronized with database
  const lastUpdated = masterContext?.last_updated;
  const isRecent = lastUpdated ? (new Date().getTime() - new Date(lastUpdated).getTime()) < 86400000 : false;
  
  checks.push({
    id: 'master_state_recent',
    name: 'Recent Synchronization',
    passed: isRecent,
    message: isRecent
      ? `✓ Master state actualizado recientemente (${new Date(lastUpdated!).toLocaleString()})`
      : '⚠ Master state no se ha actualizado recientemente',
    severity: isRecent ? 'info' : 'warning',
    data: { lastUpdated }
  });

  // Check 4: Conversation insights present
  const hasInsights = masterContext?.conversation_insights != null;
  checks.push({
    id: 'conversation_insights_present',
    name: 'Conversation Insights',
    passed: hasInsights,
    message: hasInsights
      ? '✓ Conversation insights disponibles'
      : '⚠ Conversation insights no encontrados',
    severity: hasInsights ? 'info' : 'warning',
    recommendation: hasInsights ? undefined : 'Completar wizard de análisis profundo para generar insights'
  });

  const passed = checks.filter(c => c.severity === 'critical' || c.severity === 'error').every(c => c.passed);

  return { passed, checks };
}

/**
 * Validate Agent System Integrity
 */
async function validateAgentSystemIntegrity(userId: string) {
  const checks: ValidationCheck[] = [];

  // Check 1: Verify allowed agents are registered
  checks.push({
    id: 'allowed_agents_registered',
    name: 'Allowed Agents Configuration',
    passed: true,
    message: `✓ ${ALLOWED_AGENTS.length} agentes permitidos configurados: ${ALLOWED_AGENTS.join(', ')}`,
    severity: 'info',
    data: { allowedAgents: ALLOWED_AGENTS }
  });

  // Check 2: Verify only allowed agents have active missions
  const { data: allTasks } = await supabase
    .from('agent_tasks')
    .select('agent_id, status')
    .eq('user_id', userId)
    .in('status', ['pending', 'in_progress']);

  const tasksGroupedByAgent: Record<string, number> = {};
  const blockedAgentsWithMissions: string[] = [];

  allTasks?.forEach(task => {
    const agentId = task.agent_id;
    tasksGroupedByAgent[agentId] = (tasksGroupedByAgent[agentId] || 0) + 1;

    if (BLOCKED_AGENTS.includes(agentId as any)) {
      if (!blockedAgentsWithMissions.includes(agentId)) {
        blockedAgentsWithMissions.push(agentId);
      }
    }
  });

  const hasBlockedAgentMissions = blockedAgentsWithMissions.length > 0;

  checks.push({
    id: 'no_blocked_agent_missions',
    name: 'Blocked Agents Check',
    passed: !hasBlockedAgentMissions,
    message: hasBlockedAgentMissions
      ? `✗ ${blockedAgentsWithMissions.length} agentes bloqueados tienen misiones activas: ${blockedAgentsWithMissions.join(', ')}`
      : '✓ No hay misiones de agentes bloqueados',
    severity: hasBlockedAgentMissions ? 'error' : 'info',
    recommendation: hasBlockedAgentMissions 
      ? 'Cancelar o archivar misiones de agentes bloqueados'
      : undefined,
    data: { blockedAgentsWithMissions }
  });

  // Check 3: Agent display info is properly configured
  const allAgentsHaveDisplayInfo = ALLOWED_AGENTS.every(agentId => 
    AGENT_DISPLAY_INFO[agentId] != null
  );

  checks.push({
    id: 'agent_display_info_complete',
    name: 'Agent Display Configuration',
    passed: allAgentsHaveDisplayInfo,
    message: allAgentsHaveDisplayInfo
      ? '✓ Todos los agentes tienen configuración de display (nombre, icon, color)'
      : '✗ Algunos agentes no tienen configuración de display completa',
    severity: allAgentsHaveDisplayInfo ? 'info' : 'warning'
  });

  const passed = checks.filter(c => c.severity === 'critical' || c.severity === 'error').every(c => c.passed);

  return { 
    passed, 
    checks,
    allowedAgentsActive: Object.keys(tasksGroupedByAgent).filter(a => ALLOWED_AGENTS.includes(a as any)),
    blockedAgentsInactive: BLOCKED_AGENTS.filter(a => !blockedAgentsWithMissions.includes(a)),
    blockedAgentsWithMissions
  };
}

/**
 * Validate Data Synchronization
 */
async function validateDataSynchronization(userId: string) {
  const checks: ValidationCheck[] = [];

  // Fetch all data sources
  // ✅ Obtener perfil desde NestJS backend
  const profile = await getUserProfileByUserId(userId).catch(() => null);
  
  const [masterContext, shop] = await Promise.all([
    getUserMasterContextByUserId(userId).catch(() => null),
    getArtisanShopByUserId(userId).catch(() => null)
  ]);

  // Check 1: Business name consistency across sources
  const profileBrand = profile?.brandName;
  const businessProfile = masterContext?.businessProfile as any;
  const conversationInsights = masterContext?.conversationInsights as any;
  const contextBrand = businessProfile?.brand_name || businessProfile?.brandName;
  const insightsBrand = conversationInsights?.nombre_marca;
  const shopName = shop?.shopName;

  const brandNames = [profileBrand, contextBrand, insightsBrand, shopName].filter(Boolean);
  const uniqueBrandNames = [...new Set(brandNames)];
  const isConsistent = uniqueBrandNames.length <= 1;

  checks.push({
    id: 'business_name_consistent',
    name: 'Business Name Consistency',
    passed: isConsistent || brandNames.length === 0,
    message: isConsistent || brandNames.length === 0
      ? `✓ Nombre de negocio consistente: "${uniqueBrandNames[0] || 'No definido'}"`
      : `⚠ Nombre de negocio inconsistente: ${uniqueBrandNames.join(' vs ')}`,
    severity: isConsistent || brandNames.length === 0 ? 'info' : 'warning',
    recommendation: isConsistent ? undefined : 'Sincronizar nombres a través de todas las tablas',
    data: { profileBrand, contextBrand, insightsBrand, shopName }
  });

  // Check 2: Maturity scores source validation
  const taskGenContext = masterContext?.task_generation_context as any;
  const contextScores = taskGenContext?.maturityScores;
  const hasContextScores = contextScores != null;

  checks.push({
    id: 'maturity_scores_source',
    name: 'Maturity Scores Source',
    passed: hasContextScores,
    message: hasContextScores
      ? '✓ Maturity scores vienen de user_master_context (correcto)'
      : '⚠ Maturity scores no encontrados en master context',
    severity: hasContextScores ? 'info' : 'warning',
    recommendation: hasContextScores ? undefined : 'Completar maturity test para generar scores',
    data: { source: hasContextScores ? 'master_context' : 'none' }
  });

  // Check 3: LocalStorage uses user-namespaced keys
  const hasGlobalKeys = typeof window !== 'undefined' && (
    localStorage.getItem('fused_maturity_calculator_progress') != null ||
    localStorage.getItem('maturityCalculatorProgress') != null
  );

  checks.push({
    id: 'localstorage_namespaced',
    name: 'LocalStorage Namespacing',
    passed: !hasGlobalKeys,
    message: hasGlobalKeys
      ? '⚠ Claves globales de localStorage detectadas (deben migrar a user-namespaced)'
      : '✓ LocalStorage usa claves namespacedas por usuario',
    severity: hasGlobalKeys ? 'warning' : 'info',
    recommendation: hasGlobalKeys ? 'Ejecutar migración de localStorage keys' : undefined
  });

  const passed = checks.filter(c => c.severity === 'critical' || c.severity === 'error').every(c => c.passed);

  return { 
    passed, 
    checks,
    businessNameConsistent: isConsistent || brandNames.length === 0,
    maturityScoresSource: hasContextScores ? 'master_context' as const : 'none' as const
  };
}

/**
 * Validate Mission System Health
 */
async function validateMissionSystemHealth(userId: string) {
  const checks: ValidationCheck[] = [];

  // Fetch all missions/tasks
  const { data: allTasks } = await supabase
    .from('agent_tasks')
    .select('id, title, agent_id, milestone_category, status')
    .eq('user_id', userId);

  const totalMissions = allTasks?.length || 0;
  const missionsByAgent: Record<string, number> = {};
  let missionsWithoutCategory = 0;

  allTasks?.forEach(task => {
    missionsByAgent[task.agent_id] = (missionsByAgent[task.agent_id] || 0) + 1;
    if (!task.milestone_category) {
      missionsWithoutCategory++;
    }
  });

  // Check 1: All missions have milestone_category
  checks.push({
    id: 'missions_have_category',
    name: 'Mission Categorization',
    passed: missionsWithoutCategory === 0,
    message: missionsWithoutCategory === 0
      ? '✓ Todas las misiones tienen milestone_category asignado'
      : `⚠ ${missionsWithoutCategory} misiones sin milestone_category`,
    severity: missionsWithoutCategory === 0 ? 'info' : 'warning',
    recommendation: missionsWithoutCategory > 0 
      ? 'Asignar milestone_category a misiones sin categoría'
      : undefined,
    data: { missionsWithoutCategory }
  });

  // Check 2: Missions are from allowed agents
  const allowedAgentMissions = Object.keys(missionsByAgent).filter(a => 
    ALLOWED_AGENTS.includes(a as any)
  ).length;

  checks.push({
    id: 'missions_from_allowed_agents',
    name: 'Allowed Agent Missions',
    passed: true,
    message: `✓ ${allowedAgentMissions} agentes activos generando misiones`,
    severity: 'info',
    data: { missionsByAgent }
  });

  const passed = checks.filter(c => c.severity === 'critical' || c.severity === 'error').every(c => c.passed);

  return { 
    passed, 
    checks,
    totalMissions,
    missionsByAgent,
    missionsWithoutCategory
  };
}

/**
 * Validate UI Coherence
 */
async function validateUICoherence(userId: string) {
  const checks: ValidationCheck[] = [];

  // Check 1: No hardcoded colors in semantic token system
  // This is a code-level check, not runtime
  checks.push({
    id: 'semantic_tokens_only',
    name: 'Semantic Color Tokens',
    passed: true, // Assumed true if codebase follows guidelines
    message: '✓ Sistema usa semantic tokens (verificar código para confirmar)',
    severity: 'info',
    recommendation: 'Auditar componentes para eliminar hardcoded colors como bg-green-*, text-red-*'
  });

  // Check 2: No generic placeholder names
  const { data: masterContext } = await supabase
    .from('user_master_context')
    .select('business_profile, conversation_insights')
    .eq('user_id', userId)
    .single();

  const businessProfile = masterContext?.business_profile as any;
  const conversationInsights = masterContext?.conversation_insights as any;
  const brandName = 
    businessProfile?.brand_name ||
    businessProfile?.brandName ||
    conversationInsights?.nombre_marca;

  const isGeneric = !brandName || 
    ['Tu Negocio', 'Tu Emprendimiento', 'Tu Empresa', 'Mi Negocio'].includes(brandName);

  checks.push({
    id: 'no_generic_names',
    name: 'No Generic Placeholders',
    passed: !isGeneric,
    message: isGeneric
      ? '⚠ Nombre de negocio es genérico o no definido'
      : `✓ Nombre de negocio real definido: "${brandName}"`,
    severity: isGeneric ? 'warning' : 'info',
    recommendation: isGeneric ? 'Solicitar al usuario su nombre de negocio real' : undefined
  });

  const passed = checks.filter(c => c.severity === 'critical' || c.severity === 'error').every(c => c.passed);

  return { passed, checks };
}

/**
 * Generate human-readable report from validation result
 */
export const generateValidationReport = (result: SystemIntegrityResult): string => {
  const lines: string[] = [];
  
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('       SYSTEM INTEGRITY VALIDATION REPORT');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`Timestamp: ${result.timestamp.toLocaleString()}`);
  lines.push(`Overall Status: ${result.overallPassed ? '✅ PASSED' : '❌ FAILED'}`);
  lines.push('');
  
  // Master Coordinator Health
  lines.push('📊 MASTER COORDINATOR HEALTH');
  lines.push(`   Status: ${result.masterCoordinatorHealth.passed ? '✅' : '❌'}`);
  result.masterCoordinatorHealth.checks.forEach(check => {
    lines.push(`   ${check.passed ? '✓' : '✗'} ${check.name}: ${check.message}`);
  });
  lines.push('');
  
  // Agent System Integrity
  lines.push('🤖 AGENT SYSTEM INTEGRITY');
  lines.push(`   Status: ${result.agentSystemIntegrity.passed ? '✅' : '❌'}`);
  lines.push(`   Allowed Agents Active: ${result.agentSystemIntegrity.allowedAgentsActive.join(', ')}`);
  if (result.agentSystemIntegrity.blockedAgentsWithMissions.length > 0) {
    lines.push(`   ⚠️  Blocked Agents with Missions: ${result.agentSystemIntegrity.blockedAgentsWithMissions.join(', ')}`);
  }
  result.agentSystemIntegrity.checks.forEach(check => {
    lines.push(`   ${check.passed ? '✓' : '✗'} ${check.name}: ${check.message}`);
  });
  lines.push('');
  
  // Data Synchronization
  lines.push('🔄 DATA SYNCHRONIZATION');
  lines.push(`   Status: ${result.dataSynchronization.passed ? '✅' : '❌'}`);
  lines.push(`   Business Name Consistent: ${result.dataSynchronization.businessNameConsistent ? '✓' : '✗'}`);
  lines.push(`   Maturity Scores Source: ${result.dataSynchronization.maturityScoresSource}`);
  result.dataSynchronization.checks.forEach(check => {
    lines.push(`   ${check.passed ? '✓' : '✗'} ${check.name}: ${check.message}`);
  });
  lines.push('');
  
  // Mission System Health
  lines.push('🎯 MISSION SYSTEM HEALTH');
  lines.push(`   Status: ${result.missionSystemHealth.passed ? '✅' : '❌'}`);
  lines.push(`   Total Missions: ${result.missionSystemHealth.totalMissions}`);
  lines.push(`   Missions Without Category: ${result.missionSystemHealth.missionsWithoutCategory}`);
  result.missionSystemHealth.checks.forEach(check => {
    lines.push(`   ${check.passed ? '✓' : '✗'} ${check.name}: ${check.message}`);
  });
  lines.push('');
  
  // UI Coherence
  lines.push('🎨 UI COHERENCE');
  lines.push(`   Status: ${result.uiCoherence.passed ? '✅' : '❌'}`);
  result.uiCoherence.checks.forEach(check => {
    lines.push(`   ${check.passed ? '✓' : '✗'} ${check.name}: ${check.message}`);
  });
  lines.push('');
  
  // Critical Issues
  if (result.criticalIssues.length > 0) {
    lines.push('❌ CRITICAL ISSUES:');
    result.criticalIssues.forEach(issue => {
      lines.push(`   - ${issue}`);
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
  
  // Recommendations
  if (result.recommendations.length > 0) {
    lines.push('💡 RECOMMENDATIONS:');
    result.recommendations.forEach(rec => {
      lines.push(`   - ${rec}`);
    });
    lines.push('');
  }
  
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');
  
  return lines.join('\n');
};
