-- Eliminar sistema de ambientes completo

-- 1. Primero eliminar todas las políticas RLS que dependen de las columnas environment
DROP POLICY IF EXISTS "Users can view deliverables in their environment" ON agent_deliverables;
DROP POLICY IF EXISTS "Users can create deliverables in their environment" ON agent_deliverables;
DROP POLICY IF EXISTS "Users can update deliverables in their environment" ON agent_deliverables;
DROP POLICY IF EXISTS "Users can delete deliverables in their environment" ON agent_deliverables;

DROP POLICY IF EXISTS "Users can view master context in their environment" ON user_master_context;
DROP POLICY IF EXISTS "Users can insert master context in their environment" ON user_master_context;
DROP POLICY IF EXISTS "Users can update master context in their environment" ON user_master_context;

DROP POLICY IF EXISTS "Users can view messages in their environment" ON agent_messages;
DROP POLICY IF EXISTS "Users can create messages in their environment" ON agent_messages;

DROP POLICY IF EXISTS "Users can view conversations in their environment" ON agent_conversations;
DROP POLICY IF EXISTS "Users can create conversations in their environment" ON agent_conversations;
DROP POLICY IF EXISTS "Users can update conversations in their environment" ON agent_conversations;
DROP POLICY IF EXISTS "Users can delete conversations in their environment" ON agent_conversations;

-- 2. Eliminar columnas environment de tablas
ALTER TABLE agent_deliverables DROP COLUMN IF EXISTS environment CASCADE;
ALTER TABLE user_master_context DROP COLUMN IF EXISTS environment CASCADE;
ALTER TABLE agent_messages DROP COLUMN IF EXISTS environment CASCADE;
ALTER TABLE agent_conversations DROP COLUMN IF EXISTS environment CASCADE;
ALTER TABLE task_generation_history DROP COLUMN IF EXISTS environment CASCADE;
ALTER TABLE task_steps DROP COLUMN IF EXISTS environment CASCADE;
ALTER TABLE step_validations DROP COLUMN IF EXISTS environment CASCADE;
ALTER TABLE agent_usage_metrics DROP COLUMN IF EXISTS environment CASCADE;

-- 3. Eliminar tablas relacionadas con ambientes
DROP TABLE IF EXISTS environment_activity_log CASCADE;
DROP TABLE IF EXISTS user_environment_access CASCADE;
DROP TABLE IF EXISTS environment_snapshots CASCADE;
DROP TABLE IF EXISTS environments CASCADE;

-- 4. Eliminar tipo de enum relacionado
DROP TYPE IF EXISTS environment_role CASCADE;

-- 5. Eliminar funciones relacionadas con ambientes
DROP FUNCTION IF EXISTS has_environment_access(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS get_user_environment(uuid) CASCADE;
DROP FUNCTION IF EXISTS update_environments_updated_at() CASCADE;