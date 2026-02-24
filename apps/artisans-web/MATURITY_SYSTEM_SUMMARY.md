# 📊 **Sistema Maturity Calculator/Onboarding - Resumen Completo**

## **Archivos del Sistema** (5 archivos principales)

### **1. `MaturityCalculator.tsx` - Página Principal** 📄
- **Ubicación:** `src/pages/MaturityCalculator.tsx`
- **Líneas:** 169
- **Función:** Punto de entrada de la ruta `/maturity-calculator?mode=onboarding`

**Responsabilidades:**
- ✅ Renderiza `<FusedMaturityCalculator />`
- ✅ Maneja `onComplete()` cuando el usuario termina
- ✅ Crea `user_progress` en Supabase si no existe
- ✅ Genera misiones con `analyzeProfileAndGenerateTasks()`
- ✅ Muestra overlay "Generando misiones..."
- ✅ Redirige a `/dashboard/home` después de 2s

**Flujo:**
```
onComplete() 
→ Verifica user_progress 
→ Genera tareas 
→ Toast "🎯 ¡Misiones Creadas!" 
→ navigate('/dashboard/home')
```

**Estado Limpieza:** ✅ LIMPIO (solo 2 `console.error` críticos)

---

### **2. `FusedMaturityCalculator.tsx` - Contenedor UI** 🎨
- **Ubicación:** `src/components/cultural/FusedMaturityCalculator.tsx`
- **Líneas:** 453
- **Función:** Orquestador de toda la UI del wizard

**Responsabilidades:**
- ✅ Usa hook `useFusedMaturityAgent()` (lógica central)
- ✅ Renderiza 4 componentes principales:
  1. `MaturityTestHeader` (progreso 3/3 o 30/30)
  2. `IntelligentConversationFlow` (preguntas)
  3. `MilestoneCheckpoint` (cada 5 preguntas, NO en onboarding)
  4. `CreativeResultsDisplay` (resultados finales)
- ✅ Sincroniza con `user_master_context` y `user_profiles` al completar
- ✅ Maneja estados: `isLoadingProgress`, `showCheckpoint`, `isCompleted`

**Componentes Renderizados:**
```tsx
{isLoadingProgress && <LoadingSpinner />}
{!currentBlock && <LoadingSpinner />}
{showCheckpoint && !isOnboardingMode && <MilestoneCheckpoint />}
{isCompleted && showResults && <CreativeResultsDisplay />}
{/* Main wizard: */}
<IntelligentConversationFlow 
  block={currentBlock}
  onAnswer={answerQuestion}
  onNext={goToNextBlock}
  ...
/>
```

**Estado Limpieza:** ✅ LIMPIO (console.log removidos, solo `console.error` críticos)

---

### **3. `IntelligentConversationFlow.tsx` - UI de Preguntas** 💬
- **Ubicación:** `src/components/cultural/conversational/components/IntelligentConversationFlow.tsx`
- **Líneas:** 1025
- **Función:** Renderiza cada pregunta con animaciones

**Responsabilidades:**
- ✅ Renderiza pregunta actual usando `<QuestionRenderer />`
- ✅ **Extracción AI para Q1** (`business_description`):
  - Llama edge function `extract-business-info`
  - Extrae: `brand_name`, `craft_type`, `business_location`, `unique_value`
  - Valida frontalmente (nombres inválidos)
  - Muestra `<BusinessInfoConfirmationClean />` para confirmar
- ✅ Detecta ubicación automáticamente mientras el usuario escribe
- ✅ Muestra indicadores: "Guardando...", "Analizando con IA...", "Progreso guardado"
- ✅ Navegación: botones "Anterior" y "Siguiente"
- ✅ Validación de respuestas requeridas

**Flujo Pregunta 1 (business_description):**
```
Usuario escribe descripción (min 30 chars en onboarding)
→ Click "Siguiente"
→ handleNext() detecta Q1
→ Llama extract-business-info (Supabase Edge Function)
→ Recibe: { brand_name, craft_type, business_location, unique_value }
→ Valida frontalmente (regex para nombres inválidos)
→ Muestra <BusinessInfoConfirmationClean />
→ Usuario confirma/edita
→ Guarda en profileData
→ Sincroniza a user_profiles y user_master_context
→ Avanza a Q2
```

**Validaciones de brand_name inválido:**
```typescript
const invalidBrandPhrases = [
  'hago', 'i make', 'trabajo', 'i work', 'soy', 'i am',
  'un ', 'una ', 'a ', 'an ',
  'estudio de', 'taller de', 'tienda de', 'negocio de'
];
```

**Estado Limpieza:** ✅ LIMPIO (47 console.log removidos, solo `console.error` y `console.warn` críticos)

---

### **4. `useFusedMaturityAgent.ts` - Lógica Central (Hook)** 🧠
- **Ubicación:** `src/components/cultural/hooks/useFusedMaturityAgent.ts`
- **Líneas:** 2562 (ARCHIVO MÁS GRANDE Y CRÍTICO)
- **Función:** Hook personalizado con TODA la lógica del sistema

**Responsabilidades Principales (25 funciones):**

#### **1. Detección de Modo**
```typescript
const isOnboardingMode = mode === 'onboarding'; // 3 preguntas
const isReviewMode = mode === 'review';         // Revisar respuestas
```

#### **2. Carga de Progreso Híbrida (BD + localStorage)**
```typescript
loadHybridProgress() {
  // 1️⃣ localStorage (rápido, offline)
  // 2️⃣ Supabase (fuente de verdad)
  // 3️⃣ Compara timestamps → usa el más reciente
  // 4️⃣ Valida y limpia IDs inválidos
  // 5️⃣ Migra datos legacy si existen
}
```

#### **3. Gestión de Preguntas**
- `visibleBlocks`: 3 preguntas (onboarding) o 30 (test completo)
- `currentBlock`: Calcula bloque actual basado en respuestas
- `answeredQuestionIds`: Set de IDs respondidos

#### **4. Respuesta a Preguntas**
```typescript
answerQuestion(questionId, answer) {
  // 1. Guarda en profileData
  // 2. Agrega a answeredQuestionIds
  // 3. Guarda en localStorage INMEDIATAMENTE (no bloquea UI)
  // 4. Guarda en BD cada 3 respuestas (background)
  // 5. Auto-detecta craftType con IA para business_description
}
```

#### **5. Checkpoints (solo test completo)**
```typescript
// Cada 5 preguntas: 5, 10, 15, 20, 25
showCheckpoint = true;  // Activa pantalla checkpoint
continueFromCheckpoint() // Calcula siguiente bloque

// ❌ NO en modo onboarding (isOnboardingMode = true)
```

#### **6. Auto-Completar**
```typescript
// ONBOARDING: 3 preguntas
if (isOnboardingMode && answeredQuestionIds.size === 3) {
  setTimeout(() => completeAssessment(), 100);
}

// TEST COMPLETO: 30 preguntas
if (!isOnboardingMode && answeredQuestionIds.size === 30) {
  completeAssessment();
}
```

#### **7. Completar Assessment**
```typescript
completeAssessment() {
  if (isOnboardingMode) {
    // Scores en 0 (placeholder)
    const placeholderScores = { ideaValidation: 0, userExperience: 0, marketFit: 0, monetization: 0 };
    onComplete(placeholderScores, { primary: [], secondary: [] }, profileData);
  } else {
    // Test completo: calcular scores reales
    const scores = calculateMaturityScores();
    const recommendedAgents = generateMaturityBasedRecommendations(scores);
    
    // Guardar en DB
    saveMaturityScores(scores, profileData);
    createUserAgentsFromRecommendations(user.id, recommendedAgents);
    markOnboardingComplete(user.id, scores, recommendedAgents);
    
    onComplete(scores, recommendedAgents, profileData);
  }
}
```

#### **8. Cálculo de Scores (test completo)**
```typescript
calculateIdeaValidation(profile): number {
  // Basado en: descripción, experiencia, ventas
  // Rango: 0-100
}

calculateUserExperience(profile): number {
  // Basado en: conocimiento del cliente, experiencia
  // Rango: 0-100
}

calculateMarketFit(profile): number {
  // Basado en: canales de promoción, target customer
  // Rango: 0-100
}

calculateMonetization(profile): number {
  // Basado en: ventas, pricing, profit clarity
  // Rango: 0-100
}
```

**Estados del Hook:**
```typescript
{
  currentBlockIndex: number,        // 0-3
  profileData: UserProfileData,     // Datos del usuario
  answeredQuestionIds: Set<string>, // IDs respondidos
  isCompleted: boolean,             // ¿Completó?
  showCheckpoint: boolean,          // ¿Mostrar checkpoint?
  isProcessing: boolean,            // ¿Procesando IA?
  isLoadingProgress: boolean,       // ¿Cargando progreso?
  totalAnswered: number,            // 0-3 o 0-30
  totalQuestions: number,           // 3 o 30
  isOnboardingMode: boolean,        // true/false
  blocks: ConversationBlock[]       // Todos los bloques
}
```

**API del Hook (Funciones Exportadas):**
```typescript
const {
  currentBlock,           // Bloque actual con preguntas
  profileData,            // Datos del perfil
  isCompleted,            // ¿Completó?
  maturityLevel,          // Nivel de madurez
  updateProfileData,      // Actualizar datos
  answerQuestion,         // Responder pregunta
  goToNextBlock,          // Avanzar bloque
  goToPreviousBlock,      // Retroceder bloque
  saveProgress,           // Guardar progreso
  loadProgress,           // Cargar progreso
  completeAssessment,     // Completar test
  getBlockProgress,       // Progreso del bloque
  businessType,           // Tipo de negocio
  isProcessing,           // ¿Procesando IA?
  isLoadingProgress,      // ¿Cargando?
  showCheckpoint,         // ¿Mostrar checkpoint?
  checkpointInfo,         // Info del checkpoint
  continueFromCheckpoint, // Continuar desde checkpoint
  totalAnswered,          // Preguntas respondidas
  totalQuestions,         // Total de preguntas
  answeredQuestionIds,    // Set de IDs respondidos
  isOnboardingMode,       // ¿Es onboarding?
  blocks                  // Todos los bloques
} = useFusedMaturityAgent(language, onComplete);
```

**Estado Limpieza:** ⚠️ **PENDIENTE** (180 console statements - necesita limpieza masiva)

---

### **5. `CulturalMaturityWizard.tsx` - Legacy** 🗄️
- **Ubicación:** `src/components/cultural/CulturalMaturityWizard.tsx`
- **Líneas:** 107
- **Estado:** ❌ **NO SE USA** (legacy, mantenido para compatibilidad)
- **Función:** Wrapper antiguo de `FusedMaturityCalculator`

**Estado Limpieza:** ✅ LIMPIO (1 console.log removido)

---

## **Flujo Completo del Onboarding** 🎬

```
┌─────────────────────────────────────────────────────┐
│ 1. Usuario completa Login ✅                        │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 2. Login.tsx detecta: no userMasterContext          │
│    → getRedirectPath() = '/maturity-calculator?mode=onboarding' │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 3. MaturityCalculator.tsx                           │
│    → Renderiza <FusedMaturityCalculator />          │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 4. FusedMaturityCalculator.tsx                      │
│    → Hook: useFusedMaturityAgent(language, onComplete) │
│    → Detecta: isOnboardingMode = true               │
│    → Carga ONBOARDING_BLOCKS (3 preguntas)          │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 5. IntelligentConversationFlow.tsx                  │
│    → Renderiza Q1: business_description             │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 6. Usuario escribe descripción (min 30 chars)       │
│    → Click "Siguiente"                              │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 7. handleNext() detecta Q1                          │
│    → Llama extract-business-info (Edge Function)    │
│    → Recibe: brand_name, craft_type, location       │
│    → Valida frontalmente (nombres inválidos)        │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 8. Muestra <BusinessInfoConfirmationClean />        │
│    → Usuario confirma/edita                         │
│    → Guarda en user_profiles + user_master_context  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 9. Usuario responde Q2: sales_status                │
│    → answerQuestion() guarda en localStorage + BD   │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 10. Usuario responde Q3: target_customer            │
│     → answerQuestion() guarda en localStorage + BD  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 11. useEffect detecta: answeredQuestionIds.size === 3 │
│     → Auto-completa en 100ms                        │
│     → completeAssessment()                          │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 12. completeAssessment() - Modo Onboarding          │
│     - Guarda profileData en localStorage            │
│     - Envía scores en 0 (placeholder)               │
│     - Llama onComplete(scores, agents, profileData) │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 13. MaturityCalculator.handleComplete()             │
│     - Crea user_progress si no existe               │
│     - Llama analyzeProfileAndGenerateTasks()        │
│     - Toast: "🎯 ¡Misiones Creadas!"                │
│     - Redirige a /dashboard/home después de 2s      │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 14. Dashboard muestra:                              │
│     - Camino Artesanal (5% progreso base)           │
│     - Misiones generadas por los agentes            │
└─────────────────────────────────────────────────────┘
```

---

## **Datos Guardados** 💾

### **localStorage (user-namespaced):**
```json
{
  "fused_maturity_calculator_progress": {
    "currentBlockIndex": 0,
    "answeredQuestionIds": ["business_description", "sales_status", "target_customer"],
    "profileData": {
      "businessDescription": "Vendo joyería artesanal...",
      "brandName": "JoyArte",
      "craftType": "Joyería",
      "businessLocation": "Bogotá",
      "salesStatus": "occasional",
      "targetCustomer": "individuals"
    },
    "isCompleted": true,
    "completedAt": "2026-01-21T20:00:00.000Z",
    "lastUpdated": "2026-01-21T20:00:00.000Z"
  }
}
```

### **Supabase `user_master_context`:**
```json
{
  "user_id": "uuid-here",
  "business_profile": {
    "brandName": "JoyArte",
    "brand_name": "JoyArte",
    "craftType": "Joyería",
    "businessDescription": "Vendo joyería artesanal...",
    "businessLocation": "Bogotá",
    "salesStatus": "occasional",
    "targetCustomer": "individuals"
  },
  "task_generation_context": {
    "maturity_test_progress": {
      "current_block": 0,
      "total_answered": 3,
      "answered_question_ids": ["business_description", "sales_status", "target_customer"],
      "last_updated": "2026-01-21T20:00:00.000Z"
    }
  },
  "conversation_insights": {
    "nombre_marca": "JoyArte"
  }
}
```

### **Supabase `user_profiles`:**
```json
{
  "user_id": "uuid-here",
  "brand_name": "JoyArte",
  "business_description": "Vendo joyería artesanal...",
  "business_type": "creative",
  "updated_at": "2026-01-21T20:00:00.000Z"
}
```

---

## **Diferencias: Onboarding vs Test Completo** 📊

| **Característica**          | **Onboarding** 🎓 | **Test Completo** 📊 |
|-----------------------------|-------------------|----------------------|
| **URL**                     | `?mode=onboarding` | Sin parámetro       |
| **Preguntas**               | 3                 | 30                   |
| **Bloques**                 | 1                 | 4                    |
| **IDs de Preguntas**        | `business_description`, `sales_status`, `target_customer` | 30 IDs diferentes |
| **Checkpoints**             | ❌ No             | ✅ Sí (cada 5: 5, 10, 15, 20, 25) |
| **Scores**                  | 0, 0, 0, 0 (placeholder) | Calculados (0-100) |
| **Auto-Complete**           | Al responder 3    | Al responder 30      |
| **Tiempo estimado**         | 2-3 minutos       | 10-15 minutos        |
| **Redirige a**              | `/dashboard/home` | `/dashboard/home`    |
| **Genera tareas**           | ✅ Sí (agentes)   | ✅ Sí (agentes)      |
| **Guarda en BD**            | ✅ Sí             | ✅ Sí                |
| **Extracción AI Q1**        | ✅ Sí             | ✅ Sí                |
| **Confirmación AI**         | ✅ Sí             | ✅ Sí                |

---

## **Estado de Limpieza de `console.log`** 🧹

| **Archivo**                          | **Líneas** | **Console** | **Estado**      |
|--------------------------------------|------------|-------------|-----------------|
| `MaturityCalculator.tsx`             | 169        | 2           | ✅ LIMPIO       |
| `FusedMaturityCalculator.tsx`        | 453        | 2           | ✅ LIMPIO       |
| `IntelligentConversationFlow.tsx`    | 1025       | 5           | ✅ LIMPIO       |
| `CulturalMaturityWizard.tsx`         | 107        | 0           | ✅ LIMPIO       |
| **`useFusedMaturityAgent.ts`**       | **2562**   | **180**     | ⚠️ **PENDIENTE** |

**Total removido:** 47 console.log  
**Pendiente:** 180 console.log en `useFusedMaturityAgent.ts`

---

## **Próximos Pasos para la Transición a NestJS** 🚀

### **Archivos Listos para NestJS:**
1. ✅ `MaturityCalculator.tsx` - Sin logs innecesarios
2. ✅ `FusedMaturityCalculator.tsx` - Sin logs innecesarios
3. ✅ `IntelligentConversationFlow.tsx` - Sin logs innecesarios
4. ✅ `CulturalMaturityWizard.tsx` - Sin logs innecesarios

### **Archivo Pendiente:**
5. ⚠️ **`useFusedMaturityAgent.ts`** - Necesita limpieza masiva de 180 console statements

**Recomendación:** 
- Limpiar `useFusedMaturityAgent.ts` manteniendo solo `console.error()` para errores críticos
- Esto facilitará la transición al nuevo backend NestJS
- El código quedará más limpio y profesional para producción

---

## **Documentos Relacionados**

- `FLUJO_LOGIN_DASHBOARD_PETICIONES.md` - Flujo de login y peticiones
- `BACKEND_USER_MASTER_CONTEXT_SPEC.md` - Especificación de `user_master_context`
- `.cursorrules` - Reglas del proyecto (incluye política de logs)

---

**Generado:** 2026-01-21  
**Autor:** AI Assistant  
**Propósito:** Documentación para transición a NestJS
