-- RLS para user_master_context
CREATE POLICY "Users can view their own master context"
  ON public.user_master_context FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own master context"
  ON public.user_master_context FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own master context"
  ON public.user_master_context FOR UPDATE
  USING (auth.uid() = user_id);

-- Arreglar funciones críticas
ALTER FUNCTION public.get_latest_maturity_scores(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public, pg_temp;
ALTER FUNCTION public.is_admin() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_admin_access() SET search_path = public, pg_temp;
ALTER FUNCTION public.sanitize_text_input(text, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.validate_email_format(text) SET search_path = public, pg_temp;