# 🔒 MÓDULO DE GROWTH - BLOQUEADO

Este módulo está **CERTIFICADO Y ESTABLE** tras una auditoría completa.

## 🎯 Propósito

El módulo de Growth (Agente de Crecimiento) gestiona el proceso completo de evaluación de madurez del negocio artesanal, desde el test inicial de 12 preguntas hasta la generación de tareas personalizadas.

## 🚫 Política de Modificación

### IMPORTANTE: Este módulo está BLOQUEADO

- ❌ **NO modificar** sin instrucción explícita del usuario que mencione "Growth", "Maturity Test", "Test de Madurez" o "Agente de Crecimiento"
- ❌ **NO refactorizar** como parte de cambios globales en otros módulos
- ❌ **NO renombrar** funciones, variables, constantes o prompts por iniciativa propia
- ❌ **NO mover** archivos, ni duplicar ni fusionar componentes sin autorización
- ✅ **Solo lectura** permitida para otros módulos que necesiten consultar datos del Growth

### ¿Cuándo se puede modificar?

**SOLO cuando el usuario diga explícitamente:**
- "Actualiza el Maturity Test"
- "Modifica el Agente de Growth"
- "Cambia las preguntas del test de madurez"
- "Ajusta el sistema de checkpoints"
- Cualquier instrucción directa y específica sobre este módulo

## 📦 Componentes Protegidos

### Archivos Core (NO TOCAR)
```
src/
├── config/
│   └── maturityTest.ts                    # ⚠️ Configuración central (12 preguntas, checkpoints)
├── components/
│   └── cultural/
│       ├── CulturalMaturityWizard.tsx     # ⚠️ Orquestador principal del wizard
│       ├── SimpleCulturalMaturityCalculator.tsx # ⚠️ Wrapper e integración
│       ├── hooks/
│       │   └── useFusedMaturityAgent.ts   # ⚠️ Lógica principal del test
│       ├── data/
│       │   └── fusedConversationBlocks.ts # ⚠️ 12 preguntas del test
│       ├── conversational/
│       │   ├── IntelligentConversationFlow.tsx # ⚠️ UI de preguntas
│       │   └── MilestoneCheckpoint.tsx    # ⚠️ Checkpoints cada 3 preguntas
│       └── wizard-components/
│           ├── StepContentRenderer.tsx
│           └── WizardStepContent.tsx
├── hooks/
│   ├── useMaturityScoresSaver.ts          # ⚠️ Guardado de scores
│   ├── useMaturityTestStatus.ts           # ⚠️ Estado del test
│   └── useMaturityTracker.ts              # ⚠️ Tracking de acciones
└── utils/
    └── caminoArtesanalProgress.ts         # ⚠️ Validación de progreso
```

### Edge Functions (NO TOCAR)
```
supabase/functions/
└── extract-business-info/
    └── index.ts                           # ⚠️ AI que analiza primera pregunta
```

### Configuración de Base de Datos (NO TOCAR)
- `user_maturity_scores` - Tabla de scores
- `user_master_context.task_generation_context.maturity_test_progress` - Progreso del test
- `increment_maturity_score` - RPC function

## 🎯 Funcionalidades Bloqueadas

### 1. Test de Madurez (12 preguntas, 4 bloques)
- **Estructura:** 12 preguntas divididas en 4 bloques de 3 preguntas cada uno
- **Checkpoints:** Cada 3 preguntas (al final de cada bloque)
- **Primera pregunta:** Input tipo ChatGPT con dictado de voz, AI extrae información estructurada
- **Guardado:** Automático en cada checkpoint + localStorage

### 2. Banners del Dashboard
- **No iniciado:** Banner compacto "Haz tu Maturity Test"
- **En progreso:** Banner compacto mostrando "Vas en módulo X / pregunta Y" con barra de progreso
- **Completado:** Sin banner (el banner desaparece)
- **Repetir test:** Solo accesible desde perfil con 3 advertencias obligatorias

### 3. Wizard Avanzado (Post-Test)
- **Trigger:** Después de completar las 12 preguntas
- **Contenido:** 5 preguntas adicionales de negocio profundo
- **Guardado:** En `user_master_context.business_profile`

### 4. Generación de Tareas
- **Base:** IA analiza información del test + wizard avanzado
- **Criterios:** Detecta gaps (sin marca, sin tienda, sin precio, sin claim)
- **Routing:** Tareas se asignan al agente correcto vía Coordinador Maestro

### 5. Camino Artesanal
- **Fórmula:** 5% base (completar test) + 95% tareas completadas
- **Validación:** Progreso solo avanza con tareas verificadas
- **NO avanza:** Solo por registro o completar test

## 📊 Datos que Otros Módulos Pueden Consultar

### ✅ Permitido (solo lectura):
```typescript
// Leer scores de madurez
const { maturityScores } = useMasterAgent();

// Leer estado del test
const { hasCompleted, hasInProgress, totalAnswered } = useMaturityTestStatus();

// Leer tareas generadas
const tasks = masterState.growth.misiones;

// Leer progreso del camino
const progress = calculateCaminoArtesanalProgress(context);
```

### ❌ Prohibido:
```typescript
// NO modificar configuración
MATURITY_TEST_CONFIG.TOTAL_QUESTIONS = 15; // ❌

// NO modificar bloques de preguntas directamente
fusedConversationBlocks.push(newBlock); // ❌

// NO regenerar tareas sin autorización
generateTasksBasedOnScores(); // ❌
```

## 🧪 Tests de Integridad

Para verificar que el módulo sigue funcionando correctamente:

```typescript
import { validateGrowthModule } from '@/utils/growthModuleValidator';

const result = validateGrowthModule();
console.log(result); // Debe pasar todos los checks
```

## 📝 Historial de Auditoría

### 2025-01-XX - Auditoría Completa y Bloqueo
- ✅ Configuración validada (12 preguntas, 4 bloques, checkpoints)
- ✅ Banners rediseñados (compactos, sin ocupar ancho completo)
- ✅ Wizard avanzado implementado (5 preguntas post-test)
- ✅ Validación de Camino Artesanal corregida (95% tareas, 5% base)
- ✅ Dictado por voz unificado (un solo botón)
- ✅ AI procesamiento de primera pregunta validado
- ✅ Debug Artisan recibiendo data correctamente
- 🔒 **MÓDULO BLOQUEADO** - En modo estabilidad

## 🆘 Contacto

Si necesitas modificar este módulo, contacta al usuario del proyecto o al arquitecto del sistema con una justificación clara del cambio.

---

**Última actualización:** 2025-01-XX  
**Estado:** 🔒 BLOQUEADO - ESTABLE  
**Versión:** 1.0.0
