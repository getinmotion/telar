-- =============================================
-- FASE 1: Eliminar tareas duplicadas correctamente
-- Mantiene la tarea más reciente o completada por cada (user_id, agent_id)
-- =============================================

-- Primero identificamos y eliminamos duplicados
WITH ranked_tasks AS (
  SELECT 
    id,
    user_id,
    agent_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, agent_id 
      ORDER BY 
        CASE WHEN status = 'completed' THEN 0 ELSE 1 END,
        completed_at DESC NULLS LAST,
        created_at DESC
    ) AS rn
  FROM agent_tasks
  WHERE agent_id IS NOT NULL AND agent_id != ''
)
DELETE FROM agent_tasks 
WHERE id IN (
  SELECT id FROM ranked_tasks WHERE rn > 1
);

-- =============================================
-- FASE 2: Agregar constraint único si no existe
-- =============================================

DO $$ 
BEGIN
  -- Verificar si el constraint ya existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_user_agent_task'
  ) THEN
    -- Agregar el constraint único
    ALTER TABLE agent_tasks 
    ADD CONSTRAINT unique_user_agent_task UNIQUE (user_id, agent_id);
    
    RAISE NOTICE 'Constraint unique_user_agent_task creado exitosamente';
  ELSE
    RAISE NOTICE 'Constraint unique_user_agent_task ya existe';
  END IF;
END $$;

-- =============================================
-- FASE 3: Completar tareas RUT de usuarios que ya tienen RUT
-- =============================================

UPDATE agent_tasks 
SET 
  status = 'completed',
  completed_at = COALESCE(completed_at, NOW()),
  progress_percentage = 100,
  updated_at = NOW()
WHERE agent_id = 'complete_rut' 
AND status != 'completed'
AND user_id IN (
  SELECT user_id 
  FROM user_profiles 
  WHERE rut IS NOT NULL 
    AND rut != '' 
    AND COALESCE(rut_pendiente, true) = false
);

-- =============================================
-- FASE 4: Completar tareas create_shop de usuarios con tienda
-- =============================================

UPDATE agent_tasks 
SET 
  status = 'completed',
  completed_at = COALESCE(completed_at, NOW()),
  progress_percentage = 100,
  updated_at = NOW()
WHERE agent_id = 'create_shop' 
AND status != 'completed'
AND user_id IN (
  SELECT user_id 
  FROM artisan_shops 
  WHERE creation_status = 'complete'
);

-- =============================================
-- FASE 5: Completar tareas brand de usuarios con logo
-- =============================================

UPDATE agent_tasks 
SET 
  status = 'completed',
  completed_at = COALESCE(completed_at, NOW()),
  progress_percentage = 100,
  updated_at = NOW()
WHERE agent_id = 'brand' 
AND status != 'completed'
AND user_id IN (
  SELECT user_id 
  FROM artisan_shops 
  WHERE logo_url IS NOT NULL AND logo_url != ''
);

-- =============================================
-- FASE 6: Completar tareas inventory de usuarios con productos
-- =============================================

UPDATE agent_tasks 
SET 
  status = 'completed',
  completed_at = COALESCE(completed_at, NOW()),
  progress_percentage = 100,
  updated_at = NOW()
WHERE agent_id = 'inventory' 
AND status != 'completed'
AND user_id IN (
  SELECT DISTINCT s.user_id 
  FROM artisan_shops s
  INNER JOIN products p ON p.shop_id = s.id
);