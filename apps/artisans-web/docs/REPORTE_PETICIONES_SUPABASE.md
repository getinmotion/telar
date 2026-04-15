# 📊 Reporte de Peticiones a Supabase Pendientes

**Fecha:** 2026-01-27  
**Total de archivos con peticiones:** 114

---

## 🎯 Resumen Ejecutivo

### Archivos Críticos en Dashboard (Ya Migrados Parcialmente)
- ✅ `src/components/coordinator/NewMasterCoordinatorDashboard.tsx` - 1 petición pendiente
  - Línea 559: `supabase.functions.invoke('update-user-progress')` - Edge Function

### Categorías de Archivos

#### 📁 Componentes (`src/components/`)
- **Coordinator:** 2 archivos
- **Shop:** 13 archivos
- **Cultural:** 10 archivos
- **Tasks:** 5 archivos
- **Admin:** 8 archivos
- **Brand:** 4 archivos
- **Moderation:** 3 archivos
- **Dashboard:** 2 archivos

#### 🪝 Hooks (`src/hooks/`)
- **Core Hooks:** 32 archivos
- **Language Hooks:** 1 archivo
- **User Hooks:** 1 archivo

#### 📄 Pages (`src/pages/`)
- **Admin Pages:** 2 archivos
- **Public Pages:** 3 archivos
- **Other Pages:** 1 archivo

#### 🔧 Services & Utils
- **Services:** 1 archivo
- **Utils:** 2 archivos

#### ⚙️ Supabase Functions (`supabase/functions/`)
- **Backend Functions:** 15 archivos (no requieren migración)

---

## 🔴 Peticiones Críticas Pendientes

### 1. Dashboard Principal
**Archivo:** `src/components/coordinator/NewMasterCoordinatorDashboard.tsx`

```typescript
// Línea 559
await supabase.functions.invoke('update-user-progress', {
  body: {
    xpGained: 50,
    missionCompleted: true,
    timeSpent: 0
  }
});
```

**Acción recomendada:** Reemplazar con `updateUserProgress()` del service

---

### 2. Context Principal
**Archivo:** `src/context/MasterAgentContext.tsx`

**Peticiones encontradas:** Múltiples  
**Acción recomendada:** Auditar y migrar a endpoints NestJS

---

### 3. Hooks Críticos

#### `src/hooks/useArtisanShop.ts`
- Consultas a `artisan_shops` (ya tiene service creado)

#### `src/hooks/useMasterOrchestrator.ts`
- Consultas a `agent_tasks`
- Acción: Crear endpoint NestJS para `agent_tasks`

#### `src/hooks/useMasterCoordinator.ts`
- Múltiples consultas a varias tablas
- Acción: Auditar y migrar progresivamente

---

## 📋 Lista Completa de Archivos

### Componentes

#### Coordinator
1. `src/context/MasterAgentContext.tsx`
2. `src/components/coordinator/NewMasterCoordinatorDashboard.tsx` ✅ (8/9 migrado)
3. `src/components/coordinator/AgentRecommendations.tsx`

#### Shop
4. `src/components/shop/ConversationalShopCreation.tsx`
5. `src/components/shop/wizards/HeroSliderWizard.tsx`
6. `src/components/shop/ai-upload/steps/Step5Review.tsx`
7. `src/components/shop/HeroSlideUploader.tsx`
8. `src/components/shop/AIProductUpload.tsx`
9. `src/components/shop/wizards/artisan-profile/ArtisanProfileDashboard.tsx`
10. `src/components/shop/wizards/ArtisanProfileWizard.tsx`
11. `src/components/shop/wizards/ContactWizard.tsx`
12. `src/components/shop/wizards/AboutWizard.tsx`
13. `src/components/shop/quick-publish/QuickPublishCard.tsx`
14. `src/components/shop/batch-upload/BatchUploadInterface.tsx`
15. `src/components/shop/ai-upload/hooks/useAIRefinement.ts`

#### Cultural
16. `src/components/cultural/conversational/components/MilestoneCheckpoint.tsx`
17. `src/components/cultural/hooks/useFusedMaturityAgent.ts`
18. `src/components/cultural/conversational/hooks/useConversationalAgent.ts`
19. `src/components/cultural/conversational/components/IntelligentConversationFlow.tsx`
20. `src/components/cultural/wizard-steps/ResultsStep.tsx`
21. `src/components/cultural/wizard-steps/DynamicQuestionsStep.tsx`
22. `src/components/cultural/hooks/useMaturityCalculatorLogic.tsx`
23. `src/components/cultural/conversational/components/ConversationFlow.tsx`
24. `src/components/cultural/conversational/components/AIQuestionRenderer.tsx`
25. `src/components/cultural/MaturityCalculatorSimplified.tsx`

#### Tasks
26. `src/components/wizard/TaskWizardModal.tsx`
27. `src/components/tasks/StepSpecificModals/MarketResearchModal.tsx`
28. `src/components/tasks/StepSpecificModals/BrandIdentityModal.tsx`
29. `src/components/tasks/QuestionCollector.tsx`
30. `src/components/tasks/IntelligentTaskInterface.tsx`

#### Admin
31. `src/components/moderation/ModerationLogoEditCard.tsx`
32. `src/components/brand/LogoEditModal.tsx`
33. `src/components/brand/IntelligentBrandWizard.tsx`
34. `src/components/admin/AdminImageOptimization.tsx`
35. `src/components/admin/UserManagement.tsx`
36. `src/components/admin/UserClassificationModal.tsx`
37. `src/components/admin/SiteImageManager.tsx`
38. `src/components/admin/design-system/AdminDesignSystemFAB.tsx`
39. `src/components/admin/DataManagementPanel.tsx`
40. `src/components/admin/CreateUserForm.tsx`

#### Brand
41. `src/components/brand/ColorPaletteModal.tsx`
42. `src/components/brand/ClaimEditorModal.tsx`

#### Moderation
43. `src/components/moderation/ModerationBankDataCard.tsx`

#### Dashboard
44. `src/components/dashboard/ModernFloatingAgentChat.tsx`
45. `src/components/dashboard/MasterCoordinatorPanel.tsx`

#### UI
46. `src/components/ui/voice-input.tsx`

### Hooks

#### Core Hooks
47. `src/hooks/useArtisanShop.ts` ✅ (usa service, pero puede tener consultas legacy)
48. `src/hooks/useDebugArtisanData.ts`
49. `src/hooks/useDataRecovery.ts`
50. `src/hooks/useMasterCoordinator.ts`
51. `src/hooks/user/useUserProgress.ts`
52. `src/hooks/useMasterOrchestrator.ts`
53. `src/hooks/useOptimizedUserData.ts`
54. `src/hooks/useAdminShops.ts`
55. `src/hooks/useAdminStats.ts`
56. `src/hooks/useAutoHeroGeneration.ts`
57. `src/hooks/useAdminUsers.ts`
58. `src/hooks/useModeratorManagement.ts`
59. `src/hooks/useShopModeration.ts`
60. `src/hooks/useBankData.ts`
61. `src/hooks/useSecurityMonitoring.ts`
62. `src/hooks/usePromotions.ts`
63. `src/hooks/useUnifiedTaskRecommendations.ts`
64. `src/hooks/useStepAI.ts`
65. `src/hooks/useTaskEvolution.ts`
66. `src/hooks/useShoppingCart.ts`
67. `src/hooks/useRecommendedTasks.ts`
68. `src/hooks/useRobustDashboardData.ts`
69. `src/hooks/useRobustAIRecommendations.ts`
70. `src/hooks/useMaturityTracker.ts`
71. `src/hooks/useOptimizedRecommendedTasks.ts`
72. `src/hooks/useOptimizedMaturityScores.ts`
73. `src/hooks/useProgressiveTaskGeneration.ts`
74. `src/hooks/useArtisanClassifier.ts`
75. `src/hooks/useArtisanTaskGeneration.ts`
76. `src/hooks/useContinuousLearning.ts`
77. `src/hooks/useAIRecommendations.ts`
78. `src/hooks/useAIAssistant.ts`
79. `src/hooks/use-ai-agent.ts`
80. `src/hooks/use-ai-agent-with-tasks.ts`
81. `src/hooks/_deprecated/useTaskSteps.ts`

#### Language Hooks
82. `src/hooks/language/useLanguageSystem.ts`

### Pages

#### Admin
83. `src/pages/AdminDummyReset.tsx`
84. `src/pages/BankDataPage.tsx`

#### Public
85. `src/pages/DebugArtisanPage.tsx`
86. `src/pages/ShopConfigDashboard.tsx`
87. `src/pages/VerifyPending.tsx`

### Services & Utils

#### Services
88. `src/services/counterpatiesService.ts`

#### Utils
89. `src/utils/aiCraftTypeDetection.ts`
90. `src/lib/utils/resetUserProgress.ts`
91. `src/lib/testUtils.ts`

---

## 🎯 Plan de Acción Recomendado

### Fase 1: Componentes Críticos (Prioridad Alta)
1. ✅ `NewMasterCoordinatorDashboard.tsx` - Completar última petición
2. 🔄 `MasterAgentContext.tsx` - Auditar y migrar
3. 🔄 `useMasterCoordinator.ts` - Migrar a NestJS
4. 🔄 `useMasterOrchestrator.ts` - Migrar a NestJS

### Fase 2: Hooks de Usuario (Prioridad Media)
- Hooks relacionados con tareas y progreso
- Hooks de recomendaciones AI

### Fase 3: Componentes UI (Prioridad Baja)
- Wizards y modales
- Componentes de upload
- Componentes admin

### Fase 4: Utils y Services (Prioridad Baja)
- Utils de soporte
- Services legacy

---

## 📊 Estadísticas

- **Total de archivos:** 114
- **En `src/`:** ~91 archivos
- **En `supabase/functions/`:** ~15 archivos (backend, no requieren migración)
- **Documentación:** ~8 archivos

- **Migrados completamente:** ~7 archivos principales
- **En progreso:** 2 archivos
- **Pendientes:** ~82 archivos

---

## 🚀 Próximos Pasos

1. **Inmediato:** Agregar console.log a archivos críticos
2. **Corto plazo:** Completar migración de Dashboard y Context
3. **Mediano plazo:** Migrar hooks core
4. **Largo plazo:** Migrar componentes UI y admin

---

**Nota:** Este reporte se genera automáticamente. Para agregar console.log a archivos específicos, indique cuáles priorizar.
