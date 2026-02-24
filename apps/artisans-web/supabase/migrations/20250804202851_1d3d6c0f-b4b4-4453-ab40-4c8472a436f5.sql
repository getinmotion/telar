-- Fase 1: Ampliar user_master_context para perfil de negocio inteligente
ALTER TABLE public.user_master_context 
ADD COLUMN IF NOT EXISTS business_profile jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS task_generation_context jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'es',
ADD COLUMN IF NOT EXISTS last_assessment_date timestamp with time zone DEFAULT now();

-- Actualizar la función de trigger para mantener versiones del contexto
CREATE OR REPLACE FUNCTION public.update_master_context_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.last_updated = now();
    NEW.context_version = OLD.context_version + 1;
    
    -- Si se actualiza business_profile o task_generation_context, actualizar last_assessment_date
    IF NEW.business_profile IS DISTINCT FROM OLD.business_profile 
    OR NEW.task_generation_context IS DISTINCT FROM OLD.task_generation_context THEN
        NEW.last_assessment_date = now();
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_master_context_assessment_date 
ON public.user_master_context(user_id, last_assessment_date DESC);

CREATE INDEX IF NOT EXISTS idx_user_master_context_language 
ON public.user_master_context(user_id, language_preference);

-- Crear tabla para historial de tareas generadas (para evitar duplicados)
CREATE TABLE IF NOT EXISTS public.task_generation_history (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    generation_source text NOT NULL, -- 'maturity_calculator', 'ai_recommendations', etc.
    generation_context jsonb DEFAULT '{}'::jsonb,
    tasks_created integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS para task_generation_history
ALTER TABLE public.task_generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own task generation history"
ON public.task_generation_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task generation history"
ON public.task_generation_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Índice para el historial
CREATE INDEX IF NOT EXISTS idx_task_generation_history_user_source 
ON public.task_generation_history(user_id, generation_source, created_at DESC);