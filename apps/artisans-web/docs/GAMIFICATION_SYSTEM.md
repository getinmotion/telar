# 🎮 Sistema de Gamificación - Guía Completa

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Base de Datos](#base-de-datos)
4. [Edge Functions](#edge-functions)
5. [Componentes Frontend](#componentes-frontend)
6. [Hooks y Estado](#hooks-y-estado)
7. [Flujo de Usuario](#flujo-de-usuario)
8. [Integración](#integración)

---

## Visión General

El sistema de gamificación transforma el proceso de crecimiento empresarial en una experiencia atractiva mediante:

- **Niveles y XP**: Sistema progresivo que recompensa acciones
- **Misiones Progresivas**: Tareas con pasos que desbloquean recompensas
- **Logros**: Insignias por hitos alcanzados
- **Rachas**: Incentivo para uso continuo
- **Entregables**: Output tangible de cada misión

### Objetivos

1. ✅ Aumentar engagement del usuario
2. ✅ Guiar el progreso paso a paso
3. ✅ Proveer feedback inmediato
4. ✅ Celebrar logros
5. ✅ Generar contenido valioso

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│  Components:                                                │
│  - ProgressiveMissionCard    → Tarjetas de misiones        │
│  - RewardsPanel              → Panel de progreso/logros     │
│  - DeliverableCard           → Entregables generados        │
│                                                             │
│  Hooks:                                                     │
│  - useUserProgress           → Estado de progreso           │
│  - useMasterCoordinator      → Gestión de tareas           │
├─────────────────────────────────────────────────────────────┤
│                    EDGE FUNCTIONS                           │
├─────────────────────────────────────────────────────────────┤
│  - update-user-progress      → Actualiza XP/niveles        │
│  - generate-deliverable      → Genera entregables IA       │
├─────────────────────────────────────────────────────────────┤
│                    DATABASE (Supabase)                      │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                    │
│  - user_progress             → Niveles, XP, rachas         │
│  - user_achievements         → Logros desbloqueados        │
│  - achievements_catalog      → Catálogo de logros          │
│  - agent_tasks               → Misiones activas            │
│  - task_steps                → Pasos de misiones           │
│  - agent_deliverables        → Entregables generados       │
└─────────────────────────────────────────────────────────────┘
```

---

## Base de Datos

### user_progress

Almacena el progreso del usuario.

```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  next_level_xp INTEGER DEFAULT 100,
  completed_missions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_time_spent INTEGER DEFAULT 0, -- minutos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos clave:**
- `level`: Nivel actual del usuario (1-5 inicialmente)
- `experience_points`: XP acumulado hacia siguiente nivel
- `next_level_xp`: XP requerido para subir de nivel
- `current_streak`: Días consecutivos de actividad
- `longest_streak`: Récord de racha del usuario

### user_achievements

Logros desbloqueados por el usuario.

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  achievement_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'trophy',
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

### achievements_catalog

Catálogo de todos los logros disponibles.

```sql
CREATE TABLE achievements_catalog (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'trophy',
  unlock_criteria JSONB NOT NULL,
  category TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);
```

**Ejemplo de unlock_criteria:**
```json
{
  "type": "missions_completed",
  "count": 10
}
```

**Tipos de criterios:**
- `missions_completed`: Completar N misiones
- `level_reached`: Alcanzar nivel N
- `streak_reached`: Mantener racha de N días
- `onboarding_complete`: Completar onboarding

---

## Edge Functions

### update-user-progress

**Ruta:** `supabase/functions/update-user-progress/index.ts`

**Propósito:** Actualiza el progreso del usuario y verifica logros automáticamente.

**Input:**
```typescript
{
  xpGained: number;          // XP a sumar
  missionCompleted: boolean; // Si se completó una misión
  timeSpent: number;         // Tiempo invertido (minutos)
}
```

**Output:**
```typescript
{
  success: boolean;
  data: {
    level: number;
    experiencePoints: number;
    nextLevelXP: number;
    leveledUp: boolean;
    levelsGained: number[];
    completedMissions: number;
    currentStreak: number;
    longestStreak: number;
    unlockedAchievements: Achievement[];
  }
}
```

**Lógica:**
1. Obtener progreso actual del usuario
2. Sumar XP ganado
3. Verificar si sube de nivel (loop para niveles múltiples)
4. Actualizar racha diaria (usando función SQL)
5. Incrementar contador de misiones si aplica
6. Verificar criterios de logros
7. Desbloquear logros nuevos
8. Retornar estado actualizado

**Cálculo de XP por nivel:**
```javascript
nextLevelXP = 100 * (1.5 ^ (level - 1))
```

Ejemplos:
- Nivel 1 → 2: 100 XP
- Nivel 2 → 3: 150 XP
- Nivel 3 → 4: 225 XP
- Nivel 4 → 5: 337 XP
- Nivel 5 → 6: 506 XP

### generate-deliverable

**Ruta:** `supabase/functions/generate-deliverable/index.ts`

**Propósito:** Genera entregables con contenido estructurado según el tipo de misión.

**Input:**
```typescript
{
  taskId: string;
  agentId: string;
  deliverableType: 'brand_report' | 'pricing_guide' | 
                   'growth_strategy' | 'inventory_analysis' | 
                   'market_research';
  contextData?: any;
}
```

**Output:**
```typescript
{
  success: boolean;
  data: {
    id: string;
    title: string;
    description: string;
    file_type: string;
    content: object;
    created_at: string;
  }
}
```

**Tipos de entregables:**

1. **brand_report**: Análisis de marca e identidad visual
2. **pricing_guide**: Estrategia de precios personalizada
3. **growth_strategy**: Plan de crecimiento a 90 días
4. **inventory_analysis**: Optimización de inventario
5. **market_research**: Investigación de mercado

**Contenido generado:**
- Secciones estructuradas con títulos
- Listas de recomendaciones accionables
- Análisis basado en datos del usuario
- Próximos pasos sugeridos

---

## Componentes Frontend

### ProgressiveMissionCard

**Ubicación:** `src/components/coordinator/ProgressiveMissionCard.tsx`

**Props:**
```typescript
interface ProgressiveMissionCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  steps: MissionStep[];
  progress: number; // 0-100
  estimatedTime: string;
  reward?: string;
  onStartStep: (stepId: string) => void;
  onCompleteStep: (stepId: string) => void;
  onStartMission: () => void;
  isExpanded?: boolean;
}
```

**Características:**
- ✅ Pasos progresivos con estados visuales
- ✅ Barra de progreso animada
- ✅ Badges de prioridad y categoría
- ✅ Animación de celebración al completar
- ✅ Colapsar/expandir detalles

### RewardsPanel

**Ubicación:** `src/components/coordinator/RewardsPanel.tsx`

**Props:**
```typescript
interface RewardsPanelProps {
  stats: UserStats;
  language?: 'es' | 'en';
}

interface UserStats {
  level: number;
  experiencePoints: number;
  nextLevelXP: number;
  completedMissions: number;
  totalMissions: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
}
```

**Secciones:**
1. **Nivel y XP**: Progreso hacia siguiente nivel
2. **Estadísticas**: Misiones, rachas, logros
3. **Logros**: Grid de insignias desbloqueadas/bloqueadas

### DeliverableCard

**Ubicación:** `src/components/coordinator/DeliverableCard.tsx`

**Props:**
```typescript
interface DeliverableCardProps {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'json' | 'report' | 'guide' | 'image';
  agentId: string;
  agentName: string;
  createdAt: Date;
  downloadUrl?: string;
  onDownload: (id: string) => void;
  onView?: (id: string) => void;
}
```

---

## Hooks y Estado

### useUserProgress

**Ubicación:** `src/hooks/useUserProgress.ts`

**API:**
```typescript
const {
  progress,              // UserProgress | null
  achievements,          // Achievement[] con estado locked/unlocked
  loading,               // boolean
  updating,              // boolean
  progressPercentage,    // number (0-100)
  updateProgress,        // (xp, missionCompleted, timeSpent) => Promise
  refreshProgress,       // () => Promise<void>
  refreshAchievements    // () => Promise<void>
} = useUserProgress();
```

**Uso básico:**
```typescript
// Completar una misión
await updateProgress(
  50,      // XP ganado
  true,    // Misión completada
  15       // 15 minutos invertidos
);

// El hook automáticamente:
// 1. Actualiza el estado local
// 2. Muestra toast si hay level up
// 3. Muestra toast por cada logro nuevo
// 4. Refresca la lista de logros
```

**Realtime:**
El hook se suscribe automáticamente a cambios en:
- `user_progress` (nivel, XP, rachas)
- `user_achievements` (logros desbloqueados)

---

## Flujo de Usuario

### 1. Inicio de Sesión
```
Usuario se registra/login
    ↓
Trigger: initialize_user_progress()
    ↓
Se crea registro en user_progress con valores iniciales
    ↓
useUserProgress() carga datos
    ↓
Dashboard muestra progreso inicial (Nivel 1, 0 XP)
```

### 2. Completar Misión
```
Usuario completa una misión
    ↓
Frontend llama updateProgress(xp, true, timeSpent)
    ↓
Edge Function: update-user-progress
    ├─ Suma XP
    ├─ Verifica level up
    ├─ Actualiza racha (función SQL)
    ├─ Incrementa contador misiones
    └─ Verifica y desbloquea logros
    ↓
Retorna nuevo estado
    ↓
useUserProgress actualiza estado local
    ↓
Muestra notificaciones (level up, logros)
    ↓
RewardsPanel se actualiza automáticamente (realtime)
```

### 3. Generar Entregable
```
Usuario completa todos los pasos de una misión
    ↓
Sistema verifica completion
    ↓
Frontend llama generate-deliverable
    ├─ Obtiene contexto del usuario
    ├─ Genera contenido estructurado
    └─ Guarda en agent_deliverables
    ↓
Entregable disponible para descarga
    ↓
DeliverableCard muestra el nuevo entregable
```

### 4. Desbloqueo de Logros
```
Evento del usuario (misión, nivel, racha)
    ↓
update-user-progress verifica criterios
    ↓
Para cada logro en achievements_catalog:
    ├─ Verifica si ya está desbloqueado
    ├─ Evalúa criterios (missions_completed, level_reached, etc.)
    └─ Si cumple: INSERT en user_achievements
    ↓
Retorna lista de logros nuevos
    ↓
Toast notification por cada logro
    ↓
RewardsPanel muestra nueva insignia
```

---

## Integración

### Paso 1: Importar en Dashboard

```typescript
import { useUserProgress } from '@/hooks/useUserProgress';
import { RewardsPanel } from '@/components/coordinator/RewardsPanel';
import { ProgressiveMissionCard } from '@/components/coordinator/ProgressiveMissionCard';

const Dashboard = () => {
  const { progress, achievements, updateProgress } = useUserProgress();
  
  // ... resto del componente
};
```

### Paso 2: Conectar con Misiones

```typescript
const handleCompleteMission = async (taskId: string) => {
  try {
    // 1. Marcar misión como completada en DB
    await supabase
      .from('agent_tasks')
      .update({ status: 'completed' })
      .eq('id', taskId);
    
    // 2. Actualizar progreso del usuario
    await updateProgress(
      50,    // XP según dificultad de la misión
      true,  // Misión completada
      30     // Tiempo estimado invertido
    );
    
    // 3. Generar entregable si aplica
    await supabase.functions.invoke('generate-deliverable', {
      body: {
        taskId,
        agentId: 'growth',
        deliverableType: 'growth_strategy'
      }
    });
  } catch (error) {
    console.error('Error completing mission:', error);
  }
};
```

### Paso 3: Renderizar Componentes

```tsx
<div className="dashboard-layout">
  {/* Panel de Recompensas */}
  <aside className="rewards-sidebar">
    {progress && (
      <RewardsPanel 
        stats={{
          level: progress.level,
          experiencePoints: progress.experiencePoints,
          nextLevelXP: progress.nextLevelXP,
          completedMissions: progress.completedMissions,
          totalMissions: 20, // Total de misiones disponibles
          currentStreak: progress.currentStreak,
          longestStreak: progress.longestStreak,
          achievements
        }}
        language="es"
      />
    )}
  </aside>

  {/* Lista de Misiones */}
  <main className="missions-grid">
    {missions.map(mission => (
      <ProgressiveMissionCard
        key={mission.id}
        {...mission}
        onStartStep={handleStartStep}
        onCompleteStep={handleCompleteStep}
        onStartMission={handleStartMission}
      />
    ))}
  </main>
</div>
```

---

## XP por Actividades

Valores sugeridos de XP:

| Actividad | XP Ganado |
|-----------|-----------|
| Completar onboarding | 100 XP |
| Completar misión fácil | 25 XP |
| Completar misión media | 50 XP |
| Completar misión difícil | 100 XP |
| Primer uso del día | 10 XP |
| Racha de 7 días | 50 XP bonus |
| Subir producto | 15 XP |
| Crear tienda | 75 XP |

---

## Personalización

### Añadir Nuevos Logros

```sql
INSERT INTO achievements_catalog (
  id, 
  title, 
  description, 
  icon, 
  unlock_criteria, 
  category, 
  display_order
) VALUES (
  'power_user',
  'Usuario Avanzado',
  'Completa 50 misiones',
  'crown',
  '{"type": "missions_completed", "count": 50}',
  'Misiones',
  10
);
```

### Modificar Fórmula de XP

Editar función en `update-user-progress/index.ts`:

```typescript
function calculateNextLevelXP(level: number): number {
  // Más fácil: return 100 * level;
  // Más difícil: return 100 * Math.pow(2, level - 1);
  return Math.floor(100 * Math.pow(1.5, level - 1));
}
```

---

## Troubleshooting

### Usuario no gana XP

1. Verificar autenticación: `user` debe estar definido
2. Revisar logs de edge function
3. Verificar RLS policies en `user_progress`

### Logros no se desbloquean

1. Verificar criterios en `achievements_catalog`
2. Revisar función `checkAndUnlockAchievements`
3. Ver logs: `console.log` en edge function

### Racha se reinicia incorrectamente

1. Verificar función SQL `update_user_streak`
2. Campo `last_activity_date` debe actualizarse correctamente

---

## Próximas Mejoras

- [ ] Leaderboards entre usuarios
- [ ] Sistema de recompensas (descuentos, features premium)
- [ ] Misiones diarias dinámicas
- [ ] Eventos especiales con XP doble
- [ ] Integración con notificaciones push
- [ ] Exportar estadísticas a PDF

---

**Documentación actualizada:** 27 de octubre, 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Sistema completo y funcional
