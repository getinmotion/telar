-- COMPLETE REMAINING SECURITY FIXES
-- =====================================================

-- Drop conflicting policy first
DROP POLICY IF EXISTS "Shop owners can update their orders" ON public.orders;

-- Recreate orders policies
CREATE POLICY "Shop owners can update their orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.artisan_shops s 
    WHERE s.id = shop_id 
    AND s.user_id = auth.uid()
  )
);

-- 8. CART RLS POLICIES
DROP POLICY IF EXISTS "Users can manage their cart" ON public.cart;

CREATE POLICY "Users can manage their cart"
ON public.cart
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 9. CART_ITEMS RLS POLICIES
DROP POLICY IF EXISTS "Users can manage their cart items" ON public.cart_items;

CREATE POLICY "Users can manage their cart items"
ON public.cart_items
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 10. FIX SECURITY DEFINER FUNCTIONS - ADD search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'artisan'::user_type)
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_user_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_progress (
    user_id, level, experience_points, next_level_xp,
    completed_missions, current_streak, longest_streak,
    last_activity_date, total_time_spent
  )
  VALUES (NEW.id, 1, 0, 100, 0, 0, 0, CURRENT_DATE, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_personalized_recommendations(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_patterns RECORD;
BEGIN
  SELECT * INTO v_patterns FROM public.user_learning_patterns WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'task_complexity', 'simple',
      'task_types', jsonb_build_array('validation', 'discovery'),
      'recommended_focus', 'idea_validation',
      'learning_stage', 'beginner'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'task_complexity', CASE WHEN v_patterns.completion_rate >= 80 THEN 'advanced' WHEN v_patterns.completion_rate >= 50 THEN 'intermediate' ELSE 'simple' END,
    'task_types', v_patterns.preferred_task_types,
    'completion_rate', v_patterns.completion_rate,
    'learning_stage', CASE WHEN v_patterns.tasks_completed_count >= 20 THEN 'advanced' WHEN v_patterns.tasks_completed_count >= 10 THEN 'intermediate' ELSE 'beginner' END
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_next_level_xp(current_level integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $$
BEGIN
  RETURN FLOOR(100 * POWER(1.5, current_level - 1));
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_progress_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.maintain_shop_embeddings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.match_shop_embeddings(
  query_embedding vector, 
  match_count integer DEFAULT 12, 
  similarity_threshold double precision DEFAULT 0.25, 
  craft_filter text DEFAULT NULL, 
  region_filter text DEFAULT NULL, 
  featured_only boolean DEFAULT false
)
RETURNS TABLE(id uuid, shop_name text, shop_slug text, description text, craft_type text, region text, featured boolean, banner_url text, logo_url text, similarity double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.shop_name, s.shop_slug, s.description, s.craft_type, s.region, s.featured, s.banner_url, s.logo_url,
    1 - (se.embedding <=> query_embedding) as similarity
  FROM public.shop_embeddings se
  JOIN public.artisan_shops s ON s.id = se.shop_id
  WHERE s.active IS TRUE
    AND (craft_filter IS NULL OR s.craft_type = craft_filter)
    AND (region_filter IS NULL OR s.region = region_filter)
    AND (NOT featured_only OR s.featured)
    AND (query_embedding IS NULL OR 1 - (se.embedding <=> query_embedding) >= similarity_threshold)
  ORDER BY se.embedding <=> query_embedding
  LIMIT COALESCE(match_count, 12);
END;
$$;