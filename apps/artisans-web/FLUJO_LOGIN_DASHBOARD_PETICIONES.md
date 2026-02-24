# 🔍 Análisis: Peticiones a Supabase en el Flujo Login → Dashboard

## 📌 Resumen Ejecutivo

Este documento detalla **todas las peticiones a Supabase** que se ejecutan cuando un usuario hace login y es redirigido al Dashboard.

---

## 🔄 Flujo Completo

```
1. Usuario hace LOGIN en Login.tsx
   ↓
2. Backend NestJS autentica (✅ Ya migrado)
   ↓
3. Frontend guarda token y usuario en localStorage (✅ Ya migrado)
   ↓
4. Función getUserRedirectPath() consulta Supabase ⚠️
   ↓
5. Usuario es redirigido a /dashboard
   ↓
6. DashboardHome.tsx se carga
   ↓
7. NewMasterCoordinatorDashboard se renderiza
   ↓
8. MÚLTIPLES HOOKS hacen peticiones a Supabase ⚠️
```

---

## 📍 FASE 1: Login.tsx - getUserRedirectPath()

### Ubicación
**Archivo:** `src/pages/auth/Login.tsx`  
**Líneas:** 17-47

### Peticiones

#### 1️⃣ Obtener `user_master_context`
```typescript
const { data: context } = await supabase
  .from('user_master_context')
  .select('task_generation_context')
  .eq('user_id', userId)
  .maybeSingle();
```

**Propósito:** Verificar si el usuario completó el test de madurez  
**Tabla:** `user_master_context`  
**Columnas:** `task_generation_context`  
**Filtro:** `user_id = userId`

---

#### 2️⃣ Obtener tienda del usuario
```typescript
const { data: shop } = await supabase
  .from('artisan_shops')
  .select('id, creation_status, creation_step')
  .eq('user_id', userId)
  .maybeSingle();
```

**Propósito:** Verificar si el usuario tiene tienda y su estado  
**Tabla:** `artisan_shops`  
**Columnas:** `id`, `creation_status`, `creation_step`  
**Filtro:** `user_id = userId`

**Lógica de Redirección:**
- Si tiene `maturityScores` o tienda → `/dashboard`
- Si tienda incompleta → `/dashboard/create-shop`
- Usuario nuevo sin progreso → `/maturity-calculator?mode=onboarding`

---

## 📍 FASE 2: DashboardHome.tsx

### Ubicación
**Archivo:** `src/pages/DashboardHome.tsx`

### Hooks que se Ejecutan
1. `useAutoTaskCompletion()` ⚠️ **Hace 4-5 peticiones a Supabase**
2. `useTaskReconciliation()` ⚠️ **Hace 3-4 peticiones a Supabase**
3. `useAnalyticsTracking()` → `trackPageView()` ⚠️ **Hace 1 petición + 1 Edge Function**

---

## 📍 FASE 3: useAutoTaskCompletion Hook

### Ubicación
**Archivo:** `src/hooks/useAutoTaskCompletion.ts`

### Se Ejecuta
- ✅ **Inmediatamente** al cargar el dashboard
- ✅ **Cada 30 segundos** en un intervalo

### Peticiones

#### 1️⃣ Obtener tareas pendientes
```typescript
const { data: tasks, error: tasksError } = await supabase
  .from('agent_tasks')
  .select('id, title, description, agent_id, status, progress_percentage')
  .eq('user_id', user.id)
  .in('status', ['pending', 'in_progress']);
```

**Tabla:** `agent_tasks`  
**Columnas:** `id`, `title`, `description`, `agent_id`, `status`, `progress_percentage`  
**Filtro:** `user_id = userId` AND `status IN ('pending', 'in_progress')`

---

#### 2️⃣ Obtener tienda del usuario
```typescript
const { data: shop, error: shopError } = await supabase
  .from('artisan_shops')
  .select('id, logo_url, hero_config, story, about_content, social_links, contact_info')
  .eq('user_id', user.id)
  .maybeSingle();
```

**Tabla:** `artisan_shops`  
**Columnas:** `id`, `logo_url`, `hero_config`, `story`, `about_content`, `social_links`, `contact_info`  
**Filtro:** `user_id = userId`

---

#### 3️⃣ Contar productos de la tienda
```typescript
const { count, error: productsError } = await supabase
  .from('products')
  .select('id', { count: 'exact', head: true })
  .eq('shop_id', shop.id);
```

**Tabla:** `products`  
**Columnas:** `id` (solo para contar)  
**Filtro:** `shop_id = shop.id`  
**Tipo:** Consulta COUNT (no devuelve datos, solo número)

---

#### 4️⃣ Obtener perfil del usuario (RUT)
```typescript
const { data: profile } = await supabase
  .from('user_profiles')
  .select('rut, rut_pendiente')
  .eq('user_id', user.id)
  .maybeSingle();
```

**Tabla:** `user_profiles`  
**Columnas:** `rut`, `rut_pendiente`  
**Filtro:** `user_id = userId`

---

#### 5️⃣ Actualizar tareas completadas (si aplica)
```typescript
// Para cada tarea que cumple condiciones
await markTaskAsCompleted(task.id, user.id);
```

**Función:** `markTaskAsCompleted()` (en `taskCompletionHelpers.ts`)  
**Operación:** UPDATE en `agent_tasks` + INSERT en `user_activity_log`

---

## 📍 FASE 4: useTaskReconciliation Hook

### Ubicación
**Archivo:** `src/hooks/useTaskReconciliation.ts`

### Se Ejecuta
- ✅ **Una vez** al cargar el dashboard (no se repite)

### Peticiones

#### 1️⃣ Obtener tienda del usuario
```typescript
const { data: shop } = await supabase
  .from('artisan_shops')
  .select('id, logo_url, hero_config, story, about_content, social_links, contact_info')
  .eq('user_id', user.id)
  .maybeSingle();
```

**Tabla:** `artisan_shops`  
**Columnas:** (mismas que useAutoTaskCompletion)

---

#### 2️⃣ Obtener perfil del usuario
```typescript
const { data: profile } = await supabase
  .from('user_profiles')
  .select('rut, rut_pendiente')
  .eq('user_id', user.id)
  .maybeSingle();
```

**Tabla:** `user_profiles`  
**Columnas:** (mismas que useAutoTaskCompletion)

---

#### 3️⃣ Contar productos
```typescript
const { count } = await supabase
  .from('products')
  .select('id', { count: 'exact', head: true })
  .eq('shop_id', shop.id);
```

**Tabla:** `products` (igual que useAutoTaskCompletion)

---

#### 4️⃣ Obtener tareas pendientes/en progreso
```typescript
const { data: tasks } = await supabase
  .from('agent_tasks')
  .select('id, title, description, status')
  .eq('user_id', user.id)
  .in('status', ['pending', 'in_progress']);
```

**Tabla:** `agent_tasks` (similar a useAutoTaskCompletion)

---

#### 5️⃣ Completar tareas (si aplica)
```typescript
await markTaskAsCompleted(task.id, user.id);
```

---

## 📍 FASE 5: useAnalyticsTracking Hook

### Ubicación
**Archivo:** `src/hooks/useAnalyticsTracking.ts`

### Peticiones

#### 1️⃣ Obtener nivel de madurez del usuario
```typescript
const { data: maturityData } = await supabase
  .from('user_maturity_scores')
  .select('idea_validation, user_experience, market_fit, monetization')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();
```

**Tabla:** `user_maturity_scores`  
**Columnas:** `idea_validation`, `user_experience`, `market_fit`, `monetization`  
**Filtro:** `user_id = userId`  
**Orden:** `created_at DESC`  
**Límite:** 1 registro (el más reciente)

---

#### 2️⃣ Invocar Edge Function para analytics
```typescript
const { error } = await supabase.functions.invoke('log-analytics', {
  body: {
    event_type: eventType,
    event_data: { ... },
    session_id: `session_${Date.now()}`,
    success,
    duration_ms: ...
  }
});
```

**Tipo:** Edge Function (serverless)  
**Función:** `log-analytics`  
**Propósito:** Registrar evento de vista de página

---

## 📍 FASE 6: NewMasterCoordinatorDashboard

### Ubicación
**Archivo:** `src/components/coordinator/NewMasterCoordinatorDashboard.tsx`

### Hooks Adicionales (probablemente hacen más peticiones)

```typescript
const { context } = useUnifiedUserData();           // ⚠️ Probablemente consulta Supabase
const { masterState, syncAll } = useMasterAgent();  // ⚠️ Probablemente consulta Supabase
const { progress } = useUserProgress();             // ⚠️ Probablemente consulta Supabase
const { unifiedProgress } = useUnifiedProgress();   // ⚠️ Probablemente consulta Supabase
```

**Necesitaría analizar cada uno para ver qué consultas hacen.**

---

## 📊 RESUMEN DE PETICIONES

### Total de Peticiones a Supabase (mínimo)

| Hook/Componente | Peticiones | Tablas Consultadas |
|----------------|------------|-------------------|
| **Login.tsx** (getUserRedirectPath) | 2 | `user_master_context`, `artisan_shops` |
| **useAutoTaskCompletion** | 4-5 | `agent_tasks`, `artisan_shops`, `products`, `user_profiles` |
| **useTaskReconciliation** | 4 | `artisan_shops`, `user_profiles`, `products`, `agent_tasks` |
| **useAnalyticsTracking** | 2 | `user_maturity_scores`, Edge Function |
| **NewMasterCoordinatorDashboard** | ? | Múltiples (requiere análisis) |
| **TOTAL MÍNIMO** | **12-13** | |

---

## 🔴 PETICIONES DUPLICADAS

### ⚠️ Problema de Eficiencia

Observa que **múltiples hooks** consultan las **mismas tablas**:

| Tabla | Consultada por |
|-------|----------------|
| `artisan_shops` | `getUserRedirectPath()`, `useAutoTaskCompletion()`, `useTaskReconciliation()` |
| `products` | `useAutoTaskCompletion()`, `useTaskReconciliation()` |
| `user_profiles` | `useAutoTaskCompletion()`, `useTaskReconciliation()` |
| `agent_tasks` | `useAutoTaskCompletion()`, `useTaskReconciliation()` |

**Esto significa que se están haciendo peticiones duplicadas a Supabase.**

---

## 🎯 RECOMENDACIONES PARA MIGRACIÓN

### 1. **Crear Endpoint Único de "Dashboard Data"**

En lugar de múltiples consultas, crear un endpoint en NestJS:

```typescript
GET /telar/server/users/:userId/dashboard-data
Authorization: Bearer {token}

Response:
{
  "user": { ... },
  "context": { ... },
  "shop": {
    "id": "...",
    "logo_url": "...",
    "hero_config": { ... },
    "product_count": 5,
    "creation_status": "complete"
  },
  "profile": {
    "rut": "...",
    "rut_pendiente": false
  },
  "tasks": {
    "pending": [...],
    "in_progress": [...],
    "completed_count": 10
  },
  "maturity": {
    "scores": { ... },
    "level": "intermediate"
  },
  "analytics": {
    "last_login": "...",
    "session_count": 5
  }
}
```

**Ventajas:**
- ✅ **1 sola petición** en lugar de 12+
- ✅ Más rápido (menos latencia)
- ✅ Más eficiente (menos queries a BD)
- ✅ Datos consistentes (mismo momento)
- ✅ Más fácil de cachear

---

### 2. **Migrar Hooks Progresivamente**

#### Prioridad 1 (Críticos)
1. `getUserRedirectPath()` en Login.tsx
2. `useUnifiedUserData()` → Cambiar a NestJS
3. `useUserProgress()` → Cambiar a NestJS

#### Prioridad 2 (Importantes)
4. `useAutoTaskCompletion()` → Lógica al backend
5. `useTaskReconciliation()` → Lógica al backend
6. `useAnalyticsTracking()` → Migrar a NestJS

---

### 3. **Estructura Recomendada**

```
📁 Frontend
  ├── hooks/
  │   ├── useAuth.ts (✅ ya migrado)
  │   ├── useDashboardData.ts (nuevo - llamar a NestJS)
  │   └── useUserContext.ts (nuevo - llamar a NestJS)
  
📁 Backend NestJS
  ├── modules/
  │   ├── dashboard/
  │   │   ├── dashboard.controller.ts
  │   │   ├── dashboard.service.ts
  │   │   └── dto/dashboard-data.dto.ts
  │   ├── tasks/
  │   │   ├── tasks.controller.ts
  │   │   └── tasks.service.ts (lógica de auto-complete)
  │   └── analytics/
  │       ├── analytics.controller.ts
  │       └── analytics.service.ts
```

---

## 🚨 RIESGOS DE LA MIGRACIÓN

### ⚠️ Cuidado con:

1. **Supabase Realtime**: Si algún componente usa suscripciones a cambios en tiempo real
2. **RLS (Row Level Security)**: Asegurarse de replicar permisos en NestJS
3. **Edge Functions**: Migrar lógica a NestJS o mantener híbrido
4. **Joins complejos**: Supabase hace joins automáticos que NestJS debe replicar

---

## ✅ CHECKLIST DE MIGRACIÓN

- [ ] Analizar hooks adicionales en `NewMasterCoordinatorDashboard`
- [ ] Crear endpoint `/users/:userId/dashboard-data` en NestJS
- [ ] Migrar `getUserRedirectPath()` a usar NestJS
- [ ] Crear hook `useDashboardData()` que llame al nuevo endpoint
- [ ] Migrar lógica de `useAutoTaskCompletion` al backend
- [ ] Migrar lógica de `useTaskReconciliation` al backend
- [ ] Migrar analytics a NestJS
- [ ] Probar flujo completo Login → Dashboard
- [ ] Optimizar rendimiento
- [ ] Documentar cambios

---

## 📝 NOTAS FINALES

Este análisis muestra que **el flujo de login → dashboard hace al menos 12-13 peticiones a Supabase**, muchas de ellas duplicadas.

La migración a NestJS debería:
1. ✅ Consolidar peticiones en un endpoint único
2. ✅ Eliminar duplicación
3. ✅ Mejorar performance
4. ✅ Facilitar mantenimiento

**¿Siguiente paso?**  
Analizar los hooks adicionales que faltan y crear el endpoint consolidado de dashboard.

---

**Autor:** Análisis del Sistema GetInMotion  
**Fecha:** 20 de Enero, 2026  
**Versión:** 1.0

