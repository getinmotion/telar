-- ============================================
-- FASE 4: Sistema de Gamificación - Base de Datos
-- ============================================

-- Tabla de progreso del usuario (niveles, XP, rachas)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER NOT NULL DEFAULT 0,
  next_level_xp INTEGER NOT NULL DEFAULT 100,
  completed_missions INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  total_time_spent INTEGER NOT NULL DEFAULT 0, -- en minutos
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla de logros/achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_level ON user_progress(level);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- RLS Policies para user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies para user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trigger para actualizar updated_at en user_progress
CREATE OR REPLACE FUNCTION update_user_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_progress_timestamp();

-- Función para calcular XP necesario para siguiente nivel
CREATE OR REPLACE FUNCTION calculate_next_level_xp(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Fórmula: 100 * 1.5^(level-1)
  RETURN FLOOR(100 * POWER(1.5, current_level - 1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para inicializar progreso de usuario nuevo
CREATE OR REPLACE FUNCTION initialize_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_progress (user_id, level, experience_points, next_level_xp)
  VALUES (NEW.id, 1, 0, 100)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para inicializar progreso cuando se crea user_profile
CREATE TRIGGER init_user_progress_on_profile
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_progress();

-- Función para verificar y actualizar racha
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_progress RECORD;
  v_days_since_last_activity INTEGER;
  v_new_streak INTEGER;
BEGIN
  SELECT * INTO v_progress FROM user_progress WHERE user_id = p_user_id;
  
  IF v_progress IS NULL THEN
    RETURN jsonb_build_object('error', 'User progress not found');
  END IF;
  
  v_days_since_last_activity := CURRENT_DATE - v_progress.last_activity_date;
  
  IF v_days_since_last_activity = 0 THEN
    -- Mismo día, no actualizar racha
    v_new_streak := v_progress.current_streak;
  ELSIF v_days_since_last_activity = 1 THEN
    -- Día consecutivo, incrementar racha
    v_new_streak := v_progress.current_streak + 1;
  ELSE
    -- Se rompió la racha
    v_new_streak := 1;
  END IF;
  
  UPDATE user_progress
  SET 
    current_streak = v_new_streak,
    longest_streak = GREATEST(longest_streak, v_new_streak),
    last_activity_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'current_streak', v_new_streak,
    'longest_streak', GREATEST(v_progress.longest_streak, v_new_streak),
    'streak_updated', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Catálogo de logros predefinidos
CREATE TABLE IF NOT EXISTS achievements_catalog (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  unlock_criteria JSONB NOT NULL,
  category TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar logros iniciales
INSERT INTO achievements_catalog (id, title, description, icon, unlock_criteria, category, display_order) VALUES
  ('first_mission', 'Primera Misión', 'Completa tu primera misión', 'target', '{"type": "missions_completed", "count": 1}', 'Fundamentos', 1),
  ('onboarding_complete', 'Bienvenido', 'Completa el onboarding', 'star', '{"type": "onboarding_complete"}', 'Fundamentos', 2),
  ('level_5', 'Artesano Competente', 'Alcanza el nivel 5', 'crown', '{"type": "level_reached", "level": 5}', 'Nivel', 3),
  ('streak_7', 'Racha de 7 Días', 'Mantén una racha de 7 días consecutivos', 'flame', '{"type": "streak_reached", "days": 7}', 'Constancia', 4),
  ('missions_10', 'Trabajador Incansable', 'Completa 10 misiones', 'trophy', '{"type": "missions_completed", "count": 10}', 'Misiones', 5),
  ('early_bird', 'Madrugador', 'Completa una misión antes de las 8am', 'award', '{"type": "early_activity"}', 'Especial', 6)
ON CONFLICT (id) DO NOTHING;

-- RLS para achievements_catalog (público para lectura)
ALTER TABLE achievements_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view achievements catalog"
  ON achievements_catalog FOR SELECT
  TO authenticated
  USING (true);

-- Comentarios para documentación
COMMENT ON TABLE user_progress IS 'Progreso del usuario: niveles, XP, rachas, estadísticas';
COMMENT ON TABLE user_achievements IS 'Logros desbloqueados por cada usuario';
COMMENT ON TABLE achievements_catalog IS 'Catálogo de todos los logros disponibles en el sistema';
COMMENT ON FUNCTION calculate_next_level_xp IS 'Calcula el XP necesario para el siguiente nivel usando fórmula exponencial';
COMMENT ON FUNCTION update_user_streak IS 'Actualiza la racha diaria del usuario basado en última actividad';