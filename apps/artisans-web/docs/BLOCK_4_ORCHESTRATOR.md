# Bloque 4 - Sistema de Orquestación Avanzada con IA

## 📋 Resumen

El Master Coordinator Orchestrator ahora usa **Lovable AI (Gemini 2.5 Flash)** para proporcionar análisis inteligente, generación de tareas personalizadas y validación contextual.

## 🚀 Capacidades

### 1. Análisis Contextual Inteligente
- Analiza el estado del usuario para cada agente
- Identifica fortalezas y debilidades
- Genera recomendaciones accionables
- Calcula puntuaciones y prioridades

### 2. Generación de Tareas Personalizadas
- Crea 2-4 tareas adaptadas al contexto del usuario
- Diseña pasos progresivos y realistas
- Considera nivel de madurez y recursos
- Adapta lenguaje y dificultad

### 3. Validación Inteligente
- Verifica completitud de tareas
- Genera resúmenes motivadores
- Identifica aprendizajes clave
- Recomienda próximos pasos

## 💻 Uso desde el Frontend

### Hook: `useMasterOrchestrator`

```typescript
import { useMasterOrchestrator } from '@/hooks/useMasterOrchestrator';

function MyComponent() {
  const { 
    analyzeContext, 
    generateTasks, 
    validateTask,
    isLoading 
  } = useMasterOrchestrator();

  // Analizar contexto
  const handleAnalyze = async () => {
    const analysis = await analyzeContext('growth');
    console.log('Score:', analysis?.score);
    console.log('Recommendations:', analysis?.recommendations);
  };

  // Generar tareas
  const handleGenerateTasks = async () => {
    const tasks = await generateTasks('inventory');
    console.log('Generated tasks:', tasks);
  };

  // Validar tarea
  const handleValidate = async (taskId: string) => {
    const result = await validateTask('pricing', taskId);
    if (result?.isValid) {
      console.log('Deliverable:', result.deliverable);
    }
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={isLoading}>
        Analizar Contexto
      </button>
      <button onClick={handleGenerateTasks} disabled={isLoading}>
        Generar Tareas
      </button>
    </div>
  );
}
```

## 🔧 Edge Function

**Endpoint:** `master-coordinator-orchestrator`

**Auth:** Requiere JWT (usuario autenticado)

**Invocaciones:**

### 1. Analizar Contexto
```typescript
supabase.functions.invoke('master-coordinator-orchestrator', {
  body: {
    type: 'analyze',
    agentId: 'growth',
    userId: 'user-uuid'
  }
})
```

**Respuesta:**
```json
{
  "status": "success",
  "data": {
    "agentId": "growth",
    "score": 75,
    "strengths": ["Evaluación completa", "Productos diversificados"],
    "weaknesses": ["Presencia digital limitada"],
    "recommendations": ["Crear perfil en redes sociales", "Fotografiar productos"],
    "priority": "medium",
    "estimatedImpact": "Alto"
  }
}
```

### 2. Generar Tareas
```typescript
supabase.functions.invoke('master-coordinator-orchestrator', {
  body: {
    type: 'generate_tasks',
    agentId: 'inventory',
    userId: 'user-uuid'
  }
})
```

**Respuesta:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "inventory-task-123",
      "title": "Organiza tu Catálogo",
      "description": "Crea categorías y estructura tu inventario",
      "priority": "high",
      "estimatedTime": "15-20 min",
      "category": "Organización",
      "agentId": "inventory",
      "isUnlocked": true,
      "steps": [
        {
          "id": "step-1",
          "stepNumber": 1,
          "title": "Define categorías principales",
          "description": "Identifica 3-5 categorías para tus productos",
          "isCompleted": false
        }
      ]
    }
  ]
}
```

### 3. Validar Tarea
```typescript
supabase.functions.invoke('master-coordinator-orchestrator', {
  body: {
    type: 'validate_task',
    agentId: 'growth',
    userId: 'user-uuid',
    payload: { taskId: 'task-uuid' }
  }
})
```

**Respuesta:**
```json
{
  "status": "success",
  "data": {
    "isValid": true,
    "message": "¡Increíble trabajo! Has completado todos los pasos con éxito.",
    "deliverable": {
      "id": "deliverable-task-123",
      "taskId": "task-uuid",
      "title": "Resumen: Organiza tu Catálogo",
      "description": "Aprendizajes y próximos pasos",
      "type": "report",
      "content": {
        "taskTitle": "Organiza tu Catálogo",
        "completedSteps": ["Define categorías", "Agrupa productos"],
        "keyLearnings": [
          "Organización facilita ventas",
          "Categorías claras mejoran UX"
        ],
        "nextRecommendations": [
          "Fotografía profesional de productos",
          "Agrega descripciones detalladas"
        ]
      },
      "createdAt": "2025-10-27T..."
    }
  }
}
```

## 🎯 Agentes Disponibles

- `growth` - Crecimiento y estrategia
- `pricing` - Precios y rentabilidad
- `brand` - Marca e identidad
- `digital-presence` - Presencia digital
- `inventory` - Inventario y productos
- `legal` - Legal y formalización

## 🔐 Seguridad

- Requiere autenticación JWT
- `LOVABLE_API_KEY` configurada automáticamente
- Fallbacks para errores de IA
- Validación de pasos en base de datos

## 📊 Analytics Integration

Todos los eventos del orchestrator se pueden trackear con:

```typescript
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

const { trackEvent } = useAnalyticsTracking();

// Track análisis
trackEvent('agent_analysis_completed', {
  agentId: 'growth',
  score: 75
});

// Track generación de tareas
trackEvent('tasks_generated', {
  agentId: 'inventory',
  taskCount: 3
});

// Track validación
trackEvent('task_validated', {
  taskId: 'task-uuid',
  isValid: true
});
```

## 🚨 Manejo de Errores

El orchestrator incluye fallbacks automáticos:

1. Si la IA falla en análisis → retorna análisis básico
2. Si la IA falla en generación → retorna tarea genérica
3. Si la IA falla en validación → retorna validación estándar

Logs detallados en Supabase Edge Function Logs.

## 📝 Próximos Pasos

1. Integrar en `NewMasterCoordinatorDashboard`
2. Usar en cards de agentes para análisis en tiempo real
3. Generar tareas automáticamente al activar un agente
4. Validar tareas cuando el usuario complete pasos
