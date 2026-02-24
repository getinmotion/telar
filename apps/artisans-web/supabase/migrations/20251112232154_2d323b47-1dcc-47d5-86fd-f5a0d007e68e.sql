-- FASE 3: Limpieza y mapeo de misiones con agentes no válidos
-- Esta migración reorganiza las tareas existentes para usar solo los 4 agentes funcionales

-- Paso 1: Mapear agentes legacy a agentes funcionales cuando sea posible

-- Mapear pricing → inventory (productos + precios)
UPDATE agent_tasks 
SET 
  agent_id = 'inventory',
  notes = CONCAT(
    COALESCE(notes, ''), 
    E'\n[MIGRADO: Originalmente asignado a pricing agent, remapeado a inventory el ',
    NOW()::date,
    ']'
  ),
  updated_at = NOW()
WHERE agent_id = 'pricing' 
AND status IN ('pending', 'in_progress')
AND is_archived = false;

-- Mapear cultural-consultant → brand (identidad de marca)
UPDATE agent_tasks 
SET 
  agent_id = 'brand',
  notes = CONCAT(
    COALESCE(notes, ''), 
    E'\n[MIGRADO: Originalmente asignado a cultural-consultant, remapeado a brand el ',
    NOW()::date,
    ']'
  ),
  updated_at = NOW()
WHERE agent_id = 'cultural-consultant' 
AND status IN ('pending', 'in_progress')
AND is_archived = false;

-- Mapear marketing-specialist → digital-presence (presencia online)
UPDATE agent_tasks 
SET 
  agent_id = 'digital-presence',
  notes = CONCAT(
    COALESCE(notes, ''), 
    E'\n[MIGRADO: Originalmente asignado a marketing-specialist, remapeado a digital-presence el ',
    NOW()::date,
    ']'
  ),
  updated_at = NOW()
WHERE agent_id = 'marketing-specialist' 
AND status IN ('pending', 'in_progress')
AND is_archived = false;

-- Mapear personal-brand-eval → brand (evaluación de marca)
UPDATE agent_tasks 
SET 
  agent_id = 'brand',
  notes = CONCAT(
    COALESCE(notes, ''), 
    E'\n[MIGRADO: Originalmente asignado a personal-brand-eval, remapeado a brand el ',
    NOW()::date,
    ']'
  ),
  updated_at = NOW()
WHERE agent_id = 'personal-brand-eval' 
AND status IN ('pending', 'in_progress')
AND is_archived = false;

-- Paso 2: Cancelar tareas con agentes que no se pueden mapear

-- Cancelar tareas de agentes legales (requiere desarrollo específico)
UPDATE agent_tasks 
SET 
  status = 'cancelled',
  notes = CONCAT(
    COALESCE(notes, ''), 
    E'\n[AUTO-CANCELADO: Agente legal no disponible. Requiere implementación específica. Cancelado el ',
    NOW()::date,
    ']'
  ),
  updated_at = NOW()
WHERE agent_id = 'legal' 
AND status IN ('pending', 'in_progress')
AND is_archived = false;

-- Cancelar tareas de financial-management (requiere desarrollo específico)
UPDATE agent_tasks 
SET 
  status = 'cancelled',
  notes = CONCAT(
    COALESCE(notes, ''), 
    E'\n[AUTO-CANCELADO: Agente financiero no disponible. Requiere implementación específica. Cancelado el ',
    NOW()::date,
    ']'
  ),
  updated_at = NOW()
WHERE agent_id = 'financial-management' 
AND status IN ('pending', 'in_progress')
AND is_archived = false;

-- Cancelar tareas de operations-specialist
UPDATE agent_tasks 
SET 
  status = 'cancelled',
  notes = CONCAT(
    COALESCE(notes, ''), 
    E'\n[AUTO-CANCELADO: Agente de operaciones no disponible. Requiere implementación específica. Cancelado el ',
    NOW()::date,
    ']'
  ),
  updated_at = NOW()
WHERE agent_id = 'operations-specialist' 
AND status IN ('pending', 'in_progress')
AND is_archived = false;

-- Cancelar tareas de business-intelligence
UPDATE agent_tasks 
SET 
  status = 'cancelled',
  notes = CONCAT(
    COALESCE(notes, ''), 
    E'\n[AUTO-CANCELADO: Agente de inteligencia de negocios no disponible. Requiere implementación específica. Cancelado el ',
    NOW()::date,
    ']'
  ),
  updated_at = NOW()
WHERE agent_id = 'business-intelligence' 
AND status IN ('pending', 'in_progress')
AND is_archived = false;

-- Cancelar tareas de expansion-specialist
UPDATE agent_tasks 
SET 
  status = 'cancelled',
  notes = CONCAT(
    COALESCE(notes, ''), 
    E'\n[AUTO-CANCELADO: Agente de expansión no disponible. Requiere implementación específica. Cancelado el ',
    NOW()::date,
    ']'
  ),
  updated_at = NOW()
WHERE agent_id = 'expansion-specialist' 
AND status IN ('pending', 'in_progress')
AND is_archived = false;

-- Cancelar cualquier otro agente no mapeado
UPDATE agent_tasks 
SET 
  status = 'cancelled',
  notes = CONCAT(
    COALESCE(notes, ''), 
    E'\n[AUTO-CANCELADO: Agente "', agent_id, E'" no disponible. Cancelado el ',
    NOW()::date,
    ']'
  ),
  updated_at = NOW()
WHERE agent_id NOT IN ('growth', 'inventory', 'digital-presence', 'brand')
AND status IN ('pending', 'in_progress')
AND is_archived = false;

-- Paso 3: Archivar automáticamente todas las tareas canceladas antiguas (más de 30 días)
UPDATE agent_tasks 
SET 
  is_archived = true,
  updated_at = NOW()
WHERE status = 'cancelled' 
AND created_at < NOW() - INTERVAL '30 days'
AND is_archived = false;

-- Crear comentario con estadísticas de la migración
COMMENT ON TABLE agent_tasks IS 'Tabla de tareas de agentes. FASE 3 ejecutada: Solo agentes funcionales (growth, inventory, digital-presence, brand) pueden generar nuevas tareas. Tareas legacy mapeadas o canceladas automáticamente.';