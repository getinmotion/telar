# 📱 Guía de Actualización Frontend - Fase 1

## 🎯 Objetivo
Migrar las 3 funciones clave de `useFusedMaturityAgent.ts` para usar los endpoints de NestJS en lugar de Supabase directo.

---

## **FUNCIONES A ACTUALIZAR**

### ✅ Endpoint Disponible
| Función | Endpoint NestJS | Estado |
|---------|----------------|--------|
| `saveProgressToDBWithRetry()` | `POST /telar/server/user-master-context` | ✅ Disponible |
| `loadHybridProgress()` | `GET /telar/server/master-coordinator-context/user/{userId}` | ✅ Disponible |
| `completeAssessment()` | `POST /telar/server/maturity/complete-onboarding` | ⚠️ **FALTA CREAR** |

---

## **1. Actualizar `saveProgressToDBWithRetry()`**

### **Código Actual (Supabase)**

```typescript
// Línea 30-69 de useFusedMaturityAgent.ts
const saveProgressToDBWithRetry = async (
  userId: string,
  progressData: any,
  maxRetries = 3
): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { error } = await supabase
        .from('user_master_context')
        .upsert({
          user_id: userId,
          task_generation_context: {
            maturity_test_progress: progressData
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      if (attempt === maxRetries) {
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return false;
};
```

### **Código Nuevo (NestJS)**

```typescript
// Importar el servicio de API
import { maturityApi } from '@/services/maturityApi';

const saveProgressToDBWithRetry = async (
  userId: string,
  progressData: any,
  maxRetries = 3
): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Usar el endpoint de NestJS
      await maturityApi.createOrUpdateUserMasterContext({
        userId,
        taskGenerationContext: {
          maturity_test_progress: progressData
        },
        languagePreference: 'es',
        contextVersion: 1,
      });
      
      return true;
    } catch (error) {
      if (attempt === maxRetries) {
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return false;
};
```

**Cambios:**
- ✅ Reemplazar `supabase.from('user_master_context').upsert()` con `maturityApi.createOrUpdateUserMasterContext()`
- ✅ Adaptar estructura de datos al formato esperado por el endpoint
- ✅ Añadir `languagePreference` y `contextVersion`

---

## **2. Actualizar `loadHybridProgress()`**

### **Código Actual (Supabase) - Fragmento Relevante**

```typescript
// Línea 356-404 de useFusedMaturityAgent.ts (aproximado)
try {
  const { data: dbData, error } = await supabase
    .from('user_master_context')
    .select('task_generation_context')
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (error) {
    throw error;
  }
  
  if (dbData?.task_generation_context?.maturity_test_progress) {
    const dbProgress = dbData.task_generation_context.maturity_test_progress;
    
    // Restaurar estado desde BD
    setCurrentBlockIndex(dbProgress.current_block || 0);
    setAnsweredQuestionIds(new Set(dbProgress.answered_question_ids || []));
    setProfileData(dbProgress.profile_data || {});
    // ... más código
  }
} catch (error) {
  console.error('❌ [DB] Error loading from database:', error);
}
```

### **Código Nuevo (NestJS)**

```typescript
// Línea 356-404 de useFusedMaturityAgent.ts (actualizado)
try {
  // Usar el endpoint de NestJS
  const dbData = await maturityApi.getUserMasterContext(user.id);
  
  if (dbData?.taskGenerationContext?.maturity_test_progress) {
    const dbProgress = dbData.taskGenerationContext.maturity_test_progress;
    
    // Restaurar estado desde BD
    setCurrentBlockIndex(dbProgress.current_block || 0);
    setAnsweredQuestionIds(new Set(dbProgress.answered_question_ids || []));
    
    // ⚠️ IMPORTANTE: businessProfile está en la raíz de dbData
    if (dbData.businessProfile) {
      setProfileData(dbData.businessProfile);
    }
    
    // ... más código
  }
} catch (error) {
  console.error('❌ [DB] Error loading from database:', error);
}
```

**Cambios:**
- ✅ Reemplazar `supabase.from('user_master_context').select()` con `maturityApi.getUserMasterContext(userId)`
- ✅ Adaptar acceso a propiedades: `task_generation_context` → `taskGenerationContext` (camelCase)
- ✅ El endpoint retorna `null` si no existe (no lanza error 404), así que manejar apropiadamente

---

## **3. Actualizar `completeAssessment()` - Onboarding Mode**

### **Código Actual (Supabase) - Fragmento de Onboarding**

```typescript
// Línea 1925-2049 de useFusedMaturityAgent.ts
if (isOnboardingComplete) {
  try {
    setIsCompleted(true);
    
    // Guardar en user_profiles
    await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        brand_name: profileData.brandName,
        business_description: profileData.businessDescription,
        business_type: 'creative',
        business_location: profileData.businessLocation,
      });
    
    // Guardar en user_master_context
    await supabase
      .from('user_master_context')
      .upsert({
        user_id: user.id,
        business_profile: profileData,
        task_generation_context: {
          maturity_test_progress: {
            total_answered: 3,
            is_complete: true,
            completed_at: new Date().toISOString(),
          }
        },
      });
    
    // Crear user_progress
    await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        experience_points: 0,
        level: 1,
      });
    
    // Calcular camino artesanal
    // ... más código de cálculo de progreso inicial
    
    // Llamar onComplete
    onComplete(placeholderScores, { primary: [], secondary: [] }, profileData);
    
    toast.success('🎉 ¡Onboarding completado!');
    setIsProcessing(false);
    return;
  } catch (error) {
    console.error('❌ [ONBOARDING-COMPLETE] Error:', error);
    toast.error('Error al completar onboarding');
    setIsProcessing(false);
    return;
  }
}
```

### **Código Nuevo (NestJS)** ⚠️

```typescript
// Línea 1925-2049 de useFusedMaturityAgent.ts (actualizado)
if (isOnboardingComplete) {
  try {
    setIsCompleted(true);
    
    // ✅ USAR ENDPOINT ÚNICO DE NESTJS (cuando esté disponible)
    const result = await maturityApi.completeOnboarding({
      profileData: {
        businessDescription: profileData.businessDescription,
        brandName: profileData.brandName,
        craftType: profileData.craftType,
        businessLocation: profileData.businessLocation,
        salesStatus: profileData.salesStatus,
        targetCustomer: profileData.targetCustomer,
      },
      answeredQuestionIds: Array.from(answeredQuestionIds),
      conversationInsights: {
        nombre_marca: profileData.brandName,
        tipo_artesania: profileData.craftType,
        ubicacion: profileData.businessLocation,
        ha_vendido: profileData.salesStatus !== 'not_yet',
        frecuencia_ventas: profileData.salesStatus,
        cliente_ideal: profileData.targetCustomer,
      },
    });
    
    if (!result.success) {
      throw new Error(result.message || 'Error al completar onboarding');
    }
    
    // El endpoint ya creó:
    // - user_profiles ✅
    // - user_progress ✅
    // - user_master_context (actualizado) ✅
    
    // Llamar onComplete
    const placeholderScores = {
      ideaValidation: 0,
      userExperience: 0,
      marketFit: 0,
      monetization: 0,
    };
    
    onComplete(placeholderScores, { primary: [], secondary: [] }, profileData);
    
    toast.success('🎉 ¡Onboarding completado!');
    setIsProcessing(false);
    return;
  } catch (error) {
    console.error('❌ [ONBOARDING-COMPLETE] Error:', error);
    toast.error('Error al completar onboarding');
    setIsProcessing(false);
    return;
  }
}
```

**Cambios:**
- ✅ Reemplazar 3 operaciones de Supabase con 1 endpoint de NestJS
- ✅ El endpoint maneja toda la lógica: crear `user_profiles`, `user_progress`, actualizar `user_master_context`
- ✅ Simplifica el código y reduce errores
- ⚠️ **NOTA:** Este endpoint aún no existe, debe crearse en el backend

---

## **4. Actualizar `IntelligentConversationFlow.tsx`**

### **Ubicación del Cambio**

Buscar la función que llama al edge function `extract-business-info`.

### **Código Actual (Edge Function)**

```typescript
// IntelligentConversationFlow.tsx (aproximadamente línea 200-250)
const response = await supabase.functions.invoke('extract-business-info', {
  body: {
    userText: userAnswer,
    language: language,
    fieldsToExtract: ['brandName', 'craftType', 'location'],
  },
});

if (response.error) {
  throw response.error;
}

const extracted = response.data;
```

### **Código Nuevo (NestJS)**

```typescript
// IntelligentConversationFlow.tsx (actualizado)
import { maturityApi } from '@/services/maturityApi';

// ...

const response = await maturityApi.extractBusinessInfo({
  userText: userAnswer,
  language: language,
  fieldsToExtract: ['brand_name', 'craft_type', 'business_location', 'unique_value'],
});

if (!response.success) {
  throw new Error('Error al extraer información');
}

const extracted = response.data;

// Adaptar nombres de campos (camelCase)
const adaptedData = {
  brandName: extracted.brand_name,
  craftType: extracted.craft_type,
  businessLocation: extracted.business_location,
  uniqueValue: extracted.unique_value,
  confidence: extracted.confidence,
};
```

**Cambios:**
- ✅ Reemplazar `supabase.functions.invoke('extract-business-info')` con `maturityApi.extractBusinessInfo()`
- ✅ Ajustar `fieldsToExtract` al formato snake_case esperado por el endpoint
- ✅ Adaptar respuesta a camelCase para consistencia en el frontend

---

## **5. Actualizar `MaturityCalculator.tsx`**

### **Ubicación del Cambio**

Función `handleComplete()` donde se llama a crear `user_progress`.

### **Código Actual (Supabase)**

```typescript
// MaturityCalculator.tsx (aproximadamente línea 80-120)
const handleComplete = async (
  scores: CategoryScore,
  recommendedAgents: RecommendedAgents,
  profileData: UserProfileData
) => {
  if (!user) return;

  // Crear user_progress si no existe
  const { data: existingProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existingProgress) {
    await supabase
      .from('user_progress')
      .insert({
        user_id: user.id,
        experience_points: 0,
        level: 1,
        completed_missions: 0,
        next_level_xp: 100,
      });
  }

  // ... más código
};
```

### **Código Nuevo (NestJS)**

```typescript
// MaturityCalculator.tsx (actualizado)
import { maturityApi } from '@/services/maturityApi';

const handleComplete = async (
  scores: CategoryScore,
  recommendedAgents: RecommendedAgents,
  profileData: UserProfileData
) => {
  if (!user) return;

  // ✅ Usar endpoint de NestJS (cuando esté disponible)
  try {
    await maturityApi.initUserProgress(user.id);
  } catch (error) {
    // Si ya existe, el endpoint retornará success: false
    // pero no es un error crítico
  }

  // ... más código
};
```

**Cambios:**
- ✅ Reemplazar `supabase.from('user_progress').insert()` con `maturityApi.initUserProgress(userId)`
- ✅ El endpoint maneja la verificación de existencia internamente
- ⚠️ **NOTA:** Este endpoint aún no existe, debe crearse en el backend

---

## **📋 CHECKLIST DE MIGRACIÓN - FASE 1**

### **Backend - Endpoints Faltantes**
```
□ Crear POST /telar/server/maturity/complete-onboarding
  □ MaturityController
  □ MaturityService
  □ CompleteOnboardingDto
  □ Lógica para crear user_profiles, user_progress, actualizar user_master_context
  
□ Crear POST /telar/server/user-progress
  □ UserProgressController
  □ UserProgressService
  □ CreateUserProgressDto
  
□ Probar endpoints con Postman/curl
□ Verificar datos en BD después de llamar endpoints
```

### **Frontend - Actualizaciones**
```
□ Crear src/services/maturityApi.ts ✅ (ya creado)

□ Actualizar src/components/cultural/hooks/useFusedMaturityAgent.ts
  □ Importar maturityApi
  □ Actualizar saveProgressToDBWithRetry() (línea 30)
  □ Actualizar loadHybridProgress() (línea 174)
  □ Actualizar completeAssessment() (línea 1890)
  
□ Actualizar src/components/cultural/conversational/components/IntelligentConversationFlow.tsx
  □ Importar maturityApi
  □ Reemplazar supabase.functions.invoke('extract-business-info')
  □ Adaptar respuesta a camelCase
  
□ Actualizar src/pages/MaturityCalculator.tsx
  □ Importar maturityApi
  □ Reemplazar lógica de crear user_progress
  
□ Probar flujo completo:
  □ Login
  □ Responder 3 preguntas
  □ Verificar extracción de IA
  □ Completar onboarding
  □ Redirección al dashboard
  □ Verificar datos en authStore (Zustand)
```

### **Testing**
```
□ Test 1: Extracción de IA (Q1)
  - Ingresar descripción de negocio
  - Verificar que se extraiga brand_name, craft_type, business_location
  - Confirmar datos extraídos
  
□ Test 2: Guardar progreso (Q1, Q2)
  - Responder Q1 y Q2
  - Refrescar página
  - Verificar que progreso se restaure correctamente
  
□ Test 3: Completar onboarding (Q3)
  - Responder las 3 preguntas
  - Verificar que se cree user_profiles
  - Verificar que se cree user_progress
  - Verificar que se actualice user_master_context
  - Verificar redirección al dashboard
  
□ Test 4: Verificar datos en BD
  - Consultar user_profiles (brandName, businessDescription)
  - Consultar user_progress (level: 1, xp: 0)
  - Consultar user_master_context (business_profile, task_generation_context)
```

---

## **⚡ ORDEN DE IMPLEMENTACIÓN RECOMENDADO**

### **Día 1: Backend**
1. ✅ Crear `POST /telar/server/user-progress` (30 min)
2. ✅ Crear `POST /telar/server/maturity/complete-onboarding` (2 horas)
3. ✅ Testing manual con Postman (30 min)

### **Día 2: Frontend**
4. ✅ Actualizar `saveProgressToDBWithRetry()` (15 min)
5. ✅ Actualizar `loadHybridProgress()` (15 min)
6. ✅ Actualizar `IntelligentConversationFlow.tsx` (30 min)
7. ✅ Actualizar `MaturityCalculator.tsx` (15 min)
8. ✅ Actualizar `completeAssessment()` (30 min)

### **Día 3: Testing**
9. ✅ Probar flujo completo (1 hora)
10. ✅ Verificar datos en BD (30 min)
11. ✅ Fix de bugs (1 hora)

---

## **🔥 ARCHIVOS CLAVE**

| Archivo | Líneas a cambiar | Prioridad |
|---------|------------------|-----------|
| `src/services/maturityApi.ts` | - | ✅ Creado |
| `src/components/cultural/hooks/useFusedMaturityAgent.ts` | 30-69, 174-404, 1890-2049 | 🔴 Alta |
| `src/components/cultural/conversational/components/IntelligentConversationFlow.tsx` | ~200-250 | 🔴 Alta |
| `src/pages/MaturityCalculator.tsx` | ~80-120 | 🟡 Media |
| `backend/src/maturity/` | - | 🔴 **Crear módulo** |
| `backend/src/user-progress/` | - | 🔴 **Crear módulo** |

---

## **📚 Referencias**

- Endpoints disponibles:
  - ✅ `POST /telar/server/ai/extract-business-info`
  - ✅ `POST /telar/server/user-master-context`
  - ✅ `GET /telar/server/master-coordinator-context/user/{userId}`

- Endpoints faltantes:
  - ⚠️ `POST /telar/server/maturity/complete-onboarding`
  - ⚠️ `POST /telar/server/user-progress`

- Servicio creado:
  - ✅ `src/services/maturityApi.ts`

- Documentación backend:
  - 📄 `backend/ENDPOINTS_FALTANTES_FASE1.md`
