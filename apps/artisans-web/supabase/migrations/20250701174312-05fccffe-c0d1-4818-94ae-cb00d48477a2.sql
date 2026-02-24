
-- Paso 1: Eliminar tareas duplicadas, manteniendo solo la más reciente de cada título por usuario
WITH RankedTasks AS (
    SELECT
        id,
        ROW_NUMBER() OVER(PARTITION BY user_id, title, agent_id ORDER BY created_at DESC) as rn
    FROM
        public.agent_tasks
    WHERE 
        user_id = 'a26938e6-000a-4f4f-bbdd-0dd867ac25b5'
        AND agent_id = 'cultural'
)
DELETE FROM public.agent_tasks
WHERE id IN (
    SELECT id
    FROM RankedTasks
    WHERE rn > 1
);

-- Paso 2: Actualizar el límite de tareas activas - agregar constraint para máximo 15 tareas activas por usuario
CREATE OR REPLACE FUNCTION check_active_tasks_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo verificar en INSERT y UPDATE que cambie el status a activo
    IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status IN ('pending', 'in_progress'))) THEN
        -- Contar tareas activas actuales del usuario
        IF (SELECT COUNT(*) 
            FROM agent_tasks 
            WHERE user_id = NEW.user_id 
            AND status IN ('pending', 'in_progress')
            AND (TG_OP = 'INSERT' OR id != NEW.id)
           ) >= 15 THEN
            RAISE EXCEPTION 'No puedes tener más de 15 tareas activas. Completa algunas tareas pendientes primero.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para verificar límite de tareas
DROP TRIGGER IF EXISTS check_active_tasks_limit_trigger ON agent_tasks;
CREATE TRIGGER check_active_tasks_limit_trigger
    BEFORE INSERT OR UPDATE ON agent_tasks
    FOR EACH ROW
    EXECUTE FUNCTION check_active_tasks_limit();
