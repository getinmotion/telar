# Dashboard Deprecated Components

Este directorio contiene componentes de dashboard antiguos que han sido reemplazados por versiones más modernas y mejor integradas.

## UnifiedDashboard.tsx (DEPRECADO)

**Reemplazado por:** `NewMasterCoordinatorDashboard` en `/components/coordinator/`

**Razones de la deprecación:**
1. **Falta de integración con Master Agent**: No usa el contexto unificado de `MasterAgentContext`
2. **Sin orquestación de IA**: No tiene integración con `useMasterOrchestrator` para validación inteligente
3. **Diseño desactualizado**: UI no alineada con la Fase 2.2 del proyecto
4. **Componentes desconectados**: Cada sección (tienda, productos, misiones) funciona independientemente sin coordinación central
5. **Sin chat integrado**: No tiene el `CoordinatorChatSidebar` para interacción directa
6. **Generación manual de tareas**: No usa IA para personalizar tareas según el contexto del usuario

**Funcionalidad moderna equivalente en `NewMasterCoordinatorDashboard`:**
- ✅ Integración completa con `MasterAgentContext`
- ✅ Validación de tareas con IA usando `useMasterOrchestrator`
- ✅ Chat lateral del coordinador siempre accesible
- ✅ Generación automática de entregables con IA
- ✅ Sistema de recompensas y logros integrado
- ✅ Análisis contextual inteligente del progreso
- ✅ Banner de re-onboarding automático
- ✅ Tracking completo de analytics en todas las acciones
- ✅ Diseño moderno y responsive con framer-motion

**Mantenimiento:**
- NO usar este componente para nuevas funcionalidades
- Si necesitas extraer alguna funcionalidad específica, hacerlo con cuidado
- Considerar eliminar completamente en futuras versiones cuando se confirme que no se necesita nada

**Última actualización:** 2025
