-- ============================================
-- SISTEMA DE ENTORNOS VIRTUALES (STAGING + PRODUCTION)
-- Preparado para migración futura a proyectos separados
-- ============================================

-- 1. Crear enum para roles de entorno
CREATE TYPE environment_role AS ENUM ('admin', 'developer', 'viewer', 'user');

-- 2. Tabla de configuración de entornos
CREATE TABLE IF NOT EXISTS public.environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE CHECK (name IN ('production', 'staging')),
  display_name TEXT NOT NULL,
  color_scheme JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabla de acceso de usuarios por entorno
CREATE TABLE IF NOT EXISTS public.user_environment_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  environment TEXT NOT NULL CHECK (environment IN ('production', 'staging')),
  role environment_role NOT NULL,
  granted_by UUID REFERENCES public.admin_users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, environment)
);

-- 4. Agregar columna environment a todas las tablas relevantes
ALTER TABLE public.agent_tasks 
  ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'production' 
  CHECK (environment IN ('production', 'staging'));

ALTER TABLE public.agent_conversations 
  ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'production'
  CHECK (environment IN ('production', 'staging'));

ALTER TABLE public.agent_messages
  ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'production'
  CHECK (environment IN ('production', 'staging'));

ALTER TABLE public.agent_deliverables
  ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'production'
  CHECK (environment IN ('production', 'staging'));

ALTER TABLE public.user_master_context
  ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'production'
  CHECK (environment IN ('production', 'staging'));

ALTER TABLE public.task_generation_history
  ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'production'
  CHECK (environment IN ('production', 'staging'));

ALTER TABLE public.agent_usage_metrics
  ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'production'
  CHECK (environment IN ('production', 'staging'));

ALTER TABLE public.task_steps
  ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'production'
  CHECK (environment IN ('production', 'staging'));

ALTER TABLE public.step_validations
  ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'production'
  CHECK (environment IN ('production', 'staging'));

-- 5. Tabla de snapshots para backup pre-promoción
CREATE TABLE IF NOT EXISTS public.environment_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment TEXT NOT NULL CHECK (environment IN ('production', 'staging')),
  snapshot_data JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  restored_at TIMESTAMPTZ,
  description TEXT
);

-- 6. Tabla de log de actividad por entorno
CREATE TABLE IF NOT EXISTS public.environment_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment TEXT NOT NULL CHECK (environment IN ('production', 'staging')),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Función para verificar acceso a entorno (Security Definer)
CREATE OR REPLACE FUNCTION public.has_environment_access(
  _user_id UUID,
  _environment TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_environment_access
    WHERE user_id = _user_id
      AND environment = _environment
  )
  OR EXISTS (
    -- Los admins tienen acceso automático a todos los entornos
    SELECT 1
    FROM public.admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = _user_id)
      AND is_active = true
  );
$$;

-- 8. Función para obtener el entorno del usuario (retorna 'production' por defecto)
CREATE OR REPLACE FUNCTION public.get_user_environment(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT environment 
      FROM public.user_environment_access 
      WHERE user_id = _user_id 
      ORDER BY granted_at DESC 
      LIMIT 1
    ),
    'production'
  );
$$;

-- 9. Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_agent_tasks_environment ON public.agent_tasks(environment, user_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_environment ON public.agent_conversations(environment, user_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_environment ON public.agent_messages(environment);
CREATE INDEX IF NOT EXISTS idx_agent_deliverables_environment ON public.agent_deliverables(environment, user_id);
CREATE INDEX IF NOT EXISTS idx_user_master_context_environment ON public.user_master_context(environment, user_id);
CREATE INDEX IF NOT EXISTS idx_task_generation_history_environment ON public.task_generation_history(environment, user_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_metrics_environment ON public.agent_usage_metrics(environment, user_id);
CREATE INDEX IF NOT EXISTS idx_user_environment_access_user ON public.user_environment_access(user_id, environment);

-- 10. RLS Policies para environments
ALTER TABLE public.environments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede ver entornos activos"
ON public.environments FOR SELECT
USING (is_active = true);

CREATE POLICY "Solo admins pueden modificar entornos"
ON public.environments FOR ALL
USING (public.check_admin_access())
WITH CHECK (public.check_admin_access());

-- 11. RLS Policies para user_environment_access
ALTER TABLE public.user_environment_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su propio acceso"
ON public.user_environment_access FOR SELECT
USING (auth.uid() = user_id OR public.check_admin_access());

CREATE POLICY "Solo admins pueden gestionar accesos"
ON public.user_environment_access FOR ALL
USING (public.check_admin_access())
WITH CHECK (public.check_admin_access());

-- 12. Actualizar RLS policies existentes para filtrar por entorno
-- agent_tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON public.agent_tasks;
CREATE POLICY "Users can view tasks in their environment"
ON public.agent_tasks FOR SELECT
USING (
  auth.uid() = user_id 
  AND (
    environment = 'production' 
    OR public.has_environment_access(auth.uid(), environment)
  )
);

DROP POLICY IF EXISTS "Users can create their own tasks" ON public.agent_tasks;
CREATE POLICY "Users can create tasks in their environment"
ON public.agent_tasks FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND (
    environment = 'production'
    OR public.has_environment_access(auth.uid(), environment)
  )
);

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.agent_tasks;
CREATE POLICY "Users can update tasks in their environment"
ON public.agent_tasks FOR UPDATE
USING (
  auth.uid() = user_id
  AND (
    environment = 'production'
    OR public.has_environment_access(auth.uid(), environment)
  )
);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.agent_tasks;
CREATE POLICY "Users can delete tasks in their environment"
ON public.agent_tasks FOR DELETE
USING (
  auth.uid() = user_id
  AND (
    environment = 'production'
    OR public.has_environment_access(auth.uid(), environment)
  )
);

-- agent_conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON public.agent_conversations;
CREATE POLICY "Users can view conversations in their environment"
ON public.agent_conversations FOR SELECT
USING (
  auth.uid() = user_id
  AND (
    environment = 'production'
    OR public.has_environment_access(auth.uid(), environment)
  )
);

DROP POLICY IF EXISTS "Users can create their own conversations" ON public.agent_conversations;
CREATE POLICY "Users can create conversations in their environment"
ON public.agent_conversations FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    environment = 'production'
    OR public.has_environment_access(auth.uid(), environment)
  )
);

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.agent_conversations;
CREATE POLICY "Users can update conversations in their environment"
ON public.agent_conversations FOR UPDATE
USING (
  auth.uid() = user_id
  AND (
    environment = 'production'
    OR public.has_environment_access(auth.uid(), environment)
  )
);

DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.agent_conversations;
CREATE POLICY "Users can delete conversations in their environment"
ON public.agent_conversations FOR DELETE
USING (
  auth.uid() = user_id
  AND (
    environment = 'production'
    OR public.has_environment_access(auth.uid(), environment)
  )
);

-- agent_messages (a través de conversaciones)
DROP POLICY IF EXISTS "Users can view messages from own conversations" ON public.agent_messages;
CREATE POLICY "Users can view messages in their environment"
ON public.agent_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.agent_conversations
    WHERE agent_conversations.id = agent_messages.conversation_id
      AND agent_conversations.user_id = auth.uid()
      AND (
        agent_conversations.environment = 'production'
        OR public.has_environment_access(auth.uid(), agent_conversations.environment)
      )
  )
);

DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.agent_messages;
CREATE POLICY "Users can create messages in their environment"
ON public.agent_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.agent_conversations
    WHERE agent_conversations.id = agent_messages.conversation_id
      AND agent_conversations.user_id = auth.uid()
      AND (
        agent_conversations.environment = 'production'
        OR public.has_environment_access(auth.uid(), agent_conversations.environment)
      )
  )
);

-- agent_deliverables
DROP POLICY IF EXISTS "Users can view own deliverables" ON public.agent_deliverables;
CREATE POLICY "Users can view deliverables in their environment"
ON public.agent_deliverables FOR SELECT
USING (
  auth.uid() = user_id
  AND (
    environment = 'production'
    OR public.has_environment_access(auth.uid(), environment)
  )
);

DROP POLICY IF EXISTS "Users can create their own deliverables" ON public.agent_deliverables;
CREATE POLICY "Users can create deliverables in their environment"
ON public.agent_deliverables FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    environment = 'production'
    OR public.has_environment_access(auth.uid(), environment)
  )
);

DROP POLICY IF EXISTS "Users can update their own deliverables" ON public.agent_deliverables;
CREATE POLICY "Users can update deliverables in their environment"
ON public.agent_deliverables FOR UPDATE
USING (
  auth.uid() = user_id
  AND (
    environment = 'production'
    OR public.has_environment_access(auth.uid(), environment)
  )
);

DROP POLICY IF EXISTS "Users can delete their own deliverables" ON public.agent_deliverables;
CREATE POLICY "Users can delete deliverables in their environment"
ON public.agent_deliverables FOR DELETE
USING (
  auth.uid() = user_id
  AND (
    environment = 'production'
    OR public.has_environment_access(auth.uid(), environment)
  )
);

-- user_master_context
DROP POLICY IF EXISTS "Users can view their own master context" ON public.user_master_context;
CREATE POLICY "Users can view master context in their environment"
ON public.user_master_context FOR SELECT
USING (
  auth.uid() = user_id
  AND (
    environment = 'production'
    OR public.has_environment_access(auth.uid(), environment)
  )
);

DROP POLICY IF EXISTS "Users can insert their own master context" ON public.user_master_context;
CREATE POLICY "Users can insert master context in their environment"
ON public.user_master_context FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    environment = 'production'
    OR public.has_environment_access(auth.uid(), environment)
  )
);

DROP POLICY IF EXISTS "Users can update their own master context" ON public.user_master_context;
CREATE POLICY "Users can update master context in their environment"
ON public.user_master_context FOR UPDATE
USING (
  auth.uid() = user_id
  AND (
    environment = 'production'
    OR public.has_environment_access(auth.uid(), environment)
  )
);

-- 13. RLS para snapshots y activity logs
ALTER TABLE public.environment_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo admins pueden ver snapshots"
ON public.environment_snapshots FOR SELECT
USING (public.check_admin_access());

CREATE POLICY "Solo admins pueden crear snapshots"
ON public.environment_snapshots FOR INSERT
WITH CHECK (public.check_admin_access());

ALTER TABLE public.environment_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven logs de sus entornos"
ON public.environment_activity_log FOR SELECT
USING (
  auth.uid() = user_id
  OR public.check_admin_access()
);

CREATE POLICY "Sistema puede insertar logs"
ON public.environment_activity_log FOR INSERT
WITH CHECK (true);

-- 14. Insertar entornos por defecto
INSERT INTO public.environments (name, display_name, color_scheme, config)
VALUES 
  (
    'production',
    'Producción',
    '{"header": "hsl(142, 76%, 36%)", "badge": "🚀 PRODUCTION", "watermark": false}'::jsonb,
    '{"logsEnabled": false, "debugTools": false, "autoBackup": true}'::jsonb
  ),
  (
    'staging',
    'Ensayos',
    '{"header": "hsl(271, 76%, 53%)", "badge": "🧪 STAGING", "watermark": true}'::jsonb,
    '{"logsEnabled": true, "debugTools": true, "autoBackup": true, "autoRefresh": "7d"}'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

-- 15. Dar acceso automático a staging a todos los admins actuales
INSERT INTO public.user_environment_access (user_id, environment, role)
SELECT 
  au.id,
  'staging',
  'admin'::environment_role
FROM auth.users au
INNER JOIN public.admin_users adu ON adu.email = au.email
WHERE adu.is_active = true
ON CONFLICT (user_id, environment) DO NOTHING;

-- Todos los usuarios tienen acceso implícito a production (manejado por la función has_environment_access)

-- 16. Trigger para actualizar updated_at en environments
CREATE OR REPLACE FUNCTION public.update_environments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_environments_timestamp
BEFORE UPDATE ON public.environments
FOR EACH ROW
EXECUTE FUNCTION public.update_environments_updated_at();