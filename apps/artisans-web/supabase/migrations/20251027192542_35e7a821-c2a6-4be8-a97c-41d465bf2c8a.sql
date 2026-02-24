-- RLS Policies para achievements_catalog (lectura pública)
ALTER TABLE public.achievements_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements catalog"
  ON public.achievements_catalog
  FOR SELECT
  USING (true);

-- Asegurar que user_achievements y achievements_catalog tienen las políticas correctas
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir que la función de edge pueda insertar achievements
DROP POLICY IF EXISTS "Service can insert achievements" ON public.user_achievements;
CREATE POLICY "Service can insert achievements"
  ON public.user_achievements
  FOR INSERT
  WITH CHECK (true);