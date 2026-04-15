# 🧠 Funciones Principales de `useFusedMaturityAgent.ts`

## 📌 Resumen Ejecutivo

**Archivo:** `src/components/cultural/hooks/useFusedMaturityAgent.ts`  
**Líneas:** 2562  
**Propósito:** Hook personalizado que gestiona TODO el flujo del onboarding (3 preguntas) y maturity test (30 preguntas)

---

## 🎯 FUNCIÓN PRINCIPAL

### **`useFusedMaturityAgent(language, onComplete)`** - Línea 71

**Parámetros:**
- `language`: 'es' | 'en'
- `onComplete`: Callback que se ejecuta al finalizar el test

**Retorna:** Objeto con 25 propiedades/funciones

```typescript
{
  // Estados
  currentBlock,           // Bloque actual de preguntas
  profileData,            // Datos del usuario
  isCompleted,            // ¿Completó el test?
  maturityLevel,          // Nivel de madurez (solo test completo)
  personalizedTasks,      // Tareas generadas (solo test completo)
  businessType,           // Tipo de negocio
  isProcessing,           // ¿Procesando IA?
  isLoadingProgress,      // ¿Cargando progreso?
  showCheckpoint,         // ¿Mostrar checkpoint?
  checkpointInfo,         // Info del checkpoint
  totalAnswered,          // Preguntas respondidas (0-3 o 0-30)
  totalQuestions,         // Total de preguntas (3 o 30)
  answeredQuestionIds,    // Set de IDs respondidos
  isOnboardingMode,       // ¿Es onboarding?
  blocks,                 // Todos los bloques
  
  // Funciones
  updateProfileData,      // Actualizar datos
  answerQuestion,         // Responder pregunta
  goToNextBlock,          // Avanzar bloque
  goToPreviousBlock,      // Retroceder bloque
  saveProgress,           // Guardar progreso
  loadProgress,           // Cargar progreso
  completeAssessment,     // Completar test
  getBlockProgress,       // Progreso del bloque
  continueFromCheckpoint, // Continuar desde checkpoint
}
```

---

## 🔧 FUNCIONES AUXILIARES EXTERNAS

### **1. `saveProgressToDBWithRetry()`** - Línea 30-69

**Propósito:** Guarda progreso en Supabase con reintentos automáticos

**Parámetros:**
- `userId`: UUID del usuario
- `progressData`: Objeto con el progreso actual
- `maxRetries`: Número de reintentos (default: 3)

**Retorna:** `boolean` (true si guardó exitosamente)

**Lógica:**
```typescript
for (attempt = 1 to 3) {
  try {
    await supabase
      .from('user_master_context')
      .upsert({
        user_id: userId,
        task_generation_context: {
          maturity_test_progress: progressData
        }
      });
    return true; // ✅ Éxito
  } catch (error) {
    if (attempt === maxRetries) {
      return false; // ❌ Falló después de 3 intentos
    }
    await sleep(1000 * attempt); // Backoff exponencial
  }
}
```

**Usado por:** `saveProgress()`

**Peticiones a Supabase:** `user_master_context` (UPSERT)

---

### **2. `validateAndCleanQuestionIds()`** - Línea 139-170

**Propósito:** Valida que los IDs de preguntas respondidas sean válidos y limpia los inválidos

**Parámetros:**
- `answeredIds`: Array de IDs respondidos
- `allBlocks`: Array de bloques con preguntas

**Retorna:** Objeto
```typescript
{
  validIds: string[],      // IDs válidos
  invalidIds: string[],    // IDs inválidos (de versiones antiguas)
  needsReset: boolean      // ¿Necesita limpieza?
}
```

**Lógica:**
```typescript
1. Construir Set de todos los IDs válidos de todas las preguntas
2. Filtrar answeredIds:
   - Si ID existe en bloques → validIds
   - Si NO existe → invalidIds
3. needsReset = true si hay invalidIds
```

**Usado por:** `loadHybridProgress()`

**Caso de uso:** Evitar errores cuando se actualizan las preguntas del sistema y el usuario tiene progreso guardado con IDs antiguos

---

## 🔄 FUNCIONES DE CARGA/GUARDADO

### **3. `loadHybridProgress()`** - Línea 174-662

**Propósito:** Carga progreso desde localStorage Y Supabase, usa el más reciente

**Flujo Detallado:**
```
PASO 1: Cargar de localStorage user-namespaced
  ├─ userLocalStorage.getItem('fused_maturity_calculator_progress')
  └─ Si no existe: Migrar de localStorage global o legacy

PASO 2: Migrar progreso legacy (si existe)
  ├─ Buscar 'maturityCalculatorProgress' (formato antiguo)
  └─ Convertir a formato nuevo y guardar

PASO 3: Validar y limpiar IDs
  ├─ validateAndCleanQuestionIds()
  └─ Eliminar IDs inválidos o de versiones antiguas

PASO 4: Validación modo ONBOARDING
  ├─ Si está en modo onboarding (3 preguntas)
  ├─ Pero tiene IDs del test completo (30 preguntas)
  └─ Resetear progreso (evitar corrupción)

PASO 5: Cargar de Supabase (BD)
  ├─ SELECT de user_master_context.task_generation_context
  └─ Obtener maturity_test_progress

PASO 6: Comparar timestamps
  ├─ localStorage timestamp vs BD timestamp
  └─ Usar el MÁS RECIENTE

PASO 7: Restaurar estado
  ├─ setCurrentBlockIndex(progress.current_block)
  ├─ setProfileData(progress.profile_data)
  ├─ setAnsweredQuestionIds(new Set(progress.answered_question_ids))
  ├─ setBusinessType(progress.business_type)
  └─ setShowCheckpoint(progress.show_checkpoint)

PASO 8: Marcar como cargado
  └─ setIsLoadingProgress(false)
```

**Peticiones a Supabase:**
- `user_master_context` (SELECT)

**Casos especiales manejados:**
- ✅ Migración de formato legacy
- ✅ Migración de localStorage global → user-namespaced
- ✅ Limpieza de IDs inválidos
- ✅ Validación onboarding vs test completo
- ✅ Comparación de timestamps (BD vs localStorage)

---

### **4. `saveProgress()`** - Línea 1619-1703

**Propósito:** Guarda el progreso actual en localStorage (instantáneo) y BD (background)

**Flujo:**
```
1. Construir objeto de progreso
   {
     currentBlockIndex,
     answeredQuestionIds: Array.from(answeredQuestionIds),
     profileData,
     businessType,
     showCheckpoint,
     isCompleted,
     lastUpdated: timestamp
   }

2. Guardar en localStorage (INSTANTÁNEO)
   ├─ No bloquea la UI
   └─ userLocalStorage.setItem()

3. Si hay usuario, guardar en BD (BACKGROUND)
   └─ saveProgressToDBWithRetry(user.id, progressData)
```

**Características:**
- ⚡ Guardado instantáneo en localStorage
- 🔄 Guardado asíncrono en BD (no bloquea)
- 🔁 Reintentos automáticos si falla BD

---

## 📝 FUNCIONES DE RESPUESTA

### **5. `answerQuestion(questionId, answer)`** - Línea 1464-1617

**Propósito:** Registra la respuesta a una pregunta y actualiza el estado

**Parámetros:**
- `questionId`: ID de la pregunta (ej: "business_description")
- `answer`: Respuesta del usuario (string, array, number, etc.)

**Flujo:**
```
1. Determinar fieldName desde la pregunta actual

2. Actualizar profileData
   └─ setProfileData({ ...prev, [fieldName]: answer })

3. Agregar questionId a answeredQuestionIds
   └─ setAnsweredQuestionIds(prev => new Set([...prev, questionId]))

4. Guardar en localStorage INMEDIATAMENTE
   └─ Usa ref para no bloquear UI
   └─ saveProgressToLocalStorageRef.current()

5. Si es Q1 (business_description), detectar craftType con IA
   └─ Llama a función de detección de artesanía

6. Cada 3 respuestas, guardar en BD
   └─ if (answeredQuestionIds.size % 3 === 0 && user) {
         saveProgressToDBWithRetry(user.id, progressData)
       }
```

**Peticiones a Supabase:**
- `user_master_context` (UPSERT) cada 3 respuestas

**Características:**
- ✅ Guardado instantáneo en localStorage (UX fluida)
- ✅ Guardado cada 3 respuestas en BD (balance entre performance y seguridad)
- ✅ Auto-detecta craftType para Q1 con IA

---

## 🎬 FUNCIONES DE COMPLETADO

### **6. `completeAssessment()`** - Línea 1890-2301

**Propósito:** Finaliza el onboarding o test completo

**Detecta automáticamente el modo:**
```typescript
const requiredQuestions = isOnboardingMode ? 3 : 30;
const isOnboardingComplete = answeredQuestionIds.size === 3;
```

### **MODO ONBOARDING (3 preguntas):**

**Flujo:**
```
1. Validar que se respondieron 3 preguntas

2. Marcar como completado
   └─ setIsCompleted(true)

3. Calcular progreso inicial del Camino Artesanal (5%)
   ├─ Obtener tareas existentes (probablemente 0)
   ├─ calculateCaminoArtesanalProgress()
   └─ Guardar en master_coordinator_context

4. Publicar evento
   └─ EventBus.publish('maturity.assessment.completed')

5. Guardar progreso
   └─ saveProgress()

6. Llamar onComplete() con scores en 0 (placeholder)
   └─ onComplete(
        { ideaValidation: 0, userExperience: 0, marketFit: 0, monetization: 0 },
        { primary: [], secondary: [] },
        profileData
      )

7. Toast de éxito
   └─ "🎉 ¡Onboarding completado!"
```

**Peticiones a Supabase (ONBOARDING):**
- `agent_tasks` (SELECT) - obtener tareas existentes
- `master_coordinator_context` (SELECT, UPDATE o INSERT)

---

### **MODO TEST COMPLETO (30 preguntas):**

**Flujo:**
```
1. Validar que se respondieron 30 preguntas

2. Calcular scores REALES (0-100)
   ├─ calculateIdeaValidation(profileData)
   ├─ calculateUserExperience(profileData)
   ├─ calculateMarketFit(profileData)
   └─ calculateMonetization(profileData)

3. Determinar nivel de madurez
   └─ getMaturityLevel(scores) 
       → Starting, Developing, Growing, Advanced

4. Generar agentes recomendados
   └─ generateMaturityBasedRecommendations(scores)
       → { primary: ['growth', 'brand'], secondary: ['inventory'] }

5. Generar tareas personalizadas
   └─ generatePersonalizedTasks(scores, profileData, language)

6. Guardar en BD
   ├─ saveMaturityScores(scores, profileData)
   ├─ updateProfile(profileData)
   ├─ updateContext(taskGenerationContext)
   ├─ createUserAgentsFromRecommendations(user.id, agents)
   └─ markOnboardingComplete(user.id, scores, agents)

7. Calcular progreso del Camino Artesanal (20-50%)
   └─ Basado en scores y tareas

8. Publicar evento
   └─ EventBus.publish('maturity.assessment.completed')

9. Llamar onComplete() con datos reales
   └─ onComplete(scores, recommendedAgents, profileData)

10. Toast de éxito con nivel de madurez
```

**Peticiones a Supabase (TEST COMPLETO):**
- `user_maturity_scores` (INSERT)
- `user_profiles` (UPDATE)
- `user_master_context` (UPDATE)
- `user_agents` (INSERT)
- `agent_tasks` (SELECT)
- `master_coordinator_context` (SELECT, UPDATE o INSERT)
- Edge Function: `generate-artisan-tasks`

---

## ➡️ FUNCIONES DE NAVEGACIÓN

### **7. `goToNextBlock()`** - Línea 1705-1750

**Propósito:** Avanza al siguiente bloque de preguntas

**Validaciones:**
- ✅ Todas las preguntas del bloque actual están respondidas
- ✅ No es el último bloque

**Lógica especial:**
- Detecta checkpoints (cada 5 preguntas en test completo)
- Si `answeredQuestionIds.size % 5 === 0` → muestra checkpoint
- Si es onboarding, NO muestra checkpoints

---

### **8. `goToPreviousBlock()`** - Línea 1752-1771

**Propósito:** Retrocede al bloque anterior

**Validación:**
- ✅ No es el primer bloque

---

## 🏁 FUNCIONES DE CHECKPOINT (Solo Test Completo)

### **9. `continueFromCheckpoint()`** - Línea 1013-1086

**Propósito:** Ejecuta acciones en checkpoints (cada 5 preguntas: 5, 10, 15, 20, 25)

**Flujo:**
```
1. Guardar progreso actual

2. Calcular scores parciales
   ├─ calculateMaturityScores() con datos actuales
   └─ Scores basados en las preguntas respondidas hasta ahora

3. Calcular progreso del Camino Artesanal
   ├─ Obtener tareas existentes de Supabase
   ├─ calculateCaminoArtesanalProgress(scores, tasks)
   └─ Resultado: 10-50% según progreso

4. Generar tareas incrementales (opcional)
   ├─ Llama a Edge Function: generate-artisan-tasks
   ├─ Mode: incremental = true
   └─ Solo genera tareas nuevas, no duplica

5. Actualizar master_coordinator_context
   ├─ Guarda snapshot del contexto
   ├─ Guarda checkpoint_updated_at
   └─ Guarda camino_artesanal_progress

6. Calcular siguiente bloque
   └─ setCurrentBlockIndex(prev => prev + 1)

7. Ocultar checkpoint
   └─ setShowCheckpoint(false)

8. Publicar evento
   └─ EventBus.publish('master.context.updated')
```

**Peticiones a Supabase:**
- `agent_tasks` (SELECT)
- `user_maturity_scores` (SELECT)
- `master_coordinator_context` (SELECT, UPDATE o INSERT)
- Edge Function: `generate-artisan-tasks` (incremental)

**NO se ejecuta en onboarding** - Solo en test completo

---

## 📊 FUNCIONES DE CÁLCULO DE SCORES (Test Completo)

### **10. `calculateIdeaValidation(profile)`** - Línea 1773-1799

**Propósito:** Calcula score de validación de idea (0-100)

**Factores evaluados:**
- Claridad de la descripción del negocio
- Años de experiencia
- Ventas realizadas
- Frecuencia de ventas

**Fórmula aproximada:**
```typescript
score = 0
if (businessDescription && length > 100) score += 30
if (yearsInBusiness > 0) score += 20
if (hasSold) score += 30
if (salesFrequency === 'regular') score += 20
return score (0-100)
```

---

### **11. `calculateUserExperience(profile)`** - Línea 1801-1823

**Propósito:** Calcula score de experiencia de usuario (0-100)

**Factores evaluados:**
- Conocimiento del cliente ideal
- Experiencia en el sector
- Canales de promoción usados

---

### **12. `calculateMarketFit(profile)`** - Línea 1825-1847

**Propósito:** Calcula score de ajuste al mercado (0-100)

**Factores evaluados:**
- Canales de promoción definidos
- Target customer claro
- Propuesta de valor única

---

### **13. `calculateMonetization(profile)`** - Línea 1849-1871

**Propósito:** Calcula score de monetización (0-100)

**Factores evaluados:**
- Ventas realizadas
- Precio definido por producto
- Claridad en márgenes de ganancia

---

### **14. `calculateMaturityScores()`** - Línea 1873-1888

**Propósito:** Ejecuta las 4 funciones de cálculo y retorna objeto consolidado

**Retorna:**
```typescript
{
  ideaValidation: number,    // 0-100
  userExperience: number,    // 0-100
  marketFit: number,         // 0-100
  monetization: number       // 0-100
}
```

---

## 🎯 FUNCIONES AUTO-COMPLETE

### **15. Auto-Complete para Onboarding** - Línea 1013-1033 (useEffect)

**Trigger:** `answeredQuestionIds.size === 3` en modo onboarding

**Flujo:**
```
useEffect(() => {
  if (isOnboardingMode && answeredQuestionIds.size === 3 && !isCompleted) {
    // ❌ NO mostrar checkpoint en onboarding
    setShowCheckpoint(false);
    
    // ✅ Completar con delay mínimo (evitar race conditions)
    setTimeout(() => {
      if (!isCompleted && !isProcessing) {
        setIsProcessing(true);
        completeAssessmentRef.current().finally(() => {
          setIsProcessing(false);
        });
      }
    }, 100);
  }
}, [answeredQuestionIds.size, isCompleted, isOnboardingMode]);
```

**Resultado:** Al responder la 3ra pregunta, auto-completa en 100ms

---

### **16. Auto-Complete para Test Completo** - Similar lógica

**Trigger:** `answeredQuestionIds.size === 30` en modo test completo

**Resultado:** Al responder la 30va pregunta, auto-completa

---

## 🔢 FUNCIONES DE PROGRESO

### **17. `getBlockProgress(blockIndex)`** - Línea ~1400

**Propósito:** Calcula el progreso de un bloque específico

**Retorna:**
```typescript
{
  total: number,        // Total de preguntas del bloque
  answered: number,     // Preguntas respondidas del bloque
  percentage: number    // Porcentaje (0-100)
}
```

---

### **18. `getTotalProgress()`** - Calculado inline

**Propósito:** Calcula el progreso total del test

**Fórmula:**
```typescript
totalProgress = (answeredQuestionIds.size / totalQuestions) * 100
// Onboarding: (3 / 3) * 100 = 100%
// Test completo: (15 / 30) * 100 = 50%
```

---

## 🔗 FUNCIONES DE ACTUALIZACIÓN

### **19. `updateProfileData(data)`** - Línea ~1300

**Propósito:** Actualiza parcialmente el profileData

**Uso:**
```typescript
updateProfileData({ brandName: "JoyArte" })
// Hace: setProfileData(prev => ({ ...prev, brandName: "JoyArte" }))
```

**Trigger automático:** Guarda en localStorage después de actualizar

---

## 📚 RESUMEN DE TODAS LAS FUNCIONES

| # | Función | Línea Aprox | Propósito | Peticiones Supabase |
|---|---------|-------------|-----------|---------------------|
| 1 | `useFusedMaturityAgent()` | 71 | Hook principal | - |
| 2 | `saveProgressToDBWithRetry()` | 30 | Guardar con reintentos | user_master_context |
| 3 | `validateAndCleanQuestionIds()` | 139 | Validar IDs | - |
| 4 | `loadHybridProgress()` | 174 | Cargar progreso | user_master_context |
| 5 | `answerQuestion()` | 1464 | Responder pregunta | user_master_context (cada 3) |
| 6 | `saveProgress()` | 1619 | Guardar progreso | user_master_context |
| 7 | `goToNextBlock()` | 1705 | Avanzar bloque | - |
| 8 | `goToPreviousBlock()` | 1752 | Retroceder bloque | - |
| 9 | `calculateIdeaValidation()` | 1773 | Calc score idea | - |
| 10 | `calculateUserExperience()` | 1801 | Calc score UX | - |
| 11 | `calculateMarketFit()` | 1825 | Calc score market | - |
| 12 | `calculateMonetization()` | 1849 | Calc score money | - |
| 13 | `calculateMaturityScores()` | 1873 | Calc todos los scores | - |
| 14 | `completeAssessment()` | 1890 | Completar test | Múltiples (ver arriba) |
| 15 | `continueFromCheckpoint()` | 1013 | Checkpoint logic | agent_tasks, master_coordinator_context, Edge Function |
| 16 | `getBlockProgress()` | ~1400 | Progreso de bloque | - |
| 17 | `updateProfileData()` | ~1300 | Actualizar datos | - |
| 18 | `loadProgress()` | ~1450 | Alias de loadHybridProgress | user_master_context |
| 19 | `getMaturityLevel()` | ~1200 | Determinar nivel | - |
| 20 | `generatePersonalizedTasks()` | ~1100 | Generar tareas | - |

---

## 🔑 VARIABLES DE ESTADO PRINCIPALES

```typescript
// Estados del wizard
const [currentBlockIndex, setCurrentBlockIndex] = useState(0);          // Bloque actual (0-3)
const [profileData, setProfileData] = useState<UserProfileData>({});    // Datos del usuario
const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set>(); // IDs respondidos
const [isCompleted, setIsCompleted] = useState(false);                  // ¿Completó?
const [isProcessing, setIsProcessing] = useState(false);                // ¿Procesando IA?
const [isLoadingProgress, setIsLoadingProgress] = useState(true);       // ¿Cargando?
const [showCheckpoint, setShowCheckpoint] = useState(false);            // ¿Mostrar checkpoint?
const [businessType, setBusinessType] = useState('creative');           // Tipo de negocio

// Refs
const lastInitUserIdRef = useRef<string | null>(null);          // Control de inicialización
const saveProgressToLocalStorageRef = useRef<Function | null>(); // Guardado instantáneo
const completeAssessmentRef = useRef<Function | null>();         // Referencia a completar
```

---

**Ya he limpiado los primeros console.log. ¿Quieres que continúe limpiando los ~175 restantes o primero tienes preguntas sobre las funciones?** 🚀