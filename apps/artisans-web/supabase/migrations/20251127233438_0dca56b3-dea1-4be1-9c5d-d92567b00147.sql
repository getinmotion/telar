-- 1. Limpiar tareas duplicadas manteniendo la más reciente por (user_id, agent_id)
DELETE FROM agent_tasks 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, agent_id) id
  FROM agent_tasks
  WHERE agent_id IS NOT NULL
  ORDER BY user_id, agent_id, created_at DESC
);

-- 2. Agregar constraint único para prevenir futuros duplicados
ALTER TABLE agent_tasks 
ADD CONSTRAINT unique_user_agent_task 
UNIQUE (user_id, agent_id);

-- 3. Completar tareas RUT para usuarios que ya tienen RUT
UPDATE agent_tasks 
SET status = 'completed', 
    completed_at = NOW(), 
    progress_percentage = 100
WHERE agent_id = 'complete_rut' 
AND status != 'completed'
AND user_id IN (
  SELECT user_id FROM user_profiles 
  WHERE rut IS NOT NULL AND rut != '' AND rut_pendiente = false
);