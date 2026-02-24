# 📋 ANÁLISIS DE MIGRACIÓN: USER_MASTER_CONTEXT

**Fecha:** 2026-01-25  
**Estado:** En progreso  

---

## 🎯 **SERVICIOS CREADOS**

### **✅ `src/services/userMasterContext.actions.ts`**

Servicio centralizado con 5 funciones:

1. **`getUserMasterContextByUserId(userId)`** - GET
   - Endpoint: `/telar/server/user-master-context/user/:userId`
   - Retorna: `UserMasterContext | null`

2. **`hasUserMasterContext(userId)`** - Verificación
   - Retorna: `boolean`

3. **`updateUserMasterContext(userId, payload)`** - PATCH
   - Endpoint: `/telar/server/user-master-context/user/:userId`
   - Payload: `UpdateUserMasterContextPayload`

4. **`createUserMasterContext(payload)`** - POST
   - Endpoint: `/telar/server/user-master-context`
   - Payload: `CreateUserMasterContextPayload`

5. **`upsertUserMasterContext(userId, payload)`** - UPSERT Helper
   - Combina hasUserMasterContext + create/update

### **✅ `src/types/userMasterContext.types.ts`**

Tipos TypeScript completos para:
- `UserMasterContext` (entidad principal)
- `BusinessContext`, `Preferences`, `ConversationInsights`
- `TechnicalDetails`, `GoalsAndObjectives`, `BusinessProfile`
- `TaskGenerationContext`
- `CreateUserMasterContextPayload`, `UpdateUserMasterContextPayload`
- Tipos de respuesta y error

---

## 📊 **ARCHIVOS DETECTADOS (46 archivos)**

### **🔴 ALTA PRIORIDAD - Flujo Principal (8 archivos)**

#### **1. ✅ `src/components/cultural/hooks/useFusedMaturityAgent.ts`** - MIGRADO
- **2 operaciones migradas:**
  - ✅ UPSERT en `saveProgressToDBWithRetry()` → `upsertUserMasterContext()`
  - ✅ UPDATE en migración de datos → `upsertUserMasterContext()`
- **Uso:** Guardar progreso del Maturity Calculator

#### **2. 🔄 `src/hooks/user/useUnifiedUserData.ts`**
- **3 operaciones detectadas:**
  - SELECT: Cargar contexto en `fetchFromDatabase()`
  - SELECT: Obtener contexto existente antes de merge
  - UPSERT: Actualizar contexto con merge de datos
- **Uso:** Hook principal de datos de usuario
- **Prioridad:** 🔴 CRÍTICA

#### **3. 🔄 `src/context/MasterAgentContext.tsx`**
- **2 operaciones detectadas:**
  - SELECT: Cargar business_context para Growth Agent
  - SELECT: Leer task_generation_context para maturity scores
- **Uso:** Contexto global del sistema de agentes
- **Prioridad:** 🔴 CRÍTICA

#### **4. 🔄 `src/components/cultural/FusedMaturityCalculator.tsx`**
- **3 operaciones detectadas:**
  - SELECT: Verificar contexto existente
  - UPDATE: Actualizar business_profile
  - INSERT: Crear nuevo contexto
- **Uso:** Calculadora de madurez (guardar resultados)
- **Prioridad:** 🔴 CRÍTICA

#### **5. 🔄 `src/hooks/useFixedTasksManager.ts`**
- **1 operación detectada:**
  - SELECT: Leer task_generation_context
- **Uso:** Gestor de tareas fijas
- **Prioridad:** 🟡 MEDIA

#### **6. 🔄 `src/pages/DebugArtisanPage.tsx`**
- **1 operación detectada:**
  - SELECT: Cargar datos para página de debug
- **Uso:** Herramienta de debug
- **Prioridad:** 🟢 BAJA (debug)

#### **7. 🔄 `src/hooks/useDebugArtisanData.ts`**
- **2 operaciones detectadas:**
  - UPDATE: Resetear contexto en función de reset
  - INSERT: Crear contexto si no existe al resetear
- **Uso:** Datos para debug
- **Prioridad:** 🟢 BAJA (debug)

#### **8. 🔄 `src/components/cultural/conversational/components/IntelligentConversationFlow.tsx`**
- **2 operaciones detectadas:**
  - SELECT: Obtener contexto existente
  - UPSERT: Actualizar conversation_insights y business_profile
- **Uso:** Flujo conversacional inteligente
- **Prioridad:** 🟡 MEDIA

---

### **🟡 MEDIA PRIORIDAD - Utilidades y Validación (6 archivos)**

#### **9. 🔄 `src/utils/dataRepair.ts`**
- **2 operaciones detectadas:**
  - SELECT: Verificar contexto actual
  - UPSERT: Actualizar con datos reparados
- **Uso:** Reparación de datos inconsistentes
- **Prioridad:** 🟡 MEDIA

#### **10. 🔄 `src/utils/systemIntegrityValidator.ts`**
- **3 operaciones detectadas:**
  - SELECT: Validar estructura de contexto
  - SELECT: Verificar sincronización con shop
  - SELECT: Verificar placeholders genéricos
- **Uso:** Validación de integridad del sistema
- **Prioridad:** 🟡 MEDIA

#### **11. 🔄 `src/utils/syncBrandToShop.ts`**
- **1 operación detectada:**
  - SELECT: Obtener business_context y conversation_insights
- **Uso:** Sincronización de marca a tienda
- **Prioridad:** 🟡 MEDIA

#### **12. 🔄 `src/utils/validateBrandSync.ts`**
- **1 operación detectada:**
  - SELECT: Verificar datos de marca
- **Uso:** Validación de sincronización de marca
- **Prioridad:** 🟡 MEDIA

#### **13. 🔄 `src/utils/userProgress.ts`**
- **1 operación detectada:**
  - SELECT: Verificar progreso parcial
- **Uso:** Gestión de progreso de usuario
- **Prioridad:** 🟡 MEDIA

#### **14. 🔄 `src/utils/dataMigration.ts`**
- **2 operaciones detectadas:**
  - SELECT: Verificar si contexto existe
  - INSERT: Crear contexto básico
- **Uso:** Migración de datos
- **Prioridad:** 🟡 MEDIA

---

### **🟢 BAJA PRIORIDAD - Brand & UI Components (8 archivos)**

#### **15-20. 🔄 Componentes de Marca**
- `src/components/brand/LogoEditModal.tsx` (SELECT + UPDATE)
- `src/components/brand/IntelligentBrandWizard.tsx` (3x SELECT)
- `src/components/brand/ColorPaletteModal.tsx`
- `src/components/brand/ClaimEditorModal.tsx`
- `src/components/modals/BusinessPlanModal.tsx`
- `src/components/modals/SocialMediaPlannerModal.tsx`

#### **21-24. 🔄 Componentes de Tareas**
- `src/components/tasks/IntelligentTaskInterface.tsx`
- `src/components/tasks/PreTaskContextValidator.tsx`
- `src/components/tasks/QuestionCollector.tsx`
- `src/components/tasks/StepSpecificModals/BrandIdentityModal.tsx`
- `src/components/tasks/StepSpecificModals/ContentPlannerModal.tsx`
- `src/components/tasks/StepSpecificModals/MarketResearchModal.tsx`

---

### **⚫ MUY BAJA - Edge Functions y Hooks Legacy (24 archivos)**

#### **25-48. 🔄 Supabase Edge Functions y otros**
- 10 Supabase Edge Functions (generación de tareas, shops, etc.)
- Hooks de sistema (`useUserMode.ts`, `useDataIntegrityCheck.ts`, etc.)
- Páginas secundarias (`EnhancedProfile.tsx`)

**Nota:** Edge Functions no requieren migración inmediata ya que se ejecutan en Supabase backend.

---

## 📈 **ESTADÍSTICAS**

| Categoría | Archivos | % | Estado |
|-----------|----------|---|--------|
| **Alta Prioridad** | 8 | 17% | 1/8 migrado (13%) |
| **Media Prioridad** | 6 | 13% | 0/6 migrado (0%) |
| **Baja Prioridad** | 8 | 17% | 0/8 migrado (0%) |
| **Muy Baja (Edge/Legacy)** | 24 | 52% | No crítico |
| **TOTAL** | 46 | 100% | 1/22 (5%) |

**Archivos críticos para migrar:** 22 (Alta + Media + Baja)  
**Archivos migrados:** 1  
**Progreso:** 5%

---

## 🎯 **PLAN DE MIGRACIÓN RECOMENDADO**

### **Fase 1: Críticos (8 archivos) - PRIORIDAD MÁXIMA** 🔴

1. ✅ `useFusedMaturityAgent.ts` - COMPLETADO
2. 🔄 `useUnifiedUserData.ts` - 3 operaciones
3. 🔄 `MasterAgentContext.tsx` - 2 operaciones
4. 🔄 `FusedMaturityCalculator.tsx` - 3 operaciones
5. 🔄 `useFixedTasksManager.ts` - 1 operación
6. 🔄 `IntelligentConversationFlow.tsx` - 2 operaciones
7. 🔄 `useDebugArtisanData.ts` - 2 operaciones (debug)
8. 🔄 `DebugArtisanPage.tsx` - 1 operación (debug)

**Total operaciones Fase 1:** ~16 operaciones

### **Fase 2: Utilidades (6 archivos) - IMPORTANTE** 🟡

9-14. Archivos de utils (dataRepair, systemIntegrity, sync, etc.)

**Total operaciones Fase 2:** ~10 operaciones

### **Fase 3: UI Components (8 archivos) - OPCIONAL** 🟢

15-22. Componentes de brand, modals, tasks

**Total operaciones Fase 3:** ~15 operaciones

### **Fase 4: Edge Functions (24 archivos) - FUTURO** ⚫

23-46. Edge functions y hooks legacy (No urgente)

---

## 🔧 **OPERACIONES DETECTADAS**

### **Por Tipo:**

| Operación | Cantidad | Estado |
|-----------|----------|--------|
| **SELECT** | ~30 | 0 migradas |
| **UPDATE** | ~8 | 1 migrada |
| **INSERT** | ~5 | 0 migradas |
| **UPSERT** | ~8 | 1 migrada |
| **TOTAL** | ~51 | 2 migradas (4%) |

---

## 📋 **PATRONES DE MIGRACIÓN**

### **✅ SELECT (Lectura):**
```typescript
// ANTES
const { data, error } = await supabase
  .from('user_master_context')
  .select('*')
  .eq('user_id', userId)
  .single();

// DESPUÉS ✅
const context = await getUserMasterContextByUserId(userId);
```

### **✅ UPDATE (Actualización):**
```typescript
// ANTES
const { error } = await supabase
  .from('user_master_context')
  .update({ business_context: newContext })
  .eq('user_id', userId);

// DESPUÉS ✅
await updateUserMasterContext(userId, {
  businessContext: newContext
});
```

### **✅ INSERT (Creación):**
```typescript
// ANTES
const { error } = await supabase
  .from('user_master_context')
  .insert({
    user_id: userId,
    business_context: {}
  });

// DESPUÉS ✅
await createUserMasterContext({
  userId,
  businessContext: {}
});
```

### **✅ UPSERT (Crear o Actualizar):**
```typescript
// ANTES
const { error } = await supabase
  .from('user_master_context')
  .upsert({
    user_id: userId,
    task_generation_context: context
  }, { onConflict: 'user_id' });

// DESPUÉS ✅
await upsertUserMasterContext(userId, {
  taskGenerationContext: context
});
```

---

## 🔑 **MAPEO DE CAMPOS (snake_case → camelCase)**

| Base de Datos (snake_case) | TypeScript (camelCase) |
|----------------------------|------------------------|
| `user_id` | `userId` |
| `business_context` | `businessContext` |
| `conversation_insights` | `conversationInsights` |
| `technical_details` | `technicalDetails` |
| `goals_and_objectives` | `goalsAndObjectives` |
| `context_version` | `contextVersion` |
| `last_updated` | `lastUpdated` |
| `created_at` | `createdAt` |
| `business_profile` | `businessProfile` |
| `task_generation_context` | `taskGenerationContext` |
| `language_preference` | `languagePreference` |
| `last_assessment_date` | `lastAssessmentDate` |

---

## ✅ **PRÓXIMOS PASOS**

### **INMEDIATOS:**
1. ✅ Servicios creados
2. ✅ Tipos TypeScript creados
3. ✅ `useFusedMaturityAgent.ts` migrado
4. 🔄 Migrar `useUnifiedUserData.ts` (3 operaciones)
5. 🔄 Migrar `MasterAgentContext.tsx` (2 operaciones)
6. 🔄 Migrar `FusedMaturityCalculator.tsx` (3 operaciones)

### **VALIDACIÓN:**
- Verificar que el endpoint GET funciona correctamente
- Verificar que el endpoint PATCH funciona correctamente
- Verificar que el endpoint POST funciona correctamente
- Probar flujo completo del Maturity Calculator

---

**Estado:** 1/22 archivos migrados (5%)  
**Siguiente:** `useUnifiedUserData.ts` (3 operaciones críticas)
