-- Fase 1.3: Tabla para contexto del Coordinador Maestro
-- Almacena el estado completo y memoria conversacional del usuario

CREATE TABLE IF NOT EXISTS master_coordinator_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  context_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_interaction TIMESTAMPTZ DEFAULT now(),
  ai_memory JSONB DEFAULT '[]'::jsonb,
  context_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_master_context_user ON master_coordinator_context(user_id);
CREATE INDEX IF NOT EXISTS idx_master_context_last_interaction ON master_coordinator_context(last_interaction);

-- RLS Policies
ALTER TABLE master_coordinator_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coordinator context"
  ON master_coordinator_context
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coordinator context"
  ON master_coordinator_context
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coordinator context"
  ON master_coordinator_context
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_master_context_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_interaction = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS update_master_context_timestamp_trigger ON master_coordinator_context;
CREATE TRIGGER update_master_context_timestamp_trigger
  BEFORE UPDATE ON master_coordinator_context
  FOR EACH ROW
  EXECUTE FUNCTION update_master_context_timestamp();

-- Comentarios
COMMENT ON TABLE master_coordinator_context IS 'Contexto unificado del Coordinador Maestro para cada usuario';
COMMENT ON COLUMN master_coordinator_context.context_snapshot IS 'Snapshot completo del MasterContext del usuario';
COMMENT ON COLUMN master_coordinator_context.ai_memory IS 'Memoria conversacional del chat con el Coordinador';
COMMENT ON COLUMN master_coordinator_context.context_version IS 'Versión del contexto para tracking de cambios';
