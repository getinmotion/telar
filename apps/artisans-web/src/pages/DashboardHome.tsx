import React, { useEffect } from "react";
import { NewMasterCoordinatorDashboard } from "@/components/coordinator/NewMasterCoordinatorDashboard";
import { useAutoTaskCompletion } from "@/hooks/useAutoTaskCompletion";
import { useTaskReconciliation } from "@/hooks/useTaskReconciliation";

/**
 * Tu Taller Digital - Fase 2.2 Completada
 *
 * Taller Digital integrado 100% con el Coordinador Maestro que orquesta
 * todos los agentes invisibles usando IA.
 *
 * Características:
 * - Coordinador Maestro con chat lateral integrado
 * - Validación de tareas con IA
 * - Generación automática de entregables
 * - Sistema de recompensas y logros
 * - Análisis contextual inteligente
 * - Sincronización completa con MasterAgentContext
 * - Analytics tracking integrado
 */
const DashboardHome = () => {
  // 🤖 Auto-completar tareas cuando se cumplen condiciones
  useAutoTaskCompletion();

  // 🔄 Sincronización inicial de tareas con estado real (se ejecuta solo una vez)
  useTaskReconciliation();

  return <NewMasterCoordinatorDashboard />;
};

export default DashboardHome;
