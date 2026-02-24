
-- Expandir la tabla agent_tasks con campos para seguimiento interno
ALTER TABLE public.agent_tasks 
ADD COLUMN IF NOT EXISTS subtasks jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS notes text DEFAULT '',
ADD COLUMN IF NOT EXISTS steps_completed jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS resources jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS time_spent integer DEFAULT 0; -- en minutos

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_agent_tasks_subtasks ON public.agent_tasks USING gin(subtasks);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_steps_completed ON public.agent_tasks USING gin(steps_completed);

-- Actualizar trigger para updated_at si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_agent_tasks_updated_at ON public.agent_tasks;
CREATE TRIGGER update_agent_tasks_updated_at
    BEFORE UPDATE ON public.agent_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
